const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

exports.getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('employee', 'firstName lastName employeeId')
      .populate('approvedBy', 'email username')
      .sort({ createdAt: -1 });
    
    // Format response
    const formattedLeaves = leaves.map(leave => ({
      id: leave._id,
      employeeName: leave.employee ? `${leave.employee.firstName} ${leave.employee.lastName}` : 'Unknown',
      employeeId: leave.employee?.employeeId,
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
    const leaves = await Leave.find({ status: 'pending' }).populate('employee', 'firstName lastName');
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createLeave = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found'
      });
    }
    
    const leave = new Leave({ 
      ...req.body, 
      employee: employee._id 
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
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either approved or rejected'
      });
    }
    
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status,
        approvedBy: req.user._id,
        approvedAt: new Date(),
        comments,
      },
      { new: true }
    ).populate('employee', 'firstName lastName employeeId');
    
    if (!leave) {
      return res.status(404).json({ 
        success: false,
        message: 'Leave not found' 
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