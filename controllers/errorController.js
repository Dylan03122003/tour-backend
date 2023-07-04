const AppError = require('../util/app-error');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const duplicatedValue = err.keyValue.name;
  const message = `Duplicate field value: ${duplicatedValue}. Please user another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (error) => {
  const errors = Object.values(error.errors).map((elm) => elm.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJsonWebTokenErrorDB = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleTokenExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorPro = (err, res) => {
  // Operational error like get a tour with a wrong ID

  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming error, unknown error -> we want to leak error information
    // console.error('Error: ', err); // For developers
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let copiedErr = { ...err };
    // Because destructuring doesn't work with the name property
    copiedErr.name = err.name;
    if (copiedErr.name === 'CastError') {
      copiedErr = handleCastErrorDB(copiedErr);
    }
    if (copiedErr.code === 11000) {
      copiedErr = handleDuplicateFieldsDB(copiedErr);
    }

    if (copiedErr.name === 'ValidationError') {
      copiedErr = handleValidationErrorDB(copiedErr);
    }

    if (copiedErr.name === 'JsonWebTokenError') {
      copiedErr = handleJsonWebTokenErrorDB();
    }
    if (copiedErr.name === 'TokenExpiredError') {
      copiedErr = handleTokenExpiredError();
    }

    sendErrorPro(copiedErr, res);
  }
};
