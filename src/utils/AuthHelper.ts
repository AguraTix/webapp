import { authUtils, type UserProfile } from '../api/auth';

/**
 * Helper functions for authentication and user role management
 */
export const AuthHelper = {
  /**
   * Get the current user's profile from localStorage
   */
  getUserProfile: (): UserProfile | null => {
    return authUtils.getUserProfile();
  },

  /**
   * Get the current user's ID
   */
  getUserId: (): string | null => {
    const profile = authUtils.getUserProfile();
    // @ts-ignore - user_id might exist on profile even if not in interface
    return profile?.id || profile?.user_id || null;
  },

  /**
   * Get the current user's role
   */
  getUserRole: (): string | null => {
    const profile = authUtils.getUserProfile();
    return profile?.role || null;
  },

  /**
   * Check if the current user is a SuperAdmin
   */
  isSuperAdmin: (): boolean => {
    const role = AuthHelper.getUserRole();
    return role?.toLowerCase() === 'superadmin';
  },

  /**
   * Check if the current user is an Admin (not SuperAdmin)
   */
  isAdmin: (): boolean => {
    const role = AuthHelper.getUserRole();
    return role?.toLowerCase() === 'admin';
  },

  /**
   * Check if the current user has admin privileges (Admin or SuperAdmin)
   */
  hasAdminAccess: (): boolean => {
    return AuthHelper.isAdmin() || AuthHelper.isSuperAdmin();
  },
};

export default AuthHelper;
