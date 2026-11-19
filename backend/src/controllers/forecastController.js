const prisma = require('../config/prisma');
const aiService = require('../services/aiService');

/**
 * Helper to compute recent 30-day order quantity and rolling statistics for a product.
 */
const getProductOrderStats = (orders) => {
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

  // Orders in the last 30 days
  const recentOrders = orders
    .filter((o) => new Date(o.createdAt) >= thirtyDaysAgo)
    .reduce((sum, o) => sum + (o.quantity || 0), 0);

  // Orders in the prior 30-day window (days 31-60)
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
};

/**
 * Determine inventory risk level based on stock vs predicted demand.
 */
const evaluateStockRisk = (currentStock, predictedDemand) => {
  let stockStatus = 'HEALTHY';
  let projectedShortage = 0;
  let recommendedRestock = 0;
  let recommendation = 'Inventory level is adequate for anticipated demand.';

  if (currentStock < predictedDemand) {
    projectedShortage = predictedDemand - currentStock;
    // Buffer recommendation (+20% safety stock)
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
};

/**
 * GET /api/forecast/status
 * Check AI service connectivity and health.
 */
exports.getAiHealth = async (req, res) => {
  try {
    const health = await aiService.checkHealth();
    return res.status(200).json({
      success: true,
      data: health
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to verify AI service health',
      error: error.message
    });
  }
};

/**
 * GET /api/forecast/:productId
 * Forecast future demand for a single product.
 */
exports.getProductForecast = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId, 10);

    if (!Number.isFinite(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid Product ID is required'
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Role-based access check: Suppliers can only forecast their own products
    if (req.user.role === 'SUPPLIER' && product.supplierId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only generate demand forecasts for your own products'
      });
    }

    // Compute order history statistics
    const stats = getProductOrderStats(product.orders);

    // If new product with 0 historical orders, provide safe baseline
    const effectiveOrders = stats.recentOrders > 0
      ? stats.recentOrders
      : Math.max(15, Math.floor(product.stock * 0.4));

    const predictionPayload = {
      price: product.price,
      stock: product.stock,
      orders: effectiveOrders,
      lag1Orders: stats.lag1Orders > 0 ? stats.lag1Orders : effectiveOrders,
      rollingMean3: stats.rollingMean3 > 0 ? stats.rollingMean3 : effectiveOrders,
      month: (new Date().getMonth() % 12) + 2, // next calendar month
      productName: product.name
    };

    // Request forecast from Python FastAPI microservice
    const aiResponse = await aiService.getDemandPrediction(predictionPayload);

    // Evaluate inventory risk
    const riskAnalysis = evaluateStockRisk(product.stock, aiResponse.predictedDemand);

    return res.status(200).json({
      success: true,
      data: {
        productId: product.id,
        productName: product.name,
        price: product.price,
        currentStock: product.stock,
        recentOrdersRecorded: stats.recentOrders,
        predictedDemand: aiResponse.predictedDemand,
        confidenceRange: aiResponse.confidenceRange,
        ...riskAnalysis,
        modelInfo: {
          modelType: aiResponse.modelType,
          mae: aiResponse.modelMae
        }
      }
    });
  } catch (error) {
    console.error('Forecast error:', error.message);

    if (error.message.includes('AI_SERVICE_UNAVAILABLE')) {
      return res.status(503).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to generate demand forecast',
      error: error.message
    });
  }
};

/**
 * GET /api/forecast
 * Batch forecast for all accessible products (Admin sees all; Supplier sees owned).
 */
exports.getAllForecasts = async (req, res) => {
  try {
    const where = req.user.role === 'SUPPLIER' ? { supplierId: req.user.id } : {};

    const products = await prisma.product.findMany({
      where,
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 30
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (products.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          summary: {
            totalProducts: 0,
            totalPredictedDemand: 0,
            criticalShortagesCount: 0,
            potentialShortagesCount: 0
          },
          forecasts: []
        }
      });
    }

    const forecasts = [];
    let totalPredictedDemand = 0;
    let criticalCount = 0;
    let potentialCount = 0;

    for (const product of products) {
      const stats = getProductOrderStats(product.orders);
      const effectiveOrders = stats.recentOrders > 0
        ? stats.recentOrders
        : Math.max(15, Math.floor(product.stock * 0.4));

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

        const risk = evaluateStockRisk(product.stock, aiResponse.predictedDemand);

        if (risk.stockStatus === 'CRITICAL_SHORTAGE') criticalCount += 1;
        if (risk.stockStatus === 'POTENTIAL_SHORTAGE') potentialCount += 1;
        totalPredictedDemand += aiResponse.predictedDemand;

        forecasts.push({
          productId: product.id,
          productName: product.name,
          price: product.price,
          currentStock: product.stock,
          predictedDemand: aiResponse.predictedDemand,
          confidenceRange: aiResponse.confidenceRange,
          ...risk
        });
      } catch (err) {
        console.warn(`Forecast failed for product ${product.id}:`, err.message);
        // Include product with fallback status rather than failing entire batch
        forecasts.push({
          productId: product.id,
          productName: product.name,
          price: product.price,
          currentStock: product.stock,
          predictedDemand: null,
          stockStatus: 'FORECAST_UNAVAILABLE',
          recommendation: 'Unable to calculate forecast at this time.'
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalProducts: products.length,
          totalPredictedDemand,
          criticalShortagesCount: criticalCount,
          potentialShortagesCount: potentialCount
        },
        forecasts
      }
    });
  } catch (error) {
    console.error('Batch forecast error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate batch demand forecasts',
      error: error.message
    });
  }
};
