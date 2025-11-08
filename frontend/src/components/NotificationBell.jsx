import { useState } from 'react';

const NotificationBell = () => {
  const [notifications] = useState([
    { id: 1, message: 'Leave request approved', read: false },
    { id: 2, message: 'Payslip generated', read: false },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ position: 'relative' }}>
      <button style={{ position: 'relative', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-0.5rem',
            right: '-0.5rem',
            backgroundColor: '#dc2626',
            color: 'white',
            fontSize: '0.75rem',
            borderRadius: '50%',
            height: '1.25rem',
            width: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {unreadCount}
          </span>
        )}
      </button>
      {/* Dropdown would go here */}
    </div>
  );
};

export default NotificationBell;