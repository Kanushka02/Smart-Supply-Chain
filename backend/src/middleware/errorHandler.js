const {
  errorResponse
} = require('../utils/apiResponse');

const errorHandler = (
  err,
  req,
  res,
  next
) => {

  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.issues
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(
    res,
    message,
    statusCode
  );
};

module.exports = errorHandler;