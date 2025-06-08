const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const auth = require('../middleware/auth');
const { 
  createQuotationValidation,
  recordPaymentValidation,
  filterSalesValidation
} = require('../validations/salesValidation');

// Product listings
router.get('/products', auth, salesController.getProducts);

// Quotation management
router.post('/quotation', auth, createQuotationValidation, salesController.createQuotation);
router.put('/quotation/:id/convert', auth, salesController.convertToInvoice);

// Payment processing
router.post('/:id/payment', auth, recordPaymentValidation, salesController.recordPayment);
router.get('/:id/receipt/:paymentIndex', auth, salesController.generateReceipt);

// Sales history and details
router.get('/history', auth, filterSalesValidation, salesController.getSalesHistory);
router.get('/:id', auth, salesController.getSale);

module.exports = router;