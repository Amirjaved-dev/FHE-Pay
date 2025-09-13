import React, { Component, ReactNode, ComponentType, ErrorInfo } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ComponentType<{ error: Error | null; retry: () => void; canRetry: boolean }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
}

export class EnhancedErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private maxRetries: number;
  
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.maxRetries = props.maxRetries || 3;
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }
  
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
    
    // In production, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }
  
  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: this.state.retryCount + 1
      });
    }
  };
  
  handleRefresh = () => {
    window.location.reload();
  };
  
  render() {
    if (this.state.hasError) {
      const canRetry = this.state.retryCount < this.maxRetries;
      
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent 
            error={this.state.error}
            retry={this.handleRetry}
            canRetry={canRetry}
          />
        );
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="max-w-md w-full bg-white rounded-lg shadow-lg p-6"
          >
            <div className="text-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4"
              >
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </motion.div>
              
              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg font-medium text-gray-900 mb-2"
              >
                Something went wrong
              </motion.h3>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-gray-500 mb-6"
              >
                {canRetry 
                  ? 'We encountered an unexpected error. You can try again or refresh the page.'
                  : 'Multiple errors occurred. Please refresh the page or contact support if the problem persists.'
                }
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                {canRetry && (
                  <button
                    onClick={this.handleRetry}
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors font-medium"
                  >
                    Try Again ({this.maxRetries - this.state.retryCount} left)
                  </button>
                )}
                <button
                  onClick={this.handleRefresh}
                  className="flex-1 bg-gray-200 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors font-medium"
                >
                  Refresh Page
                </button>
              </motion.div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <motion.details 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 text-left"
                >
                  <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded-md border">
                    <pre className="text-xs text-gray-600 overflow-auto max-h-40">
                      <strong>Error:</strong> {this.state.error.message}\n\n
                      <strong>Stack:</strong>\n{this.state.error.stack}
                      {this.state.errorInfo && (
                        <>\n\n<strong>Component Stack:</strong>\n{this.state.errorInfo.componentStack}</>
                      )}
                    </pre>
                  </div>
                </motion.details>
              )}
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-4 text-xs text-gray-400"
              >
                Error ID: {Date.now().toString(36)}
              </motion.div>
            </div>
          </motion.div>
        </div>
      );
    }
    
    return this.props.children;
  }
}



// Simple error fallback component
export const SimpleErrorFallback: React.FC<{
  error?: Error;
  retry?: () => void;
  canRetry?: boolean;
}> = ({ error, retry, canRetry = true }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Oops! Something went wrong</h3>
      <p className="text-sm text-gray-500 mb-4">
        {error?.message || 'An unexpected error occurred'}
      </p>
      {canRetry && retry && (
        <button
          onClick={retry}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default EnhancedErrorBoundary;