const Joi = require("joi");

const registerValidation = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .required(),

  email: Joi.string()
    .email()
    .required(),

  password: Joi.string()
    .min(6)
    .max(20)
    .required(),

  role: Joi.string()
    .valid("customer")
    .default("customer")
});

module.exports = {
  registerValidation,
};