import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/http';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Found existing token, verifying...');
      // Verify token and get user
      api.get('/auth/me')
        .then(response => {
          console.log('Token verification response:', response.data);
          const userData = response.data.data.user;
          setUser(userData);
          
          // Set company context
          if (userData.company_id) {
            setCompany({
              id: userData.company_id,
              name: userData.company_name,
              logo: userData.company_logo_url,
              timezone: userData.timezone
            });
          }
        })
        .catch((error) => {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      console.log('No existing token found');
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', email);
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      const { token, user: userData } = response.data.data;
      localStorage.setItem('token', token);
      setUser(userData);
      
      // Set company context
      if (userData.company_id) {
        setCompany({
          id: userData.company_id,
          name: userData.company_name,
          logo: userData.company_logo_url,
          timezone: userData.timezone
        });
      }
      
      console.log('Login successful, user:', userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCompany(null);
  };

  return (
    <AuthContext.Provider value={{ user, company, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};