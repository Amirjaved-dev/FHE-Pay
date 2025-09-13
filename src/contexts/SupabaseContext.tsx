import React, { createContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';
import { handleError, handleSuccess, AuthError, DatabaseError } from '../utils/errorHandler';
import { useMultipleLoadingStates } from '../hooks/useLoadingState';
import { UserProfile, Company, Employee, EmployeeWithUser } from './supabase-types';
import { authService } from '../services/authService';
import { companyService } from '../services/companyService';

interface SupabaseContextType {
  // Auth state
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  
  // Auth methods
  signUpWithWallet: (walletAddress: string, fullName: string, role?: string) => Promise<{ success: boolean; error?: string; data?: { user: UserProfile }; needsOnboarding?: boolean }>;
  signInWithWallet: (walletAddress: string) => Promise<{ success: boolean; error?: string; data?: { user: UserProfile }; needsOnboarding?: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string; data?: UserProfile; }>;
  
  // Wallet methods
  linkWalletAddress: (walletAddress: string) => Promise<{ success: boolean; error?: string; data?: UserProfile; }>;
  unlinkWalletAddress: () => Promise<void>;
  syncWalletAddress: (walletAddress: string | null) => Promise<void>;
  
  // Wallet-based auth check
  checkWalletAuth: (walletAddress: string) => Promise<{ isRegistered: boolean; user?: UserProfile; }>;
  
  // Company methods
  createCompany: (name: string, description?: string, walletAddress?: string) => Promise<Company>;
  getUserCompanies: () => Promise<Company[]>;
  getCompanyEmployees: (companyId: string) => Promise<EmployeeWithUser[]>;
  
  // Current company state
  currentCompany: Company | null;
  setCurrentCompany: (company: Company | null) => void;
  
  // Loading states
  isLoading: (key: string) => boolean;
  getError: (key: string) => string | null;
  isAnyLoading: () => boolean;
  clearError: (key: string) => void;
}

export const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  useAccount();
  const loadingStates = useMultipleLoadingStates();

  useEffect(() => {
    // Check for existing user session on initial load
    const checkExistingSession = async () => {
      try {
        setLoading(true);
        
        // Try to get current user from API
        const authResponse = await authService.getCurrentUser();
        
        if (authResponse?.user && authResponse?.profile) {
          setUser({ id: authResponse.user.id } as User);
          setSession({ user: { id: authResponse.user.id } } as Session);
          setProfile(authResponse.profile);
        }
      } catch (error) {
        console.error('Error checking existing session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  // const loadUserProfile = async (userId: string) => {
  //   try {
  //     const { data, error } = await supabase
  //       .from('users')
  //       .select('*')
  //       .eq('id', userId)
  //       .single();

  //     if (error) throw error;
  //     setProfile(data);
  //   } catch (error) {
  //     console.error('Error loading user profile:', error);
  //     toast.error('Failed to load user profile');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const signUpWithWallet = useCallback(async (walletAddress: string, fullName: string, role: string = 'employee') => {
    const operationKey = 'signUpWithWallet';
    loadingStates.setLoading(operationKey, true);

    try {
      const authResponse = await authService.register({
        email: `${walletAddress}@wallet.local`, // Placeholder email
        password: 'wallet-auth', // Placeholder password for wallet auth
        full_name: fullName,
        role: role as 'owner' | 'admin' | 'employee'
      });

      // Set the user profile
      setProfile(authResponse.profile);
      setUser({ id: authResponse.user.id } as User);
      setSession({ user: { id: authResponse.user.id } } as Session);

      // Only show success message for manual sign-ups, not automatic flows
      handleSuccess('Account created successfully with wallet!');
      loadingStates.setLoading(operationKey, false);
      return { success: true, data: { user: authResponse.profile } };
    } catch (error: unknown) {
      const authError = new AuthError(error instanceof Error ? error.message : 'Failed to create account with wallet', 'WALLET_SIGNUP_ERROR');
      handleError(authError);
      loadingStates.setError(operationKey, authError.message);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create account with wallet' };
    } finally {
      loadingStates.setLoading(operationKey, false);
    }
  }, [loadingStates]);

  const signInWithWallet = useCallback(async (walletAddress: string) => {
    const operationKey = 'signInWithWallet';
    loadingStates.setLoading(operationKey, true);

    try {
      const authResponse = await authService.signIn({
        email: `${walletAddress}@wallet.local`,
        password: 'wallet-auth'
      });

      // Set user session
      setProfile(authResponse.profile);
      setUser({ id: authResponse.user.id } as User);
      setSession({ user: { id: authResponse.user.id } } as Session);

      handleSuccess('Successfully signed in with wallet!');
      loadingStates.setLoading(operationKey, false);
      return { success: true, data: { user: authResponse.profile } };
    } catch (error: unknown) {
      const authError = new AuthError(error instanceof Error ? error.message : 'Failed to sign in with wallet', 'WALLET_SIGNIN_ERROR');
      handleError(authError);
      loadingStates.setError(operationKey, authError.message);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to sign in with wallet' };
    } finally {
      loadingStates.setLoading(operationKey, false);
    }
  }, [loadingStates]);

  const signOut = useCallback(async () => {
    const operationKey = 'signOut';
    loadingStates.setLoading(operationKey, true);

    try {
      // Clear local state first for immediate UI feedback
      setUser(null);
      setSession(null);
      setProfile(null);
      setCurrentCompany(null);

      // Sign out from API
      await authService.signOut();

      handleSuccess('Signed out successfully!');
      loadingStates.setLoading(operationKey, false);
      return { success: true };
    } catch (error: unknown) {
      const authError = new AuthError(error instanceof Error ? error.message : 'Failed to sign out', 'SIGNOUT_ERROR');
      handleError(authError);
      loadingStates.setError(operationKey, authError.message);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to sign out' };
    } finally {
      loadingStates.setLoading(operationKey, false);
    }
  }, [loadingStates]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    const operationKey = 'updateProfile';
    loadingStates.setLoading(operationKey, true);

    try {
      if (!user?.id) {
        const error = new AuthError('No user logged in', 'USER_NOT_FOUND');
        handleError(error);
        loadingStates.setError(operationKey, error.message);
        return { success: false, error: error.message };
      }

      const updatedProfile = await authService.updateProfile({
        userId: user.id,
        ...updates
      });

      if (updatedProfile) {
        setProfile(updatedProfile);
        handleSuccess('Profile updated successfully!');
      }

      loadingStates.setLoading(operationKey, false);
      return { success: true, data: updatedProfile };
    } catch (error: unknown) {
      const authError = new AuthError(error instanceof Error ? error.message : 'Failed to update profile', 'PROFILE_UPDATE_ERROR');
      handleError(authError);
      loadingStates.setError(operationKey, authError.message);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update profile' };
    } finally {
      loadingStates.setLoading(operationKey, false);
    }
  }, [user?.id, loadingStates]);

  const linkWalletAddress = useCallback(async (walletAddress: string) => {
    const operationKey = 'linkWallet';
    loadingStates.setLoading(operationKey, true);

    try {
      if (!user?.id) {
        const error = new AuthError('No user logged in', 'USER_NOT_FOUND');
        handleError(error);
        loadingStates.setError(operationKey, error.message);
        return { success: false, error: error.message };
      }

      const updatedProfile = await authService.updateProfile({
        userId: user.id,
        wallet_address: walletAddress
      });

      if (updatedProfile) {
        setProfile(updatedProfile);
        handleSuccess('Wallet address linked successfully!');
      }

      loadingStates.setLoading(operationKey, false);
      return { success: true, data: updatedProfile };
    } catch (error: unknown) {
      const authError = new AuthError(error instanceof Error ? error.message : 'Failed to link wallet address', 'WALLET_LINK_ERROR');
      handleError(authError);
      loadingStates.setError(operationKey, authError.message);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to link wallet address' };
    } finally {
      loadingStates.setLoading(operationKey, false);
    }
  }, [user?.id, loadingStates]);

  const unlinkWalletAddress = useCallback(async () => {
    const operationKey = 'unlinkWallet';
    loadingStates.setLoading(operationKey, true);

    try {
      if (!user?.id) {
        const error = new AuthError('No user logged in', 'USER_NOT_FOUND');
        handleError(error);
        loadingStates.setError(operationKey, error.message);
        return;
      }

      const updatedProfile = await authService.updateProfile({
        userId: user.id,
        wallet_address: null
      });

      if (updatedProfile) {
        setProfile(updatedProfile);
        handleSuccess('Wallet address unlinked successfully!');
      }

      loadingStates.setLoading(operationKey, false);
    } catch (error: unknown) {
      const authError = new AuthError(error instanceof Error ? error.message : 'Failed to unlink wallet address', 'WALLET_UNLINK_ERROR');
      handleError(authError);
      loadingStates.setError(operationKey, authError.message);
    } finally {
      loadingStates.setLoading(operationKey, false);
    }
  }, [user?.id, loadingStates]);

  const syncWalletAddress = useCallback(async (walletAddress: string | null) => {
    const operationKey = 'syncWallet';
    
    try {
      if (!walletAddress) {
        // Wallet disconnected - sign out user
        await signOut();
        return;
      }
      
      // Check if this wallet is registered and auto-sign in if it is
      const { isRegistered, user: walletUser } = await checkWalletAuth(walletAddress);
      
      if (isRegistered && walletUser && !user) {
        // Auto sign-in with registered wallet
        await signInWithWallet(walletAddress);
      } else if (!isRegistered && !user) {
        // Wallet not registered and no user logged in - this is fine, user can register
        return;
      } else if (user?.id && profile?.wallet_address !== walletAddress) {
        // Update wallet address for logged in user if it has changed
        loadingStates.setLoading(operationKey, true);
        
        const updatedProfile = await authService.updateProfile({
          userId: user.id,
          wallet_address: walletAddress
        });

        if (updatedProfile) {
          setProfile(updatedProfile);
          console.log('Wallet address synced successfully');
        }
        
        loadingStates.setLoading(operationKey, false);
      }
    } catch (error: unknown) {
      console.error('Sync wallet address error:', error instanceof Error ? error.message : error);
      loadingStates.setError(operationKey, error instanceof Error ? error.message : 'Failed to sync wallet');
      // Don't show toast for sync errors as they happen automatically
    } finally {
      loadingStates.setLoading(operationKey, false);
    }
  }, [user?.id, profile?.wallet_address, loadingStates]);

  const checkWalletAuth = useCallback(async (walletAddress: string) => {
    try {
      // For now, we'll assume wallet checking needs to be implemented
      // This would require a new API endpoint
      return {
        isRegistered: false,
        user: null
      };
    } catch (error: unknown) {
      console.error('Check wallet auth error:', error instanceof Error ? error.message : error);
      return { isRegistered: false };
    }
  }, []);

  const createCompany = useCallback(async (name: string, description?: string, walletAddress?: string): Promise<Company> => {
    const operationKey = 'createCompany';
    loadingStates.setLoading(operationKey, true);

    try {
      if (!user?.id) {
        const error = new AuthError('No user logged in', 'USER_NOT_FOUND');
        handleError(error);
        throw error;
      }

      const company = await companyService.createCompany({
        name,
        description,
        owner_id: user.id,
        wallet_address: walletAddress,
      });
      
      handleSuccess('Company created successfully!');
      loadingStates.setLoading(operationKey, false);
      return company;
    } catch (error: unknown) {
      const dbError = new DatabaseError(error instanceof Error ? error.message : 'Failed to create company', 'COMPANY_CREATE_ERROR');
      handleError(dbError);
      loadingStates.setError(operationKey, dbError.message);
      throw error instanceof Error ? error : new Error('Failed to create company');
    } finally {
      loadingStates.setLoading(operationKey, false);
    }
  }, [user?.id, loadingStates]);

  const getUserCompanies = useCallback(async (): Promise<Company[]> => {
    const operationKey = 'getUserCompanies';
    loadingStates.setLoading(operationKey, true);

    try {
      if (!user?.id) {
        const error = new AuthError('No user logged in', 'USER_NOT_FOUND');
        handleError(error);
        throw error;
      }
      
      const companies = await companyService.getUserCompanies(user.id);
      
      loadingStates.setLoading(operationKey, false);
      return companies;
    } catch (error: unknown) {
      const dbError = new DatabaseError(error instanceof Error ? error.message : 'Failed to fetch companies', 'COMPANIES_FETCH_ERROR');
      handleError(dbError);
      loadingStates.setError(operationKey, dbError.message);
      throw error instanceof Error ? error : new Error('Failed to fetch companies');
    } finally {
      loadingStates.setLoading(operationKey, false);
    }
  }, [user?.id, loadingStates]);

  const getCompanyEmployees = useCallback(async (companyId: string): Promise<EmployeeWithUser[]> => {
    const operationKey = 'getCompanyEmployees';
    loadingStates.setLoading(operationKey, true);

    try {
      const employees = await companyService.getCompanyEmployees(companyId);
      
      loadingStates.setLoading(operationKey, false);
      return employees;
    } catch (error: unknown) {
      const dbError = new DatabaseError(error instanceof Error ? error.message : 'Failed to fetch employees', 'EMPLOYEES_FETCH_ERROR');
      handleError(dbError);
      loadingStates.setError(operationKey, dbError.message);
      throw error instanceof Error ? error : new Error('Failed to fetch employees');
    } finally {
      loadingStates.setLoading(operationKey, false);
    }
  }, [loadingStates]);

  const value: SupabaseContextType = {
    user,
    session,
    profile,
    loading,
    signUpWithWallet,
    signInWithWallet,
    signOut,
    updateProfile,
    linkWalletAddress,
    unlinkWalletAddress,
    syncWalletAddress,
    checkWalletAuth,
    createCompany,
    getUserCompanies,
    getCompanyEmployees,
    currentCompany,
    setCurrentCompany,
    // Loading states
    isLoading: loadingStates.isLoading,
    getError: loadingStates.getError,
    isAnyLoading: loadingStates.isAnyLoading,
    clearError: loadingStates.clearError
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};

// Custom hook to use the Supabase context
export const useSupabase = () => {
  const context = React.useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};