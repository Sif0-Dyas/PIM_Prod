const express = require('express');
const router = express.Router();
const { uploadImages, setPrimaryImage, deleteImage } = require('../controllers/image.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

router.use(authenticate);

router.post('/:itemId', upload.array('images', 10), uploadImages);
router.put('/:itemId/primary/:imageId', setPrimaryImage);
router.delete('/:itemId/:imageId', deleteImage);

module.exports = router;
