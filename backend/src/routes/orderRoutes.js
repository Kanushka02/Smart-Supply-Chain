const express = require('express');
const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  deleteOrder
} = require('../controllers/orderController');

router.post('/orders', createOrder);

router.get('/orders', getAllOrders);

router.get('/orders/:id', getOrderById);

router.get('/orders/user/:userId', getOrdersByUser);

router.delete('/orders/:id', deleteOrder);

module.exports = router;