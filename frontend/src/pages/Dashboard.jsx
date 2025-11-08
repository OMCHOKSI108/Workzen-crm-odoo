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
          <div style={{ padding: '2rem', textAlign: 'center', color: '#e74c3c' }}>
            <p>Error loading dashboard data: {error}</p>
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
