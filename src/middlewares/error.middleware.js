const { StatusCodes } = require("http-status-codes");

// Catches any errors that happen during a request and sends a clean response back to the user
const errorHandler = (err, req, res, next) => {
  // Use the error's status code if it has one, otherwise default to "500 Internal Server Error"
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

  // MongoDB error code 11000 means someone tried to create a duplicate (e.g., an email that already exists)
  if (err.code === 11000) {
    statusCode = StatusCodes.BAD_REQUEST; // "400 Bad Request" — the user's fault, not the server's
    err.message = "Duplicate field value entered";
  }

  // Send a friendly error message back so the user knows what went wrong
  res.status(statusCode).json({
    success: false,
    message: err.message || "Server Error",
  });
};

module.exports = errorHandler;