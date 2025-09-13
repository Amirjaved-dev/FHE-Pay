import toast from 'react-hot-toast';

// Type for error objects that might come from various sources
interface ErrorWithCode {
  code?: string;
  message?: string;
  error_description?: string;
  details?: unknown;
}

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

export class AuthError extends Error {
  code?: string;
  details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.details = details;
  }
}

export class WalletError extends Error {
  code?: string;
  details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'WalletError';
    this.code = code;
    this.details = details;
  }
}

export class DatabaseError extends Error {
  code?: string;
  details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.details = details;
  }
}

// Error message mappings for better user experience
const ERROR_MESSAGES: Record<string, string> = {
  // Supabase Auth errors
  'invalid_credentials': 'Invalid email or password. Please check your credentials and try again.',
  'email_not_confirmed': 'Please check your email and click the confirmation link before signing in.',
  'signup_disabled': 'Account registration is currently disabled. Please contact support.',
  'email_address_invalid': 'Please enter a valid email address.',
  'password_too_short': 'Password must be at least 6 characters long.',
  'user_already_registered': 'An account with this email already exists. Please sign in instead.',
  'weak_password': 'Password is too weak. Please use a stronger password with at least 8 characters.',
  
  // Database errors
  'PGRST116': 'No data found.',
  '23505': 'This information is already in use. Please try different values.',
  '23503': 'Referenced data does not exist.',
  '42501': 'You do not have permission to perform this action.',
  
  // Wallet errors
  'wallet_not_connected': 'Please connect your wallet first.',
  'wallet_connection_failed': 'Failed to connect wallet. Please try again.',
  'wallet_already_linked': 'This wallet address is already linked to another account.',
  'unsupported_network': 'Please switch to a supported network.',
  'transaction_rejected': 'Transaction was rejected. Please try again.',
  
  // Network errors
  'network_error': 'Network connection failed. Please check your internet connection and try again.',
  'timeout_error': 'Request timed out. Please try again.',
  'server_error': 'Server error occurred. Please try again later.',
};

// Get user-friendly error message
export const getErrorMessage = (error: unknown): string => {
  if (!error) return 'An unknown error occurred';
  
  const errorObj = error as ErrorWithCode;
  
  // Check if it's a custom error with a code
  if (errorObj.code && ERROR_MESSAGES[errorObj.code]) {
    return ERROR_MESSAGES[errorObj.code];
  }
  
  // Check Supabase error codes
  if (errorObj.error_description) {
    const code = errorObj.error_description.toLowerCase().replace(/\s+/g, '_');
    if (ERROR_MESSAGES[code]) {
      return ERROR_MESSAGES[code];
    }
  }
  
  // Check PostgreSQL error codes
  if (errorObj.code && ERROR_MESSAGES[errorObj.code]) {
    return ERROR_MESSAGES[errorObj.code];
  }
  
  // Return the original message if available
  if (errorObj.message) {
    return errorObj.message;
  }
  
  // Fallback
  return 'An unexpected error occurred. Please try again.';
};

// Enhanced error handler with logging and user feedback
export const handleError = (error: unknown, context?: string, showToast: boolean = true): AppError => {
  const message = getErrorMessage(error);
  const errorObj = error as ErrorWithCode;
  const appError: AppError = {
    message,
    code: errorObj.code || errorObj.error_description || 'unknown',
    details: error
  };
  
  // Log error for debugging
  console.error(`Error in ${context || 'unknown context'}:`, {
    message: appError.message,
    code: appError.code,
    originalError: error,
    timestamp: new Date().toISOString()
  });
  
  // Show user-friendly toast notification
  if (showToast) {
    toast.error(message);
  }
  
  return appError;
};

// Success handler for consistent success messaging
export const handleSuccess = (message: string, showToast: boolean = true) => {
  if (showToast) {
    toast.success(message);
  }
  
  // Success logged
};

// Loading state manager
export class LoadingManager {
  private loadingStates: Map<string, boolean> = new Map();
  private callbacks: Map<string, (loading: boolean) => void> = new Map();
  
  setLoading(key: string, loading: boolean) {
    this.loadingStates.set(key, loading);
    const callback = this.callbacks.get(key);
    if (callback) {
      callback(loading);
    }
  }
  
  isLoading(key: string): boolean {
    return this.loadingStates.get(key) || false;
  }
  
  isAnyLoading(): boolean {
    return Array.from(this.loadingStates.values()).some(loading => loading);
  }
  
  subscribe(key: string, callback: (loading: boolean) => void) {
    this.callbacks.set(key, callback);
  }
  
  unsubscribe(key: string) {
    this.callbacks.delete(key);
  }
  
  clear() {
    this.loadingStates.clear();
    this.callbacks.clear();
  }
}

// Global loading manager instance
export const globalLoadingManager = new LoadingManager();

// Retry mechanism for failed operations
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  context?: string
): Promise<T> => {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      console.warn(`Retry attempt ${attempt}/${maxRetries} failed in ${context}:`, error);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};