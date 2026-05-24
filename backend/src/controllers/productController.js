const prisma = require('../config/prisma');

// CREATE PRODUCT
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to create product'
    });
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

    const { name, description, price, stock } = req.body;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        stock
      }
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update product'
    });
  }
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

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