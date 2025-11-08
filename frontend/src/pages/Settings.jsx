import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/http';
import CurrencySelector from '../components/CurrencySelector';

export default function Settings() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data.data || []); // Backend returns users in 'data' field
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to load users');
      setUsers([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    // Define default permissions for each role
    const rolePermissions = {
      admin: {
        employees: true,
        attendance: true,
        timeOff: true,
        payroll: true,
        reports: true,
        settings: true,
      },
      hr: {
        employees: true,
        attendance: true,
        timeOff: true,
        payroll: false,
        reports: true,
        settings: false,
      },
      payroll: {
        employees: false,
        attendance: false,
        timeOff: false,
        payroll: true,
        reports: true,
        settings: false,
      },
      employee: {
        employees: false,
        attendance: true,
        timeOff: true,
        payroll: false,
        reports: false,
        settings: false,
      },
    };

    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      
      setUsers(
        users.map((u) =>
          u._id === userId
            ? { ...u, role: newRole, permissions: rolePermissions[newRole] }
            : u
        )
      );
      alert('User role updated successfully!');
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update user role');
    }
  };

  const handlePermissionToggle = async (userId, permissionKey) => {
    const targetUser = users.find((u) => u._id === userId);
    const newPermissions = {
      ...targetUser.permissions,
      [permissionKey]: !targetUser.permissions[permissionKey],
    };
    
    try {
      await api.put(`/users/${userId}/permissions`, { permissions: newPermissions });
      
      setUsers(
        users.map((u) =>
          u._id === userId
            ? {
                ...u,
                permissions: newPermissions,
              }
            : u
        )
      );
    } catch (error) {
      console.error('Error updating permissions:', error);
      alert('Failed to update permissions');
    }
  };

  const handleSaveSettings = () => {
    alert('All changes are saved automatically!');
  };

  const filteredUsers = (users || []).filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (user?.role !== 'admin') {
    return (
      <div className="content-wrap">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ color: 'var(--gray-600)', fontSize: '1.25rem' }}>
            You don't have permission to access Settings.
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Only administrators can manage user roles and permissions.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="content-wrap">
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-600)' }}>
          Loading users...
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>System Settings</h1>
        <button
          onClick={handleSaveSettings}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          Save All Changes
        </button>
      </div>

      {/* Currency Settings */}
      <div style={{ marginBottom: '2rem' }}>
        <CurrencySelector />
      </div>

      {/* User Management Section */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--gray-800)' }}>
          👥 User Management & Permissions
        </h2>
        <input
          type="text"
          placeholder="Search by name, login ID, email, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid var(--gray-300)',
            borderRadius: '4px',
            fontSize: '0.875rem',
          }}
        />
      </div>

      {/* Role Legend */}
      <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#246BFF10' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          Role Descriptions
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', fontSize: '0.75rem' }}>
          <div>
            <strong>Employee:</strong> Basic access to personal attendance, leave requests, and payslip
          </div>
          <div>
            <strong>Admin:</strong> Full access to all modules including settings and configuration
          </div>
          <div>
            <strong>HR Officer:</strong> Manage employees, attendance, leave requests, and view reports
          </div>
          <div>
            <strong>Payroll Officer:</strong> Manage payroll processing, salary configuration, and financial reports
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--gray-200)' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  User Name
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  Login ID
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  Email
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  Role
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  Permissions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((userItem) => (
                <tr key={userItem._id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    {userItem.name}
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                    {userItem.username}
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                    {userItem.email}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <select
                      value={userItem.role}
                      onChange={(e) => handleRoleChange(userItem._id, e.target.value)}
                      style={{
                        padding: '0.375rem 0.75rem',
                        border: '1px solid var(--gray-300)',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        backgroundColor: 
                          userItem.role === 'admin' ? '#10b98120' :
                          userItem.role === 'hr' ? '#246BFF20' :
                          userItem.role === 'payroll' ? '#f59e0b20' :
                          '#6b728020',
                        color:
                          userItem.role === 'admin' ? 'var(--success-color)' :
                          userItem.role === 'hr' ? 'var(--primary-color)' :
                          userItem.role === 'payroll' ? 'var(--warning-color)' :
                          'var(--gray-700)',
                      }}
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                      <option value="hr">HR Officer</option>
                      <option value="payroll">Payroll Officer</option>
                    </select>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {Object.entries(userItem.permissions).map(([key, value]) => (
                        <label
                          key={key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: value ? '#10b98120' : '#ef444420',
                            border: value ? '1px solid var(--success-color)' : '1px solid var(--danger-color)',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={() => handlePermissionToggle(userItem._id, key)}
                            style={{ cursor: 'pointer' }}
                          />
                          <span style={{ textTransform: 'capitalize', color: value ? 'var(--success-color)' : 'var(--danger-color)', fontWeight: 600 }}>
                            {key === 'timeOff' ? 'Time Off' : key}
                          </span>
                        </label>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-600)' }}>
            No users found matching your search.
          </div>
        )}
      </div>

      {/* Permission Matrix */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
          Default Permission Matrix by Role
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--gray-200)' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 600 }}>Module</th>
                <th style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 600 }}>Employee</th>
                <th style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 600 }}>Admin</th>
                <th style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 600 }}>HR Officer</th>
                <th style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 600 }}>Payroll Officer</th>
              </tr>
            </thead>
            <tbody>
              {['Employees', 'Attendance', 'Time Off', 'Payroll', 'Reports', 'Settings'].map((module) => (
                <tr key={module} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 500 }}>{module}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                    {(['Attendance', 'Time Off'].includes(module)) ? '✓' : '✗'}
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--success-color)', fontWeight: 700 }}>✓</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                    {(['Employees', 'Attendance', 'Time Off', 'Reports'].includes(module)) ? '✓' : '✗'}
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                    {(['Payroll', 'Reports'].includes(module)) ? '✓' : '✗'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
