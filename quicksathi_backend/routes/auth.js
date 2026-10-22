import { Router } from "express";
import User from "../models/User.js";
import Provider from "../models/Provider.js";
import { generateToken, protect } from "../middleware/auth.js";
import { firebaseAuth } from "../config/firebase.js";
import { sendWelcomeEmail } from "../services/emailService.js";

const router = Router();

// Helper: check if email is in the admin list (comma-separated in .env)
const isAdminEmail = (email) => {
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email?.toLowerCase());
};

// Helper to verify Firebase ID tokens securely without falling back to spoofable body parameters
const verifyFirebaseToken = async (idToken) => {
  if (!idToken) {
    return { error: { status: 400, message: "Firebase ID token is required" } };
  }
  if (!firebaseAuth) {
    return { error: { status: 503, message: "Authentication service unavailable" } };
  }
  try {
    const decoded = await firebaseAuth.verifyIdToken(idToken);
    return { decoded };
  } catch (err) {
    return { error: { status: 401, message: "Invalid or expired Firebase token" } };
  }
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Role is ALWAYS "user" for public self-registration. Admin promotion is never derived from self-registration.
    const user = await User.create({
      name,
      email,
      password,
      phone,
      authProvider: "local",
      role: "user",
    });

    const token = generateToken(user._id);

    // Send welcome email asynchronously
    if (user.email) {
      sendWelcomeEmail({ to: user.email, name: user.name }).catch((err) =>
        console.error("Welcome email error:", err?.message || err)
      );
    }

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.authProvider !== "local") {
      return res.status(401).json({
        message: `This account uses ${user.authProvider} sign-in. Please use that method.`,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/google — Handle Firebase Google Sign-In (with strict token verification)
router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;
    const authResult = await verifyFirebaseToken(idToken);
    if (authResult.error) {
      return res.status(authResult.error.status).json({ message: authResult.error.message });
    }

    const { decoded } = authResult;
    const verifiedEmail = decoded.email?.trim().toLowerCase();
    const verifiedName = decoded.name || req.body.name || "User";
    const verifiedAvatar = decoded.picture || req.body.avatar || "";
    const verifiedUid = decoded.uid;

    if (!verifiedEmail) {
      return res.status(400).json({ message: "Google account must have an email associated" });
    }

    let user = await User.findOne({ email: verifiedEmail });

    if (!user) {
      // Create new user from Google sign-in — always role 'user'
      user = await User.create({
        name: verifiedName,
        email: verifiedEmail,
        avatar: verifiedAvatar,
        firebaseUid: verifiedUid,
        authProvider: "google",
        role: "user",
      });

      // Send welcome email to new Google user
      if (user.email) {
        sendWelcomeEmail({ to: user.email, name: user.name }).catch((err) =>
          console.error("Welcome email error:", err?.message || err)
        );
      }
    } else {
      let changed = false;
      // Update firebase UID if not set
      if (!user.firebaseUid && verifiedUid) {
        user.firebaseUid = verifiedUid;
        changed = true;
      }
      // Update avatar if not set
      if (!user.avatar && verifiedAvatar) {
        user.avatar = verifiedAvatar;
        changed = true;
      }
      if (changed) {
        await user.save();
      }
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/auth/me — Get current user (full profile)
router.get("/me", protect, async (req, res) => {
  // Also check if user has a provider profile
  const provider = await Provider.findOne({ user: req.user._id });
  res.json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar,
      phone: req.user.phone,
      address: req.user.address,
      city: req.user.city,
      state: req.user.state,
      pincode: req.user.pincode,
      createdAt: req.user.createdAt,
    },
    provider: provider || null,
  });
});

// PUT /api/auth/profile — Update user profile
router.put("/profile", protect, async (req, res) => {
  try {
    // Prohibit directly changing email and phone to prevent identity takeover
    if (req.body.email && req.body.email.toLowerCase() !== req.user.email?.toLowerCase()) {
      return res.status(400).json({
        message: "Email cannot be changed directly. Please verify via email link.",
      });
    }
    if (req.body.phone && req.body.phone !== req.user.phone) {
      return res.status(400).json({
        message: "Phone number cannot be changed directly. Please verify via OTP.",
      });
    }

    const allowedFields = ["name", "address", "city", "state", "pincode"];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/phone — Firebase Phone Auth (login or register)
router.post("/phone", async (req, res) => {
  try {
    const { idToken } = req.body;
    const authResult = await verifyFirebaseToken(idToken);
    if (authResult.error) {
      return res.status(authResult.error.status).json({ message: authResult.error.message });
    }

    const { decoded } = authResult;
    const verifiedPhone = decoded.phone_number;
    const verifiedUid = decoded.uid;

    if (!verifiedPhone) {
      return res.status(400).json({ message: "No verified phone number found in token" });
    }

    // Find existing user by firebaseUid or phone
    let user = await User.findOne({
      $or: [{ firebaseUid: verifiedUid }, { phone: verifiedPhone }],
    });

    if (!user) {
      // Create new user from phone sign-in — always role 'user'
      user = await User.create({
        name: verifiedPhone,
        phone: verifiedPhone,
        firebaseUid: verifiedUid,
        authProvider: "phone",
        role: "user",
      });
    } else {
      // Update firebase UID if not set
      let changed = false;
      if (!user.firebaseUid && verifiedUid) {
        user.firebaseUid = verifiedUid;
        changed = true;
      }
      if (!user.phone && verifiedPhone) {
        user.phone = verifiedPhone;
        changed = true;
      }
      if (changed) await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// POST /api/auth/provider-login — Provider login (email/password)
router.post("/provider-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.authProvider !== "local") {
      return res.status(401).json({
        message: `This account uses ${user.authProvider} sign-in. Please use Google login.`,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if user has a provider profile
    const provider = await Provider.findOne({ user: user._id }).populate("category", "name");
    if (!provider) {
      return res.status(403).json({ message: "No provider profile found. Please register as a provider first." });
    }

    if (provider.approvalStatus === "pending") {
      return res.status(403).json({ message: "Your provider application is under review. Please wait for admin approval." });
    }

    if (provider.approvalStatus === "rejected") {
      return res.status(403).json({ message: `Your provider application was rejected. Reason: ${provider.rejectionReason || "Not specified"}` });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      provider,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/provider-google — Provider Google login
router.post("/provider-google", async (req, res) => {
  try {
    const { idToken } = req.body;
    const authResult = await verifyFirebaseToken(idToken);
    if (authResult.error) {
      return res.status(authResult.error.status).json({ message: authResult.error.message });
    }

    const { decoded } = authResult;
    const verifiedEmail = decoded.email?.trim().toLowerCase();
    const verifiedUid = decoded.uid;

    if (!verifiedEmail) {
      return res.status(400).json({ message: "Google account must have an email associated" });
    }

    let user = await User.findOne({ email: verifiedEmail });

    if (!user) {
      return res.status(403).json({ message: "No account found. Please sign up first, then register as a provider." });
    }

    // Update firebase UID if not set
    if (!user.firebaseUid && verifiedUid) {
      user.firebaseUid = verifiedUid;
      await user.save();
    }

    // Check for provider profile
    const provider = await Provider.findOne({ user: user._id }).populate("category", "name");
    if (!provider) {
      return res.status(403).json({ message: "No provider profile found. Please register as a provider first." });
    }

    if (provider.approvalStatus === "pending") {
      return res.status(403).json({ message: "Your provider application is under review. Please wait for admin approval." });
    }

    if (provider.approvalStatus === "rejected") {
      return res.status(403).json({ message: `Your provider application was rejected. Reason: ${provider.rejectionReason || "Not specified"}` });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      provider,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/admin-login — Admin Email & Password login
router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const envAdminPassword = process.env.ADMIN_PASSWORD?.trim();
    const isEnvPasswordMatch = envAdminPassword && password === envAdminPassword;

    let user = await User.findOne({ email: normalizedEmail }).select("+password");

    // Case 1: Existing user in database
    if (user) {
      // User MUST have admin role
      if (user.role !== "admin") {
        return res.status(403).json({
          message: "Access denied. This account does not have administrator privileges.",
        });
      }

      let passwordValid = false;

      // Match against .env ADMIN_PASSWORD if this is an authorized admin email
      if (isEnvPasswordMatch && isAdminEmail(user.email)) {
        passwordValid = true;
        user.password = password;
        if (user.authProvider === "google") {
          user.authProvider = "local";
        }
        await user.save();
      } else if (user.password) {
        // Verify against MongoDB hashed password
        passwordValid = await user.comparePassword(password);
      }

      if (!passwordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = generateToken(user._id);
      return res.json({
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      });
    }

    // Case 2: User not found in DB, but email matches ADMIN_EMAILS and password matches ADMIN_PASSWORD
    if (isAdminEmail(normalizedEmail) && isEnvPasswordMatch) {
      user = await User.create({
        name: "TiptoBook Admin",
        email: normalizedEmail,
        password,
        role: "admin",
        authProvider: "local",
      });

      const token = generateToken(user._id);
      return res.json({
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      });
    }

    return res.status(401).json({ message: "Invalid email or password" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/admin-google — Admin Google login with strict token verification
router.post("/admin-google", async (req, res) => {
  try {
    const { idToken } = req.body;
    const authResult = await verifyFirebaseToken(idToken);
    if (authResult.error) {
      return res.status(authResult.error.status).json({ message: authResult.error.message });
    }

    const { decoded } = authResult;
    const normalizedEmail = decoded.email?.trim().toLowerCase();
    const verifiedUid = decoded.uid;

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Google account must have an email associated" });
    }

    let user = await User.findOne({ email: normalizedEmail });

    // Only existing accounts that ALREADY have role === "admin" can log in to admin panel
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        message: `Access denied. The Google account (${normalizedEmail}) is not authorized as an administrator.`,
      });
    }

    let changed = false;
    if (!user.firebaseUid && verifiedUid) {
      user.firebaseUid = verifiedUid;
      changed = true;
    }
    if (changed) {
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
export default router;

