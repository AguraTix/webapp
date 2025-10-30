// Authentication configuration
export const authConfig = {
  // API Base URLs
  apiBaseUrl: import.meta.env.VITE_API_URL || "https://agura-ticketing-backend.onrender.com",
  
  // Google OAuth URLs
  googleAuthUrl: `${import.meta.env.VITE_API_URL || "https://agura-ticketing-backend.onrender.com"}/api/auth/google`,
  googleCallbackUrl: `${import.meta.env.VITE_API_URL || "https://agura-ticketing-backend.onrender.com"}/api/auth/google/callback`,
  
  // Frontend URLs
  frontendUrl: import.meta.env.VITE_FRONTEND_URL || window.location.origin,
  
  // Token configuration
  tokenKey: 'token',
  userProfileKey: 'userProfile',
  
  // OAuth popup configuration
  popupConfig: {
    width: 500,
    height: 600,
    scrollbars: 'yes',
    resizable: 'yes',
  },
};

// Helper function to get full callback URL for frontend routing
export const getGoogleCallbackUrl = (): string => {
  return `${authConfig.frontendUrl}/auth/google/callback`;
};

// Helper function to check if we're in development mode
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';
};

// Helper function to log auth debug info (only in development)
import { authLogger } from '../utils/logger';

export const logAuthDebug = (message: string, data?: any): void => {
  authLogger.debug(message, data);
};

export default authConfig;