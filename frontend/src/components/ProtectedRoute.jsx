import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }


  if (allowedRoles.length === 0) {
    return children;
  }

 
  if (!allowedRoles.includes(user.role)) {
    
    const dashboardRoutes = {
      superadmin: '/superadmin/dashboard',
      admin: '/admin/dashboard',
      user: '/user/dashboard'
    };
    
    return <Navigate to={dashboardRoutes[user.role] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute; 