const { z } = require('zod');

const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters long'),
  description: z.string().min(3, 'Description must be at least 3 characters long'),
  price: z.number().positive('Price must be a positive number'),
  stock: z.number().int().min(0, 'Stock must be 0 or greater')
});

module.exports = {
  productSchema
};