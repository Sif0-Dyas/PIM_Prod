const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../middleware/asyncHandler.middleware');
const logger = require('../config/logger.config');

const prisma = new PrismaClient();

// Get all locations as a flat list (client builds the tree)
const getLocations = asyncHandler(async (req, res) => {
    const locations = await prisma.location.findMany({
        orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
        include: { _count: { select: { items: true, children: true } } }
    });
    res.json({ locations });
});

const getLocation = asyncHandler(async (req, res) => {
    const location = await prisma.location.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
            children: true,
            parent: { select: { id: true, name: true } },
            _count: { select: { items: true } }
        }
    });
    if (!location) throw new AppError('Location not found', 404);
    res.json({ location });
});

const createLocation = asyncHandler(async (req, res) => {
    const { name, type, description, parentId } = req.body;

    if (parentId) {
        const parent = await prisma.location.findUnique({ where: { id: parseInt(parentId) } });
        if (!parent) throw new AppError('Parent location not found', 404);
    }

    const location = await prisma.location.create({
        data: { name, type, description, parentId: parentId ? parseInt(parentId) : null }
    });

    logger.info('Location created', { locationId: location.id, name });
    res.status(201).json({ message: 'Location created', location });
});

const updateLocation = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const { name, type, description, parentId } = req.body;

    // Prevent circular references
    if (parentId && parseInt(parentId) === id) {
        throw new AppError('A location cannot be its own parent', 400);
    }

    const location = await prisma.location.update({
        where: { id },
        data: {
            ...(name && { name }),
            ...(type && { type }),
            ...(description !== undefined && { description }),
            ...(parentId !== undefined && { parentId: parentId ? parseInt(parentId) : null })
        }
    });

    res.json({ message: 'Location updated', location });
});

const deleteLocation = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);

    const location = await prisma.location.findUnique({
        where: { id },
        include: { _count: { select: { items: true, children: true } } }
    });
    if (!location) throw new AppError('Location not found', 404);

    if (location._count.children > 0) {
        throw new AppError('Cannot delete a location that contains sub-locations. Move or delete them first.', 400);
    }

    if (location._count.items > 0) {
        // Unassign items rather than blocking deletion
        await prisma.item.updateMany({
            where: { locationId: id },
            data: { locationId: null }
        });
    }

    await prisma.location.delete({ where: { id } });
    logger.info('Location deleted', { locationId: id });
    res.json({ message: 'Location deleted' });
});

module.exports = { getLocations, getLocation, createLocation, updateLocation, deleteLocation };
