const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const {
  validateProduct
} = require('../middleware/productValidation');

router.post(
  '/products',
  auth,
  validateProduct,
  createProduct
);

router.get('/products', auth, getAllProducts);

router.get('/products/:id', auth, getProductById);

router.put(
  '/products/:id',
  auth,
  validateProduct,
  updateProduct
);

router.delete('/products/:id', auth, deleteProduct);

module.exports = router;