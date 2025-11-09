const Payrun = require('../models/Payrun');
const Payslip = require('../models/Payslip');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const PDFDocument = require('pdfkit');

exports.simulatePayrun = async (req, res) => {
  try {
    const { month, year } = req.body;
    const companyFilter = req.companyFilter || {};
    
    const employees = await Employee.find({ 
      ...companyFilter,
      isActive: true 
    });

    if (employees.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active employees found in your company. Please add employees before running payroll.'
      });
    }

    const payrunData = {
      ...companyFilter,
      month,
      year,
      employees: employees.map(emp => ({
        employee: emp._id,
        grossPay: emp.salary.basic + (emp.salary.hra || 0) + (emp.salary.allowances || 0),
        deductions: (emp.salary.pf || 0) + (emp.salary.tax || 0),
        netPay: 0, // Calculate later
      })),
    };

    // Calculate net pay
    payrunData.employees.forEach(emp => {
      emp.netPay = emp.grossPay - emp.deductions;
    });

    const payrun = new Payrun({ ...payrunData, status: 'simulated' });
    await payrun.save();

    res.json({
      success: true,
      data: payrun,
      message: 'Payroll simulation completed successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Unable to simulate payroll. Please check your employee data and try again.' 
    });
  }
};

exports.commitPayrun = async (req, res) => {
  try {
    const payrun = await Payrun.findById(req.params.id);
    if (!payrun) {
      return res.status(404).json({ message: 'Payrun not found' });
    }

    payrun.status = 'committed';
    await payrun.save();

    // Generate payslips
    for (const emp of payrun.employees) {
      const employee = await Employee.findById(emp.employee);
      const payslip = new Payslip({
        employee: emp.employee,
        payrun: payrun._id,
        basic: employee.salary.basic,
        hra: employee.salary.hra,
        allowances: employee.salary.allowances,
        pf: employee.salary.pf,
        tax: employee.salary.tax,
        grossPay: emp.grossPay,
        totalDeductions: emp.deductions,
        netPay: emp.netPay,
      });
      await payslip.save();
    }

    res.json(payrun);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPayrun = async (req, res) => {
  try {
    const payrun = await Payrun.findById(req.params.id).populate('employees.employee', 'firstName lastName employeeId');
    if (!payrun) {
      return res.status(404).json({ message: 'Payrun not found' });
    }
    res.json(payrun);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPayslips = async (req, res) => {
  try {
    const companyFilter = req.companyFilter || {};
    
    const payslips = await Payslip.find(companyFilter)
      .populate({
        path: 'employee',
        match: companyFilter,
        select: 'firstName lastName employeeId'
      })
      .populate('payrun', 'month year');
    
    // Filter out payslips with null employees (from company mismatch)
    const filteredPayslips = payslips.filter(slip => slip.employee);
    
    if (filteredPayslips.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No payslips found for your company. Generate payroll to create payslips.'
      });
    }
    
    res.json({
      success: true,
      data: filteredPayslips
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Unable to retrieve payslip data. Please try again later.' 
    });
  }
};

exports.downloadPayslipPDF = async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.id).populate('employee', 'firstName lastName employeeId').populate('payrun', 'month year');
    if (!payslip) {
      return res.status(404).json({ message: 'Payslip not found' });
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    const filename = `payslip_${payslip.employee.employeeId}_${payslip.payrun.month}_${payslip.payrun.year}.pdf`;

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Company Header
    doc.fontSize(24).font('Helvetica-Bold').text('WORKZEN CORPORATION', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text('Human Resources Management System', { align: 'center' });
    doc.text('123 Business Avenue, Tech City, TC 12345', { align: 'center' });
    doc.text('Phone: (555) 123-4567 | Email: hr@workzen.com', { align: 'center' });
    doc.moveDown();

    // Separator line
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Payslip Title
    doc.fontSize(18).font('Helvetica-Bold').text('SALARY PAYSLIP', { align: 'center' });
    doc.moveDown();

    // Period and Date
    doc.fontSize(12).font('Helvetica');
    doc.text(`Pay Period: ${payslip.payrun.month} ${payslip.payrun.year}`, { align: 'right' });
    doc.text(`Issue Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown();

    // Employee Information Box
    doc.fontSize(14).font('Helvetica-Bold').text('EMPLOYEE INFORMATION', { underline: true });
    doc.moveDown(0.5);

    const employeeInfo = [
      ['Employee ID:', payslip.employee.employeeId],
      ['Employee Name:', `${payslip.employee.firstName} ${payslip.employee.lastName}`],
      ['Department:', 'Engineering'], // You might want to add department to the model
      ['Designation:', 'Software Engineer'], // You might want to add designation to the model
    ];

    employeeInfo.forEach(([label, value]) => {
      doc.fontSize(11).font('Helvetica-Bold').text(label, 70, doc.y, { continued: true, width: 120 });
      doc.font('Helvetica').text(value);
    });

    doc.moveDown();

    // Earnings Table
    doc.fontSize(14).font('Helvetica-Bold').text('EARNINGS', { underline: true });
    doc.moveDown(0.5);

    const earnings = [
      ['Basic Salary', `$${payslip.basic.toLocaleString()}`],
      ['House Rent Allowance (HRA)', `$${payslip.hra.toLocaleString()}`],
      ['Conveyance Allowance', `$${payslip.allowances.toLocaleString()}`],
      ['', ''], // Empty row for spacing
      ['Gross Earnings', `$${payslip.grossPay.toLocaleString()}`],
    ];

    earnings.forEach(([description, amount]) => {
      if (description) {
        doc.fontSize(11).font('Helvetica').text(description, 70, doc.y, { continued: true, width: 300 });
        doc.font('Helvetica-Bold').text(amount, { align: 'right' });
      } else {
        doc.moveDown(0.5);
      }
    });

    doc.moveDown();

    // Deductions Table
    doc.fontSize(14).font('Helvetica-Bold').text('DEDUCTIONS', { underline: true });
    doc.moveDown(0.5);

    const deductions = [
      ['Provident Fund (Employee Contribution)', `$${payslip.pf.toLocaleString()}`],
      ['Professional Tax', `$${payslip.tax.toLocaleString()}`],
      ['', ''], // Empty row for spacing
      ['Total Deductions', `$${payslip.totalDeductions.toLocaleString()}`],
    ];

    deductions.forEach(([description, amount]) => {
      if (description) {
        doc.fontSize(11).font('Helvetica').text(description, 70, doc.y, { continued: true, width: 300 });
        doc.font('Helvetica-Bold').text(amount, { align: 'right' });
      } else {
        doc.moveDown(0.5);
      }
    });

    doc.moveDown();

    // Net Pay Section
    doc.fontSize(16).font('Helvetica-Bold').text('NET SALARY PAYABLE', { align: 'center' });
    doc.fontSize(20).font('Helvetica-Bold').fillColor('green').text(`$${payslip.netPay.toLocaleString()}`, { align: 'center' });
    doc.fillColor('black');

    doc.moveDown(2);

    // Footer
    doc.fontSize(10).font('Helvetica');
    doc.text('This is a computer-generated payslip and does not require signature.', { align: 'center' });
    doc.text('For any queries, please contact the HR Department.', { align: 'center' });

    doc.moveDown();
    doc.text('© 2025 WorkZen Corporation. All rights reserved.', { align: 'center' });

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const companyFilter = req.companyFilter || {};
    
    const employees = await Employee.find({ 
      ...companyFilter,
      isActive: true 
    });
    
    const attendance = await Attendance.find(companyFilter);
    const leaves = await require('../models/Leave').find(companyFilter);
    
    // Check if there's any data for this company
    if (employees.length === 0) {
      return res.json({
        success: true,
        data: {
          monthlyData: [],
          payrollReports: [],
          employees: []
        },
        message: 'No employee data found. Please add employees to see analytics.'
      });
    }
    
    // Calculate monthly employee count and payroll amount
    const monthlyData = [];
    const months = ['June', 'July', 'August', 'September', 'October', 'November'];
    
    for (let i = 0; i < 6; i++) {
      const monthCount = employees.length; // In real scenario, filter by month
      const totalAmount = employees.reduce((sum, emp) => sum + (emp.salary?.totalCTC || 0), 0) / 12;
      
      monthlyData.push({
        month: months[i],
        employeeCount: monthCount,
        amount: totalAmount
      });
    }
    
    // Payroll reports
    const payrollReports = employees.map(emp => ({
      id: emp._id,
      employeeId: emp.employeeId,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      month: 'November',
      year: 2025,
      gross: emp.salary?.basic + (emp.salary?.hra || 0) + (emp.salary?.standardAllowance || 0),
      deductions: (emp.salary?.pf || 0) + (emp.salary?.professionalTax || 0),
      net: 0,
      status: 'Pending'
    }));
    
    // Calculate net
    payrollReports.forEach(report => {
      report.net = report.gross - report.deductions;
    });
    
    res.json({
      success: true,
      data: {
        monthlyData,
        payrollReports,
        employees: employees.map(emp => ({
          id: emp.employeeId,
          name: `${emp.firstName} ${emp.lastName}`,
          department: emp.department,
          role: emp.jobTitle,
          status: emp.status
        }))
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to load analytics data. Please try again later.'
    });
  }
};