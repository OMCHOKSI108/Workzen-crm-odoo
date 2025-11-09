import React from 'react';

export default function PayslipTemplate({ payslip, currency = 'USD' }) {
  // If no payslip data provided, show empty state
  if (!payslip) {
    return (
      <div style={{
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        boxShadow: '0 0 20px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        overflow: 'hidden',
        padding: '3rem',
        textAlign: 'center'
      }}>
        {/* Empty State */}
        <div style={{
          fontSize: '4rem',
          marginBottom: '1rem',
          opacity: 0.3
        }}>📄</div>
        <h3 style={{
          fontSize: '1.5rem',
          color: '#6b7280',
          marginBottom: '1rem'
        }}>No Payslip Available</h3>
        <p style={{
          color: '#9ca3af',
          fontSize: '1rem',
          lineHeight: '1.5',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          Your payslip will appear here once payroll has been processed for the current month. 
          Please contact HR if you believe this is an error.
        </p>
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          💡 Payslips are typically generated at the end of each month after attendance and leave records are finalized.
        </div>
      </div>
    );
  }

  const data = payslip;
  
  const gross = Object.values(data.earnings).reduce((s, v) => s + v, 0);
  const totalDeductions = Object.values(data.deductions).reduce((s, v) => s + v, 0);
  
  // Enhanced GST Calculations
  const isContractor = data.employeeType === 'contractor';
  const gstRate = 18; // 18% GST (9% CGST + 9% SGST)
  const cgstRate = 9;
  const sgstRate = 9;
  
  let gstBreakdown = null;
  let grossWithGST = gross;
  
  if (isContractor) {
    const gstAmount = (gross * gstRate / 100);
    gstBreakdown = {
      cgst: (gross * cgstRate / 100),
      sgst: (gross * sgstRate / 100),
      total: gstAmount
    };
    grossWithGST = gross + gstAmount;
  }
  
  const net = gross - totalDeductions;
  const effectiveNet = isContractor ? grossWithGST - totalDeductions : net;

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

  // Convert number to words (simplified for demo)
  const numberToWords = (num) => {
    // This is a simplified version - you might want to use a proper library
    return `${new Intl.NumberFormat('en-IN').format(num)} Only`;
  };

  return (
    <div style={{
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: 'white',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      borderRadius: '8px',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Watermark */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-45deg)',
        fontSize: '6rem',
        color: 'rgba(113, 75, 103, 0.03)',
        fontWeight: '900',
        pointerEvents: 'none',
        zIndex: 1
      }}>
        WORKZEN
      </div>

      {/* Header Section with Company Branding */}
      <div style={{
        background: 'linear-gradient(135deg, #714B67 0%, #A64D79 100%)',
        color: 'white',
        padding: '2rem',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Company Logo - Try to load from assets, fallback to placeholder */}
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: '50%',
          margin: '0 auto 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          fontWeight: 'bold',
          border: '3px solid rgba(255,255,255,0.3)',
          backgroundImage: 'url("/assets/logo.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          {/* Fallback text if image doesn't load */}
          <span style={{ 
            background: 'rgba(255,255,255,0.9)', 
            color: '#714B67', 
            borderRadius: '50%',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>WZ</span>
        </div>
        
        <h1 style={{ margin: 0, fontSize: '2.25rem', fontWeight: '700', letterSpacing: '-0.02em' }}>WorkZen HRMS</h1>
        <p style={{ margin: '0.5rem 0 0', opacity: 0.95, fontSize: '1.125rem' }}>
          Human Resource Management System
        </p>
        <div style={{ 
          margin: '0.75rem 0 0', 
          fontSize: '0.875rem', 
          opacity: 0.8,
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <span>📧 hr@workzen.com</span>
          <span>📞 +1-555-WORKZEN</span>
          <span>🌐 www.workzen.com</span>
        </div>
        
        {/* Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          opacity: 0.1,
          fontSize: '3rem'
        }}>💼</div>
        <div style={{
          position: 'absolute',
          bottom: '15px',
          left: '15px',
          opacity: 0.1,
          fontSize: '2.5rem'
        }}>📊</div>
      </div>

      {/* Document Header */}
      <div style={{
        padding: '1.5rem 2rem',
        borderBottom: '3px solid #714B67',
        backgroundColor: '#f8f9fa',
        zIndex: 2,
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#714B67', fontWeight: '700' }}>SALARY SLIP</h2>
            <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '1rem' }}>Pay Period: {data.month}</p>
            {isContractor && (
              <p style={{ margin: '0.25rem 0 0', color: '#f59e0b', fontSize: '0.875rem', fontWeight: '600' }}>
                🏢 Contractor Invoice | GST Applicable
              </p>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Generated: {currentDate}</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
              Doc ID: PS-{data.employeeId}-{data.month.replace(' ', '-')}
            </p>
            {data.gstin && (
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#714B67', fontWeight: '600' }}>
                GSTIN: {data.gstin}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Employee Information Grid */}
      <div style={{ padding: '2rem', backgroundColor: '#fafafa', zIndex: 2, position: 'relative' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          marginBottom: '1.5rem'
        }}>
          {/* Employee Details */}
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ 
              margin: '0 0 1rem', 
              color: '#714B67', 
              fontSize: '1.125rem', 
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              👤 Employee Information
            </h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500', color: '#374151' }}>Name:</span>
                <span style={{ color: '#1f2937', fontWeight: '600' }}>{data.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500', color: '#374151' }}>Employee ID:</span>
                <span style={{ color: '#714B67', fontWeight: '600' }}>{data.employeeId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500', color: '#374151' }}>Designation:</span>
                <span style={{ color: '#1f2937' }}>{data.designation}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500', color: '#374151' }}>Department:</span>
                <span style={{ color: '#1f2937' }}>{data.department}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500', color: '#374151' }}>Join Date:</span>
                <span style={{ color: '#1f2937' }}>{data.joinDate}</span>
              </div>
              {data.panNumber && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '500', color: '#374151' }}>PAN Number:</span>
                  <span style={{ color: '#1f2937', fontFamily: 'monospace' }}>{data.panNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Attendance Summary */}
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ 
              margin: '0 0 1rem', 
              color: '#714B67', 
              fontSize: '1.125rem', 
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📅 Attendance Summary
            </h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500', color: '#374151' }}>Total Working Days:</span>
                <span style={{ color: '#1f2937', fontWeight: '600' }}>{data.workingDays}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500', color: '#374151' }}>Present Days:</span>
                <span style={{ color: '#059669', fontWeight: '600' }}>{data.presentDays}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500', color: '#374151' }}>Total Leaves:</span>
                <span style={{ color: '#f59e0b', fontWeight: '600' }}>{data.totalLeaves}</span>
              </div>
              {data.lop > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '500', color: '#374151' }}>Loss of Pay (LOP):</span>
                  <span style={{ color: '#dc2626', fontWeight: '600' }}>{data.lop}</span>
                </div>
              )}
              <div style={{ 
                marginTop: '0.5rem', 
                padding: '0.75rem', 
                backgroundColor: data.presentDays === data.workingDays ? '#ecfdf5' : '#fef3c7',
                borderRadius: '4px',
                border: `1px solid ${data.presentDays === data.workingDays ? '#d1fae5' : '#fde68a'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '500', color: '#374151' }}>Attendance %:</span>
                  <span style={{ 
                    color: data.presentDays === data.workingDays ? '#059669' : '#f59e0b', 
                    fontWeight: '700',
                    fontSize: '1.125rem'
                  }}>
                    {((data.presentDays / data.workingDays) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              {data.bankAccount && (
                <div style={{ 
                  marginTop: '0.5rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Bank Account:</span>
                    <span style={{ color: '#1f2937', fontFamily: 'monospace' }}>{data.bankAccount}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Net Salary Summary */}
      <div style={{
        padding: '2rem',
        backgroundColor: '#714B67',
        background: 'linear-gradient(135deg, #714B67 0%, #A64D79 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <h3 style={{ 
          margin: '0 0 1.5rem', 
          fontSize: '1.5rem', 
          fontWeight: '700'
        }}>
          💎 Net Salary Summary
        </h3>
        
        <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
          NET SALARY PAYABLE
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>
          {formatAmount(effectiveNet)}
        </div>
        <div style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.5rem' }}>
          ({currency} {numberToWords(Math.round(effectiveNet))})
        </div>
      </div>

      {/* Footer Section */}
      <div style={{
        padding: '1.5rem 2rem',
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #e5e7eb',
        fontSize: '0.875rem',
        color: '#6b7280'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0 }}>
              <strong>WorkZen HRMS</strong> | Streamline attendance, leave requests, and payroll
            </p>
            <p style={{ margin: '0.25rem 0 0' }}>
              This is a computer-generated document and does not require a signature.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0 }}>Support: hr@workzen.com</p>
            <p style={{ margin: '0.25rem 0 0' }}>Phone: +1-555-WORKZEN</p>
          </div>
        </div>
        <div style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0 }}>
            🔒 Confidential Document - For recipient's use only | Generated on {currentDate}
          </p>
        </div>
      </div>
    </div>
  );
}