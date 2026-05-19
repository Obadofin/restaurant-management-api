// Import JWT library for verifying authentication tokens
const jwt = require("jsonwebtoken");

// Import User model for fetching users from database
const User = require("../models/user.model");

// Standard HTTP status codes (401, 403, etc.)
const { StatusCodes } = require("http-status-codes");


// ======================= AUTHENTICATION MIDDLEWARE =======================
// Checks if the user is logged in
exports.protect = async (req, res, next) => {

  // Get token from Authorization header
  // Example header: "Bearer eyJhbGciOiJIUzI1Ni..."
  const token = req.headers.authorization?.split(" ")[1];

  // If no token is provided, deny access
  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Not authorized"
    });
  }

  try {

    // Verify token using secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user using ID stored inside token
    // Exclude password from returned data
    const user = await User.findById(decoded.id).select("-password");

    // If user no longer exists, deny access
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "User not found"
      });
    }

    // Attach logged-in user data to request object
    req.user = user;

    // Move to next middleware or controller
    next();

  } catch {

    // If token is invalid or expired
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Invalid token"
    });
  }
};


// ======================= ROLE-BASED AUTHORIZATION =======================
// Restricts access based on user roles
exports.authorize = (...roles) => {

  // Return middleware function
  return (req, res, next) => {

    // Check if user's role matches any allowed role
    const hasRole = req.user.roles.some((role) =>
      roles.includes(role)
    );

    // If user does not have required role, deny access
    if (!hasRole) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "Forbidden"
      });
    }

    // Allow access if role is valid
    next();
  };
};