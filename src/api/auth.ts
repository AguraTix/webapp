interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface User {
  name: string;
  phone_number: string;
  email: string;
  password: string;
}

// User interface for login
export interface LoginCredentials {
  identifier: string; // Can be email or phone number
  password: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  created_at: string;
  updated_at: string;
  profile_photo: string;
  role?: string; // Add role field for admin/user distinction
}

export interface AuthResponse {
  message: string;
  token: string;
  user: UserProfile;
}

const API_BASE_URL = `${
  import.meta.env.VITE_API_URL ||
  "https://agura-ticketing-backend.onrender.com"
}/api`;

import authConfig, { logAuthDebug } from '../config/auth';

const GOOGLE_AUTH_BASE_URL = `${authConfig.apiBaseUrl}/api/auth`;

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP error! status: ${response.status}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export async function register(
  userData: User
): Promise<ApiResponse<AuthResponse>> {
  return apiRequest<AuthResponse>("/users/registerAdmin", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function login(
  credentials: LoginCredentials
): Promise<ApiResponse<AuthResponse>> {
  return apiRequest<AuthResponse>("/users/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function logout(): Promise<ApiResponse<void>> {
  const token = localStorage.getItem("token");

  const response = await apiRequest<void>("/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  localStorage.removeItem("token");
  localStorage.removeItem("userProfile");

  return response;
}

export async function getCurrentUser(): Promise<ApiResponse<UserProfile>> {
  const token = localStorage.getItem("token");

  if (!token) {
    return {
      success: false,
      error: "No authentication token found",
    };
  }

  return apiRequest<UserProfile>("/users/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
// Update user profile
export async function updateProfile(
  profileData: Partial<UserProfile>
): Promise<ApiResponse<UserProfile>> {
  const token = localStorage.getItem("token");

  if (!token) {
    return {
      success: false,
      error: "No authentication token found",
    };
  }

  return apiRequest<UserProfile>("/users/auth/profile", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
}

// Change password function
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<ApiResponse<void>> {
  const token = localStorage.getItem("token");

  if (!token) {
    return {
      success: false,
      error: "No authentication token found",
    };
  }

  return apiRequest<void>("/auth/change-password", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
}

// Forgot password function
export async function forgotPassword(
  email: string
): Promise<ApiResponse<void>> {
  return apiRequest<void>("/password-reset/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// Reset password function
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<ApiResponse<void>> {
  return apiRequest<void>("/password-reset/verify", {
    method: "POST",
    body: JSON.stringify({
      token,
      new_password: newPassword,
    }),
  });
}

// Utility functions for token management
export const authUtils = {
  saveAuthData: (authResponse: AuthResponse) => {
    localStorage.setItem("token", authResponse.token);
    localStorage.setItem("userProfile", JSON.stringify(authResponse.user));
  },

  // Get stored auth token
  getAuthToken: (): string | null => {
    return localStorage.getItem("token");
  },

  getUserProfile: (): UserProfile | null => {
    const profile = localStorage.getItem("userProfile");
    return profile ? JSON.parse(profile) : null;
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    // Check if token is expired (basic JWT check)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;

      if (payload.exp && payload.exp < currentTime) {
        // Token is expired, clear auth data
        authUtils.clearAuthData();
        return false;
      }

      return true;
    } catch (error) {
      // If token is malformed, clear auth data
      console.warn("Invalid token format, clearing auth data");
      authUtils.clearAuthData();
      return false;
    }
  },

  // Validate token with backend
  validateToken: async (): Promise<boolean> => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/validate-token`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        authUtils.clearAuthData();
        return false;
      }

      return true;
    } catch (error) {
      console.error("Token validation error:", error);
      authUtils.clearAuthData();
      return false;
    }
  },

  clearAuthData: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userProfile");
  },
};

// Google OAuth functions
export const googleAuth = {
  // Initiate Google OAuth login
  initiateGoogleLogin: (): void => {
    const googleAuthUrl = `${GOOGLE_AUTH_BASE_URL}/google`;
    logAuthDebug('Initiating Google login', { googleAuthUrl });
    window.location.href = googleAuthUrl;
  },

  // Handle Google OAuth callback (for popup or redirect scenarios)
  handleGoogleCallback: async (code: string): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await fetch(`${GOOGLE_AUTH_BASE_URL}/google/callback?code=${code}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || 'Google authentication failed',
        };
      }

      // Save auth data if successful
      if (data.token && data.user) {
        authUtils.saveAuthData(data);
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Google authentication error',
      };
    }
  },

  // Test Google OAuth configuration
  testGoogleConfig: async (): Promise<ApiResponse<unknown>> => {
    try {
      const response = await fetch(`${GOOGLE_AUTH_BASE_URL}/test-config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      return {
        success: response.ok,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test Google config',
      };
    }
  },

  // Open Google login in popup window
  loginWithGooglePopup: (): Promise<ApiResponse<AuthResponse>> => {
    return new Promise((resolve) => {
      const googleAuthUrl = `${GOOGLE_AUTH_BASE_URL}/google`;
      logAuthDebug('Opening Google login popup', { googleAuthUrl });
      
      const popup = window.open(
        googleAuthUrl,
        'googleLogin',
        `width=${authConfig.popupConfig.width},height=${authConfig.popupConfig.height},scrollbars=${authConfig.popupConfig.scrollbars},resizable=${authConfig.popupConfig.resizable}`
      );

      if (!popup) {
        resolve({
          success: false,
          error: 'Popup blocked. Please allow popups for this site.',
        });
        return;
      }

      // Listen for messages from the popup
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          window.removeEventListener('message', messageListener);
          popup.close();
          
          // Save auth data
          authUtils.saveAuthData(event.data.authData);
          
          resolve({
            success: true,
            data: event.data.authData,
          });
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          window.removeEventListener('message', messageListener);
          popup.close();
          
          resolve({
            success: false,
            error: event.data.error || 'Google authentication failed',
          });
        }
      };

      window.addEventListener('message', messageListener);

      // Check if popup is closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          resolve({
            success: false,
            error: 'Authentication cancelled by user',
          });
        }
      }, 1000);
    });
  },
};
