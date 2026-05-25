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

  return errorResponse(
    res,
    err.message ||
    'Internal Server Error',
    500
  );
};

module.exports = errorHandler;