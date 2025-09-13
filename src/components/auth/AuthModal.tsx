import React, { useState, useEffect, useCallback } from 'react';
import { X, AlertCircle, RefreshCw } from 'lucide-react';
import { WalletAuth } from './WalletAuth';
import { Profile } from './Profile';
import { OnboardingFlow } from './OnboardingFlow';
import { useSupabase } from '../../contexts/SupabaseContext';

export type AuthView = 'wallet' | 'profile' | 'onboarding';

interface AuthError {
  message: string;
  code?: string;
  recoverable?: boolean;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthView;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialView = 'wallet' 
}) => {
  const [currentView, setCurrentView] = useState<AuthView>(initialView);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const { user } = useSupabase();

  // Smooth view transition with animation
  const changeView = useCallback((newView: AuthView) => {
    if (newView === currentView) return;
    
    setIsTransitioning(true);
    setError(null); // Clear errors on view change
    
    setTimeout(() => {
      setCurrentView(newView);
      setIsTransitioning(false);
    }, 150);
  }, [currentView]);

  // Handle errors with recovery options
  const handleError = useCallback((error: string | AuthError, recoverable = true) => {
    const authError: AuthError = typeof error === 'string' 
      ? { message: error, recoverable }
      : error;
    
    setError(authError);
  }, []);

  // Retry mechanism
  const handleRetry = useCallback(() => {
    setError(null);
    // Force re-render of current view
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 100);
  }, []);

  // Update view based on authentication status
  useEffect(() => {
    if (user && currentView !== 'profile') {
      changeView('profile');
    } else if (!user && currentView === 'profile') {
      changeView('wallet');
    }
  }, [user, currentView, changeView]);

  // Reset view when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      const targetView = user ? 'profile' : initialView;
      if (currentView !== targetView) {
        changeView(targetView);
      }
    }
  }, [isOpen, user, initialView, currentView, changeView]);

  if (!isOpen) return null;

  const handleClose = () => {
    setError(null);
    onClose();
    // Reset to initial view after a short delay to avoid visual glitch
    setTimeout(() => {
      setCurrentView(user ? 'profile' : 'wallet');
      setIsTransitioning(false);
    }, 300);
  };

  const renderContent = () => {
    // Show error state if there's an error
    if (error) {
      return (
        <div className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
              <p className="text-gray-600 mb-4">{error.message}</p>
              {error.recoverable && (
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'wallet':
        return (
          <WalletAuth
            onError={handleError}
            onNeedsOnboarding={() => changeView('onboarding')}
          />
        );
      case 'profile':
        return (
          <Profile
            onClose={handleClose}
          />
        );
      case 'onboarding':
        return (
          <OnboardingFlow
            onComplete={handleClose}
            onBack={() => changeView('wallet')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      aria-describedby="auth-modal-description"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-all duration-300"
        onClick={handleClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
            aria-label="Close authentication modal"
            type="button"
          >
            <X className="w-6 h-6 text-gray-600" aria-hidden="true" />
          </button>
          
          {/* Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 opacity-100">
            <div id="auth-modal-title" className="sr-only">
              {currentView === 'wallet' ? 'Wallet Authentication' : 
               currentView === 'profile' ? 'User Profile' : 'Account Setup'}
            </div>
            <div id="auth-modal-description" className="sr-only">
              {currentView === 'wallet' ? 'Connect your wallet to authenticate' : 
               currentView === 'profile' ? 'View and manage your profile' : 'Complete your account setup'}
            </div>
            
            {/* Content with transition */}
            <div className={`transition-all duration-200 ${
              isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
            }`}>
              {renderContent()}
            </div>
            
            {/* Loading overlay during transitions */}
            {isTransitioning && (
              <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for managing auth modal state
export const useAuthModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [initialView, setInitialView] = useState<AuthView>('wallet');
  const [lastError, setLastError] = useState<AuthError | null>(null);

  const openModal = useCallback((view: AuthView = 'wallet') => {
    setInitialView(view);
    setLastError(null); // Clear previous errors
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    // Clear error after a delay to avoid flash
    setTimeout(() => setLastError(null), 300);
  }, []);

  const handleModalError = useCallback((error: AuthError) => {
    setLastError(error);
  }, []);

  return {
    isOpen,
    initialView,
    lastError,
    openModal,
    closeModal,
    handleModalError
  };
};