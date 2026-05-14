// Validation rules for order-related operations using Joi
const Joi = require("joi");

// Rules for placing a new order: must have at least one item in the cart
const createOrderValidation = Joi.object({
  items: Joi.array().items(
    Joi.object({
      menuItemId: Joi.string().hex().length(24).required(),  // Must be a valid 24-character MongoDB item ID
      quantity: Joi.number().integer().min(1).required(),    // Must order at least 1 of each item; whole numbers only
    })
  ).min(1).required(),  // Cart cannot be empty — must order at least one thing
});

// Rules for staff updating an order's progress: status must be one of the allowed values
const updateOrderStatusValidation = Joi.object({
  status: Joi.string().valid("pending", "preparing", "completed", "cancelled").required(),  // Only these four statuses are accepted
});

module.exports = { createOrderValidation, updateOrderStatusValidation };