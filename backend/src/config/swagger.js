const swaggerJsdoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Smart Supply Chain API',
    version: '1.0.0',
    description:
      'Professional API documentation for the Smart Supply Chain ERP backend.'
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Local development API'
    }
  ],
  tags: [
    { name: 'Auth', description: 'Authentication and token management' },
    { name: 'Products', description: 'Product and inventory management' },
    { name: 'Orders', description: 'Supplier order workflows' },
    { name: 'Users', description: 'Admin user management' },
    { name: 'Notifications', description: 'Real-time notification records' },
    { name: 'Forecast', description: 'AI demand forecasting and stock risk optimization' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Something went wrong' }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Admin User' },
          email: { type: 'string', format: 'email', example: 'admin@example.com' },
          role: { type: 'string', enum: ['ADMIN', 'SUPPLIER'], example: 'ADMIN' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 12 },
          name: { type: 'string', example: 'Wireless Scanner' },
          description: { type: 'string', example: 'Barcode scanner for warehouse teams' },
          price: { type: 'number', example: 12500 },
          stock: { type: 'integer', example: 48 },
          image: { type: 'string', nullable: true, example: 'https://res.cloudinary.com/demo/image/upload/scanner.jpg' },
          supplierId: { type: 'integer', nullable: true, example: 4 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 101 },
          userId: { type: 'integer', example: 4 },
          productId: { type: 'integer', example: 12 },
          quantity: { type: 'integer', example: 3 },
          totalPrice: { type: 'number', example: 37500 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          user: { $ref: '#/components/schemas/User' },
          product: { $ref: '#/components/schemas/Product' }
        }
      },
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 7 },
          userId: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'New Order Received' },
          message: { type: 'string', example: 'Supplier created a new order.' },
          type: { type: 'string', enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR'], example: 'INFO' },
          isRead: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a supplier account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Supplier One' },
                  email: { type: 'string', format: 'email', example: 'supplier@example.com' },
                  password: { type: 'string', format: 'password', example: 'Password123' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'User registered successfully' },
          400: { description: 'Invalid registration request' },
          500: { description: 'Server error' }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive JWT tokens',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'admin@example.com' },
                  password: { type: 'string', format: 'password', example: 'Password123' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Login successful' },
          400: { description: 'Missing email or password' },
          401: { description: 'Invalid password' },
          404: { description: 'User not found' },
          500: { description: 'Server error' }
        }
      }
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh an access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'New access token generated' },
          401: { description: 'Invalid or missing refresh token' }
        }
      }
    },
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'Get products with pagination, search, filtering, and sorting',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 100 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['price', '-price', '-createdAt'] } }
        ],
        responses: {
          200: {
            description: 'Product list returned',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Product' }
                    }
                  }
                }
              }
            }
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden role' },
          500: { description: 'Server error' }
        }
      },
      post: {
        tags: ['Products'],
        summary: 'Create a product',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['name', 'price', 'stock'],
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  price: { type: 'number' },
                  stock: { type: 'integer' },
                  image: { type: 'string', format: 'binary' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Product created' },
          400: { description: 'Validation failed' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden role' },
          500: { description: 'Server error' }
        }
      }
    },
    '/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get product by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Product returned' },
          401: { description: 'Unauthorized' },
          404: { description: 'Product not found' },
          500: { description: 'Server error' }
        }
      },
      put: {
        tags: ['Products'],
        summary: 'Update a product',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  price: { type: 'number' },
                  stock: { type: 'integer' },
                  image: { type: 'string', format: 'binary' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Product updated' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden role or supplier ownership mismatch' },
          404: { description: 'Product not found' },
          500: { description: 'Server error' }
        }
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete a product',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Product deleted' },
          401: { description: 'Unauthorized' },
          403: { description: 'Admin role required' },
          404: { description: 'Product not found' },
          500: { description: 'Server error' }
        }
      }
    },
    '/orders': {
      get: {
        tags: ['Orders'],
        summary: 'Get all orders for admin, or current supplier orders',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Orders returned' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden role' },
          500: { description: 'Server error' }
        }
      },
      post: {
        tags: ['Orders'],
        summary: 'Create an order and emit real-time dashboard events',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId', 'quantity'],
                properties: {
                  productId: { type: 'integer', example: 12 },
                  quantity: { type: 'integer', example: 3 }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Order created' },
          400: { description: 'Insufficient stock or invalid request' },
          401: { description: 'Unauthorized' },
          403: { description: 'Supplier role required' },
          404: { description: 'User or product not found' },
          500: { description: 'Server error' }
        }
      }
    },
    '/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get order by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Order returned' },
          401: { description: 'Unauthorized' },
          403: { description: 'Access denied' },
          404: { description: 'Order not found' },
          500: { description: 'Server error' }
        }
      },
      put: {
        tags: ['Orders'],
        summary: 'Update an order',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  productId: { type: 'integer' },
                  userId: { type: 'integer' },
                  quantity: { type: 'integer' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Order updated' },
          401: { description: 'Unauthorized' },
          403: { description: 'Admin role required' },
          404: { description: 'Order or product not found' },
          500: { description: 'Server error' }
        }
      },
      delete: {
        tags: ['Orders'],
        summary: 'Delete an order',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Order deleted' },
          401: { description: 'Unauthorized' },
          403: { description: 'Admin role required' },
          500: { description: 'Server error' }
        }
      }
    },
    '/orders/user/{userId}': {
      get: {
        tags: ['Orders'],
        summary: 'Get orders by user ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'User orders returned' },
          401: { description: 'Unauthorized' },
          403: { description: 'Access denied' },
          500: { description: 'Server error' }
        }
      }
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Get all users',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Users returned' },
          401: { description: 'Unauthorized' },
          403: { description: 'Admin role required' },
          500: { description: 'Server error' }
        }
      },
      post: {
        tags: ['Users'],
        summary: 'Create a user',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                  role: { type: 'string', enum: ['ADMIN', 'SUPPLIER'] }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'User created' },
          400: { description: 'Invalid request' },
          401: { description: 'Unauthorized' },
          403: { description: 'Admin role required' },
          500: { description: 'Server error' }
        }
      }
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'User returned' },
          401: { description: 'Unauthorized' },
          403: { description: 'Admin role required' },
          404: { description: 'User not found' },
          500: { description: 'Server error' }
        }
      },
      put: {
        tags: ['Users'],
        summary: 'Update a user',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'User updated' },
          401: { description: 'Unauthorized' },
          403: { description: 'Admin role required' },
          500: { description: 'Server error' }
        }
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete a user',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'User deleted' },
          401: { description: 'Unauthorized' },
          403: { description: 'Admin role required' },
          500: { description: 'Server error' }
        }
      }
    },
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Get notifications for the logged-in user',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
        ],
        responses: {
          200: { description: 'Notifications returned' },
          401: { description: 'Unauthorized' },
          500: { description: 'Server error' }
        }
      }
    },
    '/notifications/unread': {
      get: {
        tags: ['Notifications'],
        summary: 'Get unread notifications and unread count',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Unread notifications returned' },
          401: { description: 'Unauthorized' },
          500: { description: 'Server error' }
        }
      }
    },
    '/notifications/{id}/read': {
      put: {
        tags: ['Notifications'],
        summary: 'Mark a notification as read',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Notification marked as read' },
          401: { description: 'Unauthorized' },
          500: { description: 'Server error' }
        }
      }
    },
    '/notifications/read-all': {
      put: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Notifications marked as read' },
          401: { description: 'Unauthorized' },
          500: { description: 'Server error' }
        }
      }
    },
    '/notifications/{id}': {
      delete: {
        tags: ['Notifications'],
        summary: 'Delete a notification',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Notification deleted' },
          401: { description: 'Unauthorized' },
          500: { description: 'Server error' }
        }
      }
    },
    '/notifications/delete/all': {
      delete: {
        tags: ['Notifications'],
        summary: 'Delete all notifications for the logged-in user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Notifications deleted' },
          401: { description: 'Unauthorized' },
          500: { description: 'Server error' }
        }
      }
    },
    '/forecast/status': {
      get: {
        tags: ['Forecast'],
        summary: 'Check AI forecasting microservice health',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'AI service status returned' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/forecast': {
      get: {
        tags: ['Forecast'],
        summary: 'Batch demand forecasts and risk analysis for accessible products',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Batch forecasts and summary returned' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/forecast/check-alerts': {
      post: {
        tags: ['Forecast'],
        summary: 'Proactively scan catalog for shortage risks and dispatch automated alerts',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Catalog shortage scan executed and alerts dispatched' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/forecast/{productId}': {
      get: {
        tags: ['Forecast'],
        summary: 'Forecast next-month demand and evaluate stock risk for a product',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'productId',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          200: { description: 'Product forecast returned' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
          404: { description: 'Product not found' },
          503: { description: 'AI service offline' }
        }
      }
    }
  }
};

const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: ['./src/routes/*.js']
});

module.exports = swaggerSpec;
