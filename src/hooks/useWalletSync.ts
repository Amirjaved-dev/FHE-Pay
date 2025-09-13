import { useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useSupabase } from '../contexts/SupabaseContext';
import { useContractInit } from './useContractInit';

/**
 * Hook that automatically synchronizes wallet address with user profile
 * when wallet connection state changes
 */
export const useWalletSync = () => {
  const { address, isConnected } = useAccount();
  const { user, signInWithWallet } = useSupabase();
  const { isInitialized: isContractInitialized, isInitializing, error: contractError } = useContractInit();

  const handleWalletConnection = useCallback(async () => {
    // Only attempt authentication if:
    // 1. Wallet is connected
    // 2. We have an address
    // 3. User is not already authenticated
    // 4. Contract is initialized
    if (isConnected && address && !user && isContractInitialized) {
      try {
        const result = await signInWithWallet(address);
        if (!result.success) {
          // Authentication result logged
        }
      } catch (error) {
        console.error('Wallet authentication failed:', error);
      }
    }
  }, [isConnected, address, user, isContractInitialized, signInWithWallet]);

  useEffect(() => {
    handleWalletConnection();
  }, [handleWalletConnection]);

  return {
    isConnected,
    address,
    user,
    isContractInitialized,
    isInitializing,
    isInitialSync: isInitializing, // Alias for backward compatibility
    contractError
  };
};