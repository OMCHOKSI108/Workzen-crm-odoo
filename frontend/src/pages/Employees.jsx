import React, { useState, useEffect } from 'react';
import api from '../api/http';

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employees');
      if (response.data.success) {
        setEmployees(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return '#10b981'; // green
      case 'leave':
        return '#f59e0b'; // orange
      case 'absent':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const openEmployeeModal = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  if (loading) {
    return (
      <div className="content-wrap" style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Loading employees...</p>
      </div>
    );
  }

  return (
    <div className="content-wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: 0 }}>Employees</h1>
        <button className="btn btn-primary">+ Add New Employee</button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search by name, ID, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            border: '1px solid var(--gray-300)',
            borderRadius: 'var(--radius-md)',
          }}
        />
      </div>

      {/* Employee Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {filteredEmployees.map((employee) => (
          <div
            key={employee.id}
            className="card"
            onClick={() => openEmployeeModal(employee)}
            style={{
              cursor: 'pointer',
              position: 'relative',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-card)';
            }}
          >
            {/* Status Indicator */}
            <div
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: getStatusColor(employee.status),
                boxShadow: `0 0 0 3px ${getStatusColor(employee.status)}33`,
              }}
              title={employee.status}
            />

            {/* Avatar */}
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 700,
                margin: '0 auto 1rem',
              }}
            >
              {employee.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </div>

            {/* Employee Info */}
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                {employee.name}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
                {employee.role}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.75rem' }}>
                {employee.id}
              </p>
              <div
                style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  backgroundColor: 'var(--gray-100)',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--gray-700)',
                }}
              >
                {employee.department}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--gray-500)', fontSize: '1rem' }}>
            No employees found matching your search.
          </p>
        </div>
      )}

      {/* Employee Detail Modal */}
      {showModal && selectedEmployee && (
        <EmployeeModal employee={selectedEmployee} onClose={closeModal} />
      )}
    </div>
  );
}

// Employee Detail Modal Component
function EmployeeModal({ employee, onClose }) {
  const [activeTab, setActiveTab] = useState('resume');

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'var(--danger-color)',
            color: 'white',
            fontSize: '1.25rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              fontWeight: 700,
              margin: '0 auto 1rem',
            }}
          >
            {employee.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            {employee.name}
          </h2>
          <p style={{ color: 'var(--gray-600)', fontSize: '1rem', marginBottom: '0.5rem' }}>
            {employee.role}
          </p>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{employee.id}</p>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '2px solid var(--gray-200)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {['resume', 'privateInfo', 'salaryInfo', 'security'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: activeTab === tab ? 'var(--primary-color)' : 'var(--gray-600)',
                  fontWeight: activeTab === tab ? 600 : 400,
                  borderBottom: activeTab === tab ? '2px solid var(--primary-color)' : 'none',
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  marginBottom: '-2px',
                }}
              >
                {tab === 'resume' && 'Resume'}
                {tab === 'privateInfo' && 'Private Info'}
                {tab === 'salaryInfo' && 'Salary Info'}
                {tab === 'security' && 'Security'}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'resume' && (
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
                Professional Information
              </h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <InfoRow label="Department" value={employee.department} />
                <InfoRow label="Role" value={employee.role} />
                <InfoRow label="Date of Joining" value={employee.joiningDate} />
                <InfoRow label="Employee ID" value={employee.id} />
              </div>
            </div>
          )}

          {activeTab === 'privateInfo' && (
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
                Contact Information
              </h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <InfoRow label="Email" value={employee.email} />
                <InfoRow label="Phone" value={employee.phone} />
                <InfoRow label="Mobile" value={employee.phone} />
              </div>
            </div>
          )}

          {activeTab === 'salaryInfo' && (
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
                Salary Details
              </h3>
              <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <InfoRow label="Monthly Wage" value={`₹${employee.salary.monthlyWage.toLocaleString()}`} />
                <InfoRow label="Yearly Wage" value={`₹${employee.salary.yearlyWage.toLocaleString()}`} />
              </div>

              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                Salary Components
              </h4>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <InfoRow label="Basic Salary" value={`${employee.salary.components.basic}% of wage`} />
                <InfoRow label="House Rent Allowance (HRA)" value={`${employee.salary.components.hra}% of Basic`} />
                <InfoRow label="Standard Allowance" value={`${employee.salary.components.standardAllowance}%`} />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
                Account Security
              </h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <InfoRow label="Login ID" value={employee.id} />
                <InfoRow label="Email" value={employee.email} />
              </div>
              <button
                className="btn btn-primary"
                style={{ marginTop: '1.5rem' }}
              >
                Reset Password
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Component
function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.75rem',
        backgroundColor: 'var(--gray-50)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <span style={{ fontWeight: 500, color: 'var(--gray-700)' }}>{label}</span>
      <span style={{ color: 'var(--gray-900)' }}>{value}</span>
    </div>
  );
}
