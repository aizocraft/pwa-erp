const mongoose = require('mongoose');
const Hardware = require('../models/Hardware');
const Sale = require('../models/Sale');
const { validationResult } = require('express-validator');
const errorResponse = require('../utils/errorResponse');

// @desc    Get all products for sales view
// @route   GET /api/sales/products
// @access  Private/Sales
exports.getProducts = async (req, res) => {
  try {
    if (req.user.role !== 'sales') {
      return errorResponse(res, 403, 'Unauthorized access');
    }

    const products = await Hardware.find()
      .select('name description category quantity unit pricePerUnit threshold supplier')
      .populate('supplier', 'name')
      .sort({ name: 1 });

    const enhancedProducts = products.map(product => ({
      ...product._doc,
      lowStock: product.quantity < product.threshold,
      available: product.quantity > 0,
      supplierName: product.supplier?.name || 'N/A'
    }));

    res.json({ 
      success: true, 
      count: enhancedProducts.length, 
      products: enhancedProducts 
    });
  } catch (err) {
    console.error('Get products error:', err);
    errorResponse(res, 500, 'Server error');
  }
};

// @desc    Create a new quotation
// @route   POST /api/sales/quotation
// @access  Private/Sales
exports.createQuotation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 400, 'Validation failed', errors.array());
  }

  try {
    if (req.user.role !== 'sales') {
      return errorResponse(res, 403, 'Unauthorized access');
    }

    const { 
      items, 
      customerName, 
      customerContact, 
      customerEmail, 
      customerAddress, 
      notes,
      termsAndConditions,
      taxRate = 0,
      shipping = 0,
      discount = 0
    } = req.body;

    // Validate items and calculate prices
    const populatedItems = await Promise.all(items.map(async item => {
      const product = await Hardware.findById(item.product);
      if (!product) {
        throw new Error(`Product ${item.product} not found`);
      }

      return {
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.customPrice || product.pricePerUnit,
        discountPercentage: item.discountPercentage || 0,
        discountedPrice: (item.customPrice || product.pricePerUnit) * (1 - ((item.discountPercentage || 0) / 100)),
        totalPrice: (item.customPrice || product.pricePerUnit) * (1 - ((item.discountPercentage || 0) / 100)) * item.quantity
      };
    }));

    // Calculate totals
    const subTotal = populatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = subTotal * (taxRate / 100);
    const totalPrice = subTotal + taxAmount + shipping - discount;

    // Create quotation
    const quotation = await Sale.create({
      items: populatedItems,
      subTotal,
      discount,
      taxRate,
      taxAmount,
      shipping,
      totalPrice,
      soldBy: req.user.id,
      customerName,
      customerContact,
      customerEmail,
      customerAddress,
      notes,
      termsAndConditions,
      status: 'quotation'
    });

    res.status(201).json({
      success: true,
      message: 'Quotation created successfully',
      quotation
    });

  } catch (err) {
    console.error('Create quotation error:', err);
    errorResponse(res, 500, 'Failed to create quotation');
  }
};

// @desc    Convert quotation to invoice and update inventory
// @route   PUT /api/sales/quotation/:id/convert
// @access  Private/Sales
exports.convertToInvoice = async (req, res) => {
  try {
    if (req.user.role !== 'sales') {
      return errorResponse(res, 403, 'Unauthorized access');
    }

    const quotation = await Sale.findById(req.params.id);
    if (!quotation) {
      return errorResponse(res, 404, 'Quotation not found');
    }

    // Convert to invoice and update inventory
    const invoice = await quotation.convertToInvoice();

    res.json({
      success: true,
      message: 'Quotation converted to invoice successfully. Inventory updated.',
      invoice
    });

  } catch (err) {
    console.error('Convert to invoice error:', err);
    errorResponse(res, 500, err.message || 'Failed to convert quotation to invoice');
  }
};

