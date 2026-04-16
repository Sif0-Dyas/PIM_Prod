process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');

const logger = require('./config/logger.config');
const { globalErrorHandler } = require('./middleware/asyncHandler.middleware');

const authRoutes = require('./routes/auth.routes');
const itemRoutes = require('./routes/item.routes');
const locationRoutes = require('./routes/location.routes');
const imageRoutes = require('./routes/image.routes');
const lookupRoutes = require('./routes/lookup.routes');

const app = express();
const PORT = process.env.PORT || 8000;

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Rate limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { status: 'fail', message: 'Too many requests, please try again later' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { status: 'fail', message: 'Too many login attempts, please try again later' }
});

app.use(generalLimiter);

// CORS
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? (process.env.CLIENT_URL || '').split(',').map(o => o.trim())
    : ['http://localhost:3000', 'http://localhost:3002'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

// Body parsing
app.use(express.json({ limit: '20mb' })); // larger limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());

// Request logging
app.use((req, res, next) => {
    logger.http(`${req.method} ${req.url}`);
    next();
});

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: '7d'
}));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/lookup', lookupRoutes);

// Global error handler (must be last)
app.use(globalErrorHandler);

app.listen(PORT, '0.0.0.0', () => {
    logger.info(`PIM server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

module.exports = app;
