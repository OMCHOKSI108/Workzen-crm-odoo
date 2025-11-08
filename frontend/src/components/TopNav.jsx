import { useAuth } from '../contexts/AuthContext';

const TopNav = () => {
  const { user, company, logout } = useAuth();

  return (
    <nav style={{
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {company?.logo && (
          <img 
            src={company.logo} 
            alt={`${company.name} logo`}
            style={{ height: '32px' }}
          />
        )}
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          {company?.name || 'WorkZen'} HRMS
        </h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ textAlign: 'right' }}>
          <div>Welcome, {user?.name || user?.email}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Employee'}
          </div>
        </div>
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