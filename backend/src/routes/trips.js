const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

// POST /api/trips – create a new trip
router.post('/', tripController.createTrip);

// GET /api/trips – get all trips (with filters)
router.get('/', tripController.getTrips);

// PATCH /api/trips/:id – update trip status
router.patch('/:id', tripController.updateTripStatus);

// DELETE /api/trips/:id – delete a trip
router.delete('/:id', tripController.deleteTrip);

module.exports = router;