// Validation rules for order-related operations using Joi
const Joi = require("joi");
const { ORDER_STATUS } = require("../core/constants");

// Rules for placing a new order: must have at least one item in the cart
const createOrderValidation = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        menuItemId: Joi.string().hex().length(24).required(),
        quantity: Joi.number().integer().min(1).required(),
      }),
    )
    .min(1)
    .required(),
});

// Rules for staff updating an order's progress: status must be one of the allowed values
const updateOrderStatusValidation = Joi.object({
  status: Joi.string()
    .valid(...Object.values(ORDER_STATUS))
    .required(),
});

module.exports = { createOrderValidation, updateOrderStatusValidation };
