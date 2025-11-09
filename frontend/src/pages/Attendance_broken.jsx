import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/http';

export default function Attendance() {
  const { user } = useAuth();
  const [lastPunch, setLastPunch] = useState(null);
  const [status, setStatus] = useState('out'); // 'in' or 'out'
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/attendance');
      if (response.data.success) {
        const formattedHistory = response.data.data.map(att => ({
          id: att.id,
          date: new Date(att.date).toLocaleDateString('en-IN'),
          checkIn: att.checkIn ? new Date(att.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-',
          checkOut: att.checkOut ? new Date(att.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-',
          workHours: att.workHours ? `${att.workHours.toFixed(2)}` : '-',
          status: att.status === 'present' ? 'Present' : att.status === 'leave' ? 'Leave' : 'Absent',
        }));
        setAttendanceHistory(formattedHistory);
        
        // Check if already checked in today
        const today = new Date().toLocaleDateString('en-IN');
        const todayRecord = formattedHistory.find(att => att.date === today);
        if (todayRecord && todayRecord.checkIn !== '-' && todayRecord.checkOut === '-') {
          setStatus('in');
        }
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  async function punch(type) {
    try {
      const response = await api.post('/attendance/punch', { type });
      
      if (response.data.success) {
        const data = response.data.data;
        setLastPunch(data);
        setStatus(data.status);
        
        // Refresh attendance history
        await fetchAttendanceHistory();
      }
    } catch (error) {
      console.error('Punch error:', error);
      alert(error.response?.data?.message || 'Failed to record attendance');
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading attendance data...</p>
      </div>
    );
  }

  const handlePunch = (type) => {
    punch(type);
  };

  return (
    <div className="content-wrap">
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: 600 }}>Attendance</h1>

      {/* Employee ID & Status Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
              Employee ID
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>
              {user?.id || 'OI2024010001'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
              Current Status
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                backgroundColor: status === 'in' ? '#10b98120' : '#ef444420',
                color: status === 'in' ? 'var(--success-color)' : 'var(--danger-color)',
                fontWeight: 700,
                fontSize: '1rem',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: status === 'in' ? 'var(--success-color)' : 'var(--danger-color)',
                }}
              />
              {status === 'in' ? 'Checked In' : 'Checked Out'}
            </div>
          </div>
        </div>
      </div>

      {/* Punch Buttons */}
      <div className="punch-actions">
        <button
          className="punch-btn punch-in"
          onClick={() => handlePunch('IN')}
          aria-label="Punch in for the day"
          disabled={status === 'in'}
          style={{
            opacity: status === 'in' ? 0.5 : 1,
            cursor: status === 'in' ? 'not-allowed' : 'pointer',
          }}
        >
          <span className="punch-icon" aria-hidden="true">
            🕐
          </span>
          <span>Check In</span>
        </button>

        <button
          className="punch-btn punch-out"
          onClick={() => handlePunch('OUT')}
          aria-label="Punch out for the day"
          disabled={status === 'out'}
          style={{
            opacity: status === 'out' ? 0.5 : 1,
            cursor: status === 'out' ? 'not-allowed' : 'pointer',
          }}
        >
          <span className="punch-icon" aria-hidden="true">
            🕐
          </span>
          <span>Check Out</span>
        </button>
      </div>

      {/* Last Punch Timestamp */}
      {lastPunch && (
        <div
          className="card"
          style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            backgroundColor: lastPunch.type === 'IN' ? '#10b98110' : '#ef444410',
            border: `2px solid ${lastPunch.type === 'IN' ? 'var(--success-color)' : 'var(--danger-color)'}`,
          }}
        >
          <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)', marginBottom: '0.5rem' }}>
            Last {lastPunch.type === 'IN' ? 'Check In' : 'Check Out'}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>
            {lastPunch.timestamp}
          </div>
        </div>
      )}

      {/* Attendance History Table */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 className="card-title" style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
          Attendance History
        </h3>
        
        {attendanceHistory.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>📋</div>
            <h4 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: '#374151' }}>
              No Attendance Records Yet
            </h4>
            <p style={{ marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto' }}>
              Your attendance history will appear here once you start checking in and out. 
              Use the buttons above to record your first attendance.
            </p>
            <div style={{
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              padding: '1rem',
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              💡 Tip: Your attendance data helps track work hours and generates accurate payroll reports.
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--gray-200)' }}>
                  <th
                    style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--gray-700)',
                    }}
                  >
                    Date
                  </th>
                  <th
                    style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--gray-700)',
                    }}
                  >
                    Check In
                  </th>
                  <th
                    style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--gray-700)',
                    }}
                  >
                    Check Out
                  </th>
                  <th
                    style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--gray-700)',
                    }}
                  >
                    Work Hours
                  </th>
                  <th
                    style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--gray-700)',
                    }}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {attendanceHistory.map((record) => (
                  <tr key={record.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 500 }}>
                      {record.date}
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{record.checkIn}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{record.checkOut}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>
                      {record.workHours}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          backgroundColor:
                            record.status === 'Present'
                              ? '#10b98120'
                              : record.status === 'Leave'
                              ? '#f59e0b20'
                              : '#ef444420',
                          color:
                            record.status === 'Present'
                              ? 'var(--success-color)'
                              : record.status === 'Leave'
                              ? 'var(--warning-color)'
                              : 'var(--danger-color)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
            <thead>
              <tr style={{ borderBottom: '2px solid var(--gray-200)' }}>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--gray-700)',
                  }}
                >
                  Date
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--gray-700)',
                  }}
                >
                  Check In
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--gray-700)',
                  }}
                >
                  Check Out
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--gray-700)',
                  }}
                >
                  Work Hours
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--gray-700)',
                  }}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {attendanceHistory.map((record) => (
                <tr key={record.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    {record.date}
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{record.checkIn}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{record.checkOut}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>
                    {record.workHours}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        backgroundColor:
                          record.status === 'Present'
                            ? '#10b98120'
                            : record.status === 'Leave'
                            ? '#f59e0b20'
                            : '#ef444420',
                        color:
                          record.status === 'Present'
                            ? 'var(--success-color)'
                            : record.status === 'Leave'
                            ? 'var(--warning-color)'
                            : 'var(--danger-color)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}