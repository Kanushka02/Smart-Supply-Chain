const prisma = require('../config/prisma');
const aiService = require('./aiService');
const { createNotification } = require('./notificationService');

/**
 * Computes 30-day and 60-day historical order statistics for a product.
 */
function getProductOrderStats(orders) {
  if (!orders || orders.length === 0) {
    return {
      recentOrders: 0,
      lag1Orders: 0,
      rollingMean3: 0
    };
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const recentOrders = orders
    .filter((o) => new Date(o.createdAt) >= thirtyDaysAgo)
    .reduce((sum, o) => sum + (o.quantity || 0), 0);

  const priorOrders = orders
    .filter((o) => {
      const d = new Date(o.createdAt);
      return d >= sixtyDaysAgo && d < thirtyDaysAgo;
    })
    .reduce((sum, o) => sum + (o.quantity || 0), 0);

  const rollingMean = (recentOrders + priorOrders) / 2;

  return {
    recentOrders,
    lag1Orders: priorOrders > 0 ? priorOrders : recentOrders,
    rollingMean3: Number(rollingMean.toFixed(2))
  };
}

/**
 * Evaluates stock risk comparing current stock with predicted future demand.
 */
function evaluateStockRisk(currentStock, predictedDemand) {
  let stockStatus = 'HEALTHY';
  let projectedShortage = 0;
  let recommendedRestock = 0;
  let recommendation = 'Inventory level is adequate for anticipated demand.';

  if (currentStock < predictedDemand) {
    projectedShortage = predictedDemand - currentStock;
    recommendedRestock = projectedShortage + Math.round(predictedDemand * 0.2);

    if (currentStock < predictedDemand * 0.5) {
      stockStatus = 'CRITICAL_SHORTAGE';
      recommendation = `CRITICAL RISK: Projected demand (${predictedDemand} units) exceeds available stock by ${projectedShortage} units. Immediate procurement of ${recommendedRestock} units strongly recommended.`;
    } else {
      stockStatus = 'POTENTIAL_SHORTAGE';
      recommendation = `WARNING: Projected demand (${predictedDemand} units) exceeds stock by ${projectedShortage} units. Recommend ordering ${recommendedRestock} units soon.`;
    }
  } else if (currentStock > predictedDemand * 2.5 && currentStock > 100) {
    stockStatus = 'OVERSTOCK_RISK';
    recommendation = `NOTICE: Current inventory (${currentStock} units) is more than 2.5x projected demand. Monitor holding costs.`;
  }

  return {
    stockStatus,
    projectedShortage,
    recommendedRestock,
    recommendation
  };
}

/**
 * Check whether an unread alert for this product & status was sent recently.
 */
async function hasRecentUnreadAlert(userId, productName, alertType) {
  try {
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        type: alertType,
        title: { contains: productName },
        isRead: false,
        createdAt: { gte: twelveHoursAgo }
      }
    });
    return Boolean(existing);
  } catch (err) {
    console.warn('Error checking recent notification deduplication:', err.message);
    return false;
  }
}

/**
 * Send intelligent notification to target user if not recently alerted.
 */
async function sendTargetedAlert(userId, title, message, alertType, io) {
  const isDuplicate = await hasRecentUnreadAlert(userId, title, alertType);
  if (isDuplicate) {
    return null;
  }

  const notification = await createNotification(userId, title, message, alertType);
  if (io) {
    io.to(`user-${userId}`).emit('notification', notification);
  }
  return notification;
}

/**
 * Proactively check a single product and dispatch AI low-stock alerts if needed.
 */
