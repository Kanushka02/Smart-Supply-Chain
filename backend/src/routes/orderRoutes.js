const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

const {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  updateOrder,
  deleteOrder
} = require('../controllers/orderController');

router.post('/orders', auth, role('ADMIN', 'SUPPLIER'), createOrder);

router.get('/orders', auth, role('ADMIN', 'SUPPLIER'), getAllOrders);

router.get('/orders/:id', auth, role('ADMIN', 'SUPPLIER'), getOrderById);

router.get('/orders/user/:userId', auth, role('ADMIN', 'SUPPLIER'), getOrdersByUser);

router.put('/orders/:id', auth, role('ADMIN'), updateOrder);

router.delete('/orders/:id', auth, role('ADMIN'), deleteOrder);

module.exports = router;