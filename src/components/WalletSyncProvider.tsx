import React, { ReactNode } from 'react';
import { useWalletSync } from '../hooks/useWalletSync';

interface WalletSyncProviderProps {
  children: ReactNode;
}

/**
 * Component that handles automatic wallet address synchronization
 * with user profiles. Should be placed inside both SupabaseProvider
 * and WalletProvider.
 */
export const WalletSyncProvider: React.FC<WalletSyncProviderProps> = ({ children }) => {
  // This hook automatically syncs wallet addresses when connection state changes
  useWalletSync();
  
  return <>{children}</>;
};