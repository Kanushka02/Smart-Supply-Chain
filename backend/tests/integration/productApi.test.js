const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/config/prisma', () => ({
  product: {
    count: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  $transaction: jest.fn()
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

jest.mock('../../src/middleware/uploadMiddleware', () => ({
  single: jest.fn(() => (req, res, next) => next())
}));

jest.mock('../../src/services/auditService', () => ({
  createAuditLog: jest.fn()
}));

const app = require('../../src/app');
const prisma = require('../../src/config/prisma');
const redis = require('../../src/config/redis');
const { createAuditLog } = require('../../src/services/auditService');

const tokenFor = (role = 'ADMIN', id = 1) =>
  jwt.sign(
    {
      id,
      role
    },
    process.env.JWT_SECRET
  );

describe('Product API', () => {
  beforeEach(() => {
    redis.get.mockResolvedValue(null);
    redis.set.mockResolvedValue('OK');
    redis.keys.mockResolvedValue([]);
    redis.del.mockResolvedValue(0);
    createAuditLog.mockResolvedValue(undefined);
  });

  describe('GET /api/products', () => {
    it('returns paginated products for an authenticated admin', async () => {
      const products = [
        {
          id: 1,
          name: 'Warehouse Scanner',
          price: 12500,
          stock: 8,
          image: null,
          createdAt: new Date('2026-07-15T00:00:00.000Z')
        }
      ];

      prisma.$transaction.mockResolvedValue([1, products]);

      const response = await request(app)
        .get('/api/products?page=1&limit=10&search=scanner')
        .set('Authorization', `Bearer ${tokenFor('ADMIN')}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        total: 1,
        page: 1,
        limit: 10,
        data: [
          expect.objectContaining({
            id: 1,
            name: 'Warehouse Scanner',
            price: 12500,
            stock: 8
          })
        ]
      });
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(redis.set).toHaveBeenCalledWith(
        '/api/products?page=1&limit=10&search=scanner',
        expect.any(String),
        {
          EX: 300
        }
      );
    });

    it('returns 401 when no token is provided', async () => {
      const response = await request(app).get('/api/products');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: 'No token'
      });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/products', () => {
    it('creates a product for an admin user', async () => {
      const createdProduct = {
        id: 2,
        name: 'Inventory Tablet',
        description: 'Rugged stock-taking tablet',
        price: 90000,
        stock: 12,
        image: null,
        supplierId: null
      };

      prisma.product.create.mockResolvedValue(createdProduct);

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenFor('ADMIN')}`)
        .send({
          name: 'Inventory Tablet',
          description: 'Rugged stock-taking tablet',
          price: 90000,
          stock: 12
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdProduct);
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: {
          name: 'Inventory Tablet',
          description: 'Rugged stock-taking tablet',
          price: 90000,
          stock: 12,
          image: null,
          supplierId: null
        }
      });
      expect(createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          action: 'CREATE',
          entity: 'PRODUCT',
          entityId: 2
        })
      );
    });

    it('creates a product linked to the supplier when a supplier creates it', async () => {
      prisma.product.create.mockResolvedValue({
        id: 3,
        name: 'Packing Labels',
        description: 'Thermal labels for shipments',
        price: 1500,
        stock: 100,
        image: null,
        supplierId: 7
      });

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenFor('SUPPLIER', 7)}`)
        .send({
          name: 'Packing Labels',
          description: 'Thermal labels for shipments',
          price: 1500,
          stock: 100
        });

      expect(response.status).toBe(201);
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          supplierId: 7
        })
      });
    });

    it('returns 400 when validation fails', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenFor('ADMIN')}`)
        .send({
          name: 'No',
          description: 'No',
          price: -1,
          stock: 2
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          message: 'Validation error'
        })
      );
      expect(prisma.product.create).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('deletes an existing product for an admin user', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 10,
        name: 'Old Product'
      });
      prisma.product.delete.mockResolvedValue({
        id: 10,
        name: 'Old Product'
      });

      const response = await request(app)
        .delete('/api/products/10')
        .set('Authorization', `Bearer ${tokenFor('ADMIN')}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Product deleted successfully'
      });
      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: {
          id: 10
        }
      });
    });

    it('returns 403 when a supplier tries to delete a product', async () => {
      const response = await request(app)
        .delete('/api/products/10')
        .set('Authorization', `Bearer ${tokenFor('SUPPLIER', 7)}`);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        message: 'Access denied'
      });
      expect(prisma.product.delete).not.toHaveBeenCalled();
    });
  });
});
