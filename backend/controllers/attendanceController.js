const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

exports.punch = async (req, res) => {
  try {
    const { type } = req.body; // 'in' or 'out'
    const employee = await Employee.findOne({ user: req.user._id });

    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: 'Employee not found' 
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({ 
      employee: employee._id, 
      date: today 
    });

    if (!attendance) {
      attendance = new Attendance({ 
        employee: employee._id, 
        date: today 
      });
    }

    const timestamp = new Date();

    if (type === 'in') {
      attendance.inTime = timestamp;
      attendance.status = 'present';
    } else if (type === 'out') {
      attendance.outTime = timestamp;
      if (attendance.inTime) {
        const diff = (attendance.outTime - attendance.inTime) / (1000 * 60 * 60);
        attendance.totalHours = Math.round(diff * 100) / 100;
      }
    }

    await attendance.save();
    
    res.json({
      success: true,
      data: {
        timestamp: timestamp,
        type: type,
        status: type === 'in' ? 'in' : 'out',
        workHours: attendance.totalHours || 0
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const { employeeId, from, to } = req.query;
    const query = {};

    // If employeeId is provided, find the employee first
    if (employeeId) {
      const Employee = require('../models/Employee');
      const employee = await Employee.findOne({ employeeId });
      if (employee) {
        query.employee = employee._id;
      }
    } else {
      // Get current user's attendance
      const Employee = require('../models/Employee');
      const employee = await Employee.findOne({ user: req.user._id });
      if (employee) {
        query.employee = employee._id;
      }
    }
    
    if (from && to) {
      query.date = { $gte: new Date(from), $lte: new Date(to) };
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.date = { $gte: thirtyDaysAgo };
    }

    const attendance = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .sort({ date: -1 });
    
    // Format response
    const formattedAttendance = attendance.map(att => ({
      id: att._id,
      date: att.date,
      checkIn: att.inTime,
      checkOut: att.outTime,
      workHours: att.totalHours,
      status: att.status,
      employeeName: att.employee ? `${att.employee.firstName} ${att.employee.lastName}` : 'Unknown',
      employeeId: att.employee?.employeeId
    }));
    
    res.json({
      success: true,
      data: formattedAttendance
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance not found' });
    }
    res.json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};