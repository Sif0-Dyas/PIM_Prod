const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../middleware/asyncHandler.middleware');
const logger = require('../config/logger.config');

const prisma = new PrismaClient();

const itemInclude = {
    location: { select: { id: true, name: true, type: true } },
    images: { orderBy: { isPrimary: 'desc' } },
    tags: { include: { tag: true } },
    priceHistory: { orderBy: { checkedAt: 'desc' }, take: 5 }
};

const getItems = asyncHandler(async (req, res) => {
    const { locationId, category, condition, search, tags, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 50 } = req.query;

    const where = { userId: req.user.id };

    if (locationId) where.locationId = parseInt(locationId);
    if (category) where.category = { equals: category, mode: 'insensitive' };
    if (condition) where.condition = condition;
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } },
            { model: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { serialNumber: { contains: search, mode: 'insensitive' } },
            { barcode: { contains: search, mode: 'insensitive' } }
        ];
    }
    if (tags) {
        const tagList = tags.split(',').map(t => t.trim());
        where.tags = { some: { tag: { name: { in: tagList } } } };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
        prisma.item.findMany({
            where,
            include: itemInclude,
            orderBy: { [sortBy]: sortOrder },
            skip,
            take: parseInt(limit)
        }),
        prisma.item.count({ where })
    ]);

    res.json({ items, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

const getItem = asyncHandler(async (req, res) => {
    const item = await prisma.item.findFirst({
        where: { id: parseInt(req.params.id), userId: req.user.id },
        include: { ...itemInclude, priceHistory: { orderBy: { checkedAt: 'desc' } } }
    });
    if (!item) throw new AppError('Item not found', 404);
    res.json({ item });
});

const createItem = asyncHandler(async (req, res) => {
    const { name, description, brand, model, serialNumber, barcode, category, condition,
            purchasePrice, estimatedValue, purchaseDate, notes, locationId, tags } = req.body;

    const item = await prisma.item.create({
        data: {
            name, description, brand, model, serialNumber, barcode, category, condition,
            purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
            estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
            purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
            notes,
            locationId: locationId ? parseInt(locationId) : null,
            userId: req.user.id,
            ...(tags?.length && {
                tags: {
                    create: await resolveOrCreateTags(tags)
                }
            })
        },
        include: itemInclude
    });

    logger.info('Item created', { itemId: item.id, userId: req.user.id });
    res.status(201).json({ message: 'Item created', item });
});

const updateItem = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const existing = await prisma.item.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) throw new AppError('Item not found', 404);

    const { name, description, brand, model, serialNumber, barcode, category, condition,
            purchasePrice, estimatedValue, purchaseDate, notes, locationId, tags } = req.body;

    const item = await prisma.item.update({
        where: { id },
        data: {
            ...(name !== undefined && { name }),
            ...(description !== undefined && { description }),
            ...(brand !== undefined && { brand }),
            ...(model !== undefined && { model }),
            ...(serialNumber !== undefined && { serialNumber }),
            ...(barcode !== undefined && { barcode }),
            ...(category !== undefined && { category }),
            ...(condition !== undefined && { condition }),
            ...(purchasePrice !== undefined && { purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null }),
            ...(estimatedValue !== undefined && { estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null }),
            ...(purchaseDate !== undefined && { purchaseDate: purchaseDate ? new Date(purchaseDate) : null }),
            ...(notes !== undefined && { notes }),
            ...(locationId !== undefined && { locationId: locationId ? parseInt(locationId) : null }),
            ...(tags !== undefined && {
                tags: {
                    deleteMany: {},
                    create: await resolveOrCreateTags(tags)
                }
            })
        },
        include: itemInclude
    });

    res.json({ message: 'Item updated', item });
});

const deleteItem = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const item = await prisma.item.findFirst({
        where: { id, userId: req.user.id },
        include: { images: true }
    });
    if (!item) throw new AppError('Item not found', 404);

    // Delete image files from disk
    const fs = require('fs');
    const path = require('path');
    for (const image of item.images) {
        const filePath = path.join(__dirname, '../uploads/items', image.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await prisma.item.delete({ where: { id } });
    logger.info('Item deleted', { itemId: id, userId: req.user.id });
    res.json({ message: 'Item deleted' });
});

// Helper: resolve tag names to tag connect/create payloads
async function resolveOrCreateTags(tagNames) {
    return tagNames.map(name => ({
        tag: {
            connectOrCreate: {
                where: { name: name.toLowerCase().trim() },
                create: { name: name.toLowerCase().trim() }
            }
        }
    }));
}

module.exports = { getItems, getItem, createItem, updateItem, deleteItem };
