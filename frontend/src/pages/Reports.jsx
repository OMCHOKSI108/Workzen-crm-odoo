import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/http';

export default function Reports() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('November 2025');
  const [loading, setLoading] = useState(true);
  
  const [employees, setEmployees] = useState([]);
  const [payrunData, setPayrunData] = useState([]);
  const [payrollReports, setPayrollReports] = useState([]);
  
  useEffect(() => {
    fetchAnalytics();
  }, []);
  
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payroll/analytics');
      
      setPayrunData(response.data.data.monthlyData);
      setPayrollReports(response.data.data.payrollReports);
      setEmployees(response.data.data.employees);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      alert('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const maxEmployees = Math.max(...payrunData.map((d) => d.employees));
  const maxAmount = Math.max(...payrunData.map((d) => d.amount));

  const handleEmployeeClick = (employee) => {
    alert(`Employee Details:\n\nName: ${employee.name}\nID: ${employee.id}\nDepartment: ${employee.department}\nAttendance: ${employee.attendance}`);
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (user?.role !== 'admin' && user?.role !== 'hr' && user?.role !== 'payroll') {
    return (
      <div className="content-wrap">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ color: 'var(--gray-600)', fontSize: '1.25rem' }}>
            You don't have permission to access Reports.
          </h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="content-wrap">
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-600)' }}>
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrap">
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: 600 }}>
        Reports & Analytics
      </h1>

      {/* Tabs */}
      <div style={{ borderBottom: '2px solid var(--gray-200)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {['dashboard', 'payrun', 'configuration'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '3px solid var(--primary-color)' : '3px solid transparent',
                color: activeTab === tab ? 'var(--primary-color)' : 'var(--gray-600)',
                fontWeight: activeTab === tab ? 600 : 400,
                cursor: 'pointer',
                fontSize: '0.875rem',
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Payrun Warning */}
          <div
            className="card"
            style={{
              marginBottom: '1.5rem',
              backgroundColor: '#f59e0b20',
              border: '2px solid var(--warning-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '2rem' }}>⚠️</div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--warning-color)', marginBottom: '0.25rem' }}>
                  Upcoming Payrun: December 2025
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                  Scheduled for December 5, 2025 • 250 employees • Estimated: ₹2,09,00,000
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder="Search employees by name, ID, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--gray-300)',
                borderRadius: '4px',
                fontSize: '0.875rem',
              }}
            />
          </div>

          {/* Employee Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem',
            }}
          >
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="card"
                onClick={() => handleEmployeeClick(emp)}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '1px solid var(--gray-200)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  {/* Avatar */}
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-color)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {emp.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  {/* Status Indicator */}
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor:
                          emp.status === 'present'
                            ? 'var(--success-color)'
                            : emp.status === 'leave'
                            ? 'var(--warning-color)'
                            : 'var(--danger-color)',
                        boxShadow: `0 0 8px ${
                          emp.status === 'present'
                            ? 'var(--success-color)'
                            : emp.status === 'leave'
                            ? 'var(--warning-color)'
                            : 'var(--danger-color)'
                        }`,
                        position: 'absolute',
                        top: '-24px',
                        right: '-8px',
                      }}
                    />
                  </div>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  {emp.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                  {emp.jobTitle}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: '0.75rem' }}>
                  {emp.id} • {emp.department}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--gray-200)' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>Attendance</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{emp.attendance}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>Leaves Taken</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{emp.leaves}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payrun Tab */}
      {activeTab === 'payrun' && (
        <div>
          {/* Monthly Payrun Charts */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              Monthly Payrun Overview (Jan - Jun 2025)
            </h3>

            {/* Employee Count Chart */}
            <div style={{ marginBottom: '3rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--gray-700)' }}>
                Employee Count
              </h4>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem', height: '250px' }}>
                {payrunData.map((data) => {
                  const height = (data.employees / maxEmployees) * 100;
                  return (
                    <div
                      key={data.month}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-color)' }}>
                        {data.employees}
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: `${height}%`,
                          backgroundColor: 'var(--primary-color)',
                          borderRadius: '8px 8px 0 0',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#1d4ed8';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                        }}
                      />
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', textAlign: 'center' }}>
                        {data.month.split(' ')[0]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly Amount Chart */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--gray-700)' }}>
                Monthly Payroll Amount
              </h4>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem', height: '250px' }}>
                {payrunData.map((data) => {
                  const height = (data.amount / maxAmount) * 100;
                  return (
                    <div
                      key={data.month}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success-color)' }}>
                        ₹{(data.amount / 10000000).toFixed(1)}Cr
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: `${height}%`,
                          background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                          borderRadius: '8px 8px 0 0',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(180deg, #059669 0%, #047857 100%)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(180deg, #10b981 0%, #059669 100%)';
                        }}
                      />
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', textAlign: 'center' }}>
                        {data.month.split(' ')[0]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Payroll Reports Table */}
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              Payroll Processing History
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--gray-200)' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                      Month
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                      Employees
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                      Gross Salary
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                      Deductions
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                      Net Salary
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                      Status
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payrollReports.map((report) => (
                    <tr key={report.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 500 }}>
                        {report.month}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'center' }}>
                        {report.totalEmployees}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'right', fontWeight: 600 }}>
                        ₹{(report.totalGrossSalary / 10000000).toFixed(2)} Cr
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'right', color: 'var(--danger-color)', fontWeight: 600 }}>
                        -₹{(report.totalDeductions / 100000).toFixed(2)} L
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'right', color: 'var(--success-color)', fontWeight: 700 }}>
                        ₹{(report.totalNetSalary / 10000000).toFixed(2)} Cr
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            backgroundColor:
                              report.status === 'Paid' ? '#10b98120' : report.status === 'Processed' ? '#246BFF20' : '#f59e0b20',
                            color:
                              report.status === 'Paid'
                                ? 'var(--success-color)'
                                : report.status === 'Processed'
                                ? 'var(--primary-color)'
                                : 'var(--warning-color)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <button
                          style={{
                            padding: '0.375rem 0.75rem',
                            backgroundColor: 'white',
                            border: '1px solid var(--primary-color)',
                            color: 'var(--primary-color)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Tab */}
      {activeTab === 'configuration' && (
        <div>
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              Payroll Configuration
            </h3>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {/* Payroll Schedule */}
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: '0.5rem' }}>
                  Payroll Schedule
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                  }}
                >
                  <option>Monthly (5th of every month)</option>
                  <option>Bi-weekly</option>
                  <option>Weekly</option>
                </select>
              </div>

              {/* Default Salary Components */}
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: '0.5rem' }}>
                  Default Salary Components
                </label>
                <div style={{ padding: '1rem', backgroundColor: 'var(--gray-50)', borderRadius: '4px' }}>
                  <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <div>✓ Basic Salary (50%)</div>
                    <div>✓ HRA (50% of Basic)</div>
                    <div>✓ Standard Allowance (16.67%)</div>
                    <div>✓ Transport Allowance (5%)</div>
                    <div>✓ Medical Allowance (3%)</div>
                    <div style={{ color: 'var(--danger-color)', marginTop: '0.5rem' }}>✗ PF Deduction (12%)</div>
                    <div style={{ color: 'var(--danger-color)' }}>✗ Professional Tax (2%)</div>
                  </div>
                </div>
              </div>

              {/* Auto-generate Payslips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="auto-generate" defaultChecked />
                <label htmlFor="auto-generate" style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                  Auto-generate payslips on payroll processing
                </label>
              </div>

              {/* Email Notifications */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="email-notifications" defaultChecked />
                <label htmlFor="email-notifications" style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                  Send email notifications to employees
                </label>
              </div>

              {/* Save Button */}
              <button
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  width: 'fit-content',
                }}
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
