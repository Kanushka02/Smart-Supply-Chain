const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/config/prisma', () => ({
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn()
  }
}));

jest.mock('../../src/config/redis', () => ({
  get: jest.fn(),
  set: jest.fn(),
  keys: jest.fn(),
  del: jest.fn()
}));

jest.mock('../../src/config/queue', () => ({
  connection: {
    quit: jest.fn()
  },
  orderQueue: {
    add: jest.fn(),
    close: jest.fn()
  }
}));

jest.mock('../../src/services/aiService', () => ({
  checkHealth: jest.fn(),
  getDemandPrediction: jest.fn(),
  getModelInfo: jest.fn()
}));

const app = require('../../src/app');
const prisma = require('../../src/config/prisma');
const aiService = require('../../src/services/aiService');

const tokenFor = (role = 'ADMIN', id = 1) =>
  jwt.sign(
    {
      id,
      role
    },
    process.env.JWT_SECRET || 'testsecret'
  );

describe('Forecast API Integration Tests', () => {
  const adminToken = tokenFor('ADMIN', 1);
  const supplierToken = tokenFor('SUPPLIER', 2);
  const otherSupplierToken = tokenFor('SUPPLIER', 99);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/forecast/status', () => {
    it('should reject unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/forecast/status');
      expect(res.status).toBe(401);
    });

    it('should return AI microservice health for authenticated users', async () => {
      aiService.checkHealth.mockResolvedValueOnce({
        status: 'healthy',
        service: 'AI Demand Forecasting Microservice',
        model_loaded: true
      });

      const res = await request(app)
        .get('/api/forecast/status')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('healthy');
      expect(res.body.data.model_loaded).toBe(true);
    });
  });

  describe('GET /api/forecast/:productId', () => {
    const mockProduct = {
      id: 10,
      name: 'Cardamom',
      price: 1250,
      stock: 50,
      supplierId: 2,
      orders: [
        { quantity: 20, createdAt: new Date().toISOString() },
        { quantity: 30, createdAt: new Date().toISOString() }
      ]
    };

    it('should return 404 if product does not exist', async () => {
      prisma.product.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .get('/api/forecast/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Product not found');
    });

    it('should allow Admin to forecast any product', async () => {
      prisma.product.findUnique.mockResolvedValueOnce(mockProduct);
      aiService.getDemandPrediction.mockResolvedValueOnce({
        predictedDemand: 110,
        confidenceRange: { minDemand: 96, maxDemand: 124 },
        modelType: 'LinearRegression',
        modelMae: 14.23
      });

      const res = await request(app)
        .get('/api/forecast/10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.productId).toBe(10);
      expect(res.body.data.predictedDemand).toBe(110);
      expect(res.body.data.stockStatus).toBe('CRITICAL_SHORTAGE');
      expect(res.body.data.projectedShortage).toBe(60);
    });

    it('should allow Supplier to forecast their own product', async () => {
      prisma.product.findUnique.mockResolvedValueOnce(mockProduct);
      aiService.getDemandPrediction.mockResolvedValueOnce({
        predictedDemand: 45,
        confidenceRange: { minDemand: 31, maxDemand: 59 },
        modelType: 'LinearRegression',
        modelMae: 14.23
      });

      const res = await request(app)
        .get('/api/forecast/10')
        .set('Authorization', `Bearer ${supplierToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stockStatus).toBe('HEALTHY');
    });

    it('should reject Supplier trying to forecast another supplier product with 403', async () => {
      prisma.product.findUnique.mockResolvedValueOnce(mockProduct);

      const res = await request(app)
        .get('/api/forecast/10')
        .set('Authorization', `Bearer ${otherSupplierToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Access denied');
    });

    it('should return 503 if AI service is offline', async () => {
      prisma.product.findUnique.mockResolvedValueOnce(mockProduct);
      aiService.getDemandPrediction.mockRejectedValueOnce(
        new Error('AI_SERVICE_UNAVAILABLE: The AI Forecasting service is currently unreachable.')
      );

      const res = await request(app)
        .get('/api/forecast/10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(503);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('AI_SERVICE_UNAVAILABLE');
    });
  });

  describe('GET /api/forecast', () => {
    it('should return batch forecasts and summary for Admin', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Cinnamon Powder',
          price: 500,
          stock: 200,
          orders: [{ quantity: 50, createdAt: new Date().toISOString() }]
        },
        {
          id: 2,
          name: 'Cloves',
          price: 880,
          stock: 40,
          orders: [{ quantity: 30, createdAt: new Date().toISOString() }]
        }
      ];

      prisma.product.findMany.mockResolvedValueOnce(mockProducts);
      aiService.getDemandPrediction
        .mockResolvedValueOnce({
          predictedDemand: 180,
          confidenceRange: { minDemand: 166, maxDemand: 194 }
        })
        .mockResolvedValueOnce({
          predictedDemand: 120,
          confidenceRange: { minDemand: 106, maxDemand: 134 }
        });

      const res = await request(app)
        .get('/api/forecast')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.totalProducts).toBe(2);
      expect(res.body.data.summary.totalPredictedDemand).toBe(300);
      expect(res.body.data.forecasts.length).toBe(2);
    });
  });
});
