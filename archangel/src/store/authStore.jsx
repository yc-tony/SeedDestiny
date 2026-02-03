import { createContext, useContext, useState, useEffect } from 'react';
import { setLogoutCallback } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 從 localStorage 載入 token
    const savedToken = localStorage.getItem('admin_token');
    const savedRefreshToken = localStorage.getItem('admin_refresh_token');
    const savedUser = localStorage.getItem('admin_user');
    if (savedToken) {
      setToken(savedToken);
    }
    if (savedRefreshToken) {
      setRefreshToken(savedRefreshToken);
    }
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const logout = () => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
  };

  // 設定 API 的 logout callback
  useEffect(() => {
    setLogoutCallback(logout);
  }, []);

  const login = (accessToken, refreshTokenValue, userData) => {
    setToken(accessToken);
    setRefreshToken(refreshTokenValue);
    setUser(userData);
    localStorage.setItem('admin_token', accessToken);
    if (refreshTokenValue) {
      localStorage.setItem('admin_refresh_token', refreshTokenValue);
    }
    localStorage.setItem('admin_user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ token, refreshToken, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
