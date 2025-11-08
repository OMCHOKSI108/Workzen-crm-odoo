const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../app');
const Employee = require('../../models/Employee');
const User = require('../../models/User');

describe('Employee Controller Integration Tests', () => {
  let adminToken;
  let employeeToken;
  let hrToken;
  let testEmployeeId;

  beforeEach(async () => {
    // Clear data before each test
    await User.deleteMany({});
    await Employee.deleteMany({});

    // Create test users with different roles
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    const hrUser = await User.create({
      username: 'hr',
      email: 'hr@example.com',
      password: 'password123',
      role: 'hr'
    });

    const employeeUser = await User.create({
      username: 'employee',
      email: 'employee@example.com',
      password: 'password123',
      role: 'employee'
    });

    // Get tokens
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });
    adminToken = adminLogin.body.data.token;

    const hrLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'hr@example.com', password: 'password123' });
    hrToken = hrLogin.body.data.token;

    const employeeLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'employee@example.com', password: 'password123' });
    employeeToken = employeeLogin.body.data.token;

    // Create a test employee
    const testEmployee = await Employee.create({
      user: employeeUser._id,
      employeeId: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      department: 'Engineering',
      jobTitle: 'Software Engineer',
      salary: {
        basic: 50000,
        hra: 10000,
        allowances: 5000
      },
      dateOfJoining: new Date('2023-01-01')
    });
    testEmployeeId = testEmployee._id;
  });

  describe('GET /api/employees', () => {
    it('should return all employees for admin', async () => {
      const response = await request(app)
        .get('/api/employees')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].firstName).toBe('John');
      expect(response.body[0].lastName).toBe('Doe');
    });

    it('should return all employees for hr', async () => {
      const response = await request(app)
        .get('/api/employees')
        .set('Authorization', `Bearer ${hrToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
    });

    it('should return error for employee role', async () => {
      const response = await request(app)
        .get('/api/employees')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(403);

      expect(response.body.message).toContain('Insufficient permissions');
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .get('/api/employees')
        .expect(401);

      expect(response.body.message).toContain('No token provided');
    });
  });

  describe('GET /api/employees/:id', () => {
    it('should return employee by id for authenticated user', async () => {
      const response = await request(app)
        .get(`/api/employees/${testEmployeeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.firstName).toBe('John');
      expect(response.body.lastName).toBe('Doe');
      expect(response.body.employeeId).toBe('EMP001');
    });

    it('should return error for non-existent employee', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/employees/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.message).toBe('Employee not found');
    });
  });

  describe('POST /api/employees', () => {
    it('should create new employee for admin', async () => {
      const newEmployee = {
        user: (await User.create({
          username: 'newemp',
          email: 'newemp@example.com',
          password: 'password123',
          role: 'employee'
        }))._id,
        employeeId: 'EMP002',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        department: 'HR',
        jobTitle: 'HR Manager',
        salary: {
          basic: 60000,
          hra: 12000,
          allowances: 6000
        },
        dateOfJoining: new Date('2023-02-01')
      };

      const response = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newEmployee)
        .expect(201);

      expect(response.body.firstName).toBe('Jane');
      expect(response.body.lastName).toBe('Smith');
      expect(response.body.employeeId).toBe('EMP002');
    });

    it('should create new employee for hr', async () => {
      const newEmployee = {
        user: (await User.create({
          username: 'newemp2',
          email: 'newemp2@example.com',
          password: 'password123',
          role: 'employee'
        }))._id,
        employeeId: 'EMP003',
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        department: 'Finance',
        jobTitle: 'Accountant',
        salary: {
          basic: 45000,
          hra: 9000,
          allowances: 4500
        },
        dateOfJoining: new Date('2023-03-01')
      };

      const response = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${hrToken}`)
        .send(newEmployee)
        .expect(201);

      expect(response.body.firstName).toBe('Bob');
      expect(response.body.lastName).toBe('Johnson');
    });

    it('should return error for employee role', async () => {
      const response = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({})
        .expect(403);

      expect(response.body.message).toContain('Insufficient permissions');
    });

    it('should return error for duplicate employeeId', async () => {
      const duplicateEmployee = {
        user: (await User.create({
          username: 'dupemp',
          email: 'dupemp@example.com',
          password: 'password123',
          role: 'employee'
        }))._id,
        employeeId: 'EMP001', // Same as existing
        firstName: 'Duplicate',
        lastName: 'Employee',
        email: 'duplicate@example.com',
        department: 'Engineering',
        jobTitle: 'Engineer',
        salary: { basic: 50000 },
        dateOfJoining: new Date('2023-01-01')
      };

      const response = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(duplicateEmployee)
        .expect(400);

      expect(response.body.message).toContain('duplicate');
    });
  });

  describe('PUT /api/employees/:id', () => {
    it('should update employee for admin', async () => {
      const updateData = {
        firstName: 'John Updated',
        department: 'Senior Engineering'
      };

      const response = await request(app)
        .put(`/api/employees/${testEmployeeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.firstName).toBe('John Updated');
      expect(response.body.department).toBe('Senior Engineering');
      expect(response.body.lastName).toBe('Doe'); // Unchanged
    });

    it('should update employee for hr', async () => {
      const updateData = {
        jobTitle: 'Senior Software Engineer'
      };

      const response = await request(app)
        .put(`/api/employees/${testEmployeeId}`)
        .set('Authorization', `Bearer ${hrToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.jobTitle).toBe('Senior Software Engineer');
    });

    it('should return error for employee role', async () => {
      const response = await request(app)
        .put(`/api/employees/${testEmployeeId}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ firstName: 'Unauthorized Update' })
        .expect(403);

      expect(response.body.message).toContain('Insufficient permissions');
    });

    it('should return error for non-existent employee', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/employees/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName: 'Non-existent' })
        .expect(404);

      expect(response.body.message).toBe('Employee not found');
    });
  });
});