const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');

const generateToken = (userId, companyId, role) => {
  return jwt.sign({ 
    id: userId,
    company_id: companyId,
    role: role
  }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { 
      companyName, 
      firstName, 
      lastName, 
      email, 
      phone, 
      password, 
      loginId,
      role 
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create company first for new registrations
    const Company = require('../models/Company');
    const company = await Company.create({
      name: companyName || 'New Company',
      email: email,
      phone: phone || '0000000000', // Default phone if not provided
    });

    // Create username from loginId or email
    const username = loginId || email.split('@')[0];

    // Set default role to 'admin' for company creator, otherwise 'employee'
    const userRole = role || 'admin';

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      role: userRole,
      company: company._id
    });

    // Create corresponding employee record
    const Employee = require('../models/Employee');
    const employeeData = {
      employeeId: loginId || `EMP${Date.now()}`,
      firstName,
      lastName,
      email,
      phone: phone || '',
      user: user._id,
      company: company._id,
      isActive: true
    };

    const employee = await Employee.create(employeeData);

    const token = generateToken(user._id, company._id, user.role);

    res.status(201).json({
      success: true,
      data: {
        token,
        loginId: loginId || username,
        user: {
          id: employee.employeeId,
          username: user.username,
          email: user.email,
          role: user.role,
          name: `${firstName} ${lastName}`,
          employeeId: employee.employeeId,
          company_id: company._id,
          company_name: company.name,
          company_logo_url: company.logo,
          timezone: company.timezone,
          permissions: ['all'] // Admin gets all permissions
        },
      },
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password').populate('company');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account deactivated'
      });
    }

    // Get employee data if exists
    const Employee = require('../models/Employee');
    const employee = await Employee.findOne({ user: user._id });

    // Define permissions based on role
    const rolePermissions = {
      super_admin: ['all'],
      admin: ['dashboard:read', 'employees:read', 'employees:write', 'attendance:read', 'attendance:write', 'leave:read', 'leave:write', 'leave:approve', 'payroll:read', 'payroll:write', 'reports:read', 'settings:read', 'settings:write'],
      hr: ['dashboard:read', 'employees:read', 'employees:write', 'attendance:read', 'attendance:write', 'leave:read', 'leave:approve', 'reports:read'],
      payroll: ['dashboard:read', 'employees:read', 'attendance:read', 'payroll:read', 'payroll:write', 'reports:read'],
      employee: ['dashboard:read', 'attendance:read', 'leave:read', 'leave:write', 'profile:read', 'profile:write']
    };

    const token = generateToken(user._id, user.company._id, user.role);

    // Prepare user data for response
    const userData = {
      id: employee?.employeeId || user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: employee ? `${employee.firstName} ${employee.lastName}` : user.username,
      company_id: user.company._id,
      company_name: user.company.name,
      company_logo_url: user.company.logo,
      timezone: user.company.timezone,
      permissions: rolePermissions[user.role] || rolePermissions.employee
    };

    if (employee) {
      userData.employeeId = employee.employeeId;
    }

    res.json({
      success: true,
      data: {
        token,
        user: userData,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('company');
    const Employee = require('../models/Employee');
    const employee = await Employee.findOne({ user: user._id });
    
    // Define permissions based on role
    const rolePermissions = {
      super_admin: ['all'],
      admin: ['employees:read', 'employees:write', 'attendance:read', 'attendance:write', 'leave:read', 'leave:write', 'leave:approve', 'payroll:read', 'payroll:write', 'reports:read', 'settings:read', 'settings:write'],
      hr: ['employees:read', 'employees:write', 'attendance:read', 'attendance:write', 'leave:read', 'leave:approve', 'reports:read'],
      payroll: ['employees:read', 'attendance:read', 'payroll:read', 'payroll:write', 'reports:read'],
      employee: ['attendance:read', 'leave:read', 'leave:write', 'profile:read', 'profile:write']
    };

    // Base user data
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.username,
      company_id: user.company._id,
      company_name: user.company.name,
      company_logo_url: user.company.logo,
      timezone: user.company.timezone,
      permissions: rolePermissions[user.role] || rolePermissions.employee
    };

    // If employee record exists, include employee details
    if (employee) {
      userData.id = employee.employeeId;
      userData.name = `${employee.firstName} ${employee.lastName}`;
      userData.employeeId = employee.employeeId;
      
      res.json({
        success: true,
        data: {
          user: userData,
          employee: employee
        },
      });
    } else {
      // No employee record - just return user data
      res.json({
        success: true,
        data: {
          user: userData,
          employee: null
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};