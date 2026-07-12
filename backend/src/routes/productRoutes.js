const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const cache = require('../middleware/cacheMiddleware');
const upload = require('../middleware/uploadMiddleware');

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

router.post(
  '/products',
  auth,
  role('ADMIN', 'SUPPLIER'),
  upload.single('image'),
  createProduct
);

router.get('/products', auth, role('ADMIN', 'SUPPLIER'), cache, getAllProducts);

router.get('/products/:id', auth, role('ADMIN', 'SUPPLIER'), getProductById);

router.put(
  '/products/:id',
  auth,
  role('ADMIN', 'SUPPLIER'),
  upload.single('image'),
  updateProduct
);

router.delete('/products/:id', auth, role('ADMIN'), deleteProduct);

module.exports = router;
