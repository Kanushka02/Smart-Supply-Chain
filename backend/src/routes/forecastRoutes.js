const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

const {
  getAiHealth,
  getProductForecast,
  getAllForecasts,
  checkCatalogAlerts
} = require('../controllers/forecastController');

// All forecast routes require authentication
router.use(auth);

// Check AI microservice health & connectivity
router.get('/forecast/status', role('ADMIN', 'SUPPLIER'), getAiHealth);

// Batch forecast for products
router.get('/forecast', role('ADMIN', 'SUPPLIER'), getAllForecasts);

// Proactive AI catalog risk scan and alerts dispatch
router.post('/forecast/check-alerts', role('ADMIN', 'SUPPLIER'), checkCatalogAlerts);

// Single product forecast
router.get('/forecast/:productId', role('ADMIN', 'SUPPLIER'), getProductForecast);

module.exports = router;
