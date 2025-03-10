import React, { FC, ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../services/hooks';

type TProtectedRouteProps = {
  element: ReactElement;
  anonymous?: boolean;
};

export const ProtectedRoute: FC<TProtectedRouteProps> = ({ element, anonymous = false }) => {
  const location = useLocation();
  const { isAuthenticated } = useAppSelector(state => state.auth);

  // If route is for anonymous users only (login, register) and user is authenticated
  if (anonymous && isAuthenticated) {
    // Redirect to home page
    return <Navigate to="/" replace />;
  }

  // If route requires authentication and user is not authenticated
  if (!anonymous && !isAuthenticated) {
    // Redirect to login page and save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is allowed to access the route, render the element
  return element;
}; 