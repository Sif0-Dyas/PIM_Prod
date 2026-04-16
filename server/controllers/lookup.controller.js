const { asyncHandler, AppError } = require('../middleware/asyncHandler.middleware');
const claudeVisionService = require('../services/claudeVision.service');
const upcLookupService = require('../services/upcLookup.service');
const logger = require('../config/logger.config');

const analyzePhoto = asyncHandler(async (req, res) => {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) throw new AppError('Image data required', 400);

    const result = await claudeVisionService.analyzeItem(imageBase64, mimeType);
    logger.info('Photo analyzed via Claude Vision', { userId: req.user.id });
    res.json({ result });
});

const lookupBarcode = asyncHandler(async (req, res) => {
    const { barcode } = req.params;

    if (!barcode || barcode.length < 6) throw new AppError('Valid barcode required', 400);

    const result = await upcLookupService.lookup(barcode);
    if (!result) throw new AppError('No product found for this barcode', 404);

    logger.info('Barcode lookup completed', { barcode, userId: req.user.id });
    res.json({ result });
});

module.exports = { analyzePhoto, lookupBarcode };
