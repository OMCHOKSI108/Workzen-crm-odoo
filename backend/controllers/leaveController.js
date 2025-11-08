const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

exports.getLeaves = async (req, res) => {
  try {
    const companyFilter = req.companyFilter || {};
    
    const leaves = await Leave.find(companyFilter)
      .populate({
        path: 'employee',
        match: companyFilter,
        select: 'firstName lastName employeeId'
      })
      .populate('approvedBy', 'email username')
      .sort({ createdAt: -1 });
    
    // Filter out leaves with null employees (from company mismatch)
    const filteredLeaves = leaves.filter(leave => leave.employee);
    
    // Format response
    const formattedLeaves = filteredLeaves.map(leave => ({
      id: leave._id,
      employeeName: `${leave.employee.firstName} ${leave.employee.lastName}`,
      employeeId: leave.employee.employeeId,
      startDate: leave.startDate,
      endDate: leave.endDate,
      type: leave.type.charAt(0).toUpperCase() + leave.type.slice(1) + ' Leave',
      reason: leave.reason,
      status: leave.status.charAt(0).toUpperCase() + leave.status.slice(1),
      approvedBy: leave.approvedBy?.username,
      approvedAt: leave.approvedAt,
      comments: leave.comments
    }));
    
    res.json({
      success: true,
      data: formattedLeaves
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

exports.getPendingLeaves = async (req, res) => {
  try {
    const companyFilter = req.companyFilter || {};
    
    const leaves = await Leave.find({ 
      status: 'pending',
      ...companyFilter
    }).populate({
      path: 'employee',
      match: companyFilter,
      select: 'firstName lastName employeeId'
    });
    
    // Filter out leaves with null employees (from company mismatch)
    const filteredLeaves = leaves.filter(leave => leave.employee);
    
    res.json({
      success: true,
      data: filteredLeaves
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

exports.createLeave = async (req, res) => {
  try {
    const employee = await Employee.findOne({ 
      user: req.user._id,
      company: req.user.company._id
    });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found'
      });
    }
    
    const leave = new Leave({ 
      ...req.body, 
      employee: employee._id,
      company: req.user.company._id
    });
    
    await leave.save();
    
    // Populate employee data
    await leave.populate('employee', 'firstName lastName employeeId');
    
    res.status(201).json({
      success: true,
      data: {
        id: leave._id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        employeeId: employee.employeeId,
        startDate: leave.startDate,
        endDate: leave.endDate,
        type: leave.type.charAt(0).toUpperCase() + leave.type.slice(1) + ' Leave',
        reason: leave.reason,
        status: 'Pending'
      },
      message: 'Leave request submitted successfully'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.approveLeave = async (req, res) => {
  try {
    const { status, comments } = req.body;
    const companyFilter = req.companyFilter || {};
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either approved or rejected'
      });
    }
    
    const leave = await Leave.findOneAndUpdate(
      {
        _id: req.params.id,
        ...companyFilter
      },
      {
        status,
        approvedBy: req.user._id,
        approvedAt: new Date(),
        comments,
      },
      { new: true }
    ).populate({
      path: 'employee',
      match: companyFilter,
      select: 'firstName lastName employeeId'
    });
    
    if (!leave || !leave.employee) {
      return res.status(404).json({ 
        success: false,
        message: 'Leave request not found or access denied' 
      });
    }
    
    res.json({
      success: true,
      data: {
        id: leave._id,
        status: leave.status.charAt(0).toUpperCase() + leave.status.slice(1),
        employeeName: `${leave.employee.firstName} ${leave.employee.lastName}`
      },
      message: `Leave request ${status} successfully`
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};