const logger = require('../config/logger.config');

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

class AppError extends Error {
    constructor(message, statusCode = 500, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    const isDev = process.env.NODE_ENV !== 'production';

    if (err.statusCode >= 500) {
        logger.error('Server error', {
            message: err.message,
            stack: err.stack,
            url: req.url,
            method: req.method,
            userId: req.user?.id
        });
    } else {
        logger.warn('Client error', {
            message: err.message,
            statusCode: err.statusCode,
            url: req.url,
            method: req.method
        });
    }

    // Handle Prisma-specific errors
    if (err.code === 'P2002') {
        err.statusCode = 400;
        const field = err.meta?.target?.join(', ') || 'field';
        err.message = `A record with this ${field} already exists`;
    }

    if (err.code === 'P2025') {
        err.statusCode = 404;
        err.message = 'Record not found';
    }

    const response = {
        status: err.statusCode >= 500 ? 'error' : 'fail',
        message: err.message
    };

    if (err.details) response.details = err.details;
    if (isDev && err.stack) response.stack = err.stack;

    res.status(err.statusCode).json(response);
};

module.exports = { asyncHandler, AppError, globalErrorHandler };
