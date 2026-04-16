const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../middleware/asyncHandler.middleware');
const logger = require('../config/logger.config');

const prisma = new PrismaClient();

const uploadImages = asyncHandler(async (req, res) => {
    const itemId = parseInt(req.params.itemId);

    const item = await prisma.item.findFirst({ where: { id: itemId, userId: req.user.id } });
    if (!item) throw new AppError('Item not found', 404);

    if (!req.files?.length) throw new AppError('No images provided', 400);

    const existingCount = await prisma.itemImage.count({ where: { itemId } });

    const images = await Promise.all(req.files.map(async (file, index) => {
        const isPrimary = existingCount === 0 && index === 0;
        return prisma.itemImage.create({
            data: {
                itemId,
                filename: file.filename,
                url: `/uploads/items/${file.filename}`,
                isPrimary
            }
        });
    }));

    logger.info('Images uploaded', { itemId, count: images.length });
    res.status(201).json({ message: `${images.length} image(s) uploaded`, images });
});

const setPrimaryImage = asyncHandler(async (req, res) => {
    const itemId = parseInt(req.params.itemId);
    const imageId = parseInt(req.params.imageId);

    const item = await prisma.item.findFirst({ where: { id: itemId, userId: req.user.id } });
    if (!item) throw new AppError('Item not found', 404);

    // Clear existing primary, set new one
    await prisma.$transaction([
        prisma.itemImage.updateMany({ where: { itemId }, data: { isPrimary: false } }),
        prisma.itemImage.update({ where: { id: imageId }, data: { isPrimary: true } })
    ]);

    res.json({ message: 'Primary image updated' });
});

const deleteImage = asyncHandler(async (req, res) => {
    const itemId = parseInt(req.params.itemId);
    const imageId = parseInt(req.params.imageId);

    const item = await prisma.item.findFirst({ where: { id: itemId, userId: req.user.id } });
    if (!item) throw new AppError('Item not found', 404);

    const image = await prisma.itemImage.findFirst({ where: { id: imageId, itemId } });
    if (!image) throw new AppError('Image not found', 404);

    // Delete file from disk
    const filePath = path.join(__dirname, '../uploads/items', image.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.itemImage.delete({ where: { id: imageId } });

    // If deleted image was primary, promote the next one
    if (image.isPrimary) {
        const next = await prisma.itemImage.findFirst({ where: { itemId } });
        if (next) await prisma.itemImage.update({ where: { id: next.id }, data: { isPrimary: true } });
    }

    res.json({ message: 'Image deleted' });
});

module.exports = { uploadImages, setPrimaryImage, deleteImage };
