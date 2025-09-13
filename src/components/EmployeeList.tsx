import React from 'react';
import { UsersIcon, EyeIcon } from '@heroicons/react/24/outline';

interface Employee {
  id: string;
  name: string;
  email: string;
  salary: string;
  isActive: boolean;
}

interface EmployeeListProps {
  employees: Employee[];
}

export default function EmployeeList({ employees }: EmployeeListProps) {
  return (
    <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Employees</h3>
        <span className="text-sm text-gray-500">{employees.length} total</span>
      </div>
      
      {employees.length > 0 ? (
        <div className="space-y-4">
          {employees.slice(0, 5).map((employee) => (
            <div key={employee.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {employee.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                  <p className="text-xs text-gray-500">{employee.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${parseFloat(employee.salary).toLocaleString()}/mo
                  </p>
                  <p className={`text-xs ${
                    employee.isActive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {employee.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <EyeIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {employees.length > 5 && (
            <div className="text-center pt-4">
              <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                View all {employees.length} employees
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No employees</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first employee.
          </p>
        </div>
      )}
    </div>
  );
}