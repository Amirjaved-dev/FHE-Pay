import React, { useState, useEffect } from 'react';
import { Wallet, ChevronDown, ChevronUp, HelpCircle, CheckCircle, AlertCircle, RefreshCw, ExternalLink, Shield, Zap } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useConnectors } from 'wagmi';
import { useSupabase } from '../../contexts/SupabaseContext';
import { getSmartWalletSuggestion, DetectedWallet } from '../../utils/walletDetection';

interface WalletAuthProps {
  onError?: (error: string) => void;
  onNeedsOnboarding?: () => void;
}

export const WalletAuth: React.FC<WalletAuthProps> = ({ onError, onNeedsOnboarding }) => {
  const { address, isConnected } = useAccount();
  const connectors = useConnectors();
  const { signInWithWallet } = useSupabase();

  const [showOtherWallets, setShowOtherWallets] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletSuggestion, setWalletSuggestion] = useState<{
    primary: DetectedWallet | null;
    alternatives: DetectedWallet[];
    isMobileDevice: boolean;
  } | null>(null);
  const { user } = useSupabase();

  // Initialize wallet detection and smart suggestions
  useEffect(() => {
    const initializeWalletDetection = () => {
      const suggestion = getSmartWalletSuggestion([...connectors]);
      setWalletSuggestion(suggestion);
    };
    
    initializeWalletDetection();
    
    // Listen for wallet installation/changes
    const handleEthereumChange = () => {
      setTimeout(initializeWalletDetection, 100); // Small delay to ensure detection
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('ethereum#initialized', handleEthereumChange);
      // Also listen for general ethereum changes
      const ethereum = (window as { ethereum?: { on?: (event: string, handler: () => void) => void; removeListener?: (event: string, handler: () => void) => void } }).ethereum;
      if (ethereum) {
        ethereum.on?.('accountsChanged', handleEthereumChange);
        ethereum.on?.('chainChanged', handleEthereumChange);
      }
      
      return () => {
        window.removeEventListener('ethereum#initialized', handleEthereumChange);
        if (ethereum) {
          ethereum.removeListener?.('accountsChanged', handleEthereumChange);
          ethereum.removeListener?.('chainChanged', handleEthereumChange);
        }
      };
    }
  }, [connectors]);

  // Handle wallet authentication with better error handling
  const handleWalletAuth = React.useCallback(async (address: string) => {
    try {
      setIsAuthenticating(true);
      setError(null);
      
      const { data, error: authError } = await signInWithWallet(address);
      
      if (authError) {
        throw new Error(authError);
      }
      
      if (data?.user) {
        // Success - user will be redirected by parent component
        return;
      }
      
      // If no user data, trigger onboarding
      onNeedsOnboarding?.();
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
      onError?.(message);
    } finally {
      setIsAuthenticating(false);
    }
  }, [signInWithWallet, onNeedsOnboarding, onError]);

  useEffect(() => {
    if (isConnected && address && !user) {
      handleWalletAuth(address);
    }
  }, [isConnected, address, user, handleWalletAuth]);

  const handleRetry = () => {
    setError(null);
    if (address) {
      handleWalletAuth(address);
    }
  };

  const openWalletDownload = (wallet: DetectedWallet) => {
    if (wallet.downloadUrl) {
      window.open(wallet.downloadUrl, '_blank');
    }
  };

  const getPrimaryWalletButton = () => {
    if (!walletSuggestion?.primary) {
      return null;
    }

    const wallet = walletSuggestion.primary;
    const isInstalled = wallet.installed;
    const isMobileDevice = walletSuggestion.isMobileDevice;

    return {
      wallet,
      isInstalled,
      isMobileDevice,
      buttonText: isInstalled 
        ? `Connect ${wallet.name}` 
        : isMobileDevice 
          ? `Open ${wallet.name}` 
          : `Install ${wallet.name}`,
      buttonAction: isInstalled 
        ? undefined // Will use ConnectButton
        : () => openWalletDownload(wallet)
    };
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Connect Your Wallet</h2>
          <p className="text-gray-600 mt-2">Secure, private payroll management with FHE encryption</p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-700">Fully Homomorphic Encryption</span>
          </div>
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-700">Instant wallet-based authentication</span>
          </div>
          <div className="flex items-center space-x-3">
            <Wallet className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-700">No passwords or forms required</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800 mb-1">Connection Failed</h4>
                <p className="text-sm text-red-700 mb-3">{error}</p>
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center space-x-2 text-sm font-medium text-red-600 hover:text-red-500"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isAuthenticating && (
          <div className="w-full p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-blue-800">Connecting your wallet...</p>
                <p className="text-xs text-blue-600">This may take a few seconds</p>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Connection */}
        <div className="space-y-4">
          {!isConnected ? (
            <div>
              {/* Smart Primary Wallet Connection */}
              <div className="mb-4">
                {(() => {
                  const primaryButton = getPrimaryWalletButton();
                  
                  if (!primaryButton) {
                    return (
                      <div className="text-center py-8">
                        <p className="text-gray-600">Loading wallet options...</p>
                      </div>
                    );
                  }

                  const { wallet, isInstalled, isMobileDevice, buttonText, buttonAction } = primaryButton;

                  if (isInstalled && wallet.connector) {
                    return (
                      <ConnectButton.Custom>
                        {({ openConnectModal }) => {

                          return (
                            <button
                              onClick={openConnectModal}
                              type="button"
                              disabled={isAuthenticating}
                              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 disabled:from-purple-400 disabled:to-purple-400 transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-lg"
                            >
                              <div className="flex items-center justify-center space-x-3">
                                <img src={wallet.icon} alt={wallet.name} className="w-6 h-6" />
                                <span>{buttonText}</span>
                                <span className="text-xs bg-purple-500 px-2 py-1 rounded-full">Recommended</span>
                                {isMobileDevice && <span className="text-xs opacity-80">(Mobile)</span>}
                              </div>
                            </button>
                          );
                        }}
                      </ConnectButton.Custom>
                    );
                  } else {
                    return (
                      <button
                        onClick={buttonAction}
                        type="button"
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 shadow-lg"
                      >
                        <div className="flex items-center justify-center space-x-3">
                          <img src={wallet.icon} alt={wallet.name} className="w-6 h-6" />
                          <span>{buttonText}</span>
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      </button>
                    );
                  }
                })()}
              </div>

              {/* Other Wallets Section */}
              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={() => setShowOtherWallets(!showOtherWallets)}
                  className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-800 py-2 transition-colors"
                >
                  <span className="text-sm font-medium">Other Wallet Options</span>
                  {showOtherWallets ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {showOtherWallets && (
                  <div className="mt-3 space-y-2">
                    {walletSuggestion?.alternatives?.map((wallet) => {
                      const connector = connectors.find(c => c.name.toLowerCase().includes(wallet.name.toLowerCase()));
                      
                      if (wallet.installed && connector) {
                        return (
                          <ConnectButton.Custom key={wallet.id}>
                            {({ openConnectModal }) => {
                              return (
                                <button
                                  onClick={openConnectModal}
                                  className="w-full flex items-center space-x-3 py-3 px-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                                >
                                  <img src={wallet.icon} alt={wallet.name} className="w-5 h-5" />
                                  <span className="text-gray-700 font-medium">{wallet.name}</span>
                                  <span className="ml-auto text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Installed</span>
                                </button>
                              );
                            }}
                          </ConnectButton.Custom>
                        );
                      } else {
                        return (
                          <button
                            key={wallet.id}
                            onClick={() => openWalletDownload(wallet)}
                            className="w-full flex items-center space-x-3 py-3 px-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                          >
                            <img src={wallet.icon} alt={wallet.name} className="w-5 h-5 opacity-60" />
                            <span className="text-gray-700 font-medium">{wallet.name}</span>
                            <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                          </button>
                        );
                      }
                    }) || (
                      <div className="text-center py-4 text-gray-500">
                        <p>Loading wallet options...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Help Section */}
              <div className="mt-6">
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mx-auto"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>New to crypto wallets?</span>
                </button>

                {showHelp && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                    <p className="mb-2">A crypto wallet is like a digital keychain that:</p>
                    <ul className="list-disc list-inside space-y-1 mb-3">
                      <li>Stores your digital identity securely</li>
                      <li>Lets you sign in without passwords</li>
                      <li>Keeps your data private and encrypted</li>
                    </ul>
                    <a 
                      href="https://ethereum.org/en/wallets/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-500 underline font-medium"
                    >
                      Learn more about wallets →
                    </a>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                By connecting your wallet, you agree to our{' '}
                <a href="#" className="text-purple-600 hover:text-purple-500 underline">terms of service</a>
                {' '}and{' '}
                <a href="#" className="text-purple-600 hover:text-purple-500 underline">privacy policy</a>.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl mb-4">
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">
                      {user ? 'Successfully Authenticated!' : 'Wallet Connected!'}
                    </h3>
                    <p className="text-sm text-green-600">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </p>
                  </div>
                </div>
                {!user && (
                  <div className="flex items-center justify-center space-x-2 text-sm text-green-700">
                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Completing authentication...</span>
                  </div>
                )}
              </div>
              {user ? (
                <p className="text-sm text-gray-600">
                  Welcome back! You'll be redirected to your dashboard.
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  Great! Now we'll set up your profile to get you started.
                </p>
              )}
            </div>
          )}
        </div>


      </div>
    </div>
  );
};