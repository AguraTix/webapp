import React, { createContext, useContext, useEffect, useState } from 'react';
import { authUtils } from '../api/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  login: (token: string, userData: any) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const authStatus = authUtils.isAuthenticated();
      const userData = authUtils.getUserProfile();
      
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

  const login = (token: string, userData: unknown) => {
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
    if (!user) return false;
    
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
    
    for (const userRole of possibleRoles) {
      if (userRole && userRole.toString().toLowerCase() === role.toLowerCase()) {
        return true;
      }
    }
    
    return false;
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;