import { WalletProvider } from './contexts/WalletContext';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { WalletSyncProvider } from './contexts/WalletSyncContext';
import { Router } from './Router';
import { EnhancedErrorBoundary } from './components/ui/EnhancedErrorBoundary';
import { EnhancedToaster } from './components/ui/Toast';

function App() {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Application Error:', error, errorInfo);
    }
    
    // In production, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  };

  return (
    <EnhancedErrorBoundary onError={handleError} maxRetries={3}>
      <WalletProvider>
        <SupabaseProvider>
          <WalletSyncProvider>
            <Router />
            <EnhancedToaster />
          </WalletSyncProvider>
        </SupabaseProvider>
      </WalletProvider>
    </EnhancedErrorBoundary>
  );
}

export default App
