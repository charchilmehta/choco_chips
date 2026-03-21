import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const roleRedirects = {
  admin: '/admin',
  doctor: '/doctor',
  patient: '/patient',
};

const RoleRoute = ({ role, children }) => {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role !== role) {
    const redirect = roleRedirects[user.role] || '/';
    return <Navigate to={redirect} replace />;
  }

  return children;
};

export default RoleRoute;
