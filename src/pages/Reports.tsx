import React, { useState, useCallback, useEffect } from 'react';
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { useWallet } from '../hooks/useWallet';
import toast from 'react-hot-toast';

interface PayrollSummary {
  month: string;
  totalPaid: number;
  employeeCount: number;
  averageSalary: number;
}

interface EmployeeReport {
  id: string;
  name: string;
  department: string;
  totalPaid: number;
  lastPayment: Date;
  status: 'active' | 'inactive';
}

export default function Reports() {
  const { address } = useWallet();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('last6months');
  const [payrollSummary, setPayrollSummary] = useState<PayrollSummary[]>([]);
  const [employeeReports, setEmployeeReports] = useState<EmployeeReport[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalEmployees: 0,
    totalPaidThisMonth: 0,
    averageMonthlyPayroll: 0,
    growthRate: 0
  });

  const loadReportsData = useCallback(async () => {
    if (!address) return;
    
    try {
      setLoading(true);
      
      // Mock payroll summary data
      const mockSummary: PayrollSummary[] = [
        { month: 'Jan 2024', totalPaid: 45000, employeeCount: 9, averageSalary: 5000 },
        { month: 'Feb 2024', totalPaid: 50000, employeeCount: 10, averageSalary: 5000 },
        { month: 'Mar 2024', totalPaid: 55000, employeeCount: 11, averageSalary: 5000 },
        { month: 'Apr 2024', totalPaid: 60000, employeeCount: 12, averageSalary: 5000 },
        { month: 'May 2024', totalPaid: 65000, employeeCount: 13, averageSalary: 5000 },
        { month: 'Jun 2024', totalPaid: 70000, employeeCount: 14, averageSalary: 5000 }
      ];
      
      // Mock employee reports
      const mockEmployees: EmployeeReport[] = [
        {
          id: '1',
          name: 'John Doe',
          department: 'Engineering',
          totalPaid: 30000,
          lastPayment: new Date(Date.now() - 24 * 60 * 60 * 1000),
          status: 'active'
        },
        {
          id: '2',
          name: 'Jane Smith',
          department: 'Design',
          totalPaid: 25000,
          lastPayment: new Date(Date.now() - 24 * 60 * 60 * 1000),
          status: 'active'
        },
        {
          id: '3',
          name: 'Mike Johnson',
          department: 'Marketing',
          totalPaid: 22000,
          lastPayment: new Date(Date.now() - 48 * 60 * 60 * 1000),
          status: 'active'
        },
        {
          id: '4',
          name: 'Sarah Wilson',
          department: 'HR',
          totalPaid: 18000,
          lastPayment: new Date(Date.now() - 72 * 60 * 60 * 1000),
          status: 'inactive'
        }
      ];
      
      setPayrollSummary(mockSummary);
      setEmployeeReports(mockEmployees);
      
      // Calculate total stats
      const currentMonth = mockSummary[mockSummary.length - 1];
      const previousMonth = mockSummary[mockSummary.length - 2];
      const growthRate = previousMonth ? 
        ((currentMonth.totalPaid - previousMonth.totalPaid) / previousMonth.totalPaid) * 100 : 0;
      
      setTotalStats({
        totalEmployees: currentMonth.employeeCount,
        totalPaidThisMonth: currentMonth.totalPaid,
        averageMonthlyPayroll: mockSummary.reduce((sum, month) => sum + month.totalPaid, 0) / mockSummary.length,
        growthRate
      });
      
    } catch (error) {
      console.error('Error loading reports data:', error);
      toast.error('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    loadReportsData();
  }, [loadReportsData]);

  const exportReport = (format: 'csv' | 'pdf') => {
    // Mock export functionality
    toast.success(`Report exported as ${format.toUpperCase()}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payroll Reports</h1>
              <p className="mt-1 text-sm text-gray-500">
                Analyze payroll trends and employee payment history.
              </p>
            </div>
            <div className="flex space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
              >
                <option value="last3months">Last 3 Months</option>
                <option value="last6months">Last 6 Months</option>
                <option value="lastyear">Last Year</option>
              </select>
              <button
                type="button"
                onClick={() => exportReport('csv')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <DocumentArrowDownIcon className="-ml-1 mr-2 h-4 w-4" />
                Export CSV
              </button>
              <button
                type="button"
                onClick={() => exportReport('pdf')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <DocumentArrowDownIcon className="-ml-1 mr-2 h-4 w-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Employees
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {totalStats.totalEmployees}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    This Month
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(totalStats.totalPaidThisMonth)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Average Monthly
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(totalStats.averageMonthlyPayroll)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {totalStats.growthRate >= 0 ? (
                  <ArrowTrendingUpIcon className="h-6 w-6 text-green-400" />
                ) : (
                  <ArrowTrendingDownIcon className="h-6 w-6 text-red-400" />
                )}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Growth Rate
                  </dt>
                  <dd className={`text-lg font-medium ${
                    totalStats.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {totalStats.growthRate >= 0 ? '+' : ''}{totalStats.growthRate.toFixed(1)}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Trend Chart */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Payroll Trend
          </h3>
          <div className="mt-4">
            {/* Simple bar chart representation */}
            <div className="space-y-3">
              {payrollSummary.map((month) => {
                const maxAmount = Math.max(...payrollSummary.map(m => m.totalPaid));
                const widthPercentage = (month.totalPaid / maxAmount) * 100;
                
                return (
                  <div key={month.month} className="flex items-center space-x-4">
                    <div className="w-20 text-sm text-gray-600">{month.month}</div>
                    <div className="flex-1">
                      <div className="bg-gray-200 rounded-full h-6 relative">
                        <div 
                          className="bg-purple-600 h-6 rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${widthPercentage}%` }}
                        >
                          <span className="text-xs text-white font-medium">
                            {formatCurrency(month.totalPaid)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-16 text-sm text-gray-600 text-right">
                      {month.employeeCount} emp
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Employee Reports Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Employee Payment Summary
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Individual employee payment history and status.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employeeReports.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {employee.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(employee.totalPaid)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(employee.lastPayment)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      employee.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ChartBarIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Encrypted Payroll Analytics
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                All payroll data is processed using Fully Homomorphic Encryption (FHE). 
                Individual salary amounts remain encrypted while still allowing for aggregate reporting and analytics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}