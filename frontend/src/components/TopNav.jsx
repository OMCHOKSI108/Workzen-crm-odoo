import { useAuth } from '../contexts/AuthContext';

const TopNav = () => {
  const { user, logout } = useAuth();

  return (
    <nav style={{
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>WorkZen HRMS</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span>Welcome, {user?.email}</span>
        <button
          onClick={logout}
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default TopNav;