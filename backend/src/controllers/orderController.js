const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { sendOrderEmail } = require('../services/emailService');

// CREATE ORDER
exports.createOrder = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    // Check user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Check product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({
        message: 'Insufficient stock'
      });
    }

    // Auto calculate total
    const totalPrice =
      product.price * quantity;

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        productId,
        quantity,
        totalPrice
      }
    });

    // Reduce stock automatically
    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          decrement: quantity
        }
      }
    });

    await sendOrderEmail(
      user.email,
      user.name,
      product.name,
      quantity,
      totalPrice
    );

    res.status(201).json(order);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to create order'
    });
  }
};

// GET ALL ORDERS
exports.getAllOrders = async (req, res) => {
  try {
    const include = {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      product: true
    };

    const orders =
      req.user.role === 'ADMIN'
        ? await prisma.order.findMany({ include })
        : await prisma.order.findMany({
            where: {
              userId: req.user.id
            },
            include
          });

    res.status(200).json(orders);

  } catch (error) {

    res.status(500).json({
      message: 'Failed to fetch orders'
    });
  }
};

// GET ORDER BY ID
exports.getOrderById = async (req, res) => {
  try {

    const id = parseInt(req.params.id);

    const order =
      await prisma.order.findUnique({
        where: { id },

        include: {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  },
  product: true
}
      });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    res.status(200).json(order);

  } catch (error) {

    res.status(500).json({
      message: 'Failed to fetch order'
    });
  }
};

exports.getOrdersByUser =
async (req, res) => {

  try {

    const { userId } =
      req.params;

    if (
      req.user.role !== 'ADMIN' &&
      Number(userId) !== req.user.id
    ) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    const orders =
      await prisma.order.findMany({

        where: {
          userId:
          Number(userId)
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },

          product: true
        }
      });

    return successResponse(
      res,
      'Orders fetched',
      orders
    );

  } catch (error) {

    return errorResponse(
      res,
      error.message
    );
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { quantity, productId, userId } = req.body;

    const existingOrder = await prisma.order.findUnique({
      where: { id }
    });

    if (!existingOrder) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    const nextProductId = productId ? Number(productId) : existingOrder.productId;
    const nextUserId = userId ? Number(userId) : existingOrder.userId;
    const nextQuantity = quantity ? Number(quantity) : existingOrder.quantity;

    const product = await prisma.product.findUnique({
      where: { id: nextProductId }
    });

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    const totalPrice = product.price * nextQuantity;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        userId: nextUserId,
        productId: nextProductId,
        quantity: nextQuantity,
        totalPrice
      }
    });

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update order'
    });
  }
};

// DELETE ORDER
exports.deleteOrder = async (req, res) => {
  try {

    const id = parseInt(req.params.id);

    await prisma.order.delete({
      where: { id }
    });

    res.status(200).json({
      message: 'Order deleted successfully'
    });

  } catch (error) {

    res.status(500).json({
      message: 'Failed to delete order'
    });
  }
};
