const prisma = require('../config/prisma');
const redis = require('../config/redis');
const { productSchema } = require('../validators/productValidator');
const { createAuditLog } = require('../services/auditService');

const PRODUCTS_CACHE_KEY = '/api/products';

const invalidateProductsCache = async () => {
  try {
    await redis.del(PRODUCTS_CACHE_KEY);
  } catch (error) {
    console.error('Failed to invalidate products cache', error);
  }
};

// CREATE PRODUCT
exports.createProduct = async (req, res) => {
  try {
    const parsedProduct = productSchema.parse({
      ...req.body,
      price: Number(req.body.price),
      stock: Number.parseInt(req.body.stock, 10)
    });
    const supplierId = req.user.role === 'SUPPLIER' ? req.user.id : null;
    const image = req.file ? req.file.path : null;

    const product = await prisma.product.create({
      data: {
        name: parsedProduct.name,
        description: parsedProduct.description,
        price: parsedProduct.price,
        stock: parsedProduct.stock,
        image,
        supplierId
      }
    });

    try {
      await createAuditLog({
        userId: req.user.id,
        action: 'CREATE',
        entity: 'PRODUCT',
        entityId: product.id,
        description: `Created product ${product.name}`
      });
    } catch (auditError) {
      console.error('Failed to write product create audit log', auditError);
    }

    await invalidateProductsCache();

    res.status(201).json(product);
  } catch (error) {
    throw error;
  }
};

// GET ALL PRODUCTS
exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();

    try {
      await redis.set(
        req.originalUrl,
        JSON.stringify(products),
        {
          EX: 300
        }
      );
    } catch (cacheError) {
      console.error('Failed to store products cache', cacheError);
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch products'
    });
  }
};

// GET PRODUCT BY ID
exports.getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch product'
    });
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const parsedProduct = productSchema.parse({
      ...req.body,
      price: Number(req.body.price),
      stock: Number.parseInt(req.body.stock, 10)
    });

    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    if (
      req.user.role === 'SUPPLIER' &&
      existingProduct.supplierId !== req.user.id
    ) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: parsedProduct.name,
        description: parsedProduct.description,
        price: parsedProduct.price,
        stock: parsedProduct.stock,
        image: req.file ? req.file.path : existingProduct.image
      }
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    throw error;
  }
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    await prisma.product.delete({
      where: { id }
    });

    try {
      await createAuditLog({
        userId: req.user.id,
        action: 'DELETE',
        entity: 'PRODUCT',
        entityId: id,
        description: `Deleted product ID ${id}`
      });
    } catch (auditError) {
      console.error('Failed to write product delete audit log', auditError);
    }

    await invalidateProductsCache();

    res.status(200).json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete product'
    });
  }
};
