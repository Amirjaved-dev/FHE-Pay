import { useEffect, useState } from 'react';
import { useWalletClient, useAccount } from 'wagmi';
import { BrowserProvider } from 'ethers';
import { contractService } from '../services/contractService';
import toast from 'react-hot-toast';

export const useContractInit = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeContract = async () => {
      // Contract init check
      
      if (!isConnected || !walletClient || !address) {
        // Contract init skipped: missing requirements
        setIsInitialized(false);
        return;
      }

      // Check if already initialized
      if (contractService.isInitialized()) {
        // Contract already initialized
        setIsInitialized(true);
        return;
      }

      // Starting contract initialization
      setIsInitializing(true);
      setError(null);

      try {
        // Convert wagmi wallet client to ethers provider
        // Creating provider and signer
        const provider = new BrowserProvider(walletClient.transport);
        const signer = await provider.getSigner();
        // Provider and signer created

        // Initialize the contract service
        // Initializing contract service
        await contractService.initialize(provider, signer);
        
        setIsInitialized(true);
        // Contract service initialized successfully
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize contract';
        setError(errorMessage);
        console.error('❌ Contract initialization failed:', err);
        toast.error('Failed to initialize contract: ' + errorMessage);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeContract();
  }, [isConnected, walletClient, address]);

  // Reset state when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setIsInitialized(false);
      setIsInitializing(false);
      setError(null);
    }
  }, [isConnected]);

  return {
    isInitialized,
    isInitializing,
    error,
    reinitialize: () => {
      if (isConnected && walletClient && address) {
        setIsInitialized(false);
        // This will trigger the useEffect to reinitialize
      }
    }
  };
};