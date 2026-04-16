const jwt = require('jsonwebtoken');
const { AppError } = require('./asyncHandler.middleware');

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        return next(new AppError('Authentication required', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id, email: decoded.email };
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new AppError('Session expired, please log in again', 401));
        }
        return next(new AppError('Invalid token', 401));
    }
};

module.exports = { authenticate };
