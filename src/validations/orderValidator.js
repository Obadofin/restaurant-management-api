const Joi = require("joi");

const createOrderValidation = Joi.object({
  items: Joi.array().items(
    Joi.object({
      menuItemId: Joi.string().hex().length(24).required(),
      quantity: Joi.number().integer().min(1).required(),
    })
  ).min(1).required(),
});

const updateOrderStatusValidation = Joi.object({
  status: Joi.string().valid("pending", "preparing", "completed", "cancelled").required(),
});

module.exports = { createOrderValidation, updateOrderStatusValidation };