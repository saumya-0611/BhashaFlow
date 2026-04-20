import React from 'react';
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to='/auth' replace />;
}

export function AdminRoute({ children }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');   // saved on login
  
  if (!token) return <Navigate to='/auth' replace />;
  if (role !== 'authority' && role !== 'admin') return <Navigate to='/dashboard' replace />;
  
  return children;
}
