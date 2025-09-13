import React, { createContext, useContext, ReactNode } from 'react';
import { useWalletSync } from '../hooks/useWalletSync';

type WalletSyncContextType = Record<string, never>

export const WalletSyncContext = createContext<WalletSyncContextType | undefined>(undefined);

interface WalletSyncProviderProps {
  children: ReactNode;
}

/**
 * Provider that handles automatic wallet address synchronization
 * with user profiles. Should be placed inside both SupabaseProvider
 * and WalletProvider.
 */
export const WalletSyncProvider: React.FC<WalletSyncProviderProps> = ({ children }) => {
  // This hook automatically syncs wallet addresses when connection state changes
  useWalletSync();
  
  const contextValue: WalletSyncContextType = {};

  return (
    <WalletSyncContext.Provider value={contextValue}>
      {children}
    </WalletSyncContext.Provider>
  );
};