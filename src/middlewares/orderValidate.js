const { StatusCodes } = require("http-status-codes");

// Checks if the user's submitted order data follows the correct format/rules
const validateOrder = (schema) => {
  return (req, res, next) => {
    // Run the validation rules against the submitted data
    const { error } = schema.validate(req.body);

    // If something is wrong (e.g., missing address, invalid email), stop and tell the user
    if (error) {
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        success: false,
        message: error.details[0].message, // Show the first specific error message
      });
    }

    next(); // Data looks good — let the request proceed
  };
};

module.exports = validateOrder;