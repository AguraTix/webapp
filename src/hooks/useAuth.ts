import { useState, useEffect } from 'react';
import { authUtils } from '../api/auth';

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  login: (token: string, userData: any) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      // Debug: Log what's in localStorage
      console.log('=== AUTH DEBUG ===');
      console.log('Token in localStorage:', localStorage.getItem('token'));
      console.log('UserProfile in localStorage:', localStorage.getItem('userProfile'));
      
      const authStatus = authUtils.isAuthenticated();
      const userData = authUtils.getUserProfile();
      
      console.log('Auth status:', authStatus);
      console.log('User data from authUtils:', userData);
      
      setIsAuthenticated(authStatus);
      setUser(userData);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (token: string, userData: any) => {
    authUtils.saveAuthData({ token, user: userData });
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    authUtils.clearAuthData();
    setIsAuthenticated(false);
    setUser(null);
  };

  const hasRole = (role: string): boolean => {
    console.log('hasRole check - user:', user);
    console.log('hasRole check - user.role:', user?.role);
    console.log('hasRole check - required role:', role);
    
    if (!user) {
      console.log('hasRole check - no user, returning false');
      return false;
    }
    
    // Check multiple possible role field names that backend might use
    const possibleRoles = [
      user.role,
      user.user_role,
      user.userRole,
      user.Role,
      user.USER_ROLE,
      user.type,
      user.account_type
    ];
    
    console.log('hasRole check - all possible roles:', possibleRoles);
    
    for (const userRole of possibleRoles) {
      if (userRole) {
        const normalizedUserRole = userRole.toString().toLowerCase();
        const normalizedRequiredRole = role.toLowerCase();
        
        console.log(`hasRole check - comparing "${normalizedUserRole}" with "${normalizedRequiredRole}"`);
        
        if (normalizedUserRole === normalizedRequiredRole) {
          console.log('hasRole check - MATCH FOUND, returning true');
          return true;
        }
      }
    }
    
    console.log('hasRole check - no matching role found, returning false');
    return false;
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    hasRole,
  };
};

export default useAuth;