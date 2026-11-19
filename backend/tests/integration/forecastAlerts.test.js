const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/config/prisma', () => ({
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn()
  },
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn()
  },
  order: {
    findMany: jest.fn(),
    create: jest.fn()
  },
  notification: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn()
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
const alertService = require('../../src/services/alertService');

const tokenFor = (role = 'ADMIN', id = 1) =>
  jwt.sign(
    {
      id,
      role
    },
    process.env.JWT_SECRET || 'testsecret'
  );

describe('Forecast Alerts & AI Low-Stock Automation Tests', () => {
  const adminToken = tokenFor('ADMIN', 1);
  const supplierToken = tokenFor('SUPPLIER', 2);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('evaluateStockRisk() logic', () => {
    it('should classify critical shortage when stock is less than 50% of demand', () => {
      const risk = alertService.evaluateStockRisk(30, 100);
      expect(risk.stockStatus).toBe('CRITICAL_SHORTAGE');
      expect(risk.projectedShortage).toBe(70);
      expect(risk.recommendedRestock).toBe(90); // 70 + 20% of 100
    });

    it('should classify potential shortage when stock is between 50% and 100% of demand', () => {
      const risk = alertService.evaluateStockRisk(75, 100);
      expect(risk.stockStatus).toBe('POTENTIAL_SHORTAGE');
      expect(risk.projectedShortage).toBe(25);
    });

    it('should classify healthy stock when inventory meets projected demand', () => {
      const risk = alertService.evaluateStockRisk(120, 100);
      expect(risk.stockStatus).toBe('HEALTHY');
      expect(risk.projectedShortage).toBe(0);
    });

    it('should detect overstock risk when inventory is more than 2.5x demand', () => {
      const risk = alertService.evaluateStockRisk(300, 80);
      expect(risk.stockStatus).toBe('OVERSTOCK_RISK');
    });
  });

  describe('POST /api/forecast/check-alerts', () => {
    it('should reject unauthenticated requests with 401', async () => {
      const res = await request(app).post('/api/forecast/check-alerts');
      expect(res.status).toBe(401);
    });

    it('should scan catalog and trigger notifications for critical shortages', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Cinnamon Powder',
          price: 500,
          stock: 20,
          supplierId: 2,
          orders: [{ quantity: 50, createdAt: new Date().toISOString() }]
        }
      ];

      prisma.product.findMany.mockResolvedValueOnce(mockProducts);
      prisma.user.findMany.mockResolvedValueOnce([{ id: 1, role: 'ADMIN' }]);
      prisma.notification.findFirst.mockResolvedValue(null); // No previous duplicate
      prisma.notification.create.mockImplementation((args) =>
        Promise.resolve({ id: 101, ...args.data })
      );

      aiService.getDemandPrediction.mockResolvedValueOnce({
        predictedDemand: 120,
        confidenceRange: { minDemand: 106, maxDemand: 134 }
      });

      const res = await request(app)
        .post('/api/forecast/check-alerts')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalScanned).toBe(1);
      expect(res.body.data.alertsTriggered).toBe(1);
      expect(res.body.data.criticalCount).toBe(1);

      // Verify notification created for Admin and Supplier
      expect(prisma.notification.create).toHaveBeenCalled();
    });

    it('should deduplicate when recent unread alert already exists', async () => {
      const mockProducts = [
        {
          id: 2,
          name: 'Black Pepper',
          price: 850,
          stock: 15,
          supplierId: 2,
          orders: [{ quantity: 30, createdAt: new Date().toISOString() }]
        }
      ];

      prisma.product.findMany.mockResolvedValueOnce(mockProducts);
      prisma.user.findMany.mockResolvedValueOnce([{ id: 1, role: 'ADMIN' }]);
      // Simulate existing recent unread alert
      prisma.notification.findFirst.mockResolvedValue({ id: 99, isRead: false });

      aiService.getDemandPrediction.mockResolvedValueOnce({
        predictedDemand: 100,
        confidenceRange: { minDemand: 86, maxDemand: 114 }
      });

      const res = await request(app)
        .post('/api/forecast/check-alerts')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.alertsTriggered).toBe(1);
      // createNotification should NOT be called due to deduplication
      expect(prisma.notification.create).not.toHaveBeenCalled();
    });

    it('should fallback to static low stock check when AI service is unavailable', async () => {
      const mockProducts = [
        {
          id: 3,
          name: 'Cloves',
          price: 900,
          stock: 5, // < 10 triggers static fallback
          supplierId: 2,
          orders: []
        }
      ];

      prisma.product.findMany.mockResolvedValueOnce(mockProducts);
      prisma.user.findMany.mockResolvedValueOnce([{ id: 1, role: 'ADMIN' }]);
      prisma.notification.findFirst.mockResolvedValue(null);
      prisma.notification.create.mockImplementation((args) =>
        Promise.resolve({ id: 102, ...args.data })
      );

      aiService.getDemandPrediction.mockRejectedValueOnce(
        new Error('AI_SERVICE_UNAVAILABLE')
      );

      const res = await request(app)
        .post('/api/forecast/check-alerts')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalScanned).toBe(1);
      expect(res.body.data.alertsTriggered).toBe(1);
      expect(res.body.data.fallbackCount).toBe(1);
      expect(prisma.notification.create).toHaveBeenCalled();
    });
  });
});
