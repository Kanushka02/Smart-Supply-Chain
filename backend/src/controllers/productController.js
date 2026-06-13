const prisma = require('../config/prisma');
const { productSchema } = require('../validators/productValidator');

// CREATE PRODUCT
exports.createProduct = async (req, res) => {
  try {
    const parsedProduct = productSchema.parse({
      ...req.body,
      price: Number(req.body.price),
      stock: Number.parseInt(req.body.stock, 10)
    });
    const supplierId = req.user.role === 'SUPPLIER' ? req.user.id : null;

    const product = await prisma.product.create({
      data: {
        name: parsedProduct.name,
        description: parsedProduct.description,
        price: parsedProduct.price,
        stock: parsedProduct.stock,
        supplierId
      }
    });

    res.status(201).json(product);
  } catch (error) {
    throw error;
  }
};

// GET ALL PRODUCTS
exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();

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
        stock: parsedProduct.stock
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

    res.status(200).json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete product'
    });
  }
};