const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

exports.punch = async (req, res) => {
  try {
    const { type } = req.body; // 'in' or 'out'
    const employee = await Employee.findOne({ 
      user: req.user._id,
      company: req.user.company._id
    });

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
      date: today,
      company: req.user.company._id
    });

    if (!attendance) {
      attendance = new Attendance({ 
        employee: employee._id, 
        date: today,
        company: req.user.company._id
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
    const companyFilter = req.companyFilter || {};
    const query = { ...companyFilter };

    // If employeeId is provided, find the employee first
    if (employeeId) {
      const employee = await Employee.findOne({ 
        employeeId,
        ...companyFilter
      });
      if (employee) {
        query.employee = employee._id;
      }
    } else {
      // Get current user's attendance
      const employee = await Employee.findOne({ 
        user: req.user._id,
        ...companyFilter
      });
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
      .populate({
        path: 'employee',
        match: companyFilter,
        select: 'firstName lastName employeeId'
      })
      .sort({ date: -1 });
    
    // Filter out null employees (from company mismatch)
    const filteredAttendance = attendance.filter(att => att.employee);
    
    // Format response
    const formattedAttendance = filteredAttendance.map(att => ({
      id: att._id,
      date: att.date,
      checkIn: att.inTime,
      checkOut: att.outTime,
      workHours: att.totalHours,
      status: att.status,
      employeeName: `${att.employee.firstName} ${att.employee.lastName}`,
      employeeId: att.employee.employeeId
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
    const companyFilter = req.companyFilter || {};
    
    const attendance = await Attendance.findOneAndUpdate(
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
    
    if (!attendance) {
      return res.status(404).json({ 
        success: false,
        message: 'Attendance record not found or access denied' 
      });
    }
    
    res.json({
      success: true,
      data: attendance,
      message: 'Attendance updated successfully'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};