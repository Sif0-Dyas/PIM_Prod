const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'fail',
            message: 'Validation failed',
            details: errors.array().map(e => e.msg)
        });
    }
    next();
};

const validateRegister = [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').optional().trim().isLength({ max: 100 }).withMessage('Name too long')
];

const validateLogin = [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password required')
];

const validateItem = [
    body('name').trim().notEmpty().withMessage('Item name required').isLength({ max: 255 }),
    body('condition').optional().isIn(['new', 'like_new', 'good', 'fair', 'poor'])
        .withMessage('Invalid condition value'),
    body('purchasePrice').optional().isFloat({ min: 0 }).withMessage('Price must be positive'),
    body('estimatedValue').optional().isFloat({ min: 0 }).withMessage('Value must be positive'),
    body('locationId').optional().isInt({ min: 1 }).withMessage('Invalid location ID')
];

const validateLocation = [
    body('name').trim().notEmpty().withMessage('Location name required').isLength({ max: 255 }),
    body('type').isIn(['room', 'shelf', 'drawer', 'box', 'cabinet', 'other'])
        .withMessage('Invalid location type'),
    body('parentId').optional().isInt({ min: 1 }).withMessage('Invalid parent location ID')
];

module.exports = {
    handleValidationErrors,
    validateRegister,
    validateLogin,
    validateItem,
    validateLocation
};
