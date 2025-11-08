const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payrun = require('../models/Payrun');

exports.getDashboardStats = async (req, res) => {
  try {
    // Apply company filter automatically from RBAC middleware
    const companyFilter = req.companyFilter || {};
    
    // Get total employees count
    const totalEmployees = await Employee.countDocuments({ 
      isActive: true,
      ...companyFilter
    });
    
    // Get today's attendance statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaysAttendance = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: today, $lt: tomorrow },
          ...companyFilter
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employeeData'
        }
      },
      {
        $match: {
          'employeeData.company': companyFilter.company
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const presentToday = todaysAttendance.find(att => att._id === 'present')?.count || 0;
    
    // Get leave statistics
    const activeLeaves = await Leave.aggregate([
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employeeData'
        }
      },
      {
        $match: {
          'employeeData.company': companyFilter.company,
          status: 'approved',
          startDate: { $lte: today },
          endDate: { $gte: today }
        }
      },
      {
        $count: 'total'
      }
    ]);
    
    const onLeaveToday = activeLeaves[0]?.total || 0;
    
    const pendingLeaves = await Leave.aggregate([
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employeeData'
        }
      },
      {
        $match: {
          'employeeData.company': companyFilter.company,
          status: 'pending'
        }
      },
      {
        $count: 'total'
      }
    ]);
    
    const pendingLeaveRequests = pendingLeaves[0]?.total || 0;
    
    // Get next payrun information
    const nextPayrun = await Payrun.findOne({
      ...companyFilter,
      status: { $in: ['scheduled', 'processing'] },
      payDate: { $gte: today }
    }).sort({ payDate: 1 });
    
    // Get latest payrun status
    const latestPayrun = await Payrun.findOne({
      ...companyFilter
    }).sort({ createdAt: -1 });
    
    const stats = {
      totalEmployees,
      presentToday,
      onLeave: onLeaveToday,
      pendingLeaves: pendingLeaveRequests,
      upcomingPayrun: nextPayrun ? 
        nextPayrun.payDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 
        'None Scheduled',
      payrollStatus: latestPayrun ? 
        latestPayrun.status.charAt(0).toUpperCase() + latestPayrun.status.slice(1) : 
        'Not Available'
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const companyFilter = req.companyFilter || {};
    
    // Get recent attendance records
    const recentAttendance = await Attendance.find(companyFilter)
      .populate({
        path: 'employee',
        match: { company: companyFilter.company },
        select: 'firstName lastName employeeId'
      })
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get recent leave requests
    const recentLeaves = await Leave.aggregate([
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employeeData'
        }
      },
      {
        $match: {
          'employeeData.company': companyFilter.company
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee'
        }
      },
      {
        $unwind: '$employee'
      }
    ]);
    
    const activity = {
      attendance: recentAttendance.filter(att => att.employee).map(att => ({
        id: att._id,
        type: 'attendance',
        employee: `${att.employee.firstName} ${att.employee.lastName}`,
        action: att.inTime && att.outTime ? 'Check-out' : 'Check-in',
        timestamp: att.updatedAt || att.createdAt
      })),
      leaves: recentLeaves.map(leave => ({
        id: leave._id,
        type: 'leave',
        employee: `${leave.employee.firstName} ${leave.employee.lastName}`,
        action: `${leave.type} leave ${leave.status}`,
        timestamp: leave.createdAt
      }))
    };
    
    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};