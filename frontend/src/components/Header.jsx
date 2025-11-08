import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Header({ onToggleSidebar }) {
  const { user, company, logout } = useAuth();
  
  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="toggle-sidebar-btn" 
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <div className="header-brand">
          {company?.logo && (
            <img 
              src={company.logo} 
              alt={`${company.name} logo`}
              className="company-logo"
              style={{ height: '32px', marginRight: '0.5rem' }}
            />
          )}
          <h1 className="header-title">{company?.name || 'WorkZen'} HRMS</h1>
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
        <div className="user-info">
          <span className="user-name">{user?.name || user?.email || 'User'}</span>
          <span className="user-role" style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Employee'}
          </span>
        </div>
        <button className="btn btn-danger" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}