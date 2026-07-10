// Admin role check middleware — must be used after protect middleware
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin only." });
  }
};

// Provider role check
export const providerOnly = (req, res, next) => {
  if (req.user && (req.user.role === "provider" || req.user.role === "admin")) {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Provider only." });
  }
};
