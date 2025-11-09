import React from 'react';
import Hero from '../components/Hero';
import StatCard from '../components/StatCard';
import { useDashboardStats } from '../hooks/useDashboard';

export default function Dashboard() {
  const { stats, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <>
        <Hero />
        <div className="content-wrap" id="overview">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.75rem', fontWeight: 600 }}>
            Overview
          </h2>
          <div className="stats-grid">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="stat-card">
                <StatCard title="Loading..." value="..." />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Hero />
        <div className="content-wrap" id="overview">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.75rem', fontWeight: 600 }}>
            Overview
          </h2>
          <div style={{ 
            padding: '3rem', 
            textAlign: 'center', 
            backgroundColor: '#fef2f2',
            borderRadius: '8px',
            border: '1px solid #fecaca'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>⚠️</div>
            <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>Unable to Load Dashboard</h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              We're having trouble connecting to the server. Please check your internet connection and try again.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              🔄 Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  // Show empty state if no employees
  const hasNoData = stats.totalEmployees === 0;

  if (hasNoData && !loading) {
    return (
      <>
        <Hero />
        <div className="content-wrap" id="overview">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.75rem', fontWeight: 600 }}>
            Overview
          </h2>
          <div style={{ 
            padding: '3rem', 
            textAlign: 'center', 
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '2px dashed #d1d5db'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>👋</div>
            <h3 style={{ color: '#374151', marginBottom: '1rem' }}>Welcome to WorkZen HRMS!</h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
              You're all set up! To get started, add some employees to your company and begin tracking attendance, 
              managing leaves, and processing payroll.
            </p>
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'center', 
              flexWrap: 'wrap' 
            }}>
              <a 
                href="/employees" 
                style={{
                  backgroundColor: '#714B67',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                👥 Add Employees
              </a>
              <a 
                href="/attendance" 
                style={{
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                📅 View Attendance
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Hero />
      <div className="content-wrap" id="overview">
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.75rem', fontWeight: 600 }}>
          Overview
        </h2>

        <div className="stats-grid">
          <div className="stat-card">
            <StatCard title="Total Employees" value={stats.totalEmployees.toString()} />
          </div>

          <div className="stat-card">
            <StatCard title="Present Today" value={stats.presentToday.toString()} />
          </div>

          <div className="stat-card">
            <StatCard title="On Leave" value={stats.onLeave.toString()} />
          </div>

          <div className="stat-card">
            <StatCard title="Pending Leaves" value={stats.pendingLeaves.toString()} />
          </div>

          <div className="stat-card">
            <StatCard title="Upcoming Payrun" value={stats.upcomingPayrun} />
          </div>

          <div className="stat-card">
            <StatCard title="Payroll Status" value={stats.payrollStatus} />
          </div>
        </div>
      </div>
    </>
  );
}
