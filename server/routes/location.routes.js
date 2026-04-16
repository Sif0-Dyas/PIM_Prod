const express = require('express');
const router = express.Router();
const { getLocations, getLocation, createLocation, updateLocation, deleteLocation } = require('../controllers/location.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateLocation, handleValidationErrors } = require('../middleware/validation.middleware');

router.use(authenticate);

router.get('/', getLocations);
router.get('/:id', getLocation);
router.post('/', validateLocation, handleValidationErrors, createLocation);
router.put('/:id', validateLocation, handleValidationErrors, updateLocation);
router.delete('/:id', deleteLocation);

module.exports = router;
