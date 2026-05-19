// Validation rules for category-related operations using Joi
const Joi = require("joi");

// Rules for creating a new category: name is required, description is optional
const createCategoryValidation = Joi.object({
  name: Joi.string().min(2).max(50).required(),      // Must be 2–50 characters long
  description: Joi.string().max(255).optional(),       // Optional, but if provided, max 255 characters
});

// Rules for updating a category: at least one field must be provided, nothing is strictly required
const updateCategoryValidation = Joi.object({
  name: Joi.string().min(2).max(50).optional(),      // Can update name, or not
  description: Joi.string().max(255).optional(),       // Can update description, or not
}).min(1);                                              // Prevents empty updates — must send at least one field to change

module.exports = { createCategoryValidation, updateCategoryValidation };