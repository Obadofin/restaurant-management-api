const jwt = require("jsonwebtoken");

// Creates a short-lived access token (like a temporary hall pass) — used for normal requests
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,  // e.g., "15m" — expires quickly for security
  });
};

// Creates a long-lived refresh token (like a longer-term ID card) — used to get new access tokens without re-logging in
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {  // Falls back to main secret if no refresh secret is set
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '30d',  // Defaults to 30 days if not configured
  });
};

// Attaches the refresh token function as a property so both can be imported from one export
generateToken.generateRefreshToken = generateRefreshToken;
module.exports = generateToken;