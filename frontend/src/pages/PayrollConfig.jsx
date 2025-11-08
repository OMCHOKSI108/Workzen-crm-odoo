import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/http';

export default function PayrollConfig() {
  const { user } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState([]);
  
  const [salaryConfig, setSalaryConfig] = useState({
    wageType: 'Monthly',
    basicSalary: 50000,
    workDays: 26,
    workHours: 8,
    components: {
      basic: { percentage: 50, amount: 25000 },
      hra: { percentage: 50, baseOn: 'basic', amount: 12500 },
      standardAllowance: { percentage: 16.67, baseOn: 'basic', amount: 4168 },
      transportAllowance: { percentage: 5, baseOn: 'basic', amount: 1250 },
      medicalAllowance: { percentage: 3, baseOn: 'basic', amount: 750 },
    },
    deductions: {
      pf: { percentage: 12, amount: 3000 },
      professionalTax: { percentage: 2, amount: 500 },
    },
  });
  
  useEffect(() => {
    fetchEmployees();
  }, []);
  
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employees');
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      alert('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };
  
  const loadEmployeeSalary = (employee) => {
    setSelectedEmployee(employee);
    // Load salary from backend if available
    if (employee.salary) {
      const basic = employee.salary.basic || 50000;
      setSalaryConfig({
        ...salaryConfig,
        basicSalary: basic,
        components: {
          basic: { percentage: 50, amount: basic * 0.5 },
          hra: { percentage: 50, baseOn: 'basic', amount: employee.salary.hra || basic * 0.25 },
          standardAllowance: { percentage: 16.67, baseOn: 'basic', amount: employee.salary.standardAllowance || basic * 0.1667 },
          transportAllowance: { percentage: 5, baseOn: 'basic', amount: employee.salary.transportAllowance || basic * 0.05 },
          medicalAllowance: { percentage: 3, baseOn: 'basic', amount: employee.salary.medicalAllowance || basic * 0.03 },
        },
        deductions: {
          pf: { percentage: 12, amount: employee.salary.pf || basic * 0.12 },
          professionalTax: { percentage: 2, amount: employee.salary.professionalTax || basic * 0.02 },
        },
      });
    }
  };
  
  const handleSaveSalary = async () => {
    if (!selectedEmployee) {
      alert('Please select an employee first');
      return;
    }
    
    try {
      setSaving(true);
      await api.put(`/employees/${selectedEmployee.employeeId}/salary`, {
        basic: salaryConfig.components.basic.amount,
        hra: salaryConfig.components.hra.amount,
        standardAllowance: salaryConfig.components.standardAllowance.amount,
        transportAllowance: salaryConfig.components.transportAllowance.amount,
        medicalAllowance: salaryConfig.components.medicalAllowance.amount,
        pf: salaryConfig.deductions.pf.amount,
        professionalTax: salaryConfig.deductions.professionalTax.amount,
        totalCTC: calculateTotalSalary(),
      });
      
      alert('Salary configuration saved successfully!');
      await fetchEmployees(); // Refresh list
    } catch (error) {
      console.error('Error saving salary:', error);
      alert('Failed to save salary configuration');
    } finally {
      setSaving(false);
    }
  };

  const calculateTotalSalary = () => {
    const componentsTotal = Object.values(salaryConfig.components).reduce(
      (sum, comp) => sum + comp.amount,
      0
    );
    const deductionsTotal = Object.values(salaryConfig.deductions).reduce(
      (sum, ded) => sum + ded.amount,
      0
    );
    return componentsTotal - deductionsTotal;
  };

  const handleWageTypeChange = (type) => {
    setSalaryConfig({ ...salaryConfig, wageType: type });
  };

  const handleBasicSalaryChange = (value) => {
    const basic = parseFloat(value) || 0;
    const basicComponent = (basic * salaryConfig.components.basic.percentage) / 100;
    
    // Recalculate all components based on basic salary
    const newComponents = { ...salaryConfig.components };
    newComponents.basic.amount = basicComponent;
    newComponents.hra.amount = (basicComponent * newComponents.hra.percentage) / 100;
    newComponents.standardAllowance.amount = (basicComponent * newComponents.standardAllowance.percentage) / 100;
    newComponents.transportAllowance.amount = (basicComponent * newComponents.transportAllowance.percentage) / 100;
    newComponents.medicalAllowance.amount = (basicComponent * newComponents.medicalAllowance.percentage) / 100;

    // Recalculate deductions
    const newDeductions = { ...salaryConfig.deductions };
    newDeductions.pf.amount = (basic * newDeductions.pf.percentage) / 100;
    newDeductions.professionalTax.amount = (basic * newDeductions.professionalTax.percentage) / 100;

    setSalaryConfig({
      ...salaryConfig,
      basicSalary: basic,
      components: newComponents,
      deductions: newDeductions,
    });
  };

  const handleComponentPercentageChange = (componentKey, percentage) => {
    const percent = parseFloat(percentage) || 0;
    const newComponents = { ...salaryConfig.components };
    const component = newComponents[componentKey];
    
    const baseAmount = component.baseOn === 'basic' 
      ? (salaryConfig.basicSalary * salaryConfig.components.basic.percentage) / 100
      : salaryConfig.basicSalary;
    
    component.percentage = percent;
    component.amount = (baseAmount * percent) / 100;

    setSalaryConfig({ ...salaryConfig, components: newComponents });
  };

  const handleDeductionPercentageChange = (deductionKey, percentage) => {
    const percent = parseFloat(percentage) || 0;
    const newDeductions = { ...salaryConfig.deductions };
    newDeductions[deductionKey].percentage = percent;
    newDeductions[deductionKey].amount = (salaryConfig.basicSalary * percent) / 100;

    setSalaryConfig({ ...salaryConfig, deductions: newDeductions });
  };

  const handleSaveConfiguration = () => {
    alert('Salary configuration saved successfully!');
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (user?.role !== 'admin' && user?.role !== 'payroll') {
    return (
      <div className="content-wrap">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ color: 'var(--gray-600)', fontSize: '1.25rem' }}>
            You don't have permission to access Payroll Configuration.
          </h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="content-wrap">
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-600)' }}>
          Loading employees...
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="content-wrap">
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-600)' }}>
          Loading employees...
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrap">
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: 600 }}>
        Payroll Configuration
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>
        {/* Employee List Sidebar */}
        <div className="card" style={{ height: 'fit-content', maxHeight: '80vh', overflow: 'auto' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
            Employees
          </h3>
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid var(--gray-300)',
              borderRadius: '4px',
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}
          />
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {filteredEmployees.map((emp) => (
              <div
                key={emp.employeeId}
                onClick={() => loadEmployeeSalary(emp)}
                style={{
                  padding: '0.75rem',
                  border: selectedEmployee?.employeeId === emp.employeeId ? '2px solid var(--primary-color)' : '1px solid var(--gray-200)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: selectedEmployee?.employeeId === emp.employeeId ? '#246BFF10' : 'white',
                }}
              >
                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  {emp.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                  {emp.employeeId}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                  {emp.department}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-color)', marginTop: '0.25rem' }}>
                  ₹{(emp.salary?.totalCTC || 0).toLocaleString('en-IN')}/month
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Salary Configuration Panel */}
        <div>
          {selectedEmployee ? (
            <>
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {selectedEmployee.name}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                  {selectedEmployee.jobTitle} • {selectedEmployee.department}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                  Employee ID: {selectedEmployee.employeeId}
                </p>
              </div>

              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                    Wage Configuration
                  </h3>
                  <button
                    onClick={handleSaveSalary}
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1.5rem',
                      backgroundColor: 'var(--primary-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      opacity: saving ? 0.6 : 1,
                    }}
                  >
                    {saving ? 'Saving...' : 'Save Salary Configuration'}
                  </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', color: 'var(--gray-600)', display: 'block', marginBottom: '0.5rem' }}>
                      Wage Type
                    </label>
                    <select
                      value={salaryConfig.wageType}
                      onChange={(e) => handleWageTypeChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid var(--gray-300)',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                      }}
                    >
                      <option>Monthly</option>
                      <option>Yearly</option>
                      <option>Daily</option>
                      <option>Hourly</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ fontSize: '0.875rem', color: 'var(--gray-600)', display: 'block', marginBottom: '0.5rem' }}>
                      Basic Salary (₹)
                    </label>
                    <input
                      type="number"
                      value={salaryConfig.basicSalary}
                      onChange={(e) => handleBasicSalaryChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid var(--gray-300)',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  {salaryConfig.wageType === 'Monthly' && (
                    <div>
                      <label style={{ fontSize: '0.875rem', color: 'var(--gray-600)', display: 'block', marginBottom: '0.5rem' }}>
                        Work Days/Month
                      </label>
                      <input
                        type="number"
                        value={salaryConfig.workDays}
                        onChange={(e) => setSalaryConfig({ ...salaryConfig, workDays: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid var(--gray-300)',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
                  Salary Components
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                  * System will automatically calculate each component amount based on the defined percentages
                </p>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  {Object.entries(salaryConfig.components).map(([key, component]) => (
                    <div key={key} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr', gap: '1rem', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--gray-50)', borderRadius: '4px' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500, textTransform: 'capitalize' }}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        {component.baseOn && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                            {component.percentage}% of {component.baseOn}
                          </div>
                        )}
                      </div>
                      <div>
                        <input
                          type="number"
                          step="0.01"
                          value={component.percentage}
                          onChange={(e) => handleComponentPercentageChange(key, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.375rem',
                            border: '1px solid var(--gray-300)',
                            borderRadius: '4px',
                            fontSize: '0.875rem',
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, textAlign: 'right' }}>
                        ₹{component.amount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
                  Deductions
                </h3>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  {Object.entries(salaryConfig.deductions).map(([key, deduction]) => (
                    <div key={key} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr', gap: '1rem', alignItems: 'center', padding: '0.75rem', backgroundColor: '#ef444410', borderRadius: '4px' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500, textTransform: 'capitalize' }}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                          {deduction.percentage}% of basic salary
                        </div>
                      </div>
                      <div>
                        <input
                          type="number"
                          step="0.01"
                          value={deduction.percentage}
                          onChange={(e) => handleDeductionPercentageChange(key, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.375rem',
                            border: '1px solid var(--gray-300)',
                            borderRadius: '4px',
                            fontSize: '0.875rem',
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, textAlign: 'right', color: 'var(--danger-color)' }}>
                        -₹{deduction.amount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ backgroundColor: '#246BFF10', border: '2px solid var(--primary-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                      Total Monthly Salary
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                      ₹{calculateTotalSalary().toLocaleString('en-IN')}
                    </div>
                  </div>
                  <button
                    onClick={handleSaveConfiguration}
                    style={{
                      padding: '0.75rem 2rem',
                      backgroundColor: 'var(--primary-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                    }}
                  >
                    Save Configuration
                  </button>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                  Annual CTC: ₹{(calculateTotalSalary() * 12).toLocaleString('en-IN')}
                </div>
              </div>
            </>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
              <p style={{ fontSize: '1.125rem', color: 'var(--gray-600)' }}>
                Select an employee to configure salary
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
