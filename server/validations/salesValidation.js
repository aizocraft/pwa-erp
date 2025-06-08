const { body, query, param } = require('express-validator');

// For POST /api/sales/quotation
exports.createQuotationValidation = [
  body('items')
    .isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product')
    .isMongoId().withMessage('Invalid product ID'),
  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('customerName')
    .notEmpty().withMessage('Customer name is required')
    .trim()
    .isLength({ min: 2 }).withMessage('Customer name must be at least 2 characters'),
  body('customerContact')
    .optional()
    .trim()
    .isLength({ min: 5 }).withMessage('Contact must be at least 5 characters'),
  body('customerEmail')
    .optional()
    .isEmail().withMessage('Invalid email format'),
  body('customerAddress')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Address too long'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  body('termsAndConditions')
    .optional()
    .isBoolean().withMessage('Terms must be true/false'),
  body('taxRate')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Tax rate must be between 0-100'),
  body('shipping')
    .optional()
    .isFloat({ min: 0 }).withMessage('Shipping must be positive number'),
  body('discount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Discount must be positive number')
];

// For POST /api/sales/:id/payment
exports.recordPaymentValidation = [
  body('method')
    .isIn(['cash', 'credit', 'debit', 'transfer', 'check']).withMessage('Invalid payment method'),
  body('amount')
    .isFloat({ min: 0.01 }).withMessage('Valid payment amount required'),
  body('transactionId')
    .optional()
    .trim()
    .isLength({ min: 3 }).withMessage('Transaction ID too short'),
  body('bankName')
    .if(body('method').equals('transfer'))
    .notEmpty().withMessage('Bank name required for transfers')
    .bail()
    .if(body('method').equals('check'))
    .notEmpty().withMessage('Bank name required for checks'),
  body('chequeNumber')
    .if(body('method').equals('check'))
    .notEmpty().withMessage('Cheque number required'),
  body('cardLastFour')
    .if(body('method').equals('credit'))
    .isLength({ min: 4, max: 4 }).withMessage('Last 4 card digits required')
    .isNumeric().withMessage('Card digits must be numbers')
    .bail()
    .if(body('method').equals('debit'))
    .isLength({ min: 4, max: 4 }).withMessage('Last 4 card digits required')
    .isNumeric().withMessage('Card digits must be numbers'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Payment notes too long')
];

// For GET /api/sales/history
exports.filterSalesValidation = [
  query('startDate')
    .optional()
    .isISO8601().withMessage('Invalid start date format (use ISO format)'),
  query('endDate')
    .optional()
    .isISO8601().withMessage('Invalid end date format (use ISO format)')
    .custom((value, { req }) => {
      if (req.query.startDate && new Date(value) < new Date(req.query.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  query('productId')
    .optional()
    .isMongoId().withMessage('Invalid product ID'),
  query('userId')
    .optional()
    .isMongoId().withMessage('Invalid user ID'),
  query('type')
    .optional()
    .isIn(['quotation', 'invoice', 'paid']).withMessage('Invalid document type')
];

// For backward compatibility (if used elsewhere in your app)
exports.sellProductValidation = [
  body('productId')
    .notEmpty().withMessage('Product ID is required')
    .isMongoId().withMessage('Invalid product ID'),
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('customerName')
    .notEmpty().withMessage('Customer name is required')
    .trim()
    .isLength({ min: 2 }).withMessage('Customer name must be at least 2 characters'),
  body('customerContact')
    .optional()
    .trim()
    .isLength({ min: 5 }).withMessage('Contact must be at least 5 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
];