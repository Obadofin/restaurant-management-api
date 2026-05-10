const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;

  if (err.code === 11000) {
    statusCode = 400;
    err.message = "Duplicate field value entered";
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Server Error",
  });
};

module.exports = errorHandler;