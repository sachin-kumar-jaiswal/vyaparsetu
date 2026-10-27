import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vs_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [sellerProfile, setSellerProfile] = useState(() => {
    const saved = localStorage.getItem('vs_seller_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('vs_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Restore session
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('vs_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await apiClient.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          setSellerProfile(res.data.sellerProfile);
          localStorage.setItem('vs_user', JSON.stringify(res.data.user));
          if (res.data.sellerProfile) {
            localStorage.setItem('vs_seller_profile', JSON.stringify(res.data.sellerProfile));
          }
        }
      } catch (err) {
        console.warn('Session verification failed, cleared credentials.');
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      setSellerProfile(res.data.sellerProfile);
      localStorage.setItem('vs_token', res.data.token);
      localStorage.setItem('vs_user', JSON.stringify(res.data.user));
      if (res.data.sellerProfile) {
        localStorage.setItem('vs_seller_profile', JSON.stringify(res.data.sellerProfile));
      }
    }
    return res.data;
  };

  const register = async (payload) => {
    const res = await apiClient.post('/auth/register', payload);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      setSellerProfile(res.data.sellerProfile);
      localStorage.setItem('vs_token', res.data.token);
      localStorage.setItem('vs_user', JSON.stringify(res.data.user));
      if (res.data.sellerProfile) {
        localStorage.setItem('vs_seller_profile', JSON.stringify(res.data.sellerProfile));
      }
    }
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setSellerProfile(null);
    localStorage.removeItem('vs_token');
    localStorage.removeItem('vs_user');
    localStorage.removeItem('vs_seller_profile');
  };

  const refreshProfile = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setSellerProfile(res.data.sellerProfile);
        localStorage.setItem('vs_user', JSON.stringify(res.data.user));
        if (res.data.sellerProfile) {
          localStorage.setItem('vs_seller_profile', JSON.stringify(res.data.sellerProfile));
        }
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  const quickDemoLogin = async (role) => {
    const credentials = {
      CUSTOMER: { email: 'customer@vyaparsetu.in', password: 'CustomerSecure@2026' },
      RETAILER: { email: 'retailer@vyaparsetu.in', password: 'RetailerSecure@2026' },
      WHOLESALER: { email: 'wholesaler@vyaparsetu.in', password: 'SellerSecure@2026' },
      SUPER_ADMIN: { email: 'admin@vyaparsetu.in', password: 'AdminSecure@2026' },
    };

    const target = credentials[role];
    if (target) {
      return await login(target.email, target.password);
    }
  };

  const value = {
    user,
    sellerProfile,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    login,
    register,
    logout,
    refreshProfile,
    quickDemoLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;
