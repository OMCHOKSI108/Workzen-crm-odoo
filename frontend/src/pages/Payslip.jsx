import React from 'react';
import PayslipTemplate from '../components/PayslipTemplate';

export default function Payslip() {
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

      <div className="fade-in-up" style={{ animation: 'fade-in-up 0.6s ease forwards' }}>
        <PayslipTemplate />
      </div>

      <div className="text-center" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => window.print()}
          aria-label="Download payslip as PDF"
        >
          📄 Download PDF
        </button>
      </div>
    </div>
  );
}
