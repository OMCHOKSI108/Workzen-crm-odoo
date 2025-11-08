const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
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

    // Create username from loginId or email
    const username = loginId || email.split('@')[0];

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'admin' // First user is typically admin for company
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        token,
        loginId: username,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          name: `${firstName} ${lastName}`
        },
      },
      message: 'Registration successful'
    });
  } catch (error) {
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

    const user = await User.findOne({ email }).select('+password');
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

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const Employee = require('../models/Employee');
    const employee = await Employee.findOne({ user: user._id });
    
    res.json({
      success: true,
      data: {
        user: {
          id: employee?.employeeId || user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          name: employee ? `${employee.firstName} ${employee.lastName}` : user.username
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};