import React from 'react';
import { ChartBarIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface PayrollSummaryProps {
  summary?: {
    nextPayroll: Date;
    totalAmount: string;
    employeeCount: number;
    status: 'pending' | 'processing' | 'completed';
  };
}

export default function PayrollSummary({ summary }: PayrollSummaryProps) {
  const defaultSummary = {
    nextPayroll: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
    totalAmount: '0',
    employeeCount: 0,
    status: 'pending' as const
  };

  const currentSummary = summary || defaultSummary;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'processing':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircleIcon;
      case 'processing':
        return ClockIcon;
      default:
        return ChartBarIcon;
    }
  };

  const StatusIcon = getStatusIcon(currentSummary.status);

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Next Payroll</h3>
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(currentSummary.status)}`}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {currentSummary.status.charAt(0).toUpperCase() + currentSummary.status.slice(1)}
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Date</span>
          <span className="text-sm font-medium text-gray-900">
            {currentSummary.nextPayroll.toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Total Amount</span>
          <span className="text-sm font-medium text-gray-900">
            ${parseFloat(currentSummary.totalAmount).toLocaleString()}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Employees</span>
          <span className="text-sm font-medium text-gray-900">
            {currentSummary.employeeCount}
          </span>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
            Process Payroll
          </button>
        </div>
      </div>
    </div>
  );
}