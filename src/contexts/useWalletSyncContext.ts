import { useContext } from 'react';
import { WalletSyncContext } from './WalletSyncContext';

export const useWalletSyncContext = () => {
  const context = useContext(WalletSyncContext);
  if (context === undefined) {
    throw new Error('useWalletSyncContext must be used within a WalletSyncProvider');
  }
  return context;
};