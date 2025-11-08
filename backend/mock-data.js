// Mock data for WorkZen API
// This file contains example responses for testing and development

const mockUsers = [
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j1",
    email: "admin@workzen.com",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    isActive: true,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j2",
    email: "hr@workzen.com",
    firstName: "HR",
    lastName: "Manager",
    role: "hr",
    isActive: true,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j3",
    email: "payroll@workzen.com",
    firstName: "Payroll",
    lastName: "Officer",
    role: "payroll",
    isActive: true,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j4",
    email: "employee@workzen.com",
    firstName: "John",
    lastName: "Doe",
    role: "employee",
    isActive: true,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  }
];

const mockEmployees = [
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j4",
    user: mockUsers[3],
    employeeId: "EMP001",
    department: "Engineering",
    jobTitle: "Software Engineer",
    salary: {
      basic: 50000,
      hra: 25000,
      allowances: 10000,
      pfEmployee: 6000,
      pfEmployer: 6000
    },
    bankDetails: {
      accountNumber: "1234567890",
      ifscCode: "SBIN0001234",
      bankName: "State Bank of India"
    },
    dateOfJoining: "2023-01-15",
    isActive: true,
    createdAt: "2023-01-15T00:00:00Z",
    updatedAt: "2023-01-15T00:00:00Z"
  }
];

const mockAttendance = [
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j5",
    employee: "64f1a2b3c4d5e6f7g8h9i0j4",
    employeeName: "Sanskruti Kukadiya",
    date: "2024-12-15",
    clockIn: "2024-12-15T09:00:00Z",
    clockOut: "2024-12-15T18:00:00Z",
    totalHours: 9,
    status: "present",
    location: {
      latitude: 12.9716,
      longitude: 77.5946
    },
    notes: "",
    createdAt: "2024-12-15T09:00:00Z",
    updatedAt: "2024-12-15T18:00:00Z"
  }
];

const mockLeaves = [
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j6",
    employee: "64f1a2b3c4d5e6f7g8h9i0j4",
    employeeName: "Sanskruti Kukadiya",
    startDate: "2024-01-15",
    endDate: "2024-01-17",
    type: "annual",
    reason: "Family vacation",
    status: "approved",
    approvedBy: "64f1a2b3c4d5e6f7g8h9i0j2",
    approvedAt: "2024-01-10T10:00:00Z",
    comments: "Approved for family vacation",
    partialDay: false,
    createdAt: "2024-01-08T14:30:00Z",
    updatedAt: "2024-01-10T10:00:00Z"
  }
];

const mockPayrun = {
  _id: "64f1a2b3c4d5e6f7g8h9i0j7",
  month: 12,
  year: 2024,
  status: "committed",
  employeeCount: 1,
  totalGrossPay: 90000,
  totalDeductions: 12235,
  totalNetPay: 77765,
  payslips: [mockPayslip],
  createdBy: "64f1a2b3c4d5e6f7g8h9i0j3",
  createdAt: "2024-12-31T23:59:00Z",
  committedAt: "2024-12-31T23:59:59Z"
};

const mockPayslip = {
  _id: "64f1a2b3c4d5e6f7g8h9i0j8",
  employee: "64f1a2b3c4d5e6f7g8h9i0j4",
  employeeName: "Sanskruti Kukadiya",
  payrun: "64f1a2b3c4d5e6f7g8h9i0j7",
  month: 12,
  year: 2024,
  earnings: {
    basic: 50000,
    hra: 25000,
    allowances: 10000,
    overtime: 5000,
    grossPay: 90000
  },
  deductions: {
    pfEmployee: 6000,
    professionalTax: 235,
    incomeTax: 5000,
    otherDeductions: 1000,
    totalDeductions: 12235
  },
  netPay: 77765,
  workingDays: 22,
  presentDays: 20,
  leaveDays: 2,
  status: "generated",
  generatedAt: "2024-12-31T23:59:59Z",
  downloadedAt: null
};

const mockPayrollReport = [
  {
    employeeId: "EMP001",
    employeeName: "Sanskruti Kukadiya",
    basic: 50000,
    allowances: 35000,
    deductions: 12235,
    netPay: 77765
  }
];

const mockAttendanceReport = [
  {
    employeeId: "EMP001",
    employeeName: "Sanskruti Kukadiya",
    department: "Engineering",
    totalDays: 22,
    presentDays: 20,
    absentDays: 0,
    leaveDays: 2,
    attendancePercentage: 90.91
  }
];

const mockLeaveReport = [
  {
    employeeId: "EMP001",
    employeeName: "Sanskruti Kukadiya",
    department: "Engineering",
    annualLeave: {
      used: 2,
      balance: 18
    },
    sickLeave: {
      used: 0,
      balance: 10
    }
  }
];

module.exports = {
  mockUsers,
  mockEmployees,
  mockAttendance,
  mockLeaves,
  mockPayrun,
  mockPayslip,
  mockPayrollReport,
  mockAttendanceReport,
  mockLeaveReport
};