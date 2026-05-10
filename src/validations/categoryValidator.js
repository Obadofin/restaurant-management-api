const Joi = require("joi");

const createCategoryValidation = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(255).optional(),
});

const updateCategoryValidation = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  description: Joi.string().max(255).optional(),
}).min(1);

module.exports = { createCategoryValidation, updateCategoryValidation };
