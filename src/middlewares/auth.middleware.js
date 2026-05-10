const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { StatusCodes } = require("http-status-codes");

exports.protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid token" });
  }
};

// ROLE-BASED ACCESS
exports.authorize = (...roles) => {
  return (req, res, next) => {
    const hasRole = req.user.roles.some((role) => roles.includes(role));
    if (!hasRole) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: "Forbidden" });
    }
    next();
  };
};
