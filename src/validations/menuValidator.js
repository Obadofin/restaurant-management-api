// Validation rules for menu-related operations using Joi
const Joi = require("joi");

// Rules for adding a new menu item: name, price, and category are required
const createMenuValidation = Joi.object({
  name: Joi.string().min(2).max(100).required(),       // Item name: 2–100 characters
  description: Joi.string().max(500).optional(),         // Optional short blurb about the item
  price: Joi.number().min(0).required(),                 // Must have a price; free items ($0) allowed
  category: Joi.string().hex().length(24).required(),    // Must be a valid 24-character MongoDB ID (links to a category)
  isAvailable: Joi.boolean().optional(),               // Defaults to true if not specified
  image: Joi.string().uri().optional(),                  // Optional web link to the item's photo
});

// Rules for editing a menu item: at least one field must be provided
const updateMenuValidation = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(500).optional(),
  price: Joi.number().min(0).optional(),
  category: Joi.string().hex().length(24).optional(),
  isAvailable: Joi.boolean().optional(),
  image: Joi.string().uri().optional(),
}).min(1);                                               // Prevents empty updates — must change at least one thing

module.exports = { createMenuValidation, updateMenuValidation };