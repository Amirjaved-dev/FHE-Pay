import { toast as hotToast } from 'react-hot-toast';
import React from 'react';
import { ToastContent } from './ToastContent';

export interface ToastOptions {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    hotToast.custom(
      (t) => (
        <ToastContent 
          t={t} 
          type="success" 
          message={message} 
          options={options} 
        />
      ),
      { duration: options?.duration || 4000 }
    );
  },
  
  error: (message: string, options?: ToastOptions) => {
    hotToast.custom(
      (t) => (
        <ToastContent 
          t={t} 
          type="error" 
          message={message} 
          options={options} 
        />
      ),
      { duration: options?.duration || 6000 }
    );
  },
  
  warning: (message: string, options?: ToastOptions) => {
    hotToast.custom(
      (t) => (
        <ToastContent 
          t={t} 
          type="warning" 
          message={message} 
          options={options} 
        />
      ),
      { duration: options?.duration || 5000 }
    );
  },
  
  info: (message: string, options?: ToastOptions) => {
    hotToast.custom(
      (t) => (
        <ToastContent 
          t={t} 
          type="info" 
          message={message} 
          options={options} 
        />
      ),
      { duration: options?.duration || 4000 }
    );
  },
  
  loading: (message: string, promise: Promise<unknown>, options?: {
    success?: string;
    error?: string;
  }) => {
    return hotToast.promise(
      promise,
      {
        loading: (
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
            <span className="text-sm text-gray-700">{message}</span>
          </div>
        ),
        success: options?.success || 'Operation completed successfully!',
        error: options?.error || 'Something went wrong. Please try again.'
      },
      {
        style: {
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '12px 16px',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
        }
      }
    );
  },
  
  dismiss: (toastId?: string) => {
    hotToast.dismiss(toastId);
  },
  
  remove: (toastId?: string) => {
    hotToast.remove(toastId);
  }
};