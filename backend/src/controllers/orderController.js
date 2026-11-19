const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { orderQueue } = require('../config/queue');
const { createAuditLog } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');
const { evaluateAndTriggerStockAlert } = require('../services/alertService');

// CREATE ORDER
exports.createOrder = async (req, res) => {
  try {
    const productId = Number(req.body.productId);
    const quantity = Number(req.body.quantity);
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: 'Insufficient stock'
      });
    }

    // Atomic transaction: create order and decrement stock together
    const { order, updatedProduct } = await prisma.$transaction(async (tx) => {
      const freshProduct = await tx.product.findUnique({
        where: { id: productId }
      });

      if (!freshProduct || freshProduct.stock < quantity) {
        throw new Error('INSUFFICIENT_STOCK');
      }

      const totalPrice = freshProduct.price * quantity;

      const newOrder = await tx.order.create({
        data: {
          userId,
          productId,
          quantity,
          totalPrice
        }
      });

      const updated = await tx.product.update({
        where: { id: productId },
        data: {
          stock: {
            decrement: quantity
          }
        }
      });

      return { order: newOrder, updatedProduct: updated };
    });

    const orderWithDetails = await prisma.order.findUnique({
      where: { id: order.id },
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

    const io = req.app.get('io');

    if (io) {
      io.to('role-admin').emit('order:created', orderWithDetails);
      io.to(`user-${userId}`).emit('order:created', orderWithDetails);

      io.emit('inventory:updated', {
        product: updatedProduct,
        productId: updatedProduct.id,
        stock: updatedProduct.stock
      });

      io.to('role-admin').emit('dashboard:updated', {
        reason: 'order_created',
        orderId: order.id,
        productId: updatedProduct.id,
        totalPrice
      });
    }

    try {
      await createAuditLog({
        userId: req.user.id,
        action: 'CREATE',
        entity: 'ORDER',
        entityId: order.id,
        description: `Created order ${order.id}`
      });
    } catch (auditError) {
      console.error('Failed to write order create audit log', auditError);
    }

    await orderQueue.add(
      'process-order-events',
      {
        orderId: order.id,
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        productId: product.id,
        productName: product.name,
        quantity,
        totalPrice
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        },
        removeOnComplete: 100,
        removeOnFail: 500,
        jobId: `order-${order.id}`
      }
    );

    try {
      const supplierNotification = await createNotification(
        userId,
        'Order Created Successfully',
        `Your order for ${product.name} (Qty: ${quantity}) has been created.`,
        'SUCCESS'
      );

      if (io) {
        io.to(`user-${userId}`).emit('notification', supplierNotification);
      }

      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' }
      });

      for (const admin of admins) {
        const adminNotification = await createNotification(
          admin.id,
          'New Order Received',
          `${user.name} created a new order for ${product.name} (Qty: ${quantity}).`,
          'INFO'
        );

        if (io) {
          io.to(`user-${admin.id}`).emit('notification', adminNotification);
        }
      }
    } catch (notificationError) {
      console.error('Failed to create/emit notifications:', notificationError);
    }

    // Proactive AI demand forecasting & automated shortage alert dispatch
    try {
      await evaluateAndTriggerStockAlert(updatedProduct, io);
    } catch (stockAlertError) {
      console.error('Failed to evaluate AI stock alert:', stockAlertError.message);
    }

    res.status(201).json(orderWithDetails || order);
  } catch (error) {
    console.error(error);

    if (error.message === 'INSUFFICIENT_STOCK') {
      return res.status(400).json({
        message: 'Insufficient stock'
      });
    }

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
