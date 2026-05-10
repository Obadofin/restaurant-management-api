const { StatusCodes } = require("http-status-codes");

const validateOrder = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        success: false,
        message: error.details[0].message,
      });
    }

    next();
  };
};

module.exports = validateOrder;
