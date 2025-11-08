const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
require('dotenv').config();

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workzen-hrms');
    console.log('📊 Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});

    // Read seed data
    const seedFilePath = path.join(__dirname, '../seed-data/employees.json');
    if (!fs.existsSync(seedFilePath)) {
      throw new Error(`Seed file not found at: ${seedFilePath}`);
    }
    const seedData = JSON.parse(fs.readFileSync(seedFilePath, 'utf8'));
    console.log(`📝 Loading ${seedData.length} employee records...`);

    let userCount = 0;
    let employeeCount = 0;
    let attendanceCount = 0;
    let leaveCount = 0;

    for (const empData of seedData) {
      try {
        // Skip duplicate emails (expected in seed data for testing)
        const existingUser = await User.findOne({ email: empData.email });
        if (existingUser) {
          console.log(`⚠️  Skipping duplicate email: ${empData.email}`);
          continue;
        }

        // Create User record (fix role mapping)
        const userRole = empData.role === 'manager' ? 'hr' : empData.role; // Map 'manager' to 'hr'
        const user = await User.create({
          username: empData.first_name.toLowerCase() + empData.last_name.toLowerCase() + Math.random().toString(36).substr(2, 3), // Add random suffix to avoid duplicates
          email: empData.email,
          password: 'password123', // Default password for all seed users
          role: userRole,
          isActive: !empData.terminated,
          permissions: {
            employees: userRole === 'admin' || userRole === 'hr',
            attendance: true,
            timeOff: true,
            payroll: userRole === 'admin' || userRole === 'payroll',
            reports: userRole === 'admin' || userRole === 'hr',
            settings: userRole === 'admin'
          }
        });
        userCount++;

        // Create Employee record
        const employee = await Employee.create({
          user: user._id,
          employeeId: empData.employee_id,
          firstName: empData.first_name,
          lastName: empData.last_name,
          email: empData.email,
          department: empData.department,
          position: getPositionByRole(empData.role),
          hireDate: new Date(empData.hire_date),
          salary: empData.salary,
          payFrequency: empData.pay_frequency,
          bankAccountLast4: empData.bank_account_last4,
          isActive: !empData.terminated,
          terminationDate: empData.terminated ? new Date() : null,
          timezone: empData.metadata.timezone,
          officeLocation: empData.metadata.office_location
        });
        employeeCount++;

        // Create Attendance records (fix status mapping)
        for (const attData of empData.attendance) {
          const attendanceStatus = attData.out_time ? 'present' : 'present'; // Use valid enum values
          await Attendance.create({
            employee: employee._id,
            date: new Date(attData.date),
            inTime: attData.in_time ? new Date(attData.in_time) : null,
            outTime: attData.out_time ? new Date(attData.out_time) : null,
            totalHours: attData.duration_minutes ? Math.round(attData.duration_minutes / 60 * 100) / 100 : null,
            status: attendanceStatus,
            notes: attData.notes || ''
          });
          attendanceCount++;
        }

        // Create Leave records (fix field mapping)
        for (const leaveData of empData.leave_requests) {
          const leaveType = leaveData.type.toLowerCase(); // Convert to lowercase for enum
          await Leave.create({
            employee: employee._id,
            startDate: new Date(leaveData.start_date),
            endDate: new Date(leaveData.end_date),
            type: leaveType === 'unpaid' ? 'casual' : leaveType, // Map 'unpaid' to 'casual'
            reason: `${leaveData.type} leave request`,
            status: leaveData.status.toLowerCase(),
            createdAt: new Date(leaveData.created_at)
          });
          leaveCount++;
        }

        // Log progress every 20 records
        if (employeeCount % 20 === 0) {
          console.log(`✅ Processed ${employeeCount} employees...`);
        }

      } catch (error) {
        console.error(`❌ Error processing employee ${empData.employee_id}:`, error.message);
      }
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   👥 Users created: ${userCount}`);
    console.log(`   🏢 Employees created: ${employeeCount}`);
    console.log(`   ⏰ Attendance records: ${attendanceCount}`);
    console.log(`   🏖️  Leave requests: ${leaveCount}`);

    // Create default admin user if it doesn't exist
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        email: 'admin@workzen.com',
        password: 'admin123',
        role: 'admin',
        isActive: true,
        permissions: {
          employees: true,
          attendance: true,
          timeOff: true,
          payroll: true,
          reports: true,
          settings: true
        }
      });
      console.log('👤 Default admin user created (admin@workzen.com / admin123)');
    }

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

function getPositionByRole(role) {
  const positions = {
    'admin': 'System Administrator',
    'manager': 'Department Manager', // Keep original for display
    'employee': 'Software Engineer'
  };
  return positions[role] || 'Employee';
}

// Run the seeding function
seedDatabase();