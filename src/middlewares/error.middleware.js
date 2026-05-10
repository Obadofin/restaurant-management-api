const { StatusCodes } = require("http-status-codes");

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

  if (err.code === 11000) {
    statusCode = StatusCodes.BAD_REQUEST;
    err.message = "Duplicate field value entered";
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Server Error",
  });
};

module.exports = errorHandler;
