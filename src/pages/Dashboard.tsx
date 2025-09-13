import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import DashboardStats from '../components/DashboardStats';
import EmployeeList from '../components/EmployeeList';
import PayrollSummary from '../components/PayrollSummary';
import QuickActions from '../components/QuickActions';
import { useWalletSync } from '../hooks/useWalletSync';
import { useSupabase, type EmployeeWithUser } from '../contexts/SupabaseContext';
import { contractService } from '../services/contractService';
import { toast } from 'sonner';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface DashboardEmployee {
  id: string;
  name: string;
  email: string;
  salary: string;
  isActive: boolean;
}

interface DashboardStats {
  totalEmployees: number;
  activeStreams: number;
  totalFunds: string;
  monthlyPayroll: string;
}

export default function Dashboard() {
  const { address, isContractInitialized, isInitializing, contractError } = useWalletSync();
  const { profile, getCompanyEmployees, currentCompany, getUserCompanies } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<DashboardEmployee[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeStreams: 0,
    totalFunds: '0',
    monthlyPayroll: '0'
  });
  

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if user has a company
      let companyToUse = currentCompany;
      
      if (!companyToUse) {
        // Try to get user's companies
        const companies = await getUserCompanies();
        if (companies.length > 0) {
          companyToUse = companies[0]; // Use the first company
        }
      }

      if (!companyToUse) {
        // User doesn't have a company yet
        setEmployees([]);
        setStats({
          totalEmployees: 0,
          activeStreams: 0,
          totalFunds: '0',
          monthlyPayroll: '0'
        });
        setRetryCount(0);
        return;
      }

      // Get employees from Supabase
      const supabaseEmployees = await getCompanyEmployees(companyToUse.id);
      
      // Transform Supabase employee data to Dashboard format
      const dashboardEmployees: DashboardEmployee[] = supabaseEmployees.map((emp: EmployeeWithUser) => ({
        id: emp.id,
        name: emp.users?.full_name || 'Unknown',
        email: emp.users?.email || '',
        salary: emp.salary_amount?.toString() || '0',
        isActive: emp.status === 'active'
      }));
      
      setEmployees(dashboardEmployees);

      // Calculate stats from employee data
      const totalEmployees = dashboardEmployees.length;
      const activeStreams = dashboardEmployees.filter(emp => emp.isActive).length;
      
      // Get company funds from contract if available
      let totalFunds = '0';
      try {
        if (isContractInitialized && address) {
          totalFunds = (await contractService.getCompanyFunds('USDT', address)).toString();
        }
      } catch (contractErr) {
        console.warn('Could not fetch contract funds:', contractErr);
        // Use fallback value
        totalFunds = '0';
      }
      
      // Calculate monthly payroll
      const monthlyPayroll = dashboardEmployees
        .filter(emp => emp.isActive)
        .reduce((total, emp) => total + parseFloat(emp.salary || '0'), 0);

      setStats({
        totalEmployees,
        activeStreams,
        totalFunds,
        monthlyPayroll: monthlyPayroll.toString()
      });

      // Dashboard data loaded successfully
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentCompany, getUserCompanies, getCompanyEmployees, isContractInitialized, address]);

  const handleRetry = async () => {
    if (retryCount >= maxRetries) {
      toast.error('Maximum retry attempts reached. Please refresh the page.');
      return;
    }
    
    setRetryCount(prev => prev + 1);
    await loadDashboardData();
  };

  useEffect(() => {
    if (profile && !loading) {
      loadDashboardData();
    }
  }, [profile, loading, currentCompany, getUserCompanies, getCompanyEmployees, isContractInitialized, address, loadDashboardData]);



  // Show loading state for contract initialization or data loading
  if (isInitializing || loading) {
    const loadingMessage = isInitializing ? 'Initializing contract...' : 'Loading dashboard...';
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">{loadingMessage}</p>
            {isInitializing && (
              <p className="text-sm text-gray-500 mt-2">Setting up secure encryption...</p>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  if (error && retryCount >= 3) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {contractError ? 'Contract Initialization Failed' : 'Unable to Load Dashboard'}
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {contractError ? 'Retry Connection' : 'Try Again'}
            </button>
            {retryCount > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Retry attempt {retryCount}/{maxRetries}
              </p>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">{profile?.full_name?.charAt(0) || 'U'}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {profile?.full_name || 'User'}!
              </h1>
              <p className="text-gray-600">
                Your Company • Contract Initialized
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Components */}
        <DashboardStats stats={stats} />
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <EmployeeList employees={employees} />
          <div className="space-y-6">
            <PayrollSummary />
            <QuickActions />
          </div>
        </div>
      </div>
    </Layout>
  );
}