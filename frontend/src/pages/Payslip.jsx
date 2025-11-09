import React, { useState, useEffect } from 'react';
import PayslipTemplate from '../components/PayslipTemplate';
import api from '../api/http';

export default function Payslip() {
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPayslip();
  }, []);

  const fetchPayslip = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/payroll');
      
      if (response.data.success && response.data.data.length > 0) {
        // Get the most recent payslip
        const latestPayslip = response.data.data[0];
        setPayslip(latestPayslip);
      } else {
        setPayslip(null);
      }
    } catch (err) {
      console.error('Error fetching payslip:', err);
      setError(err.response?.data?.message || 'Failed to load payslip data');
      setPayslip(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="content-wrap">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img
            src="/images/Web-design.jpg"
            alt="WorkZen HRMS Logo"
            className="company-logo"
            style={{ maxWidth: '180px', height: 'auto', margin: '0 auto' }}
            loading="lazy"
          />
          <h1 style={{ fontSize: '2rem', marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 600 }}>
            Employee Payslip
          </h1>
          <p style={{ color: 'var(--gray-600)', fontSize: '1rem' }}>November 2025</p>
        </div>

        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          fontSize: '1.125rem',
          color: '#6b7280' 
        }}>
          🔄 Loading your payslip...
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrap">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <img
          src="/images/Web-design.jpg"
          alt="WorkZen HRMS Logo"
          className="company-logo"
          style={{ maxWidth: '180px', height: 'auto', margin: '0 auto' }}
          loading="lazy"
        />
        <h1 style={{ fontSize: '2rem', marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 600 }}>
          Employee Payslip
        </h1>
        <p style={{ color: 'var(--gray-600)', fontSize: '1rem' }}>November 2025</p>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <p style={{ color: '#dc2626', margin: 0 }}>
            ⚠️ {error}
          </p>
        </div>
      )}

      <div className="fade-in-up" style={{ animation: 'fade-in-up 0.6s ease forwards' }}>
        <PayslipTemplate payslip={payslip} />
      </div>

      {payslip && (
        <div className="text-center" style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => window.print()}
            aria-label="Download payslip as PDF"
          >
            📄 Download PDF
          </button>
        </div>
      )}
    </div>
  );
}
