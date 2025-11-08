import React from 'react';

export default function StatCard({ title, value, children }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{title}</div>
      <div className="stat-value">{value}</div>
      {children}
    </div>
  );
}