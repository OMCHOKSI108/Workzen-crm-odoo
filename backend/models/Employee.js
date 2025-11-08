const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: String,
  department: {
    type: String,
    default: 'General',
  },
  jobTitle: {
    type: String,
    default: 'Employee',
  },
  salary: {
    basic: { type: Number, default: 0 },
    hra: Number,
    standardAllowance: Number,
    transportAllowance: Number,
    medicalAllowance: Number,
    pf: Number,
    professionalTax: Number,
    totalCTC: Number,
  },
  bankDetails: {
    accountNumber: String,
    ifsc: String,
    bankName: String,
  },
  pfId: String,
  avatar: String,
  status: {
    type: String,
    enum: ['present', 'leave', 'absent'],
    default: 'present',
  },
  dateOfJoining: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
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

module.exports = mongoose.model('Employee', employeeSchema);