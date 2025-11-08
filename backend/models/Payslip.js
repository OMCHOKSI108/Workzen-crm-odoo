const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  payrun: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payrun',
    required: true,
  },
  basic: Number,
  hra: Number,
  allowances: Number,
  pf: Number,
  tax: Number,
  grossPay: Number,
  totalDeductions: Number,
  netPay: Number,
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  pdfUrl: String, // For storing PDF link
});

module.exports = mongoose.model('Payslip', payslipSchema);