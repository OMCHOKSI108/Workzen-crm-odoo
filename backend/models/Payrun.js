const mongoose = require('mongoose');

const payrunSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: true,
  },
  employees: [{
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    grossPay: Number,
    deductions: Number,
    netPay: Number,
    status: {
      type: String,
      enum: ['pending', 'processed'],
      default: 'pending',
    },
  }],
  status: {
    type: String,
    enum: ['draft', 'simulated', 'committed'],
    default: 'draft',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Unique index for company, month and year
payrunSchema.index({ company: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payrun', payrunSchema);