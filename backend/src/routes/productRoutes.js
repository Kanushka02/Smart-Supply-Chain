const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

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
  role('ADMIN', 'SUPPLIER'),
  validateProduct,
  createProduct
);

router.get('/products', auth, role('ADMIN', 'SUPPLIER'), getAllProducts);

router.get('/products/:id', auth, role('ADMIN', 'SUPPLIER'), getProductById);

router.put(
  '/products/:id',
  auth,
  role('ADMIN', 'SUPPLIER'),
  validateProduct,
  updateProduct
);

router.delete('/products/:id', auth, role('ADMIN'), deleteProduct);

module.exports = router;