import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const testAPI = async () => {
    try {
      console.log('Testing API connection...');
      const response = await fetch('http://localhost:4000/api/health');
      const data = await response.json();
      console.log('API test response:', data);
      alert('API connection successful: ' + JSON.stringify(data));
    } catch (error) {
      console.error('API test failed:', error);
      alert('API connection failed: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log('Login form submitted with:', { email, password });

    try {
      const user = await login(email, password);
      console.log('Login successful, user:', user);
      console.log('Navigating to dashboard...');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.25rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        width: '24rem'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>WorkZen Login</h2>
        {error && <p style={{
          color: '#dc2626',
          marginBottom: '1rem',
          padding: '0.5rem',
          backgroundColor: '#fef2f2',
          borderRadius: '0.25rem'
        }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.25rem'
              }}
              required
              disabled={loading}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.25rem'
              }}
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              padding: '0.5rem',
              borderRadius: '0.25rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#1d4ed8')}
            onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <button
          onClick={testAPI}
          style={{
            width: '100%',
            backgroundColor: '#10b981',
            color: 'white',
            padding: '0.5rem',
            borderRadius: '0.25rem',
            border: 'none',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Test API Connection
        </button>
        <div style={{
          marginTop: '1rem',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <p>Sample accounts:</p>
          <p>Admin: admin@workzen.com / admin123</p>
          <p>Employee: employee@workzen.com / emp123</p>
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280', marginTop: '1rem' }}>
          Don't have an account?{' '}
          <a
            href="/signup"
            style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;