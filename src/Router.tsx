import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Funding from './pages/Funding';
import Portal from './pages/Portal';
import Reports from './pages/Reports';
import { WalletConnectTest } from './components/WalletConnectTest';

export const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute allowPublic>
              <Home />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected app routes */}
        <Route 
          path="/app" 
          element={
            <ProtectedRoute requireBoth>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="funding" element={<Funding />} />
          <Route path="portal" element={<Portal />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        
        {/* Test route for WalletConnect debugging */}
        <Route path="/test-wallet" element={<WalletConnectTest />} />
        
        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};