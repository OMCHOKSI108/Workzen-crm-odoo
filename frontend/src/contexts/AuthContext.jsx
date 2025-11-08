import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/http';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Found existing token, verifying...');
      // Verify token and get user
      api.get('/auth/me')
        .then(response => {
          console.log('Token verification response:', response.data);
          setUser(response.data.data.user);
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
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      setUser(user);
      console.log('Login successful, user:', user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};