import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useSupabase } from '../contexts/SupabaseContext';
import { useWalletSync } from '../hooks/useWalletSync';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireWallet?: boolean;
  requireAuth?: boolean;
  requireBoth?: boolean; // Require both wallet and auth
  allowPublic?: boolean; // Allow access without any authentication
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireWallet = false,
  requireAuth = false,
  requireBoth = false,
  allowPublic = false
}) => {
  const { isConnected } = useWallet();
  const { user, loading: authLoading } = useSupabase();
  const { isInitializing } = useWalletSync();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Set a timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (authLoading || (isInitializing && isConnected)) {
        setLoadingTimeout(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timer);
  }, [authLoading, isInitializing, isConnected]);
  
  // Determine what's actually required
  const needsWallet = requireWallet || requireBoth;
  const needsAuth = requireAuth || requireBoth;

  // Show loading state while checking authentication status
  // Only show loading if we're actually trying to authenticate or initialize
  // Don't show loading for public routes when no wallet is connected
  if ((authLoading || (isInitializing && isConnected)) && !loadingTimeout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {authLoading ? 'Checking authentication...' : 
             isInitializing ? 'Connecting wallet...' : 'Loading...'}
          </p>
          {loadingTimeout && (
            <p className="mt-2 text-sm text-red-600">
              Taking longer than expected. Please refresh the page.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Allow public access if specified
  if (allowPublic) {
    return <>{children}</>;
  }

  // Check authentication requirements
  const hasAuth = !!user;
  const hasWallet = isConnected;
  
  // If both are required, check both
  if (requireBoth) {
    if (!hasAuth || !hasWallet) {
      return <Navigate to="/" state={{ from: location, needsAuth: !hasAuth, needsWallet: !hasWallet }} replace />;
    }
  }
  // If only auth is required
  else if (needsAuth && !hasAuth) {
    return <Navigate to="/" state={{ from: location, needsAuth: true }} replace />;
  }
  // If only wallet is required
  else if (needsWallet && !hasWallet) {
    return <Navigate to="/" state={{ from: location, needsWallet: true }} replace />;
  }
  
  // Auto-redirect authenticated users away from public pages
  // Only redirect if both wallet and auth are complete for protected routes
  if (location.pathname === '/' && hasAuth && hasWallet) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;