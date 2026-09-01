import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('minierp_user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('minierp_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Validate existing token on initial mount
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('minierp_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await authService.getMe();
        setUser(currentUser);
        localStorage.setItem('minierp_user', JSON.stringify(currentUser));
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        localStorage.removeItem('minierp_token');
        localStorage.removeItem('minierp_user');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    const { user: loggedInUser, token: authToken } = data;

    localStorage.setItem('minierp_token', authToken);
    localStorage.setItem('minierp_user', JSON.stringify(loggedInUser));

    setToken(authToken);
    setUser(loggedInUser);

    return loggedInUser;
  };

  const logout = () => {
    localStorage.removeItem('minierp_token');
    localStorage.removeItem('minierp_user');
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  };

  const hasRole = (allowedRoles = []) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true; // Admin has universal access
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};