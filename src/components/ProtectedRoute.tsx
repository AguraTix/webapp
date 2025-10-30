import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: string; // Optional role requirement
  redirectTo?: string;
  fallbackComponent?: React.ComponentType; // Optional fallback component for unauthorized access
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  requiredRole,
  redirectTo = '/login',
  fallbackComponent: FallbackComponent
}) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <AuthLoadingSpinner />;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Redirect to login page with the current location as state
    // so we can redirect back after successful login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If a specific role is required, check if user has that role
  if (requiredRole) {
    console.log('Required role:', requiredRole);
    console.log('User data:', user);
    console.log('User role:', user?.role);
    console.log('Has required role:', hasRole(requiredRole));
    
    // For admin role, also check if user has admin-like properties
    if (requiredRole.toLowerCase() === 'admin') {
      const isAdmin = hasRole('admin') || 
                     hasRole('administrator') || 
                     hasRole('ADMIN') ||
                     user?.isAdmin === true ||
                     user?.is_admin === true ||
                     user?.admin === true;
      
      console.log('Admin check result:', isAdmin);
      
      if (!isAdmin) {
        console.log('User is not admin, showing unauthorized access');
        if (FallbackComponent) {
          return <FallbackComponent />;
        }
        return <UnauthorizedAccess />;
      }
    } else if (!hasRole(requiredRole)) {
      // For other roles, use standard check
      if (FallbackComponent) {
        return <FallbackComponent />;
      }
      return <UnauthorizedAccess />;
    }
  }

  // If all checks pass, render children
  return <>{children}</>;
};

// Loading spinner component for authentication checks
const AuthLoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-400">Checking authentication...</p>
    </div>
  </div>
);

// Unauthorized access component
export const UnauthorizedAccess: React.FC = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-red-500 mb-4">403</h1>
      <h2 className="text-2xl font-semibold text-white mb-4">Access Denied</h2>
      <p className="text-gray-400 mb-6">You don't have permission to access this page.</p>
      <button
        onClick={() => window.history.back()}
        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
      >
        Go Back
      </button>
    </div>
  </div>
);

export default ProtectedRoute;