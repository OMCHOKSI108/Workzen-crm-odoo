const mongoose = require('mongoose');
const User = require('./models/User');
const Employee = require('./models/Employee');
require('dotenv').config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const users = [
      { username: 'admin', email: 'admin@workzen.com', password: 'admin123', role: 'admin' },
      { username: 'hr', email: 'hr@workzen.com', password: 'hr123', role: 'hr' },
      { username: 'payroll', email: 'payroll@workzen.com', password: 'payroll123', role: 'payroll' },
      { username: 'employee', email: 'employee@workzen.com', password: 'emp123', role: 'employee' },
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`Created user: ${userData.email}`);

        // Create employee profile for non-admin users
        if (userData.role !== 'admin') {
          const employee = new Employee({
            user: user._id,
            employeeId: `EMP${userData.role.toUpperCase()}001`,
            firstName: userData.role.charAt(0).toUpperCase() + userData.role.slice(1),
            lastName: 'User',
            email: userData.email,
            department: userData.role === 'employee' ? 'Engineering' : 'HR',
            jobTitle: userData.role.charAt(0).toUpperCase() + userData.role.slice(1),
            salary: {
              basic: 50000,
              hra: 10000,
              allowances: 5000,
              pf: 2400,
              tax: 5000,
            },
            dateOfJoining: new Date(),
          });
          await employee.save();
          console.log(`Created employee profile for: ${userData.email}`);
        }
      }
    }

    console.log('Seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedUsers();