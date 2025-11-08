import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Header({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  
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
        <h1 className="header-title">WorkZen HRMS</h1>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
        <span className="welcome">Welcome, {user?.email || 'User'}</span>
        <button className="btn btn-danger" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}