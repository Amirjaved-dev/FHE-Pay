import { useState, useCallback, useRef, useEffect } from 'react';
import { globalLoadingManager } from '../utils/errorHandler';

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

// Hook for managing loading states with error handling
export const useLoadingState = (initialLoading: boolean = false): LoadingState => {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
    if (loading) {
      setError(null); // Clear error when starting new operation
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    setLoading,
    setError,
    clearError,
    reset
  };
};

// Hook for managing multiple loading states
export const useMultipleLoadingStates = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }));
    globalLoadingManager.setLoading(key, loading);
    
    if (loading) {
      // Clear error when starting new operation
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  }, []);

  const setError = useCallback((key: string, error: string | null) => {
    setErrors(prev => ({ ...prev, [key]: error }));
    if (error) {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
      globalLoadingManager.setLoading(key, false);
    }
  }, []);

  const clearError = useCallback((key: string) => {
    setErrors(prev => ({ ...prev, [key]: null }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const getError = useCallback((key: string) => {
    return errors[key] || null;
  }, [errors]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(loading => loading);
  }, [loadingStates]);

  const reset = useCallback((key?: string) => {
    if (key) {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
      setErrors(prev => ({ ...prev, [key]: null }));
      globalLoadingManager.setLoading(key, false);
    } else {
      setLoadingStates({});
      setErrors({});
      globalLoadingManager.clear();
    }
  }, []);

  return {
    setLoading,
    setError,
    clearError,
    isLoading,
    getError,
    isAnyLoading,
    reset
  };
};

// Hook for async operations with automatic loading and error handling
export const useAsyncOperation = <T extends unknown[], R>(
  operation: (...args: T) => Promise<R>,
  options?: {
    onSuccess?: (result: R) => void;
    onError?: (error: Error) => void;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
  }
) => {
  const { isLoading, error, setLoading, setError, reset } = useLoadingState();
  const operationRef = useRef(operation);
  
  // Update operation ref when it changes
  useEffect(() => {
    operationRef.current = operation;
  }, [operation]);

  const execute = useCallback(async (...args: T): Promise<R | null> => {
    try {
      setLoading(true);
      const result = await operationRef.current(...args);
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      
      if (options?.onError && err instanceof Error) {
        options.onError(err);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, options]);

  return {
    execute,
    isLoading,
    error,
    reset
  };
};

// Hook for debounced async operations
export const useDebouncedAsyncOperation = <T extends unknown[], R>(
  operation: (...args: T) => Promise<R>,
  delay: number = 300,
  options?: {
    onSuccess?: (result: R) => void;
    onError?: (error: Error) => void;
  }
) => {
  const { execute, isLoading, error, reset } = useAsyncOperation(operation, options);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedExecute = useCallback((...args: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      execute(...args);
    }, delay);
  }, [execute, delay]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    execute: debouncedExecute,
    cancel,
    isLoading,
    error,
    reset
  };
};