// @desc    Record payment for a sale
// @route   POST /api/sales/:id/payment
// @access  Private/Sales
exports.recordPayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 400, 'Validation failed', errors.array());
  }

  try {
    if (req.user.role !== 'sales' && req.user.role !== 'cashier') {
      return errorResponse(res, 403, 'Unauthorized access');
    }

    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return errorResponse(res, 404, 'Sale not found');
    }

    const { 
      method, 
      amount, 
      transactionId, 
      bankName, 
      chequeNumber, 
      cardLastFour, 
      notes 
    } = req.body;

    // Record payment
    const paymentData = {
      method,
      amount,
      transactionId,
      bankName,
      chequeNumber,
      cardLastFour,
      notes
    };

    const updatedSale = await sale.recordPayment(paymentData);

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      sale: updatedSale
    });

  } catch (err) {
    console.error('Record payment error:', err);
    errorResponse(res, 500, err.message || 'Failed to record payment');
  }
};

// @desc    Generate receipt for a payment
// @route   GET /api/sales/:id/receipt/:paymentIndex
// @access  Private/Sales
exports.generateReceipt = async (req, res) => {
  try {
    if (req.user.role !== 'sales' && req.user.role !== 'cashier') {
      return errorResponse(res, 403, 'Unauthorized access');
    }

    const sale = await Sale.findById(req.params.id)
      .populate('items.product', 'name')
      .populate('soldBy', 'username');
    
    if (!sale) {
      return errorResponse(res, 404, 'Sale not found');
    }

    const paymentIndex = parseInt(req.params.paymentIndex) || 0;
    if (paymentIndex >= sale.paymentDetails.length) {
      return errorResponse(res, 400, 'Payment index out of range');
    }

    const receipt = sale.generateReceipt(paymentIndex);

    res.json({
      success: true,
      receipt
    });

  } catch (err) {
    console.error('Generate receipt error:', err);
    errorResponse(res, 500, 'Failed to generate receipt');
  }
};

// @desc    Get sales history with filtering
// @route   GET /api/sales/history
// @access  Private/Sales
exports.getSalesHistory = async (req, res) => {
  try {
    if (req.user.role !== 'sales' && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Unauthorized access');
    }

    // Build filter object based on query parameters
    const filter = {};
    
    // Document type filter
    if (req.query.type) {
      if (req.query.type === 'quotation') {
        filter.status = 'quotation';
      } else if (req.query.type === 'invoice') {
        filter.status = { $in: ['confirmed', 'paid', 'delivered'] };
        filter.invoiceNumber = { $exists: true };
      } else if (req.query.type === 'paid') {
        filter.paymentStatus = 'paid';
      }
    }
    
    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.dateCreated = {};
      if (req.query.startDate) filter.dateCreated.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.dateCreated.$lte = new Date(req.query.endDate);
    }
    
    // Product filter
    if (req.query.productId) {
      filter['items.product'] = req.query.productId;
    }
    
    // Customer filter
    if (req.query.customerName) {
      filter.customerName = { $regex: req.query.customerName, $options: 'i' };
    }
    
    // User filter
    if (req.query.userId && req.user.role === 'admin') {
      filter.soldBy = req.query.userId;
    } else if (req.user.role !== 'admin') {
      filter.soldBy = req.user.id;
    }

    const sales = await Sale.find(filter)
      .populate({
        path: 'items.product',
        select: 'name pricePerUnit unit'
      })
      .populate('soldBy', 'username')
      .sort('-dateCreated');

    res.json({
      success: true,
      count: sales.length,
      sales
    });
  } catch (err) {
    console.error('Get sales history error:', err);
    errorResponse(res, 500, 'Failed to fetch sales history');
  }
};

// @desc    Get a single sale document
// @route   GET /api/sales/:id
// @access  Private/Sales
exports.getSale = async (req, res) => {
  try {
    if (req.user.role !== 'sales' && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Unauthorized access');
    }

    const sale = await Sale.findById(req.params.id)
      .populate({
        path: 'items.product',
        select: 'name description pricePerUnit unit quantity'
      })
      .populate('soldBy', 'username name');

    if (!sale) {
      return errorResponse(res, 404, 'Sale not found');
    }

    // Check if user is authorized to view this sale
    if (req.user.role !== 'admin' && sale.soldBy._id.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Unauthorized to view this sale');
    }

    res.json({
      success: true,
      sale
    });
  } catch (err) {
    console.error('Get sale error:', err);
    errorResponse(res, 500, 'Failed to fetch sale');
  }
};