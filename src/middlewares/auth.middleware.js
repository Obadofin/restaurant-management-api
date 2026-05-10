const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

exports.protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ROLE-BASED ACCESS
exports.authorize = (...roles) => {
  return (req, res, next) => {
    const hasRole = req.user.roles.some((role) => roles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};