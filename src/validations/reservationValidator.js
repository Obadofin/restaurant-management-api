const Joi = require("joi");
const { RESERVATION_STATUS } = require("../core/constants");

const createReservationValidation = Joi.object({
  table: Joi.string().hex().length(24).required(),
  date: Joi.date().iso().required(),
  time: Joi.string()
    .pattern(/^\d{2}:\d{2}$/)
    .required()
    .messages({ "string.pattern.base": "time must be in HH:MM format" }),
  partySize: Joi.number().integer().min(1).required(),
  specialRequests: Joi.string().max(500).optional(),
});

const updateReservationStatusValidation = Joi.object({
  status: Joi.string()
    .valid(...Object.values(RESERVATION_STATUS))
    .required(),
});

module.exports = {
  createReservationValidation,
  updateReservationStatusValidation,
};
