import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set auth header from stored token
  const setAuthToken = useCallback((token) => {
    if (token) {
      localStorage.setItem('access_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete api.defaults.headers.common['Authorization'];
    }
  }, []);

  // Fetch current user profile
  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data);
      return res.data;
    } catch {
      setAuthToken(null);
      setUser(null);
      return null;
    }
  }, [setAuthToken]);

  // Initialize: check for stored token
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  // Auto-refresh token on 401
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const res = await api.post('/api/auth/refresh', { refresh_token: refreshToken });
              setAuthToken(res.data.access_token);
              localStorage.setItem('refresh_token', res.data.refresh_token);
              originalRequest.headers['Authorization'] = `Bearer ${res.data.access_token}`;
              return api(originalRequest);
            } catch {
              setAuthToken(null);
              setUser(null);
            }
          } else {
            setAuthToken(null);
            setUser(null);
          }
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(interceptor);
  }, [setAuthToken]);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    setAuthToken(res.data.access_token);
    localStorage.setItem('refresh_token', res.data.refresh_token);
    const userData = await fetchUser();
    return userData;
  };

  const register = async (email, password, fullName) => {
    const res = await api.post('/api/auth/register', {
      email,
      password,
      full_name: fullName,
    });
    setAuthToken(res.data.access_token);
    localStorage.setItem('refresh_token', res.data.refresh_token);
    const userData = await fetchUser();
    return userData;
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
