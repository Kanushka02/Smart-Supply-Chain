const express = require('express');
const router = express.Router();

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
  validateProduct,
  createProduct
);

router.get('/products', getAllProducts);

router.get('/products/:id', getProductById);

router.put(
  '/products/:id',
  validateProduct,
  updateProduct
);

router.delete('/products/:id', deleteProduct);

module.exports = router;