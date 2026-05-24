const { body, validationResult } = require('express-validator');

exports.validateProduct = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required'),

  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be 0 or greater'),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    next();
  }
];