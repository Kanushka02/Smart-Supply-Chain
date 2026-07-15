const { productSchema } = require('../../src/validators/productValidator');

describe('Product validator', () => {
  it('accepts a valid product payload', () => {
    const payload = {
      name: 'Warehouse Scanner',
      description: 'Barcode scanner for warehouse teams',
      price: 12500,
      stock: 20
    };

    const result = productSchema.parse(payload);

    expect(result).toEqual(payload);
  });

  it('rejects products with invalid price and stock', () => {
    const result = productSchema.safeParse({
      name: 'Scanner',
      description: 'Valid description',
      price: -10,
      stock: 1.5
    });

    expect(result.success).toBe(false);
    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['price'],
          message: 'Price must be a positive number'
        }),
        expect.objectContaining({
          path: ['stock'],
          message: 'Invalid input: expected int, received number'
        })
      ])
    );
  });

  it('rejects short product names and descriptions', () => {
    const result = productSchema.safeParse({
      name: 'AB',
      description: 'No',
      price: 100,
      stock: 5
    });

    expect(result.success).toBe(false);
    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['name'],
          message: 'Product name must be at least 3 characters long'
        }),
        expect.objectContaining({
          path: ['description'],
          message: 'Description must be at least 3 characters long'
        })
      ])
    );
  });
});
