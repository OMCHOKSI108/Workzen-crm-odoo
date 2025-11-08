// MongoDB initialization script
db = db.getSiblingDB('hrms');

// Create collections and indexes
db.users.createIndex({ "loginId": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.employees.createIndex({ "userId": 1 }, { unique: true });
db.employees.createIndex({ "employeeId": 1 }, { unique: true });
db.attendance.createIndex({ "employeeId": 1, "date": 1 });
db.leaves.createIndex({ "employeeId": 1, "startDate": 1 });
db.payroll.createIndex({ "employeeId": 1, "month": 1, "year": 1 });

print('HRMS database initialized with indexes');