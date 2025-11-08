const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../app');
const Payrun = require('../../models/Payrun');
const Payslip = require('../../models/Payslip');
const Employee = require('../../models/Employee');
const User = require('../../models/User');

describe('Payroll Controller Integration Tests', () => {
  let adminToken;
  let employeeToken;
  let payrollToken;
  let testEmployeeId;

  beforeEach(async () => {
    // Clear data before each test
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Payrun.deleteMany({});
    await Payslip.deleteMany({});

    // Create test users with different roles
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    const payrollUser = await User.create({
      username: 'payroll',
      email: 'payroll@example.com',
      password: 'password123',
      role: 'payroll'
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

    const payrollLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'payroll@example.com', password: 'password123' });
    payrollToken = payrollLogin.body.data.token;

    const employeeLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'employee@example.com', password: 'password123' });
    employeeToken = employeeLogin.body.data.token;

    // Create test employees
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
        allowances: 5000,
        pf: 6000,
        tax: 5000
      },
      dateOfJoining: new Date('2023-01-01')
    });

    testEmployeeId = testEmployee._id;
  });

  describe('POST /api/payroll/payrun/simulate', () => {
    it('should simulate payrun for admin', async () => {
      const response = await request(app)
        .post('/api/payroll/payrun/simulate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ month: 12, year: 2023 })
        .expect(200);

      expect(response.body.month).toBe(12);
      expect(response.body.year).toBe(2023);
      expect(response.body.status).toBe('simulated');
      expect(Array.isArray(response.body.employees)).toBe(true);
      expect(response.body.employees.length).toBe(1);

      const employeePay = response.body.employees[0];
      expect(employeePay.grossPay).toBe(65000); // 50000 + 10000 + 5000
      expect(employeePay.deductions).toBe(11000); // 6000 + 5000
      expect(employeePay.netPay).toBe(54000); // 65000 - 11000
    });

    it('should simulate payrun for payroll role', async () => {
      const response = await request(app)
        .post('/api/payroll/payrun/simulate')
        .set('Authorization', `Bearer ${payrollToken}`)
        .send({ month: 11, year: 2023 })
        .expect(200);

      expect(response.body.month).toBe(11);
      expect(response.body.year).toBe(2023);
      expect(response.body.status).toBe('simulated');
    });

    it('should return error for employee role', async () => {
      const response = await request(app)
        .post('/api/payroll/payrun/simulate')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ month: 12, year: 2023 })
        .expect(403);

      expect(response.body.message).toContain('Insufficient permissions');
    });

    it('should return error for duplicate payrun', async () => {
      // Create first payrun
      await request(app)
        .post('/api/payroll/payrun/simulate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ month: 12, year: 2023 });

      // Try to create duplicate
      const response = await request(app)
        .post('/api/payroll/payrun/simulate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ month: 12, year: 2023 })
        .expect(500);

      expect(response.body.message).toBe('Server error');
    });
  });

  describe('POST /api/payroll/payrun/:id/commit', () => {
    let simulatedPayrunId;

    beforeEach(async () => {
      // Create a simulated payrun
      const response = await request(app)
        .post('/api/payroll/payrun/simulate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ month: 12, year: 2023 });

      simulatedPayrunId = response.body._id;
    });

    it('should commit payrun and generate payslips for admin', async () => {
      const response = await request(app)
        .post(`/api/payroll/payrun/${simulatedPayrunId}/commit`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('committed');

      // Check if payslips were generated
      const payslips = await Payslip.find({ payrun: simulatedPayrunId });
      expect(payslips.length).toBe(1);

      const payslip = payslips[0];
      expect(payslip.basic).toBe(50000);
      expect(payslip.hra).toBe(10000);
      expect(payslip.allowances).toBe(5000);
      expect(payslip.pf).toBe(6000);
      expect(payslip.tax).toBe(5000);
      expect(payslip.grossPay).toBe(65000);
      expect(payslip.totalDeductions).toBe(11000);
      expect(payslip.netPay).toBe(54000);
    });

    it('should commit payrun for payroll role', async () => {
      const response = await request(app)
        .post(`/api/payroll/payrun/${simulatedPayrunId}/commit`)
        .set('Authorization', `Bearer ${payrollToken}`)
        .expect(200);

      expect(response.body.status).toBe('committed');
    });

    it('should return error for employee role', async () => {
      const response = await request(app)
        .post(`/api/payroll/payrun/${simulatedPayrunId}/commit`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(403);

      expect(response.body.message).toContain('Insufficient permissions');
    });

    it('should return error for non-existent payrun', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/payroll/payrun/${fakeId}/commit`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.message).toBe('Payrun not found');
    });
  });

  describe('GET /api/payroll/payrun/:id', () => {
    let payrunId;

    beforeEach(async () => {
      // Create a payrun
      const response = await request(app)
        .post('/api/payroll/payrun/simulate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ month: 12, year: 2023 });

      payrunId = response.body._id;
    });

    it('should return payrun details for authenticated user', async () => {
      const response = await request(app)
        .get(`/api/payroll/payrun/${payrunId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.month).toBe(12);
      expect(response.body.year).toBe(2023);
      expect(response.body.employees[0].employee.firstName).toBe('John');
      expect(response.body.employees[0].employee.lastName).toBe('Doe');
    });

    it('should return error for non-existent payrun', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/payroll/payrun/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.message).toBe('Payrun not found');
    });
  });

  describe('GET /api/payroll/payslips', () => {
    beforeEach(async () => {
      // Create and commit a payrun to generate payslips
      const simulateResponse = await request(app)
        .post('/api/payroll/payrun/simulate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ month: 12, year: 2023 });

      await request(app)
        .post(`/api/payroll/payrun/${simulateResponse.body._id}/commit`)
        .set('Authorization', `Bearer ${adminToken}`);
    });

    it('should return all payslips for authenticated user', async () => {
      const response = await request(app)
        .get('/api/payroll/payslips')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].employee.firstName).toBe('John');
      expect(response.body[0].payrun.month).toBe(12);
      expect(response.body[0].payrun.year).toBe(2023);
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .get('/api/payroll/payslips')
        .expect(401);

      expect(response.body.message).toContain('No token provided');
    });
  });
});