import { FC, ReactElement, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../services/hooks';
import { getUser } from '../../services/authSlice';

type TProtectedRouteProps = {
  element: ReactElement;
  anonymous?: boolean;
};

export const ProtectedRoute: FC<TProtectedRouteProps> = ({ element, anonymous = false }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading, error } = useAppSelector(state => state.auth);
  const [authCheckFailed, setAuthCheckFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Check if this is a profile order route
  const isProfileOrderRoute = location.pathname.includes('/profile/orders/');
  
  // Handle auth check with retry limits
  useEffect(() => {
    const MAX_RETRIES = 2;
    
    // Only attempt to check auth if:
    // 1. We're still loading
    // 2. Auth check hasn't already failed
    // 3. We haven't exceeded retry limit
    // 4. We're not already authenticated
    if (loading && !authCheckFailed && retryCount < MAX_RETRIES && !isAuthenticated) {
      // Add a delay before retrying to avoid rate limits
      const timer = setTimeout(() => {
        console.log(`Retry auth check attempt ${retryCount + 1}/${MAX_RETRIES}`);
        dispatch(getUser())
          .unwrap()
          .catch(err => {
            console.error('Auth check failed:', err);
            setRetryCount(prev => prev + 1);
            
            // If we've reached max retries, mark auth check as failed
            if (retryCount + 1 >= MAX_RETRIES) {
              console.log('Max retries reached, marking auth check as failed');
              setAuthCheckFailed(true);
            }
          });
      }, retryCount * 1000); // Increasing delay with each retry
      
      return () => clearTimeout(timer);
    }
  }, [dispatch, loading, authCheckFailed, retryCount, isAuthenticated]);

  // If auth check has failed after retries, stop loading and show error
  if (authCheckFailed || (error && !loading)) {
    // For anonymous routes (login, register), continue as not authenticated
    if (anonymous) {
      return element;
    }
    
    // Special handling for profile order routes - we want to try to display them even if auth failed
    if (isProfileOrderRoute) {
      console.log('Auth check failed for profile order route, but allowing access');
      return element;
    }
    
    // For protected routes, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // While authentication state is loading (and we haven't exceeded retries)
  if (loading && !authCheckFailed) {
    // For profile order routes, just render the element instead of showing loading
    if (isProfileOrderRoute) {
      return element;
    }
    
    return <div>Проверка авторизации... {retryCount > 0 ? `(Попытка ${retryCount}/${2})` : ''}</div>;
  }

  // If route is for anonymous users only (login, register) and user is authenticated
  if (anonymous && isAuthenticated) {
    // Redirect to home page
    return <Navigate to="/" replace />;
  }

  // If route requires authentication and user is not authenticated
  if (!anonymous && !isAuthenticated) {
    // Special case for profile order routes
    if (isProfileOrderRoute) {
      console.log('User not authenticated for profile order route, but allowing access');
      return element;
    }
    
    // Redirect to login page and save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is allowed to access the route, render the element
  return element;
}; 