const Joi = require("joi");
const { PAYMENT_METHOD } = require("../core/constants");

const processPaymentValidation = Joi.object({
  order: Joi.string().hex().length(24).optional(),
  amount: Joi.when("order", {
    is: Joi.exist(),
    then: Joi.number().min(0.01).optional(),
    otherwise: Joi.number().min(0.01).required(),
  }),
  paymentMethod: Joi.string()
    .valid(...Object.values(PAYMENT_METHOD))
    .required(),
});

module.exports = { processPaymentValidation };
