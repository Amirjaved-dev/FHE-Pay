/**
 * Authentication Service for handling user authentication API calls
 */

import { apiClient, ApiResponse } from './apiClient';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  wallet_address: string | null;
  role: 'admin' | 'owner' | 'employee';
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  wallet_address: string | null;
  role: 'admin' | 'owner' | 'employee';
  created_at: string;
  updated_at: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role?: 'owner' | 'admin' | 'employee';
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  userId: string;
  full_name?: string;
  avatar_url?: string;
  wallet_address?: string;
  role?: 'admin' | 'owner' | 'employee';
}

export interface AuthResponse {
  message: string;
  user: User;
  profile: UserProfile;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/api/auth/register', userData);
    return {
      message: response.message || 'User registered successfully',
      user: response.user,
      profile: response.profile
    };
  }

  /**
   * Sign in user
   */
  async signIn(credentials: SignInData): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/api/auth/signin', credentials);
    return {
      message: response.message || 'Sign in successful',
      user: response.user,
      profile: response.profile
    };
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse>('/api/auth/signout');
    return {
      message: response.message || 'Sign out successful'
    };
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<AuthResponse | null> {
    try {
      const response = await apiClient.get<ApiResponse<AuthResponse>>('/api/auth/me');
      if (response.user && response.profile) {
        return {
          message: 'User retrieved successfully',
          user: response.user,
          profile: response.profile
        };
      }
      return null;
    } catch (error: any) {
      // If user is not authenticated, return null instead of throwing
      if (error.status === 401) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: UpdateProfileData): Promise<UserProfile> {
    const response = await apiClient.put<ApiResponse<{ profile: UserProfile }>>('/api/auth/profile', updates);
    return response.profile;
  }

  /**
   * Check if user is authenticated by trying to get current user
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get user role
   */
  async getUserRole(): Promise<'admin' | 'owner' | 'employee' | null> {
    try {
      const user = await this.getCurrentUser();
      return user?.profile?.role || null;
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;