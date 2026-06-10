const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');

const {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  deleteOrder
} = require('../controllers/orderController');

router.post('/orders', auth, createOrder);

router.get('/orders', auth, getAllOrders);

router.get('/orders/:id', auth, getOrderById);

router.get('/orders/user/:userId', auth, getOrdersByUser);

router.delete('/orders/:id', auth, deleteOrder);

module.exports = router;