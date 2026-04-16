const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../middleware/asyncHandler.middleware');
const logger = require('../config/logger.config');

const prisma = new PrismaClient();

const generateToken = (user) =>
    jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });

const register = asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('An account with this email already exists', 400);

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, password: hashed, name } });

    const token = generateToken(user);
    logger.info('User registered', { userId: user.id });

    res.status(201).json({
        message: 'Account created successfully',
        token,
        user: { id: user.id, email: user.email, name: user.name }
    });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('Invalid email or password', 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError('Invalid email or password', 401);

    const token = generateToken(user);
    logger.info('User logged in', { userId: user.id });

    res.json({
        message: 'Logged in successfully',
        token,
        user: { id: user.id, email: user.email, name: user.name }
    });
});

const getMe = asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, email: true, name: true, createdAt: true }
    });
    if (!user) throw new AppError('User not found', 404);
    res.json({ user });
});

module.exports = { register, login, getMe };
