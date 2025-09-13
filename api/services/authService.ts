import { supabase } from '../config/supabase';
import { Database } from '../../supabase/client';
import { ValidationError, AuthenticationError } from '../middleware/errorHandler';
type UserUpdate = Database['public']['Tables']['users']['Update'];

export class AuthService {
  // Register a new user
  static async registerUser(userData: {
    email: string;
    password: string;
    full_name: string;
    role?: 'owner' | 'admin' | 'employee';
  }) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new ValidationError('User with this email already exists');
        }
        throw new AuthenticationError(authError.message);
      }

      // Create user profile
      if (authData.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: userData.email,
            full_name: userData.full_name,
            role: userData.role || 'employee',
          })
          .select()
          .single();

        if (profileError) {
          throw new ValidationError(`Failed to create user profile: ${profileError.message}`);
        }

        return { user: authData.user, profile: profileData };
      }

      throw new Error('User creation failed');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Sign in user
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new AuthenticationError('Invalid email or password');
        }
        throw new AuthenticationError(error.message);
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        throw new ValidationError(`Failed to fetch user profile: ${profileError.message}`);
      }

      return { user: data.user, profile };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  // Sign out user
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new AuthenticationError(`Sign out failed: ${error.message}`);
      }
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        throw new AuthenticationError(error.message);
      }
      if (!user) {
        throw new AuthenticationError('No authenticated user found');
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new ValidationError(`Failed to fetch user profile: ${profileError.message}`);
      }

      return { user, profile };
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(userId: string, updates: UserUpdate) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new ValidationError(`Failed to update profile: ${error.message}`);
      }
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
}