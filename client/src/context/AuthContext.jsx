import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vs_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [sellerProfile, setSellerProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('vs_seller_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('vs_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Restore and verify session on mount
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
        // Token invalid or expired — clear credentials
        console.warn('Session verification failed. Clearing credentials.');
        _clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _persistSession = (data) => {
    setToken(data.token);
    setUser(data.user);
    setSellerProfile(data.sellerProfile ?? null);
    localStorage.setItem('vs_token', data.token);
    localStorage.setItem('vs_user', JSON.stringify(data.user));
    if (data.sellerProfile) {
      localStorage.setItem('vs_seller_profile', JSON.stringify(data.sellerProfile));
    }
  };

  const _clearSession = () => {
    setToken(null);
    setUser(null);
    setSellerProfile(null);
    localStorage.removeItem('vs_token');
    localStorage.removeItem('vs_user');
    localStorage.removeItem('vs_seller_profile');
  };

  /**
   * login — POST /auth/login with email + password.
   * Throws on bad credentials so caller can display the error.
   */
  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.data.success) {
      _persistSession(res.data);
    }
    return res.data;
  };

  /**
   * register — POST /auth/register with full payload.
   * On success, automatically logs the new user in.
   */
  const register = async (payload) => {
    const res = await apiClient.post('/auth/register', payload);
    if (res.data.success) {
      _persistSession(res.data);
    }
    return res.data;
  };

  /**
   * logout — clears all local session data.
   * Also calls the backend to record the logout event (non-critical).
   */
  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Non-critical — proceed with client-side clear regardless
    } finally {
      _clearSession();
    }
  };

  /**
   * refreshProfile — re-fetches latest user data from backend.
   * Useful after approval status changes, etc.
   */
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;
