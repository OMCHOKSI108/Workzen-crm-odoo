const Employee = require('../models/Employee');

exports.getEmployees = async (req, res) => {
  try {
    // Apply company filter automatically from RBAC middleware
    const companyFilter = req.companyFilter || {};
    
    const employees = await Employee.find({ 
      isActive: true,
      ...companyFilter
    })
      .populate('user', 'email role')
      .populate('company', 'name')
      .sort({ createdAt: -1 });
    
    // Format response to match frontend structure
    const formattedEmployees = employees.map(emp => ({
      id: emp._id,
      employeeId: emp.employeeId,
      name: `${emp.firstName} ${emp.lastName}`,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      jobTitle: emp.jobTitle,
      role: emp.user?.role,
      status: emp.status,
      avatar: emp.avatar,
      salary: emp.salary,
      dateOfJoining: emp.dateOfJoining,
      company: emp.company?.name,
      companyId: emp.company?._id,
    }));
    
    res.json({
      success: true,
      data: formattedEmployees
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

exports.getEmployee = async (req, res) => {
  try {
    const companyFilter = req.companyFilter || {};
    
    const employee = await Employee.findOne({
      _id: req.params.id,
      ...companyFilter
    }).populate('user', 'email role').populate('company', 'name');
    
    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: 'Employee not found or access denied' 
      });
    }
    
    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    // Automatically assign company from authenticated user
    const employeeData = {
      ...req.body,
      company: req.user.company._id
    };
    
    const employee = new Employee(employeeData);
    await employee.save();
    
    res.status(201).json({
      success: true,
      data: employee,
      message: 'Employee created successfully'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const companyFilter = req.companyFilter || {};
    
    const employee = await Employee.findOneAndUpdate(
      { 
        _id: req.params.id,
        ...companyFilter
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    
    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: 'Employee not found or access denied' 
      });
    }
    
    res.json({
      success: true,
      data: employee,
      message: 'Employee updated successfully'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['phone', 'avatar'];
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        employee[key] = req.body[key];
      }
    });

    await employee.save();

    res.json({
      success: true,
      data: employee,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateSalaryConfig = async (req, res) => {
  try {
    const employee = await Employee.findOne({ employeeId: req.params.id });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Update salary configuration
    employee.salary = {
      ...employee.salary,
      ...req.body.salary
    };

    await employee.save();

    res.json({
      success: true,
      data: {
        employeeId: employee.employeeId,
        name: `${employee.firstName} ${employee.lastName}`,
        salary: employee.salary
      },
      message: 'Salary configuration updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};