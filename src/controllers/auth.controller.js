const User = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler");
const generateToken = require('../utils/generateToken');


// REGISTER
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, roles } = req.body;

  // Check existing user
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error("Email already in use");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    name,
    email,
    password,
    roles: roles || ["customer"],
  });

  res.status(201).json({
  success: true,
  data: {
    id: user._id,
    name: user.name,
    email: user.email,
    roles: user.roles,
  },
});
});

// LOGIN
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({ id: user._id });

  const refreshToken =
    generateToken.generateRefreshToken({
      id: user._id,
    });

  res.status(200).json({
    success: true,
    token,
    refreshToken,
  });
});