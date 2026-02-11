import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me/');
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const response = await api.post('/auth/login/', { username, password });
    if (response.data.requires_2fa) {
      return { requires2FA: true, username };
    }
    setUser(response.data.user);
    return { requires2FA: false };
  };

  const verify2FA = async (username, code) => {
    const response = await api.post('/auth/verify-2fa/', { username, code });
    setUser(response.data.user);
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register/', userData);
    setUser(response.data.user);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
  };

  const updateProfile = async (data) => {
    const response = await api.put('/auth/me/update/', data);
    setUser(response.data.user);
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isEditor = () => ['EDITOR', 'ADMIN'].includes(user?.role);
  const isUser = () => ['USER', 'EDITOR', 'ADMIN'].includes(user?.role);

  const value = {
    user,
    loading,
    login,
    verify2FA,
    register,
    logout,
    updateProfile,
    checkAuth,
    isAdmin,
    isEditor,
    isUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
