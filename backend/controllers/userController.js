const User = require('../models/User');
const Employee = require('../models/Employee');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('-password')
      .sort({ createdAt: -1 });
    
    // Get employee data for each user
    const usersWithEmployees = await Promise.all(
      users.map(async (user) => {
        const employee = await Employee.findOne({ user: user._id });
        return {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          employeeName: employee ? `${employee.firstName} ${employee.lastName}` : user.username,
          employeeId: employee?.employeeId,
          permissions: user.permissions || {
            employees: false,
            attendance: false,
            timeOff: false,
            payroll: false,
            reports: false,
            settings: false
          }
        };
      })
    );
    
    res.json({
      success: true,
      data: usersWithEmployees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['admin', 'hr', 'payroll', 'employee'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: user._id,
        role: user.role
      },
      message: 'User role updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateUserPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { permissions },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: user._id,
        permissions: user.permissions
      },
      message: 'Permissions updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
