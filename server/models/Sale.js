const mongoose = require('mongoose');

const PaymentDetailsSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'cheque', 'other'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  transactionId: {
    type: String,
    trim: true
  },
  bankName: {
    type: String,
    trim: true
  },
  chequeNumber: {
    type: String,
    trim: true
  },
  cardLastFour: {
    type: String,
    trim: true,
    maxlength: 4
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  },
  receiptNumber: {
    type: String,
    trim: true
  }
});

const SaleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hardware',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  discountedPrice: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  }
});

const SaleSchema = new mongoose.Schema({
  saleId: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  items: [SaleItemSchema],
  subTotal: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  taxRate: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  shipping: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  balanceDue: {
    type: Number,
    default: function() { return this.totalPrice; }
  },
  soldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerContact: {
    type: String,
    trim: true
  },
  customerEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  customerAddress: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  termsAndConditions: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['quotation', 'confirmed', 'paid', 'delivered', 'cancelled'],
    default: 'quotation'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentDetails: [PaymentDetailsSchema],
  deliveryStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'returned'],
    default: 'pending'
  },
  deliveryDate: {
    type: Date
  },
  quoteNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  invoiceNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  dateConfirmed: {
    type: Date
  },
  datePaid: {
    type: Date
  },
  dateDelivered: {
    type: Date
  },
  expiryDate: {
    type: Date,
    default: function() {
      if (this.status === 'quotation') {
        const date = new Date();
        date.setDate(date.getDate() + 30); // Default 30-day quote validity
        return date;
      }
    }
  }
}, { timestamps: true });

// Pre-save hook to generate document numbers and calculate totals
SaleSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generate sale ID
    const count = await this.constructor.countDocuments();
    this.saleId = `SALE-${(count + 1).toString().padStart(6, '0')}`;
    
    // Generate quote number if status is quotation
    if (this.status === 'quotation') {
      const quoteCount = await this.constructor.countDocuments({ status: 'quotation' });
      this.quoteNumber = `QT-${new Date().getFullYear().toString().slice(-2)}${(quoteCount + 1).toString().padStart(5, '0')}`;
    }
  }
  
  // Calculate item totals if items are modified
  if (this.isModified('items')) {
    this.items.forEach(item => {
      item.discountedPrice = item.unitPrice * (1 - (item.discountPercentage / 100));
      item.totalPrice = item.discountedPrice * item.quantity;
    });
    
    this.subTotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
    this.taxAmount = this.subTotal * (this.taxRate / 100);
    this.totalPrice = this.subTotal + this.taxAmount + this.shipping - this.discount;
    this.balanceDue = this.totalPrice - this.amountPaid;
  }
  
  // Generate invoice number when status changes to confirmed
  if (this.isModified('status') && this.status === 'confirmed' && !this.invoiceNumber) {
    const invoiceCount = await this.constructor.countDocuments({ invoiceNumber: { $exists: true } });
    this.invoiceNumber = `INV-${new Date().getFullYear().toString().slice(-2)}${(invoiceCount + 1).toString().padStart(5, '0')}`;
    this.dateConfirmed = new Date();
  }
  
  // Update payment status based on amount paid
  if (this.isModified('amountPaid')) {
    if (this.amountPaid >= this.totalPrice) {
      this.paymentStatus = 'paid';
      this.balanceDue = 0;
    } else if (this.amountPaid > 0) {
      this.paymentStatus = 'partial';
      this.balanceDue = this.totalPrice - this.amountPaid;
    } else {
      this.paymentStatus = 'pending';
      this.balanceDue = this.totalPrice;
    }
  }
  
  // Update payment date when payment status changes to paid
  if (this.isModified('paymentStatus') && this.paymentStatus === 'paid' && !this.datePaid) {
    this.datePaid = new Date();
    this.status = 'paid';
    
    // Generate receipt numbers for payments
    this.paymentDetails.forEach((payment, index) => {
      if (!payment.receiptNumber) {
        payment.receiptNumber = `RCPT-${new Date().getFullYear().toString().slice(-2)}${(index + 1).toString().padStart(5, '0')}`;
      }
    });
  }
  
  // Update delivery date when delivery status changes to delivered
  if (this.isModified('deliveryStatus') && this.deliveryStatus === 'delivered' && !this.dateDelivered) {
    this.dateDelivered = new Date();
    this.status = 'delivered';
  }
  
  next();
});

// Method to convert quotation to invoice and update inventory
SaleSchema.methods.convertToInvoice = async function() {
  if (this.status !== 'quotation') {
    throw new Error('Only quotations can be converted to invoices');
  }
  
  // Check stock availability for all items
  for (const item of this.items) {
    const product = await mongoose.model('Hardware').findById(item.product);
    if (!product) {
      throw new Error(`Product ${item.product} not found`);
    }
    if (product.quantity < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}. Only ${product.quantity} available`);
    }
  }
  
  // Update inventory
  for (const item of this.items) {
    await mongoose.model('Hardware').findByIdAndUpdate(item.product, {
      $inc: { quantity: -item.quantity }
    });
  }
  
  this.status = 'confirmed';
  await this.save();
  return this;
};

// Method to record payment and update payment status
SaleSchema.methods.recordPayment = async function(paymentData) {
  if (this.status === 'cancelled') {
    throw new Error('Cannot record payment for cancelled sale');
  }
  
  if (this.status === 'quotation') {
    throw new Error('Cannot record payment for quotation. Convert to invoice first.');
  }
  
  // Add payment
  this.paymentDetails.push(paymentData);
  this.amountPaid = (this.amountPaid || 0) + paymentData.amount;
  
  // Update status if fully paid
  if (this.amountPaid >= this.totalPrice) {
    this.paymentStatus = 'paid';
    this.status = 'paid';
  } else if (this.amountPaid > 0) {
    this.paymentStatus = 'partial';
  }
  
  await this.save();
  return this;
};

// Method to generate receipt for a payment
SaleSchema.methods.generateReceipt = function(paymentIndex = 0) {
  if (paymentIndex >= this.paymentDetails.length) {
    throw new Error('Payment index out of range');
  }
  
  const payment = this.paymentDetails[paymentIndex];
  
  return {
    receiptNumber: payment.receiptNumber || `RCPT-${new Date().getFullYear().toString().slice(-2)}${(paymentIndex + 1).toString().padStart(5, '0')}`,
    date: payment.date,
    saleId: this.saleId,
    invoiceNumber: this.invoiceNumber,
    customerName: this.customerName,
    items: this.items.map(item => ({
      name: item.product.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountPercentage: item.discountPercentage,
      totalPrice: item.totalPrice
    })),
    subTotal: this.subTotal,
    discount: this.discount,
    taxAmount: this.taxAmount,
    shipping: this.shipping,
    totalPrice: this.totalPrice,
    paymentMethod: payment.method,
    amountPaid: payment.amount,
    balanceDue: this.balanceDue,
    soldBy: this.soldBy.username,
    notes: payment.notes
  };
};

module.exports = mongoose.model('Sale', SaleSchema);