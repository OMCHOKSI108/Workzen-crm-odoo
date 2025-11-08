// PDF Generation Utility for Professional Payslips
import html2pdf from 'html2pdf.js';

export const generatePayslipPDF = async (employeeData, payslipData, currency = 'USD') => {
  try {
    // Create a temporary container for the PDF content
    const element = document.createElement('div');
    element.innerHTML = createPayslipHTML(employeeData, payslipData, currency);
    
    // PDF configuration options
    const options = {
      margin: [0.5, 0.5, 0.5, 0.5], // inches: top, left, bottom, right
      filename: `WorkZen_Payslip_${employeeData.employeeId}_${payslipData.month.replace(' ', '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        allowTaint: false
      },
      jsPDF: { 
        unit: 'in', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // Generate and download PDF
    await html2pdf().set(options).from(element).save();
    
    // Clean up
    element.remove();
    
    return { success: true, message: 'PDF generated successfully' };
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return { success: false, message: 'Failed to generate PDF', error };
  }
};

// Create HTML content optimized for PDF generation
const createPayslipHTML = (employeeData, payslipData, currency) => {
  const getCurrencySymbol = (curr) => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };
    return symbols[curr] || '$';
  };

  const formatAmount = (amount) => {
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${amount.toLocaleString()}`;
  };

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const gross = Object.values(payslipData.earnings).reduce((s, v) => s + v, 0);
  const totalDeductions = Object.values(payslipData.deductions).reduce((s, v) => s + v, 0);
  const net = gross - totalDeductions;

  // GST Calculations
  const isContractor = employeeData.employeeType === 'contractor';
  const gstRate = 18;
  const gstAmount = isContractor ? (gross * gstRate / 100) : 0;
  const grossWithGST = gross + gstAmount;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>WorkZen Payslip - ${employeeData.name}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.5;
          color: #374151;
          background: white;
        }
        
        .payslip-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .header {
          background: linear-gradient(135deg, #714B67 0%, #A64D79 100%);
          color: white;
          padding: 2rem;
          text-align: center;
          position: relative;
        }
        
        .company-logo {
          width: 60px;
          height: 60px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
        }
        
        .company-name {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
        }
        
        .company-tagline {
          margin: 0.5rem 0 0;
          opacity: 0.9;
        }
        
        .document-header {
          padding: 1.5rem 2rem;
          border-bottom: 2px solid #714B67;
          background: #f8f9fa;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .document-title {
          font-size: 1.5rem;
          color: #714B67;
          margin: 0;
        }
        
        .document-subtitle {
          margin: 0.25rem 0 0;
          color: #6b7280;
        }
        
        .document-meta {
          text-align: right;
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .employee-info {
          padding: 1.5rem 2rem;
        }
        
        .section-title {
          margin: 0 0 1rem;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        
        .info-item {
          margin-bottom: 0.75rem;
        }
        
        .info-label {
          font-size: 0.875rem;
          color: #6b7280;
          display: block;
        }
        
        .info-value {
          font-weight: 600;
          font-size: 1.125rem;
        }
        
        .attendance-summary {
          margin-top: 1.5rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }
        
        .attendance-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        
        .attendance-item {
          text-align: center;
        }
        
        .attendance-label {
          font-size: 0.75rem;
          color: #6b7280;
          display: block;
        }
        
        .attendance-value {
          font-size: 1.25rem;
          font-weight: 600;
          color: #374151;
        }
        
        .salary-breakdown {
          padding: 0 2rem 1.5rem;
        }
        
        .breakdown-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }
        
        .earnings-section, .deductions-section {
          border-radius: 6px;
        }
        
        .earnings-title {
          margin: 0 0 1rem;
          color: #374151;
          border-bottom: 2px solid #10b981;
          padding-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .deductions-title {
          margin: 0 0 1rem;
          color: #374151;
          border-bottom: 2px solid #ef4444;
          padding-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .salary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .salary-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-top: 2px solid #10b981;
          margin-top: 0.5rem;
          font-weight: 700;
          font-size: 1.125rem;
        }
        
        .deductions-total {
          border-top: 2px solid #ef4444;
        }
        
        .earnings-amount {
          font-weight: 600;
          color: #10b981;
        }
        
        .deductions-amount {
          font-weight: 600;
          color: #ef4444;
        }
        
        .net-salary {
          margin: 0 2rem 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #714B67 0%, #A64D79 100%);
          border-radius: 8px;
          color: white;
          text-align: center;
        }
        
        .net-label {
          font-size: 0.875rem;
          opacity: 0.9;
          margin-bottom: 0.5rem;
        }
        
        .net-amount {
          font-size: 2.5rem;
          font-weight: 700;
        }
        
        .net-words {
          font-size: 0.875rem;
          opacity: 0.8;
          margin-top: 0.5rem;
        }
        
        .footer {
          padding: 1.5rem 2rem;
          background: #f8f9fa;
          border-top: 1px solid #e5e7eb;
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .footer-disclaimer {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
          text-align: center;
        }
        
        @media print {
          body { margin: 0; }
          .payslip-container { box-shadow: none; }
          .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .net-salary { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="payslip-container">
        <!-- Header Section -->
        <div class="header">
          <div class="company-logo">WZ</div>
          <h1 class="company-name">WorkZen HRMS</h1>
          <p class="company-tagline">Streamline attendance, leave requests, and payroll</p>
        </div>

        <!-- Document Header -->
        <div class="document-header">
          <div>
            <h2 class="document-title">SALARY SLIP</h2>
            <p class="document-subtitle">Pay Period: ${payslipData.month}</p>
          </div>
          <div class="document-meta">
            <p>Generated on: ${currentDate}</p>
            <p>Document ID: PS-${employeeData.employeeId}-${payslipData.month.replace(' ', '-')}</p>
          </div>
        </div>

        <!-- Employee Information -->
        <div class="employee-info">
          <h3 class="section-title">Employee Information</h3>
          
          <div class="info-grid">
            <div>
              <div class="info-item">
                <span class="info-label">Employee Name</span>
                <span class="info-value">${employeeData.name}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Employee ID</span>
                <span class="info-value">${employeeData.employeeId}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Designation</span>
                <span class="info-value">${employeeData.designation}</span>
              </div>
            </div>
            
            <div>
              <div class="info-item">
                <span class="info-label">Department</span>
                <span class="info-value">${employeeData.department}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Date of Joining</span>
                <span class="info-value">${new Date(employeeData.joinDate).toLocaleDateString()}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Bank Account</span>
                <span class="info-value">${employeeData.bankAccount || '**** **** **** 1234'}</span>
              </div>
            </div>
          </div>

          <!-- Attendance Summary -->
          <div class="attendance-summary">
            <h4 class="section-title">Attendance Summary</h4>
            <div class="attendance-grid">
              <div class="attendance-item">
                <span class="attendance-label">Working Days</span>
                <span class="attendance-value">${payslipData.workingDays}</span>
              </div>
              <div class="attendance-item">
                <span class="attendance-label">Present Days</span>
                <span class="attendance-value" style="color: #10b981;">${payslipData.presentDays}</span>
              </div>
              <div class="attendance-item">
                <span class="attendance-label">Leave Taken</span>
                <span class="attendance-value" style="color: #f59e0b;">${payslipData.totalLeaves}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Salary Breakdown -->
        <div class="salary-breakdown">
          <div class="breakdown-grid">
            <!-- Earnings -->
            <div class="earnings-section">
              <h3 class="earnings-title">
                <span style="font-size: 1.25rem;">💰</span>
                Earnings
              </h3>
              
              ${Object.entries(payslipData.earnings).map(([key, value]) => `
                <div class="salary-item">
                  <span>${key}</span>
                  <span class="earnings-amount">${formatAmount(value)}</span>
                </div>
              `).join('')}
              
              ${isContractor && gstAmount > 0 ? `
                <div class="salary-item">
                  <span>GST (${gstRate}%)</span>
                  <span class="earnings-amount">${formatAmount(gstAmount)}</span>
                </div>
              ` : ''}
              
              <div class="salary-total">
                <span>Gross Earnings</span>
                <span class="earnings-amount">${formatAmount(isContractor ? grossWithGST : gross)}</span>
              </div>
            </div>

            <!-- Deductions -->
            <div class="deductions-section">
              <h3 class="deductions-title">
                <span style="font-size: 1.25rem;">📉</span>
                Deductions
              </h3>
              
              ${Object.entries(payslipData.deductions).map(([key, value]) => `
                <div class="salary-item">
                  <span>${key}</span>
                  <span class="deductions-amount">${formatAmount(value)}</span>
                </div>
              `).join('')}
              
              <div class="salary-total deductions-total">
                <span>Total Deductions</span>
                <span class="deductions-amount">${formatAmount(totalDeductions)}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Net Salary -->
        <div class="net-salary">
          <div class="net-label">NET SALARY PAYABLE</div>
          <div class="net-amount">${formatAmount(net)}</div>
          <div class="net-words">(${currency} ${new Intl.NumberFormat('en-IN').format(net)} in words)</div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div class="footer-content">
            <div>
              <p><strong>WorkZen HRMS</strong> | Streamline attendance, leave requests, and payroll</p>
              <p>This is a computer-generated document and does not require a signature.</p>
            </div>
            <div style="text-align: right;">
              <p>Support: hr@workzen.com</p>
              <p>Phone: +1-555-WORKZEN</p>
            </div>
          </div>
          
          <div class="footer-disclaimer">
            <p>🔒 Confidential Document - For recipient's use only | Generated on ${currentDate}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Utility function to convert number to words (for amount in words)
export const numberToWords = (amount) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const scales = ['', 'Thousand', 'Million', 'Billion'];

  if (amount === 0) return 'Zero';

  const convertChunk = (num) => {
    let result = '';
    
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    } else if (num >= 10) {
      result += teens[num - 10] + ' ';
      return result;
    }
    
    if (num > 0) {
      result += ones[num] + ' ';
    }
    
    return result;
  };

  let result = '';
  let scaleIndex = 0;
  
  while (amount > 0) {
    const chunk = amount % 1000;
    if (chunk !== 0) {
      result = convertChunk(chunk) + scales[scaleIndex] + ' ' + result;
    }
    amount = Math.floor(amount / 1000);
    scaleIndex++;
  }
  
  return result.trim();
};

// GST Calculation utilities
export const calculateGST = (amount, rate = 18) => {
  const gstAmount = (amount * rate) / 100;
  const cgst = gstAmount / 2; // Central GST
  const sgst = gstAmount / 2; // State GST
  
  return {
    gstAmount,
    cgst,
    sgst,
    totalWithGST: amount + gstAmount,
    gstRate: rate
  };
};

// Currency formatting utility
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  const formatters = {
    USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    EUR: new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR' }),
    GBP: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }),
    INR: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })
  };
  
  return formatters[currency]?.format(amount) || `$${amount.toLocaleString()}`;
};