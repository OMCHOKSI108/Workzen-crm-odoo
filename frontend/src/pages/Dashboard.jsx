import React from 'react';
import Hero from '../components/Hero';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  return (
    <>
      <Hero />
      <div className="content-wrap" id="overview">
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.75rem', fontWeight: 600 }}>
          Overview
        </h2>

        <div className="stats-grid">
          <div className="stat-card">
            <StatCard title="Total Employees" value="250" />
          </div>

          <div className="stat-card">
            <StatCard title="Present Today" value="238" />
          </div>

          <div className="stat-card">
            <StatCard title="On Leave" value="8" />
          </div>

          <div className="stat-card">
            <StatCard title="Pending Leaves" value="15" />
          </div>

          <div className="stat-card">
            <StatCard title="Upcoming Payrun" value="Jan 2026" />
          </div>

          <div className="stat-card">
            <StatCard title="Payroll Status" value="Ready" />
          </div>
        </div>
      </div>
    </>
  );
}
