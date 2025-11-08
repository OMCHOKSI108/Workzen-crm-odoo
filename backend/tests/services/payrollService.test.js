const PayrollService = require('../../services/payrollService');

describe('PayrollService', () => {
  let payrollService;
  let mockEmployee;
  let mockSalaryTemplate;
  let mockTaxRules;

  beforeEach(() => {
    payrollService = new PayrollService();

    mockEmployee = {
      _id: '64f1a2b3c4d5e6f7g8h9i0j1',
      user: {
        firstName: 'John',
        lastName: 'Doe'
      },
      salary: {
        basic: 50000,
        hra: 25000,
        allowances: 10000
      }
    };

    mockSalaryTemplate = {
      basic: 50000,
      hra: 25000,
      allowances: 10000
    };

    mockTaxRules = {
      pfRate: 0.12,
      professionalTaxSlabs: [],
      otherDeductions: 0
    };
  });

  describe('calculatePayslip - Regular Month Scenario', () => {
    test('should calculate payslip correctly for a regular month with full attendance', () => {
      const attendanceRecords = [
        { date: '2024-12-02', status: 'present' },
        { date: '2024-12-03', status: 'present' },
        { date: '2024-12-04', status: 'present' },
        { date: '2024-12-05', status: 'present' },
        { date: '2024-12-06', status: 'present' },
        { date: '2024-12-09', status: 'present' },
        { date: '2024-12-10', status: 'present' },
        { date: '2024-12-11', status: 'present' },
        { date: '2024-12-12', status: 'present' },
        { date: '2024-12-13', status: 'present' },
        { date: '2024-12-16', status: 'present' },
        { date: '2024-12-17', status: 'present' },
        { date: '2024-12-18', status: 'present' },
        { date: '2024-12-19', status: 'present' },
        { date: '2024-12-20', status: 'present' },
        { date: '2024-12-23', status: 'present' },
        { date: '2024-12-24', status: 'present' },
        { date: '2024-12-26', status: 'present' },
        { date: '2024-12-27', status: 'present' },
        { date: '2024-12-30', status: 'present' },
        { date: '2024-12-31', status: 'present' }
      ];

      const approvedLeaves = [];
      const options = { month: 12, year: 2024 };

      const payslip = payrollService.calculatePayslip(
        mockEmployee,
        attendanceRecords,
        approvedLeaves,
        mockSalaryTemplate,
        mockTaxRules,
        options
      );

      // December 2024 has 22 working days
      expect(payslip.workingDays).toBe(22);
      expect(payslip.presentDays).toBe(21);
      expect(payslip.leaveDays).toBe(0);
      expect(payslip.absentDays).toBe(1);

      // Earnings should be prorated (21/22 attendance ratio)
      const attendanceRatio = 21/22;
      expect(payslip.earnings.basic).toBe(Math.round(50000 * attendanceRatio));
      expect(payslip.earnings.hra).toBe(Math.round(25000 * attendanceRatio));
      expect(payslip.earnings.allowances).toBe(Math.round(10000 * attendanceRatio));
      expect(payslip.earnings.grossPay).toBe(
        payslip.earnings.basic + payslip.earnings.hra + payslip.earnings.allowances + payslip.earnings.overtime
      );

      // Deductions
      expect(payslip.deductions.pfEmployee).toBe(6000); // 12% of 50000
      expect(payslip.deductions.professionalTax).toBeGreaterThan(0);
      expect(payslip.deductions.incomeTax).toBeGreaterThan(0);
      expect(payslip.deductions.totalDeductions).toBe(
        payslip.deductions.pfEmployee +
        payslip.deductions.professionalTax +
        payslip.deductions.incomeTax +
        payslip.deductions.otherDeductions
      );

      // Net pay
      expect(payslip.netPay).toBe(payslip.earnings.grossPay - payslip.deductions.totalDeductions);
      expect(payslip.netPay).toBeGreaterThan(0);

      // Validation
      const validation = payrollService.validatePayslip(payslip);
      expect(validation.isValid).toBe(true);
    });
  });

  describe('calculatePayslip - Unpaid Leave Scenario', () => {
    test('should calculate payslip correctly with unpaid leave days', () => {
      const attendanceRecords = [
        { date: '2024-12-02', status: 'present' },
        { date: '2024-12-03', status: 'present' },
        { date: '2024-12-04', status: 'present' },
        { date: '2024-12-05', status: 'present' },
        { date: '2024-12-06', status: 'present' },
        // Missing some days - treated as absent/unpaid
      ];

      const approvedLeaves = [
        {
          startDate: '2024-12-09',
          endDate: '2024-12-13',
          status: 'approved',
          type: 'annual'
        }
      ];

      const options = { month: 12, year: 2024 };

      const payslip = payrollService.calculatePayslip(
        mockEmployee,
        attendanceRecords,
        approvedLeaves,
        mockSalaryTemplate,
        mockTaxRules,
        options
      );

      // Should have leave days counted
      expect(payslip.leaveDays).toBe(5); // 9th to 13th = 5 days
      expect(payslip.presentDays).toBe(5); // Only 5 present days
      expect(payslip.absentDays).toBe(22 - 5 - 5); // working days - present - leave

      // Salary should be prorated
      const attendanceRatio = payslip.presentDays / payslip.workingDays;
      expect(attendanceRatio).toBeLessThan(1);

      expect(payslip.earnings.basic).toBe(Math.round(50000 * attendanceRatio));
      expect(payslip.earnings.hra).toBe(Math.round(25000 * attendanceRatio));
      expect(payslip.earnings.allowances).toBe(Math.round(10000 * attendanceRatio));

      // Validation
      const validation = payrollService.validatePayslip(payslip);
      expect(validation.isValid).toBe(true);
    });
  });

  describe('calculatePayslip - Overtime Scenario', () => {
    test('should calculate payslip correctly with overtime hours', () => {
      // Simulate working extra days (beyond normal working days)
      const attendanceRecords = Array.from({ length: 25 }, (_, i) => ({
        date: `2024-12-${String(i + 1).padStart(2, '0')}`,
        status: 'present'
      }));

      const approvedLeaves = [];
      const options = { month: 12, year: 2024 };

      const payslip = payrollService.calculatePayslip(
        mockEmployee,
        attendanceRecords,
        approvedLeaves,
        mockSalaryTemplate,
        mockTaxRules,
        options
      );

      // Should have overtime calculated
      expect(payslip.earnings.overtime).toBeGreaterThan(0);
      expect(payslip.earnings.grossPay).toBe(
        payslip.earnings.basic +
        payslip.earnings.hra +
        payslip.earnings.allowances +
        payslip.earnings.overtime
      );

      // Validation
      const validation = payrollService.validatePayslip(payslip);
      expect(validation.isValid).toBe(true);
    });
  });

  describe('calculateIncomeTax', () => {
    test('should calculate income tax correctly for different income slabs', () => {
      // Test different income levels
      expect(payrollService.calculateIncomeTax(200000)).toBe(0); // Below 250k after standard deduction
      expect(payrollService.calculateIncomeTax(400000)).toBeGreaterThan(0); // 5% slab
      expect(payrollService.calculateIncomeTax(800000)).toBeGreaterThan(0); // 20% slab
    });
  });

  describe('calculateProfessionalTax', () => {
    test('should calculate professional tax based on monthly salary', () => {
      expect(payrollService.calculateProfessionalTax(15000)).toBe(0); // Below 21k
      expect(payrollService.calculateProfessionalTax(25000)).toBeGreaterThan(0); // 4.75% slab
      expect(payrollService.calculateProfessionalTax(35000)).toBeGreaterThan(0); // 9.5% slab
    });
  });

  describe('validatePayslip', () => {
    test('should validate correct payslip', () => {
      const validPayslip = {
        earnings: { basic: 50000, hra: 25000, allowances: 10000, overtime: 5000, grossPay: 90000 },
        deductions: { pfEmployee: 6000, professionalTax: 1000, incomeTax: 5000, otherDeductions: 0, totalDeductions: 12000 },
        netPay: 78000
      };

      const result = payrollService.validatePayslip(validPayslip);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect invalid payslip calculations', () => {
      const invalidPayslip = {
        earnings: { basic: 50000, hra: 25000, allowances: 10000, overtime: 5000, grossPay: 80000 }, // Wrong gross pay
        deductions: { pfEmployee: 6000, professionalTax: 1000, incomeTax: 5000, otherDeductions: 0, totalDeductions: 12000 },
        netPay: 78000
      };

      const result = payrollService.validatePayslip(invalidPayslip);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Gross pay calculation mismatch');
    });
  });
});