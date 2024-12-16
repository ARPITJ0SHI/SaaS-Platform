import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { authService } from '../services/api.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authService.login({ email, password });
      
     
      if (!response.user || !response.user.role) {
        throw new Error('Invalid user data received');
      }


      setUser(response.user);
      toast.success('Login successful! Welcome back!');
      return response;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during login';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const data = await authService.register(userData);
      toast.success('Registration successful! Please log in.');
      return data;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during registration';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.info('You have been logged out');
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isSuperAdmin: user?.role === 'superadmin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
