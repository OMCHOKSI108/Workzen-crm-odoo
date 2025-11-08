const mongoose = require('mongoose');

const payrunSchema = new mongoose.Schema({
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

// Unique index for month and year
payrunSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payrun', payrunSchema);