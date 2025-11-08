import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/http';

export default function LeaveRequest() {
  const { user } = useAuth();
  const isAdminOrHR = user?.role === 'admin' || user?.role === 'hr';

  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    type: 'casual',
    reason: '',
  });

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('paid'); // paid or sick
  const [leaveBalance, setLeaveBalance] = useState({
    casual: { available: 12, used: 2 },
    earned: { available: 15, used: 5 },
    sick: { available: 7, used: 1 },
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leaves');
      if (response.data.success) {
        setLeaves(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/leaves', form);
      
      if (response.data.success) {
        alert(response.data.message || 'Leave request submitted successfully');
        setForm({ startDate: '', endDate: '', type: 'casual', reason: '' });
        await fetchLeaves();
      }
    } catch (error) {
      console.error('Error submitting leave:', error);
      alert(error.response?.data?.message || 'Failed to submit leave request');
    }
  };

  const handleApprove = async (leaveId) => {
    try {
      const response = await api.put(`/leaves/${leaveId}/approve`, {
        status: 'approved',
        comments: 'Approved'
      });
      
      if (response.data.success) {
        alert(response.data.message);
        await fetchLeaves();
      }
    } catch (error) {
      console.error('Error approving leave:', error);
      alert(error.response?.data?.message || 'Failed to approve leave');
    }
  };

  const handleReject = async (leaveId) => {
    const comments = prompt('Reason for rejection (optional):');
    
    try {
      const response = await api.put(`/leaves/${leaveId}/approve`, {
        status: 'rejected',
        comments: comments || 'Rejected'
      });
      
      if (response.data.success) {
        alert(response.data.message);
        await fetchLeaves();
      }
    } catch (error) {
      console.error('Error rejecting leave:', error);
      alert(error.response?.data?.message || 'Failed to reject leave');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // If start date is changed and it's after end date, clear end date
    if (name === 'startDate' && form.endDate && value > form.endDate) {
      setForm({ ...form, startDate: value, endDate: '' });
    }
  };

  const myLeaves = leaves.filter((leave) => leave.employeeId === user?.id);
  const allLeaves = leaves;

  const paidLeaves = activeTab === 'paid' 
    ? leaves.filter((l) => l.type.includes('Casual') || l.type.includes('Annual') || l.type.includes('Earned'))
    : leaves.filter((l) => l.type.includes('Sick'));

  return (
    <div className="content-wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: 0 }}>
          {isAdminOrHR ? 'Time Off Management' : 'Leave Requests'}
        </h1>
      </div>

      {/* Leave Balance Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>
            Casual Leave
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-color)' }}>
            {leaveBalance.casual.available}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
            {leaveBalance.casual.used} days used
          </div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>
            Earned Leave
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success-color)' }}>
            {leaveBalance.earned.available}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
            {leaveBalance.earned.used} days used
          </div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>
            Sick Leave
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--warning-color)' }}>
            {leaveBalance.sick.available}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
            {leaveBalance.sick.used} days used
          </div>
        </div>
      </div>

      {/* Request Leave Form */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>Request Leave</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="startDate">Start Date</label>
              <input
                id="startDate"
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                min={today}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="endDate">End Date</label>
              <input
                id="endDate"
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                min={form.startDate || today}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="leaveType">Leave Type</label>
            <select
              id="leaveType"
              name="type"
              value={form.type}
              onChange={handleChange}
            >
              <option value="casual">Casual Leave</option>
              <option value="earned">Earned Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="maternity">Maternity Leave</option>
              <option value="paternity">Paternity Leave</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="reason">Reason (Optional)</label>
            <textarea
              id="reason"
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="Briefly describe the reason for your leave..."
              rows="3"
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Submit Request
          </button>
        </form>
      </div>

      {/* Admin/HR View - All Leave Requests */}
      {isAdminOrHR && (
        <div className="card">
          <div style={{ borderBottom: '2px solid var(--gray-200)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0', marginBottom: '-2px' }}>
              <button
                onClick={() => setActiveTab('paid')}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  backgroundColor: activeTab === 'paid' ? 'var(--primary-color)' : 'transparent',
                  color: activeTab === 'paid' ? 'white' : 'var(--gray-600)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  borderRadius: '8px 8px 0 0',
                }}
              >
                Paid Time Off
              </button>
              <button
                onClick={() => setActiveTab('sick')}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  backgroundColor: activeTab === 'sick' ? 'var(--primary-color)' : 'transparent',
                  color: activeTab === 'sick' ? 'white' : 'var(--gray-600)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  borderRadius: '8px 8px 0 0',
                }}
              >
                Sick Time Off
              </button>
            </div>
          </div>

          <h3 className="card-title" style={{ marginBottom: '1rem' }}>All Leave Requests</h3>
          {paidLeaves.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--gray-200)' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                      Employee
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                      Start Date
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                      End Date
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                      Type
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                      Status
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paidLeaves.map((leave) => (
                    <tr key={leave.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: 500 }}>{leave.employeeName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{leave.employeeId}</div>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{leave.startDate}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{leave.endDate}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          backgroundColor: 'var(--gray-100)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}>
                          {leave.type}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span
                          style={{
                            color:
                              leave.status === 'Approved'
                                ? 'var(--success-color)'
                                : leave.status === 'Rejected'
                                ? 'var(--danger-color)'
                                : 'var(--warning-color)',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                          }}
                        >
                          {leave.status === 'Approved' && '✓ '}
                          {leave.status === 'Rejected' && '✗ '}
                          {leave.status === 'Pending' && '⏳ '}
                          {leave.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        {leave.status === 'Pending' && (
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleApprove(leave.id)}
                              style={{
                                padding: '0.375rem 0.75rem',
                                backgroundColor: 'var(--success-color)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(leave.id)}
                              style={{
                                padding: '0.375rem 0.75rem',
                                backgroundColor: 'var(--danger-color)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--gray-500)', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
              No {activeTab} leave requests found.
            </p>
          )}
        </div>
      )}

      {/* Employee View - My Leave Requests */}
      {!isAdminOrHR && (
        <div className="card">
          <h3 className="card-title">My Leave Requests</h3>
          {myLeaves.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {myLeaves.map((leave) => (
                <div
                  key={leave.id}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-card)',
                    backgroundColor: 'var(--gray-50)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <span style={{ fontWeight: 500 }}>
                    📅 {leave.startDate} to {leave.endDate}
                  </span>
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      backgroundColor: 'white',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    {leave.type}
                  </span>
                  <span
                    style={{
                      color:
                        leave.status === 'Approved'
                          ? 'var(--success-color)'
                          : leave.status === 'Rejected'
                          ? 'var(--danger-color)'
                          : 'var(--warning-color)',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                    }}
                  >
                    {leave.status === 'Approved' ? '✓ ' : leave.status === 'Rejected' ? '✗ ' : '⏳ '}
                    {leave.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--gray-500)', fontStyle: 'italic' }}>
              No leave requests found. Submit your first request above.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
