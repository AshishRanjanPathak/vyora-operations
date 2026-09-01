import { AppError } from '../errors/AppError.js';

const errorHandler = (err, req, res, next) => {
  console.error('[ERROR] ' + err.message);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Something went wrong. Please try again.',
  });
};

export default errorHandler;
