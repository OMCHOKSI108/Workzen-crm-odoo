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
const dashboardRoutes = require('./routes/dashboard');

const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
const corsOptions = {
  origin: [
    'https://workzen-crm.vercel.app',
    'https://workzen-5if8c7a3e-om-choksi-s-projects.vercel.app',
    'https://workzen-lmn1xwpdc-om-choksi-s-projects.vercel.app',
    'https://workzen-5q7l7zc13-om-choksi-s-projects.vercel.app',
    'https://workzen-x9wniy7pa-om-choksi-s-projects.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
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
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Documentation Root
app.get('/', (req, res) => {
  res.json({
    name: 'WorkZen HRMS API',
    version: '1.0.0',
    description: 'Multi-tenant Human Resource Management System API',
    frontend_url: 'https://workzen-crm.vercel.app',
    endpoints: {
      authentication: {
        'POST /api/auth/register': 'Register new user and company',
        'POST /api/auth/login': 'User login',
        'GET /api/auth/me': 'Get current user profile'
      },
      dashboard: {
        'GET /api/dashboard/stats': 'Get dashboard statistics',
        'GET /api/dashboard/activity': 'Get recent activity'
      },
      employees: {
        'GET /api/employees': 'Get all employees (company-scoped)',
        'POST /api/employees': 'Create new employee',
        'GET /api/employees/:id': 'Get employee by ID',
        'PUT /api/employees/:id': 'Update employee',
        'DELETE /api/employees/:id': 'Delete employee'
      },
      attendance: {
        'GET /api/attendance': 'Get attendance records',
        'POST /api/attendance/punch': 'Punch in/out',
        'GET /api/attendance/:employeeId': 'Get attendance by employee'
      },
      leaves: {
        'GET /api/leaves': 'Get leave requests',
        'POST /api/leaves': 'Create leave request',
        'GET /api/leaves/pending': 'Get pending leave requests',
        'POST /api/leaves/:id/approve': 'Approve/reject leave'
      },
      payroll: {
        'GET /api/payroll': 'Get payroll records',
        'POST /api/payroll/run': 'Run payroll',
        'GET /api/payroll/:id': 'Get payroll by ID'
      }
    },
    features: [
      'Multi-tenant architecture',
      'Role-based access control (RBAC)',
      'Company-scoped data isolation',
      'JWT authentication',
      'RESTful API design',
      'MongoDB database',
      'CORS enabled for frontend'
    ],
    cors_origins: [
      'https://workzen-crm.vercel.app',
      'https://workzen-5if8c7a3e-om-choksi-s-projects.vercel.app'
    ]
  });
});

// API Info
app.get('/api', (req, res) => {
  res.json({
    message: 'WorkZen HRMS API is running',
    version: '1.0.0',
    endpoints: '/api/health for health check',
    documentation: 'Visit root (/) for full API documentation'
  });
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