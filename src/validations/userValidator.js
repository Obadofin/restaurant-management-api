const Joi = require("joi");
const { ROLES } = require("../core/constants");

const registerValidation = Joi.object({
  name: Joi.string().min(3).max(50).required(),

  email: Joi.string().email().required(),

  password: Joi.string().min(6).max(20).required(),

  roles: Joi.array()
    .items(Joi.string().valid(...Object.values(ROLES)))
    .optional(),
});

module.exports = {
  registerValidation,
};
