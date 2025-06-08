// utils/errorResponse.js
const errorResponse = (res, status, message, errors = []) => {
    return res.status(status).json({
      success: false,
      message,
      errors: errors.length ? errors : undefined
    });
  };
  
  module.exports = errorResponse;