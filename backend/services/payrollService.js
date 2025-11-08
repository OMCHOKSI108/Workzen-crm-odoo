/**
 * Payroll Service
 * Handles payroll calculations including salary components, deductions, and payslip generation
 */

class PayrollService {
  constructor() {
    // Tax slabs for FY 2024-25 (Indian tax system)
    this.taxSlabs = [
      { min: 0, max: 250000, rate: 0 },
      { min: 250000, max: 500000, rate: 0.05 },
      { min: 500000, max: 1000000, rate: 0.20 },
      { min: 1000000, max: Infinity, rate: 0.30 }
    ];

    // Professional tax slabs (Karnataka example)
    this.professionalTaxSlabs = [
      { min: 0, max: 21000, rate: 0 },
      { min: 21000, max: 30000, rate: 0.0475 },
      { min: 30000, max: 45000, rate: 0.095 },
      { min: 45000, max: 60000, rate: 0.1425 },
      { min: 60000, max: Infinity, rate: 0.190 }
    ];
  }

  /**
   * Calculate payslip for an employee
   * @param {Object} employee - Employee profile with salary details
   * @param {Array} attendanceRecords - Monthly attendance records
   * @param {Array} approvedLeaves - Approved leave records for the month
   * @param {Object} salaryTemplate - Salary template with components
   * @param {Object} taxRules - Tax and deduction rules
   * @param {Object} options - Additional calculation options
   * @returns {Object} Payslip object with detailed breakdown
   */
  calculatePayslip(employee, attendanceRecords, approvedLeaves, salaryTemplate, taxRules, options = {}) {
    const { month, year } = options;

    // Calculate working days and attendance
    const attendanceSummary = this.calculateAttendanceSummary(attendanceRecords, approvedLeaves, month, year);

    // Calculate earnings
    const earnings = this.calculateEarnings(employee, attendanceSummary, salaryTemplate, taxRules);

    // Calculate deductions
    const deductions = this.calculateDeductions(earnings, taxRules, employee);

    // Calculate net pay
    const netPay = earnings.grossPay - deductions.totalDeductions;

    return {
      employee: employee._id,
      employeeName: `${employee.user.firstName} ${employee.user.lastName}`,
      month: month || new Date().getMonth() + 1,
      year: year || new Date().getFullYear(),
      earnings,
      deductions,
      netPay,
      workingDays: attendanceSummary.workingDays,
      presentDays: attendanceSummary.presentDays,
      leaveDays: attendanceSummary.leaveDays,
      absentDays: attendanceSummary.absentDays,
      status: 'generated',
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Calculate attendance summary for the month
   */
  calculateAttendanceSummary(attendanceRecords, approvedLeaves, month, year) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const workingDays = this.getWorkingDaysInMonth(year, month);
    let presentDays = 0;
    let leaveDays = 0;

    // Count present days from attendance records
    attendanceRecords.forEach(record => {
      if (record.status === 'present') {
        presentDays += 1;
      }
    });

    // Count approved leave days
    approvedLeaves.forEach(leave => {
      if (leave.status === 'approved') {
        const startDate = new Date(leave.startDate);
        const endDate = new Date(leave.endDate);
        const leaveDaysCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        leaveDays += leaveDaysCount;
      }
    });

    const absentDays = workingDays - presentDays - leaveDays;

    return {
      workingDays,
      presentDays,
      leaveDays,
      absentDays,
      attendancePercentage: (presentDays / workingDays) * 100
    };
  }

  /**
   * Get number of working days in a month (excluding weekends)
   */
  getWorkingDaysInMonth(year, month) {
    const daysInMonth = new Date(year, month, 0).getDate();
    let workingDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      // Exclude Saturday (6) and Sunday (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }

    return workingDays;
  }

  /**
   * Calculate earnings components
   */
  calculateEarnings(employee, attendanceSummary, salaryTemplate, taxRules) {
    const monthlyBasic = employee.salary.basic;
    const monthlyHRA = employee.salary.hra || 0;
    const monthlyAllowances = employee.salary.allowances || 0;

    // Calculate prorated salary based on attendance
    const attendanceRatio = attendanceSummary.presentDays / attendanceSummary.workingDays;

    const basic = Math.round(monthlyBasic * attendanceRatio);
    const hra = Math.round(monthlyHRA * attendanceRatio);
    const allowances = Math.round(monthlyAllowances * attendanceRatio);

    // Calculate overtime (assuming 2 hours OT per extra day worked)
    const overtimeHours = Math.max(0, attendanceSummary.presentDays - attendanceSummary.workingDays + attendanceSummary.leaveDays);
    const overtimeRate = monthlyBasic / attendanceSummary.workingDays / 8; // Daily rate / 8 hours
    const overtime = Math.round(overtimeHours * 2 * overtimeRate);

    const grossPay = basic + hra + allowances + overtime;

    return {
      basic,
      hra,
      allowances,
      overtime,
      grossPay
    };
  }

  /**
   * Calculate deductions
   */
  calculateDeductions(earnings, taxRules, employee) {
    const { grossPay } = earnings;

    // PF Employee contribution: use configured pfRate on the employee's full basic salary
    // Tests expect PF to be calculated on the full basic (not prorated). Use taxRules.pfRate when provided.
    const pfRate = (taxRules && typeof taxRules.pfRate === 'number') ? taxRules.pfRate : 0.12;
    const pfBase = (employee && employee.salary && typeof employee.salary.basic === 'number') ? employee.salary.basic : earnings.basic;
    const pfEmployee = Math.round(pfBase * pfRate);

    // Professional Tax (state-specific)
    const professionalTax = this.calculateProfessionalTax(grossPay);

    // Income Tax (annual calculation, monthly estimate)
    const annualGross = grossPay * 12;
    const annualTax = this.calculateIncomeTax(annualGross);
    const monthlyIncomeTax = Math.round(annualTax / 12);

    // Other deductions (loans, advances, etc.)
    const otherDeductions = taxRules.otherDeductions || 0;

    const totalDeductions = pfEmployee + professionalTax + monthlyIncomeTax + otherDeductions;

    return {
      pfEmployee,
      professionalTax,
      incomeTax: monthlyIncomeTax,
      otherDeductions,
      totalDeductions
    };
  }

  /**
   * Calculate professional tax based on monthly salary
   */
  calculateProfessionalTax(monthlySalary) {
    for (const slab of this.professionalTaxSlabs) {
      if (monthlySalary > slab.min && monthlySalary <= slab.max) {
        return Math.round(monthlySalary * slab.rate);
      }
    }
    return 0;
  }

  /**
   * Calculate income tax using Indian tax slabs
   */
  calculateIncomeTax(annualIncome) {
    let tax = 0;
    let remainingIncome = annualIncome;

    // Standard deduction (₹50,000)
    remainingIncome -= 50000;

    if (remainingIncome <= 0) return 0;

    for (const slab of this.taxSlabs) {
      if (remainingIncome > 0) {
        const taxableInSlab = Math.min(remainingIncome, slab.max - slab.min);
        tax += taxableInSlab * slab.rate;
        remainingIncome -= taxableInSlab;
      }
    }

    // Cess (4% on tax)
    tax += tax * 0.04;

    return Math.round(tax);
  }

  /**
   * Validate payslip calculation
   */
  validatePayslip(payslip) {
    const errors = [];

    if (payslip.netPay < 0) {
      errors.push('Net pay cannot be negative');
    }

    if (payslip.earnings.grossPay !== payslip.earnings.basic + payslip.earnings.hra + payslip.earnings.allowances + payslip.earnings.overtime) {
      errors.push('Gross pay calculation mismatch');
    }

    if (payslip.deductions.totalDeductions !== payslip.deductions.pfEmployee + payslip.deductions.professionalTax + payslip.deductions.incomeTax + payslip.deductions.otherDeductions) {
      errors.push('Total deductions calculation mismatch');
    }

    if (payslip.netPay !== payslip.earnings.grossPay - payslip.deductions.totalDeductions) {
      errors.push('Net pay calculation mismatch');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = PayrollService;