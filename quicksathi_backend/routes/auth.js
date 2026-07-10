import { Router } from "express";
import User from "../models/User.js";
import Provider from "../models/Provider.js";
import { generateToken, protect } from "../middleware/auth.js";
import { firebaseAuth } from "../config/firebase.js";

const router = Router();

// Helper: check if email is in the admin list (comma-separated in .env)
const isAdminEmail = (email) => {
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email?.toLowerCase());
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

    const user = await User.create({
      name,
      email,
      password,
      phone,
      authProvider: "local",
      role: isAdminEmail(email) ? "admin" : "user",
    });

    const token = generateToken(user._id);

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

    // Auto-promote to admin if email is in ADMIN_EMAILS list
    if (isAdminEmail(user.email) && user.role !== "admin") {
      user.role = "admin";
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

// POST /api/auth/google — Handle Firebase Google Sign-In (with server-side token verification)
router.post("/google", async (req, res) => {
  try {
    const { idToken, email, name, avatar, firebaseUid } = req.body;

    let verifiedEmail = email;
    let verifiedName = name;
    let verifiedAvatar = avatar;
    let verifiedUid = firebaseUid;

    // If an ID token is provided, verify it server-side (preferred & secure)
    if (idToken && firebaseAuth) {
      try {
        const decodedToken = await firebaseAuth.verifyIdToken(idToken);
        verifiedEmail = decodedToken.email;
        verifiedName = decodedToken.name || name;
        verifiedAvatar = decodedToken.picture || avatar;
        verifiedUid = decodedToken.uid;
      } catch (tokenError) {
        return res.status(401).json({ message: "Invalid Firebase token" });
      }
    } else if (!email) {
      return res.status(400).json({ message: "Email or Firebase ID token is required" });
    }

    let user = await User.findOne({ email: verifiedEmail });

    if (!user) {
      // Create new user from Google sign-in
      user = await User.create({
        name: verifiedName,
        email: verifiedEmail,
        avatar: verifiedAvatar,
        firebaseUid: verifiedUid,
        authProvider: "google",
        role: isAdminEmail(verifiedEmail) ? "admin" : "user",
      });
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
      // Auto-promote to admin if email is in ADMIN_EMAILS list
      if (isAdminEmail(user.email) && user.role !== "admin") {
        user.role = "admin";
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

// GET /api/auth/me — Get current user
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
    },
    provider: provider || null,
  });
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
    const { idToken, email, name, avatar, firebaseUid } = req.body;

    let verifiedEmail = email;
    let verifiedName = name;
    let verifiedAvatar = avatar;
    let verifiedUid = firebaseUid;

    if (idToken && firebaseAuth) {
      try {
        const decodedToken = await firebaseAuth.verifyIdToken(idToken);
        verifiedEmail = decodedToken.email;
        verifiedName = decodedToken.name || name;
        verifiedAvatar = decodedToken.picture || avatar;
        verifiedUid = decodedToken.uid;
      } catch (tokenError) {
        return res.status(401).json({ message: "Invalid Firebase token" });
      }
    } else if (!email) {
      return res.status(400).json({ message: "Email or Firebase ID token is required" });
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

export default router;
