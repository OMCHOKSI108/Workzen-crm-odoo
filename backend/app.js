const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leaves');
const payrollRoutes = require('./routes/payroll');
const userRoutes = require('./routes/users');
const settingsRoutes = require('./routes/settings');

const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Error handling
app.use(errorHandler);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms');
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = { app, connectDB };