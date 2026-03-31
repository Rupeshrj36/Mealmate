import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('mealmate_token'));

  const loadUser = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      localStorage.removeItem('mealmate_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('mealmate_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    localStorage.setItem('mealmate_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('mealmate_token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const isAdmin = user?.role === 'admin';
  const isOwner = user?.role === 'owner';
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider value={{
      user, token, loading, login, register, logout, updateUser,
      isAdmin, isOwner, isStudent,
      unreadNotifications: user?.notifications?.filter(n => !n.read).length || 0
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
