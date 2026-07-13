const prisma = require('../config/prisma');
const redis = require('../config/redis');
const { productSchema } = require('../validators/productValidator');
const { createAuditLog } = require('../services/auditService');

const PRODUCTS_CACHE_KEY_PREFIX = '/api/products';

const PRODUCT_LIST_SELECT = {
  id: true,
  name: true,
  price: true,
  stock: true,
  image: true,
  createdAt: true
};

const toPositiveInt = (value, defaultValue) => {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return defaultValue;
  }

  return parsed;
};

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const invalidateProductsCache = async () => {
  try {
    const keys = await redis.keys(`${PRODUCTS_CACHE_KEY_PREFIX}*`);

    if (keys.length > 0) {
      await redis.del(keys);
    }
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
    const page = toPositiveInt(req.query.page, 1);
    const requestedLimit = toPositiveInt(req.query.limit, 10);
    const limit = Math.min(requestedLimit, 100);
    const skip = (page - 1) * limit;

    const search = (req.query.search || '').trim();
    const minPrice = toNumberOrNull(req.query.minPrice);
    const maxPrice = toNumberOrNull(req.query.maxPrice);
    const sort = req.query.sort;

    const where = {};

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    if (minPrice !== null || maxPrice !== null) {
      where.price = {};

      if (minPrice !== null) {
        where.price.gte = minPrice;
      }

      if (maxPrice !== null) {
        where.price.lte = maxPrice;
      }
    }

    let orderBy = {
      createdAt: 'desc'
    };

    if (sort === 'price') {
      orderBy = {
        price: 'asc'
      };
    } else if (sort === '-price') {
      orderBy = {
        price: 'desc'
      };
    } else if (sort === '-createdAt') {
      orderBy = {
        createdAt: 'asc'
      };
    }

    const [total, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: PRODUCT_LIST_SELECT
      })
    ]);

    const responsePayload = {
      success: true,
      total,
      page,
      limit,
      data: products
    };

    try {
      await redis.set(
        req.originalUrl,
        JSON.stringify(responsePayload),
        {
          EX: 300
        }
      );
    } catch (cacheError) {
      console.error('Failed to store products cache', cacheError);
    }

    res.status(200).json(responsePayload);
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
