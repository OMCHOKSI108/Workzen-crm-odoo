import React, { useState } from 'react';

export default function PayrollSimulator() {
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [simulation, setSimulation] = useState(null);

  const handleSimulate = () => {
    setSimulation({
      month,
      year,
      totalGross: 120000,
      totalDeductions: 13800,
      totalNet: 106200,
      employees: 2,
    });
  };

  const handleCommit = () => {
    alert('Payrun committed successfully!');
    setSimulation(null);
    setMonth('');
    setYear('');
  };

  return (
    <div className="content-wrap">
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 600 }}>
        Payroll Simulator
      </h1>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 className="card-title">Run Payroll Simulation</h3>
        <div className="form-row" style={{ alignItems: 'flex-end', gap: '1rem' }}>
          <div className="form-field" style={{ flex: 1 }}>
            <label htmlFor="payrollMonth">Month</label>
            <select id="payrollMonth" value={month} onChange={(e) => setMonth(e.target.value)}>
              <option value="">Select Month</option>
              <option value="01">January</option>
              <option value="02">February</option>
              <option value="03">March</option>
              <option value="04">April</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">July</option>
              <option value="08">August</option>
              <option value="09">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>
          <div className="form-field" style={{ flex: 1 }}>
            <label htmlFor="payrollYear">Year</label>
            <input
              id="payrollYear"
              type="number"
              placeholder="2025"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              min="2020"
              max="2030"
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleSimulate}
            disabled={!month || !year}
            style={{ marginBottom: '1rem' }}
          >
            Simulate Payroll
          </button>
        </div>
      </div>

      {simulation && (
        <div className="flip-card card">
          <h3 className="card-title">
            Payroll Summary -{' '}
            {new Date(simulation.year, simulation.month - 1).toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </h3>

          <div className="grid grid-cols-3 mb-3" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
            <div
              style={{
                padding: '1.25rem',
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                borderRadius: 'var(--radius-card)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--gray-600)',
                  marginBottom: '0.5rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                }}
              >
                Gross Pay
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                ${simulation.totalGross.toLocaleString()}
              </div>
            </div>

            <div
              style={{
                padding: '1.25rem',
                background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                borderRadius: 'var(--radius-card)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--gray-600)',
                  marginBottom: '0.5rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                }}
              >
                Deductions
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--danger-color)' }}>
                ${simulation.totalDeductions.toLocaleString()}
              </div>
            </div>

            <div
              style={{
                padding: '1.25rem',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                borderRadius: 'var(--radius-card)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--gray-600)',
                  marginBottom: '0.5rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                }}
              >
                Net Pay
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success-color)' }}>
                ${simulation.totalNet.toLocaleString()}
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--gray-50)',
              borderRadius: 'var(--radius-card)',
              marginBottom: '1.5rem',
            }}
          >
            <p style={{ margin: 0, color: 'var(--gray-700)', fontSize: '1rem' }}>
              ✓ <strong>{simulation.employees} employees</strong> processed successfully
            </p>
          </div>

          <button className="btn btn-success btn-lg" onClick={handleCommit}>
            Commit Payrun
          </button>
        </div>
      )}
    </div>
  );
}
