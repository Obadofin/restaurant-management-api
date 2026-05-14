// Import the User model for interacting with the users collection in the database
const User = require("../models/user.model");

// Wrapper to automatically handle async errors without using try/catch everywhere
const asyncHandler = require("../utils/asyncHandler");

// Utility function for generating access and refresh tokens
const generateToken = require("../utils/generateToken");

// Application roles (e.g CUSTOMER, ADMIN)
const { ROLES } = require("../core/constants");

// Standard HTTP status codes (200, 201, 400, etc.)
const { StatusCodes } = require("http-status-codes");


// ======================= REGISTER USER =======================
exports.register = asyncHandler(async (req, res) => {

  // Extract user details from request body
  const { name, email, password, roles } = req.body;

  // Check if a user with the same email already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error("Email already in use");
    error.statusCode = StatusCodes.BAD_REQUEST;
    throw error;
  }

  // Create a new user in the database
  const user = await User.create({
    name,
    email,
    password,

    // If no role is provided, assign CUSTOMER role by default
    roles: roles || [ROLES.CUSTOMER],
  });

  // Send success response with newly created user details
  res.status(StatusCodes.CREATED).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
    },
  });
});


// ======================= LOGIN USER =======================
exports.login = asyncHandler(async (req, res) => {

  // Extract login credentials from request body
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  // Check if user exists and password is correct
  if (!user || !(await user.matchPassword(password))) {
    const error = new Error("Invalid credentials");
    error.statusCode = StatusCodes.UNAUTHORIZED;
    throw error;
  }

  // Generate short-lived access token
  const token = generateToken({ id: user._id });

  // Generate long-lived refresh token
  const refreshToken = generateToken.generateRefreshToken({
    id: user._id,
  });

  // Send tokens back to the client
  res.status(StatusCodes.OK).json({
    success: true,
    token,
    refreshToken,
  });
});