const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Company = require('../models/Company');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payrun = require('../models/Payrun');
const Payslip = require('../models/Payslip');

const migrateToMultiTenant = async () => {
  try {
    console.log('🚀 Starting multi-tenant migration...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workzen');
    console.log('✅ Connected to MongoDB');

    // Step 1: Create default company for existing data
    let defaultCompany = await Company.findOne({ name: 'WorkZen' });
    
    if (!defaultCompany) {
      defaultCompany = await Company.create({
        name: 'WorkZen',
        email: 'admin@workzen.com',
        phone: '+1-234-567-8900',
        address: {
          street: '123 Business Street',
          city: 'Tech City',
          state: 'Innovation State',
          postalCode: '12345',
          country: 'India'
        },
        timezone: 'Asia/Kolkata',
        currency: 'INR'
      });
      console.log('✅ Created default company:', defaultCompany.name);
    } else {
      console.log('✅ Default company already exists:', defaultCompany.name);
    }

    // Step 2: Update all users to have company reference
    const usersWithoutCompany = await User.find({ company: { $exists: false } });
    console.log(`📝 Found ${usersWithoutCompany.length} users without company reference`);
    
    for (const user of usersWithoutCompany) {
      await User.findByIdAndUpdate(user._id, {
        company: defaultCompany._id,
        // Set first user as admin if no admin exists
        role: user.role || (await User.countDocuments({ role: 'admin' }) === 0 ? 'admin' : 'employee')
      });
      console.log(`✅ Updated user: ${user.email} with company reference`);
    }

    // Step 3: Update all employees to have company reference
    const employeesWithoutCompany = await Employee.find({ company: { $exists: false } });
    console.log(`📝 Found ${employeesWithoutCompany.length} employees without company reference`);
    
    for (const employee of employeesWithoutCompany) {
      await Employee.findByIdAndUpdate(employee._id, {
        company: defaultCompany._id
      });
      console.log(`✅ Updated employee: ${employee.firstName} ${employee.lastName} with company reference`);
    }

    // Step 4: Update all attendance records to have company reference
    const attendanceWithoutCompany = await Attendance.find({ company: { $exists: false } });
    console.log(`📝 Found ${attendanceWithoutCompany.length} attendance records without company reference`);
    
    for (const attendance of attendanceWithoutCompany) {
      await Attendance.findByIdAndUpdate(attendance._id, {
        company: defaultCompany._id
      });
    }
    console.log(`✅ Updated ${attendanceWithoutCompany.length} attendance records`);

    // Step 5: Update all leave records to have company reference
    const leavesWithoutCompany = await Leave.find({ company: { $exists: false } });
    console.log(`📝 Found ${leavesWithoutCompany.length} leave records without company reference`);
    
    for (const leave of leavesWithoutCompany) {
      await Leave.findByIdAndUpdate(leave._id, {
        company: defaultCompany._id
      });
    }
    console.log(`✅ Updated ${leavesWithoutCompany.length} leave records`);

    // Step 6: Update all payrun records to have company reference
    const payrunsWithoutCompany = await Payrun.find({ company: { $exists: false } });
    console.log(`📝 Found ${payrunsWithoutCompany.length} payrun records without company reference`);
    
    for (const payrun of payrunsWithoutCompany) {
      await Payrun.findByIdAndUpdate(payrun._id, {
        company: defaultCompany._id
      });
    }
    console.log(`✅ Updated ${payrunsWithoutCompany.length} payrun records`);

    // Step 7: Update all payslip records to have company reference
    const payslipsWithoutCompany = await Payslip.find({ company: { $exists: false } });
    console.log(`📝 Found ${payslipsWithoutCompany.length} payslip records without company reference`);
    
    for (const payslip of payslipsWithoutCompany) {
      await Payslip.findByIdAndUpdate(payslip._id, {
        company: defaultCompany._id
      });
    }
    console.log(`✅ Updated ${payslipsWithoutCompany.length} payslip records`);

    // Step 8: Verification
    console.log('\n🔍 Verification:');
    console.log(`Companies: ${await Company.countDocuments()}`);
    console.log(`Users with company: ${await User.countDocuments({ company: { $exists: true } })}`);
    console.log(`Employees with company: ${await Employee.countDocuments({ company: { $exists: true } })}`);
    console.log(`Attendance with company: ${await Attendance.countDocuments({ company: { $exists: true } })}`);
    console.log(`Leaves with company: ${await Leave.countDocuments({ company: { $exists: true } })}`);
    console.log(`Payruns with company: ${await Payrun.countDocuments({ company: { $exists: true } })}`);
    console.log(`Payslips with company: ${await Payslip.countDocuments({ company: { $exists: true } })}`);

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Test the application with existing users');
    console.log('2. Verify that company scoping works correctly');
    console.log('3. Check that role-based access control is enforced');
    console.log('4. Create new test companies and users to verify multi-tenancy');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run migration if this script is executed directly
if (require.main === module) {
  migrateToMultiTenant()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = migrateToMultiTenant;