const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Enhanced RBAC middleware with company scoping
const rbacAuth = (requiredPermissions = [], options = {}) => {
  return async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ 
          success: false,
          message: 'No token provided' 
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).populate('company');

      if (!user || !user.isActive) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid token' 
        });
      }

      // Check if company is active
      if (!user.company.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Company account is deactivated'
        });
      }

      // Define role permissions
      const rolePermissions = {
        super_admin: ['all'],
        admin: ['dashboard:read', 'employees:read', 'employees:write', 'attendance:read', 'attendance:write', 'leaves:read', 'leaves:write', 'leave:approve', 'payroll:read', 'payroll:write', 'reports:read', 'settings:read', 'settings:write'],
        hr: ['dashboard:read', 'employees:read', 'employees:write', 'attendance:read', 'attendance:write', 'leaves:read', 'leave:approve', 'reports:read'],
        payroll: ['dashboard:read', 'employees:read', 'attendance:read', 'payroll:read', 'payroll:write', 'reports:read'],
        employee: ['dashboard:read', 'attendance:read', 'leaves:read', 'leaves:write', 'profile:read', 'profile:write']
      };

      const userPermissions = rolePermissions[user.role] || [];

      // Check permissions
      if (requiredPermissions.length > 0) {
        const hasPermission = user.role === 'super_admin' || 
          userPermissions.includes('all') ||
          requiredPermissions.some(permission => userPermissions.includes(permission));

        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            message: 'Insufficient permissions'
          });
        }
      }

      // Add user and company context to request
      req.user = user;
      req.userPermissions = userPermissions;
      req.company = user.company;

      // Company scoping: ensure resource belongs to user's company
      // Skip company check for super_admin
      if (user.role !== 'super_admin' && options.enforceCompanyScope !== false) {
        req.companyFilter = { company: user.company._id };
      }

      next();
    } catch (error) {
      console.error('RBAC Auth Error:', error);
      res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }
  };
};

// Convenience functions for common permission checks
const requireAdmin = rbacAuth(['employees:write', 'settings:write']);
const requireHR = rbacAuth(['employees:read', 'leave:approve']);
const requireEmployee = rbacAuth(['profile:read']);
const requirePayroll = rbacAuth(['payroll:read']);

// Company ownership validation middleware
const validateCompanyOwnership = (Model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      if (req.user.role === 'super_admin') {
        return next(); // Super admin can access all
      }

      const resourceId = req.params[paramName];
      const resource = await Model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check if resource belongs to user's company
      if (resource.company && resource.company.toString() !== req.user.company._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this resource'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Company ownership validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
};

// Employee self-access validation (employees can only access their own data)
const validateSelfAccess = (req, res, next) => {
  const employeeId = req.params.id || req.params.employeeId;
  
  if (req.user.role === 'employee') {
    // Get employee record to check if it belongs to the user
    const Employee = require('../models/Employee');
    Employee.findOne({ user: req.user._id })
      .then(employee => {
        if (!employee || employee.employeeId !== employeeId) {
          return res.status(403).json({
            success: false,
            message: 'You can only access your own data'
          });
        }
        next();
      })
      .catch(error => {
        console.error('Self access validation error:', error);
        res.status(500).json({
          success: false,
          message: 'Server error'
        });
      });
  } else {
    next();
  }
};

module.exports = {
  rbacAuth,
  requireAdmin,
  requireHR,
  requireEmployee,
  requirePayroll,
  validateCompanyOwnership,
  validateSelfAccess
};