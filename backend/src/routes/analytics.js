const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/tripAnalyticsController');

// KPIs endpoint
router.get('/kpis', analyticsController.getKPIs);

// Charts endpoints
router.get('/cancellation-reasons', analyticsController.getCancellationReasons);
router.get('/payment-methods', analyticsController.getPaymentMethods);
router.get('/vehicle-analysis', analyticsController.getVehicleAnalysis);
router.get('/peak-hours', analyticsController.getPeakHours);
router.get('/weekday-analysis', analyticsController.getWeekdayAnalysis);

// Filters
router.get('/vehicle-types', analyticsController.getVehicleTypes);

module.exports = router;