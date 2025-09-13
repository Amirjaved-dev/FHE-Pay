import React from 'react';
import { Toast, toast as hotToast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { ToastOptions } from './toast-utils';

export const ToastContent: React.FC<{
  t: Toast;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  options?: ToastOptions;
}> = ({ t, type, message, options }) => {
  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  };
  
  const colors = {
    success: {
      icon: 'text-green-500',
      border: 'border-green-200',
      bg: 'bg-green-50'
    },
    error: {
      icon: 'text-red-500',
      border: 'border-red-200',
      bg: 'bg-red-50'
    },
    warning: {
      icon: 'text-yellow-500',
      border: 'border-yellow-200',
      bg: 'bg-yellow-50'
    },
    info: {
      icon: 'text-blue-500',
      border: 'border-blue-200',
      bg: 'bg-blue-50'
    }
  };
  
  const Icon = icons[type];
  const colorScheme = colors[type];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`bg-white rounded-lg shadow-lg border ${colorScheme.border} p-4 max-w-md min-w-[300px] ${
        t.visible ? 'animate-enter' : 'animate-leave'
      }`}
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 p-1 rounded-full ${colorScheme.bg}`}>
          <Icon className={`h-5 w-5 ${colorScheme.icon}`} />
        </div>
        <div className="ml-3 flex-1">
          {options?.title && (
            <p className="text-sm font-medium text-gray-900 mb-1">{options.title}</p>
          )}
          <p className="text-sm text-gray-700">{message}</p>
          {options?.description && (
            <p className="text-xs text-gray-500 mt-1">{options.description}</p>
          )}
        </div>
        <div className="ml-3 flex items-center space-x-2">
          {options?.action && (
            <button
              onClick={() => {
                options.action!.onClick();
                hotToast.dismiss(t.id);
              }}
              className={`text-sm font-medium ${colorScheme.icon} hover:opacity-80 transition-opacity`}
            >
              {options.action.label}
            </button>
          )}
          <button
            onClick={() => hotToast.dismiss(t.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};