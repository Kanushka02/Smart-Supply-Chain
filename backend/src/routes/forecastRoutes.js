const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

const {
  getAiHealth,
  getProductForecast,
  getAllForecasts
} = require('../controllers/forecastController');

// All forecast routes require authentication
router.use(auth);

// Check AI microservice health & connectivity
router.get('/forecast/status', role('ADMIN', 'SUPPLIER'), getAiHealth);

// Batch forecast for products
router.get('/forecast', role('ADMIN', 'SUPPLIER'), getAllForecasts);

// Single product forecast
router.get('/forecast/:productId', role('ADMIN', 'SUPPLIER'), getProductForecast);

module.exports = router;
