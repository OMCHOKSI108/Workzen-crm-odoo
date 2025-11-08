const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../app');
const Attendance = require('../../models/Attendance');
const Employee = require('../../models/Employee');
const User = require('../../models/User');

describe('Attendance Controller Integration Tests', () => {
  let employeeToken;
  let adminToken;
  let testEmployeeId;
  let testEmployeeUserId;

  beforeEach(async () => {
    // Clear data before each test
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Attendance.deleteMany({});

    // Create test users
    const employeeUser = await User.create({
      username: 'testemployee',
      email: 'employee@example.com',
      password: 'password123',
      role: 'employee'
    });

    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    // Get tokens
    const employeeLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'employee@example.com', password: 'password123' });
    employeeToken = employeeLogin.body.data.token;

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });
    adminToken = adminLogin.body.data.token;

    // Create test employee
    const testEmployee = await Employee.create({
      user: employeeUser._id,
      employeeId: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      department: 'Engineering',
      jobTitle: 'Software Engineer',
      salary: { basic: 50000 },
      dateOfJoining: new Date('2023-01-01')
    });

    testEmployeeId = testEmployee._id;
    testEmployeeUserId = employeeUser._id;
  });

  describe('POST /api/attendance/punch', () => {
    it('should punch in successfully', async () => {
      const response = await request(app)
        .post('/api/attendance/punch')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ type: 'in' })
        .expect(200);

      expect(response.body.employee.toString()).toBe(testEmployeeId.toString());
      expect(response.body.inTime).toBeDefined();
      expect(response.body.outTime).toBeUndefined();
      expect(response.body.totalHours).toBeUndefined();
    });

    it('should punch out successfully and calculate total hours', async () => {
      // First punch in
      await request(app)
        .post('/api/attendance/punch')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ type: 'in' });

      // Wait a moment then punch out
      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await request(app)
        .post('/api/attendance/punch')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ type: 'out' })
        .expect(200);

      expect(response.body.employee.toString()).toBe(testEmployeeId.toString());
      expect(response.body.inTime).toBeDefined();
      expect(response.body.outTime).toBeDefined();
      expect(response.body.totalHours).toBeDefined();
      expect(response.body.totalHours).toBeGreaterThanOrEqual(0);
    });

    it('should handle invalid punch type gracefully', async () => {
      const response = await request(app)
        .post('/api/attendance/punch')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ type: 'invalid' })
        .expect(200);

      // Invalid type should not change anything
      expect(response.body.employee.toString()).toBe(testEmployeeId.toString());
      expect(response.body.inTime).toBeUndefined();
      expect(response.body.outTime).toBeUndefined();
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .post('/api/attendance/punch')
        .send({ type: 'in' })
        .expect(401);

      expect(response.body.message).toContain('No token provided');
    });
  });

  describe('GET /api/attendance', () => {
    beforeEach(async () => {
      // Create some attendance records
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await Attendance.create({
        employee: testEmployeeId,
        date: today,
        inTime: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9 AM
        outTime: new Date(today.getTime() + 17 * 60 * 60 * 1000), // 5 PM
        totalHours: 8,
        status: 'present'
      });

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      await Attendance.create({
        employee: testEmployeeId,
        date: yesterday,
        status: 'absent'
      });
    });

    it('should return all attendance records for authenticated user', async () => {
      const response = await request(app)
        .get('/api/attendance')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].employee.firstName).toBe('John');
      expect(response.body[0].employee.lastName).toBe('Doe');
    });

    it('should filter by employee ID', async () => {
      const response = await request(app)
        .get(`/api/attendance?employeeId=${testEmployeeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body.every(record => record.employee._id.toString() === testEmployeeId.toString())).toBe(true);
    });

    it('should filter by date range', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const dayBeforeYesterday = new Date(today);
      dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

      const response = await request(app)
        .get(`/api/attendance?from=${dayBeforeYesterday.toISOString().split('T')[0]}&to=${today.toISOString().split('T')[0]}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .get('/api/attendance')
        .expect(401);

      expect(response.body.message).toContain('No token provided');
    });
  });

  describe('PUT /api/attendance/:id', () => {
    let attendanceId;

    beforeEach(async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const attendance = await Attendance.create({
        employee: testEmployeeId,
        date: today,
        inTime: new Date(today.getTime() + 9 * 60 * 60 * 1000),
        outTime: new Date(today.getTime() + 17 * 60 * 60 * 1000),
        totalHours: 8,
        status: 'present'
      });

      attendanceId = attendance._id;
    });

    it('should update attendance for admin', async () => {
      const updateData = {
        status: 'late',
        notes: 'Arrived late due to traffic'
      };

      const response = await request(app)
        .put(`/api/attendance/${attendanceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('late');
      expect(response.body.notes).toBe('Arrived late due to traffic');
      expect(response.body.totalHours).toBe(8); // Unchanged
    });

    it('should return error for employee role', async () => {
      const response = await request(app)
        .put(`/api/attendance/${attendanceId}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ status: 'absent' })
        .expect(403);

      expect(response.body.message).toContain('Insufficient permissions');
    });

    it('should return error for non-existent attendance', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/attendance/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'present' })
        .expect(404);

      expect(response.body.message).toBe('Attendance not found');
    });
  });
});