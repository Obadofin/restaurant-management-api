const Joi = require("joi");
const { TABLE_STATUS } = require("../core/constants");

const createTableValidation = Joi.object({
  tableNumber: Joi.number().integer().min(1).required(),
  capacity: Joi.number().integer().min(1).required(),
  status: Joi.string().valid(...Object.values(TABLE_STATUS)).optional(),
  location: Joi.string().max(100).optional(),
});

const updateTableValidation = Joi.object({
  tableNumber: Joi.number().integer().min(1).optional(),
  capacity: Joi.number().integer().min(1).optional(),
  status: Joi.string().valid(...Object.values(TABLE_STATUS)).optional(),
  location: Joi.string().max(100).optional(),
}).min(1);

module.exports = { createTableValidation, updateTableValidation };
