import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar({ className = '' }) {
  const { user } = useAuth();
  const role = user?.role || 'employee';

  return (
    <aside className={`sidebar ${className}`} role="navigation" aria-label="Main navigation">
      <div className="brand">WorkZen</div>
      <nav className="side-nav">
        <NavLink to="/dashboard" className="nav-item">
          <span className="label">Dashboard</span>
        </NavLink>
        
        {(role === 'admin' || role === 'hr') && (
          <NavLink to="/employees-list" className="nav-item">
            <span className="label">Employees</span>
          </NavLink>
        )}
        
        <NavLink to="/attendance" className="nav-item">
          <span className="label">Attendance</span>
        </NavLink>
        
        <NavLink to="/leaves" className="nav-item">
          <span className="label">Leave Requests</span>
        </NavLink>
        
        {(role === 'admin' || role === 'payroll') && (
          <>
            <NavLink to="/payroll" className="nav-item">
              <span className="label">Payroll</span>
            </NavLink>
            <NavLink to="/payroll-config" className="nav-item">
              <span className="label">Salary Config</span>
            </NavLink>
          </>
        )}
        
        <NavLink to="/payslip" className="nav-item">
          <span className="label">My Payslip</span>
        </NavLink>
        
        <NavLink to="/profile" className="nav-item">
          <span className="label">My Profile</span>
        </NavLink>
        
        {(role === 'admin' || role === 'hr' || role === 'payroll') && (
          <NavLink to="/reports" className="nav-item">
            <span className="label">Reports</span>
          </NavLink>
        )}
        
        {role === 'admin' && (
          <NavLink to="/settings" className="nav-item">
            <span className="label">Settings</span>
          </NavLink>
        )}
      </nav>
      <div style={{marginTop:'auto',fontSize:12,color:'#cdd6e0',padding:'1rem'}}>
        © WorkZen
      </div>
    </aside>
  );
}