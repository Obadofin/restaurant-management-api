const Joi = require("joi");

const createMenuValidation = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
  price: Joi.number().min(0).required(),
  category: Joi.string().hex().length(24).required(),
  isAvailable: Joi.boolean().optional(),
  image: Joi.string().uri().optional(),
});

const updateMenuValidation = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(500).optional(),
  price: Joi.number().min(0).optional(),
  category: Joi.string().hex().length(24).optional(),
  isAvailable: Joi.boolean().optional(),
  image: Joi.string().uri().optional(),
}).min(1);

module.exports = { createMenuValidation, updateMenuValidation };