async function evaluateAndTriggerStockAlert(productIdOrProduct, io) {
  try {
    let product = productIdOrProduct;

    // If ID was passed, fetch full product with orders and supplier
    if (typeof productIdOrProduct === 'number') {
      product = await prisma.product.findUnique({
        where: { id: productIdOrProduct },
        include: {
          orders: {
            orderBy: { createdAt: 'desc' },
            take: 40
          },
          supplier: true
        }
      });
    } else if (!product.orders) {
      // If product object passed without orders, fetch orders
      const orders = await prisma.order.findMany({
        where: { productId: product.id },
        orderBy: { createdAt: 'desc' },
        take: 40
      });
      product.orders = orders;
    }

    if (!product) {
      return { triggered: false, reason: 'Product not found' };
    }

    // Identify target recipients
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true }
    });

    const recipientIds = new Set(admins.map((a) => a.id));
    if (product.supplierId) {
      recipientIds.add(product.supplierId);
    }

    const stats = getProductOrderStats(product.orders);
    const effectiveOrders = stats.recentOrders > 0
      ? stats.recentOrders
      : Math.max(15, Math.floor(product.stock * 0.4));

    let predictedDemand = null;
    let risk = null;

    try {
      const aiResponse = await aiService.getDemandPrediction({
        price: product.price,
        stock: product.stock,
        orders: effectiveOrders,
        lag1Orders: stats.lag1Orders > 0 ? stats.lag1Orders : effectiveOrders,
        rollingMean3: stats.rollingMean3 > 0 ? stats.rollingMean3 : effectiveOrders,
        month: (new Date().getMonth() % 12) + 2,
        productName: product.name
      });

      predictedDemand = aiResponse.predictedDemand;
      risk = evaluateStockRisk(product.stock, predictedDemand);
    } catch (aiError) {
      console.warn(`[alertService] AI demand forecast unavailable for product ${product.id}. Falling back to static threshold:`, aiError.message);

      // Graceful offline fallback: static stock < 10 rule
      if (product.stock < 10) {
        const title = `⚠️ Low Stock Warning: ${product.name}`;
        const message = `${product.name} has only ${product.stock} items remaining. Reorder recommended.`;
        const alertType = 'WARNING';

        const notificationsSent = [];
        for (const recipientId of recipientIds) {
          const sent = await sendTargetedAlert(recipientId, title, message, alertType, io);
          if (sent) notificationsSent.push(sent);
        }

        if (io) {
          io.to('role-admin').emit('inventory:alert', {
            productId: product.id,
            productName: product.name,
            currentStock: product.stock,
            stockStatus: 'LOW_STOCK_STATIC',
            fallback: true
          });
        }

        return {
          triggered: true,
          fallback: true,
          stockStatus: 'LOW_STOCK_STATIC',
          notificationsSent: notificationsSent.length
        };
      }

      return { triggered: false, fallback: true };
    }

    // If shortage risk detected
    if (risk.stockStatus === 'CRITICAL_SHORTAGE' || risk.stockStatus === 'POTENTIAL_SHORTAGE') {
      const isCritical = risk.stockStatus === 'CRITICAL_SHORTAGE';
      const title = isCritical
        ? `🚨 Critical Stockout Risk: ${product.name}`
        : `⚠️ Inventory Shortage Warning: ${product.name}`;

      const message = isCritical
        ? `Available stock (${product.stock} units) is critically below projected demand (${predictedDemand} units). Immediate reorder of ${risk.recommendedRestock} units recommended.`
        : `Available stock (${product.stock} units) is insufficient for projected demand (${predictedDemand} units). Consider reordering ${risk.recommendedRestock} units soon.`;

      const alertType = isCritical ? 'CRITICAL_SHORTAGE' : 'POTENTIAL_SHORTAGE';

      const notificationsSent = [];
      for (const recipientId of recipientIds) {
        const sent = await sendTargetedAlert(recipientId, title, message, alertType, io);
        if (sent) notificationsSent.push(sent);
      }

      // Broadcast inventory alert via Socket.IO
      if (io) {
        const alertPayload = {
          productId: product.id,
          productName: product.name,
          currentStock: product.stock,
          predictedDemand,
          projectedShortage: risk.projectedShortage,
          recommendedRestock: risk.recommendedRestock,
          stockStatus: risk.stockStatus,
          timestamp: new Date().toISOString()
        };

        io.to('role-admin').emit('inventory:alert', alertPayload);
        if (product.supplierId) {
          io.to(`user-${product.supplierId}`).emit('inventory:alert', alertPayload);
        }
      }

      return {
        triggered: true,
        productId: product.id,
        productName: product.name,
        predictedDemand,
        currentStock: product.stock,
        stockStatus: risk.stockStatus,
        recommendedRestock: risk.recommendedRestock,
        notificationsSent: notificationsSent.length
      };
    }

    return {
      triggered: false,
      productId: product.id,
      productName: product.name,
      stockStatus: risk.stockStatus
    };
  } catch (error) {
    console.error(`[alertService] Failed to evaluate alert for product:`, error.message);
    return { triggered: false, error: error.message };
  }
}

/**
 * Proactively scan all catalog products and dispatch AI shortage alerts.
 */
async function scanCatalogForRiskAlerts(options = {}, io) {
  const { supplierId, role } = options;
  const where = role === 'SUPPLIER' && supplierId ? { supplierId } : {};

  const products = await prisma.product.findMany({
    where,
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 30
      },
      supplier: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const summary = {
    totalScanned: products.length,
    alertsTriggered: 0,
    criticalCount: 0,
    potentialCount: 0,
    healthyCount: 0,
    fallbackCount: 0,
    details: []
  };

  for (const product of products) {
    const result = await evaluateAndTriggerStockAlert(product, io);
    if (result.triggered) {
      summary.alertsTriggered += 1;
      if (result.stockStatus === 'CRITICAL_SHORTAGE') summary.criticalCount += 1;
      else if (result.stockStatus === 'POTENTIAL_SHORTAGE') summary.potentialCount += 1;
      else if (result.fallback) summary.fallbackCount += 1;
    } else {
      summary.healthyCount += 1;
    }
    summary.details.push({
      productId: product.id,
      productName: product.name,
      currentStock: product.stock,
      ...result
    });
  }

  return summary;
}

module.exports = {
  getProductOrderStats,
  evaluateStockRisk,
  evaluateAndTriggerStockAlert,
  scanCatalogForRiskAlerts
};
