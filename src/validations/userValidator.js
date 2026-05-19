// Validation rules for user-related operations using Joi
const Joi = require("joi");
// We also need the list of valid roles to ensure users can only be assigned allowed roles
const { ROLES } = require("../core/constants");

// Rules for signing up a new user account
const registerValidation = Joi.object({
  name: Joi.string().min(3).max(50).required(),    // Full name: must be 3–50 characters

  email: Joi.string().email().required(),            // Must be a properly formatted email address (e.g., user@example.com)

  password: Joi.string().min(6).max(20).required(),  // Password: must be 6–20 characters long

  roles: Joi.array()
    .items(Joi.string().valid(...Object.values(ROLES)))  // Only allows valid roles: "customer", "admin", or "staff"
    .optional(),                                          // Usually not sent — defaults to "customer" on the backend
});

module.exports = {
  registerValidation,
};