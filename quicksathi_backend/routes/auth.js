import { Router } from "express";
import User from "../models/User.js";
import Provider from "../models/Provider.js";
import { generateToken, protect } from "../middleware/auth.js";
import { firebaseAuth } from "../config/firebase.js";
import { sendWelcomeEmail } from "../services/emailService.js";
import { normalizePhone } from "../services/phone.js";

const router = Router();

// ── Helpers ─────────────────────────────────────────────────────────────────

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Wrap a handler so HttpError → its status; anything else → 500 (same shape as before).
const route = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    if (error instanceof HttpError) return res.status(error.status).json({ message: error.message });
    if (error?.code === 11000) {
      return res.status(409).json({ message: "An account with these details already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

// Reject non-string credentials (blocks NoSQL operator objects like { $ne: null }).
const asString = (value) => (typeof value === "string" ? value : "");

const publicUser = (user, extra = {}) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  ...extra,
});

const profileUser = (user) =>
  publicUser(user, {
    phone: user.phone,
    address: user.address,
    city: user.city,
    state: user.state,
    pincode: user.pincode,
    createdAt: user.createdAt,
  });

/**
 * The ONLY way identity is established from Firebase. Everything (email, uid, phone,
 * name, picture) comes from the verified token; request-body fields are never trusted.
 * 400 = no token, 401 = bad token, 503 = Firebase Admin not configured.
 */
async function verifyFirebaseIdentity(idToken) {
  if (!idToken || typeof idToken !== "string") throw new HttpError(400, "Firebase ID token is required");
  if (!firebaseAuth) throw new HttpError(503, "Sign-in is temporarily unavailable");
  let decoded;
  try {
    decoded = await firebaseAuth.verifyIdToken(idToken);
  } catch {
    throw new HttpError(401, "Invalid or expired Firebase token");
  }
  return {
    uid: decoded.uid,
    email: decoded.email ? decoded.email.trim().toLowerCase() : null,
    emailVerified: decoded.email_verified === true,
    phone: decoded.phone_number || null,
    name: decoded.name || "",
    picture: decoded.picture || "",
  };
}

async function verifiedGoogleIdentity(idToken) {
  const identity = await verifyFirebaseIdentity(idToken);
  if (!identity.email || !identity.emailVerified) {
    throw new HttpError(401, "A verified Google email is required");
  }
  return identity;
}

// Link Firebase details to an existing account (never changes role).
async function linkGoogleIdentity(user, identity) {
  let changed = false;
  if (!user.firebaseUid) { user.firebaseUid = identity.uid; changed = true; }
  if (!user.avatar && identity.picture) { user.avatar = identity.picture; changed = true; }
  if (!user.emailVerified) { user.emailVerified = true; changed = true; }
  if (changed) await user.save();
}

function assertActive(user) {
  if (!user.isActive) throw new HttpError(403, "Account deactivated");
}

// ── Email / password ────────────────────────────────────────────────────────

// POST /api/auth/register — always creates a customer account. Admin rights are never
// derived from the email address (see scripts/grant-admin.mjs).
router.post("/register", route(async (req, res) => {
  const name = asString(req.body.name).trim();
  const email = asString(req.body.email).trim().toLowerCase();
  const password = asString(req.body.password);
  const rawPhone = asString(req.body.phone).trim();
  const phone = normalizePhone(rawPhone);
  if (rawPhone && !phone) throw new HttpError(400, "Please enter a valid phone number");

  if (!name || !email || !password) {
    throw new HttpError(400, "Name, email and password are required");
  }

  if (await User.findOne({ email })) {
    throw new HttpError(400, "User already exists with this email");
  }

  const user = await User.create({ name, email, password, phone: phone || undefined, authProvider: "local", role: "user" });
  const token = generateToken(user._id);

  if (user.email) {
    sendWelcomeEmail({ to: user.email, name: user.name }).catch((err) =>
      console.error("Welcome email error:", err?.message || err)
    );
  }

  res.status(201).json({ token, user: publicUser(user) });
}));

async function localCredentialUser(req) {
  const email = asString(req.body.email).trim().toLowerCase();
  const password = asString(req.body.password);
  if (!email || !password) throw new HttpError(400, "Email and password are required");

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new HttpError(401, "Invalid email or password");

  if (user.authProvider !== "local") {
    throw new HttpError(401, `This account uses ${user.authProvider} sign-in. Please use that method.`);
  }
  if (!user.password || !(await user.comparePassword(password))) {
    throw new HttpError(401, "Invalid email or password");
  }
  assertActive(user);
  return user;
}

// POST /api/auth/login
router.post("/login", route(async (req, res) => {
  const user = await localCredentialUser(req);
  res.json({ token: generateToken(user._id), user: publicUser(user) });
}));

// ── Google ──────────────────────────────────────────────────────────────────

// POST /api/auth/google — customers (creates the account on first sign-in)
router.post("/google", route(async (req, res) => {
  const identity = await verifiedGoogleIdentity(req.body.idToken);

  let user = await User.findOne({ email: identity.email });
  if (!user) {
    user = await User.create({
      name: identity.name || identity.email.split("@")[0],
      email: identity.email,
      avatar: identity.picture,
      firebaseUid: identity.uid,
      emailVerified: true,
      authProvider: "google",
      role: "user",
    });
    sendWelcomeEmail({ to: user.email, name: user.name }).catch((err) =>
      console.error("Welcome email error:", err?.message || err)
    );
  } else {
    assertActive(user);
    await linkGoogleIdentity(user, identity);
  }

  res.json({ token: generateToken(user._id), user: publicUser(user) });
}));

// POST /api/auth/provider-google — existing, approved providers only
router.post("/provider-google", route(async (req, res) => {
  const identity = await verifiedGoogleIdentity(req.body.idToken);

  const user = await User.findOne({ email: identity.email });
  if (!user) {
    throw new HttpError(403, "No account found. Please sign up first, then register as a provider.");
  }
  assertActive(user);
  await linkGoogleIdentity(user, identity);

  const provider = await Provider.findOne({ user: user._id }).populate("category", "name");
  if (!provider) {
    throw new HttpError(403, "No provider profile found. Please register as a provider first.");
  }
  if (provider.approvalStatus === "pending") {
    throw new HttpError(403, "Your provider application is under review. Please wait for admin approval.");
  }
  if (provider.approvalStatus === "rejected") {
    throw new HttpError(403, `Your provider application was rejected. Reason: ${provider.rejectionReason || "Not specified"}`);
  }

  res.json({ token: generateToken(user._id), user: publicUser(user), provider });
}));

// POST /api/auth/admin-google — users whose stored role is already "admin"
router.post("/admin-google", route(async (req, res) => {
  const identity = await verifiedGoogleIdentity(req.body.idToken);

  const user = await User.findOne({ email: identity.email });
  if (!user || user.role !== "admin") {
    throw new HttpError(403, "Access denied. This Google account is not authorized as an administrator.");
  }
  assertActive(user);
  await linkGoogleIdentity(user, identity);

  res.json({ token: generateToken(user._id), user: publicUser(user) });
}));

// ── Phone (Firebase OTP) ────────────────────────────────────────────────────

// POST /api/auth/phone
router.post("/phone", route(async (req, res) => {
  const identity = await verifyFirebaseIdentity(req.body.idToken);
  if (!identity.phone) {
    throw new HttpError(401, "This token does not carry a verified phone number");
  }

  // Match by Firebase uid, or by phone only on accounts that were created by phone sign-in.
  // Phones typed into email/Google accounts are unverified and must not grant access.
  let user = await User.findOne({
    $or: [{ firebaseUid: identity.uid }, { phone: identity.phone, authProvider: "phone" }],
  });

  if (!user) {
    user = await User.create({
      name: identity.phone,
      phone: identity.phone,
      firebaseUid: identity.uid,
      authProvider: "phone",
      role: "user",
    });
  } else {
    assertActive(user);
    let changed = false;
    if (!user.firebaseUid) { user.firebaseUid = identity.uid; changed = true; }
    if (!user.phone) { user.phone = identity.phone; changed = true; }
    if (changed) await user.save();
  }

  res.json({ token: generateToken(user._id), user: profileUser(user) });
}));

// ── Providers & admins (email / password) ───────────────────────────────────

// POST /api/auth/provider-login
router.post("/provider-login", route(async (req, res) => {
  const user = await localCredentialUser(req);

  const provider = await Provider.findOne({ user: user._id }).populate("category", "name");
  if (!provider) {
    throw new HttpError(403, "No provider profile found. Please register as a provider first.");
  }
  if (provider.approvalStatus === "pending") {
    throw new HttpError(403, "Your provider application is under review. Please wait for admin approval.");
  }
  if (provider.approvalStatus === "rejected") {
    throw new HttpError(403, `Your provider application was rejected. Reason: ${provider.rejectionReason || "Not specified"}`);
  }

  res.json({ token: generateToken(user._id), user: publicUser(user), provider });
}));

// POST /api/auth/admin-login — the account's own password; role must already be "admin"
router.post("/admin-login", route(async (req, res) => {
  const user = await localCredentialUser(req);
  if (user.role !== "admin") {
    throw new HttpError(403, "Access denied. This account does not have administrator privileges.");
  }
  res.json({ token: generateToken(user._id), user: publicUser(user) });
}));

// ── Session / profile ───────────────────────────────────────────────────────

// GET /api/auth/me — full profile + provider profile
router.get("/me", protect, route(async (req, res) => {
  const provider = await Provider.findOne({ user: req.user._id });
  res.json({ user: profileUser(req.user), provider: provider || null });
}));

// PUT /api/auth/profile — email and phone are identity: they can only be set by a verified
// sign-in flow, never by free-text edit.
router.put("/profile", protect, route(async (req, res) => {
  const body = req.body || {};

  const emailChanged = body.email !== undefined && asString(body.email).trim().toLowerCase() !== (req.user.email || "");
  const phoneChanged = body.phone !== undefined && asString(body.phone).trim() !== (req.user.phone || "");
  if (emailChanged || phoneChanged) {
    throw new HttpError(400, "Email and phone number can't be edited here. Sign in with that email or phone to link it.");
  }

  const updates = {};
  for (const field of ["name", "address", "city", "state", "pincode"]) {
    if (body[field] !== undefined) updates[field] = asString(body[field]);
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ user: profileUser(user) });
}));

export default router;
