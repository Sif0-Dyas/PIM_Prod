const express = require('express');
const router = express.Router();
const { analyzePhoto, lookupBarcode } = require('../controllers/lookup.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.post('/photo', analyzePhoto);
router.get('/barcode/:barcode', lookupBarcode);

module.exports = router;
