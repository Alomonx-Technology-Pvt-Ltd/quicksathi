import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

// Verify JWT token and attach user to request
export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.slice(7);
  }
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  // Only a bad or expired token is a 401 (the frontend treats 401 as "signed out").
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
  } catch {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }

  // A database problem is not the user's fault: answer 503 so nobody is signed out by an outage.
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Service temporarily unavailable. Please try again." });
  }
  try {
    req.user = await User.findById(decoded.id);
  } catch (error) {
    console.error("protect: user lookup failed:", error?.message || error);
    return res.status(503).json({ message: "Service temporarily unavailable. Please try again." });
  }

  if (!req.user) {
    return res.status(401).json({ message: "User not found" });
  }
  // Tokens issued before the cutoff were ended on purpose (account taken back by its verified owner,
  // admin password reset). Compare in whole seconds: JWT iat has no milliseconds, and the token issued
  // in the same request as the cutoff must stay valid.
  if (req.user.tokensValidAfter && decoded.iat < Math.floor(req.user.tokensValidAfter.getTime() / 1000)) {
    return res.status(401).json({ message: "Session ended. Please sign in again." });
  }
  if (!req.user.isActive) {
    return res.status(403).json({ message: "Account deactivated" });
  }
  next();
};

// Generate JWT token
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};
