import React from 'react';
import { Toaster } from 'react-hot-toast';



export const EnhancedToaster: React.FC = () => (
  <Toaster
    position="top-right"
    gutter={8}
    containerStyle={{
      top: 80,
      right: 20,
      zIndex: 9999
    }}
    toastOptions={{
      duration: 4000,
      style: {
        background: 'transparent',
        boxShadow: 'none',
        padding: 0,
        margin: 0
      },
      success: {
        iconTheme: {
          primary: '#10b981',
          secondary: '#ffffff'
        }
      },
      error: {
        iconTheme: {
          primary: '#ef4444',
          secondary: '#ffffff'
        }
      }
    }}
  />
);