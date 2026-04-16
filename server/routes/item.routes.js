const express = require('express');
const router = express.Router();
const { getItems, getItem, createItem, updateItem, deleteItem } = require('../controllers/item.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateItem, handleValidationErrors } = require('../middleware/validation.middleware');

router.use(authenticate);

router.get('/', getItems);
router.get('/:id', getItem);
router.post('/', validateItem, handleValidationErrors, createItem);
router.put('/:id', validateItem, handleValidationErrors, updateItem);
router.delete('/:id', deleteItem);

module.exports = router;
