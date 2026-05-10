const { StatusCodes } = require("http-status-codes");

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message,
      });
    }

    next();
  };
};

module.exports = validate;
