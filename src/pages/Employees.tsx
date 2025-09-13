import { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon,
  UserIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PauseIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { contractService } from '../services/contractService';
import { useWallet } from '../hooks/useWallet';
import toast from 'react-hot-toast';

interface Employee {
  id: string;
  address: string;
  name: string;
  position: string;
  salary: string;
  isActive: boolean;
  streamId?: string;
}

export default function Employees() {
  const { address } = useWallet();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    walletAddress: '',
    position: '',
    salary: ''
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    walletAddress?: string;
    position?: string;
    salary?: string;
  }>({});
  const [isCreatingStream, setIsCreatingStream] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Form validation functions
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) return 'Name can only contain letters and spaces';
    return undefined;
  };

  const validateWalletAddress = (address: string): string | undefined => {
    if (!address.trim()) return 'Wallet address is required';
    if (!/^0x[a-fA-F0-9]{40}$/.test(address.trim())) return 'Invalid Ethereum wallet address format';
    return undefined;
  };

  const validatePosition = (position: string): string | undefined => {
    if (!position.trim()) return 'Position is required';
    if (position.trim().length < 2) return 'Position must be at least 2 characters';
    return undefined;
  };

  const validateSalary = (salary: string): string | undefined => {
    if (!salary.trim()) return 'Salary is required';
    const numSalary = parseFloat(salary);
    if (isNaN(numSalary)) return 'Salary must be a valid number';
    if (numSalary <= 0) return 'Salary must be greater than 0';
    if (numSalary > 1000000) return 'Salary cannot exceed 1,000,000 cUSDT';
    return undefined;
  };

  const validateField = (field: string, value: string) => {
    let error: string | undefined;
    switch (field) {
      case 'name':
        error = validateName(value);
        break;
      case 'walletAddress':
        error = validateWalletAddress(value);
        break;
      case 'position':
        error = validatePosition(value);
        break;
      case 'salary':
        error = validateSalary(value);
        break;
    }
    setFormErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const loadEmployees = useCallback(async (isRetry = false) => {
    try {
      setLoading(true);
      if (!isRetry) {
        setError(null);
      }
      
      // Simulate occasional failures for testing
      if (Math.random() < 0.15 && retryCount < 2) {
        throw new Error('Failed to fetch employee data');
      }
      
      // Mock data for demo - in real app, this would come from contract events or off-chain storage
      setEmployees([
        {
          id: '1',
          address: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
          name: 'John Doe',
          position: 'Software Engineer',
          salary: '5000',
          isActive: true,
          streamId: 'stream_1'
        },
        {
          id: '2',
          address: '0x8ba1f109551bD432803012645Hac136c9c1e3a9e',
          name: 'Jane Smith',
          position: 'Product Manager',
          salary: '6000',
          isActive: true,
          streamId: 'stream_2'
        },
        {
          id: '3',
          address: '0x1234567890123456789012345678901234567890',
          name: 'Bob Johnson',
          position: 'Designer',
          salary: '4500',
          isActive: false
        }
      ]);
      setRetryCount(0);
    } catch (error) {
      console.error('Error loading employees:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load employees';
      setError(errorMessage);
      
      if (retryCount < 3) {
        toast.error(`${errorMessage}. Retrying...`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => loadEmployees(true), 2000 * (retryCount + 1));
      } else {
        toast.error('Failed to load employees after multiple attempts');
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    loadEmployees();
  }, [address, retryCount, loadEmployees]);

  const handleRetry = () => {
    setRetryCount(0);
    loadEmployees();
  };

  const handleAddEmployee = async () => {
    // Validate all fields
    const nameValid = validateField('name', newEmployee.name);
    const walletValid = validateField('walletAddress', newEmployee.walletAddress);
    const positionValid = validateField('position', newEmployee.position);
    const salaryValid = validateField('salary', newEmployee.salary);

    if (!nameValid || !walletValid || !positionValid || !salaryValid) {
      return;
    }

    // Check for duplicate wallet address
    const existingEmployee = employees.find(emp => emp.address.toLowerCase() === newEmployee.walletAddress.toLowerCase());
    if (existingEmployee) {
      setFormErrors(prev => ({ ...prev, walletAddress: 'This wallet address is already registered' }));
      return;
    }

    try {
      setIsCreatingStream(true);
      
      // Create confidential stream
      const streamId = await contractService.createConfidentialStream({
        employeeAddress: newEmployee.walletAddress,
        monthlySalary: parseFloat(newEmployee.salary)
      });
      
      const employee: Employee = {
        id: Date.now().toString(),
        address: newEmployee.walletAddress.trim(),
        name: newEmployee.name.trim(),
        position: newEmployee.position.trim(),
        salary: newEmployee.salary,
        isActive: true,
        streamId
      };
      
      setEmployees(prev => [...prev, employee]);
      setNewEmployee({ name: '', walletAddress: '', position: '', salary: '' });
      setFormErrors({});
      setShowModal(false);
      toast.success('Employee added and stream created successfully!');
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error('Failed to add employee');
      setFormErrors({ walletAddress: 'Failed to create employee. Please try again.' });
    } finally {
      setIsCreatingStream(false);
    }
  };

  const handleToggleEmployee = async (employeeId: string) => {
    try {
      setEmployees(prev => prev.map(emp => 
        emp.id === employeeId 
          ? { ...emp, isActive: !emp.isActive }
          : emp
      ));
      
      const employee = employees.find(emp => emp.id === employeeId);
      if (employee) {
        toast.success(`Employee ${employee.isActive ? 'paused' : 'resumed'} successfully`);
      }
    } catch (error) {
      console.error('Error toggling employee status:', error);
      toast.error('Failed to update employee status');
    }
  };

  const handleRemoveEmployee = async (employeeId: string) => {
    if (!confirm('Are you sure you want to remove this employee?')) return;
    
    try {
      // In a real app, you would also pause/cancel the stream
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      toast.success('Employee removed successfully');
    } catch (error) {
      console.error('Error removing employee:', error);
      toast.error('Failed to remove employee');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Header Skeleton */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <div className="animate-pulse space-y-2">
              <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/4"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <div className="animate-pulse">
              <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-32"></div>
            </div>
          </div>
        </div>

        {/* Employees List Skeleton */}
        <div className="bg-white shadow-sm overflow-hidden sm:rounded-md border border-gray-100">
          <ul className="divide-y divide-gray-200">
            {Array.from({ length: 3 }).map((_, index) => (
              <li key={index} className="animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="animate-pulse flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-300"></div>
                      </div>
                      <div className="ml-4 space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24"></div>
                          <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-16"></div>
                        </div>
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-32"></div>
                        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right space-y-1">
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24"></div>
                        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16"></div>
                      </div>
                      <div className="flex space-x-2">
                        <div className="h-5 w-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                        <div className="h-5 w-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (error && retryCount >= 3) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-red-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Unable to Load Employees</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md">
            {error}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header - Mobile optimized */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900" id="page-title">Employees</h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-700" id="page-description">
            Manage your team members and their salary streams.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-transparent bg-purple-600 px-3 sm:px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5"
            aria-label="Add new employee to payroll"
            aria-describedby="page-description"
          >
            <PlusIcon className="h-4 w-4 mr-2" aria-hidden="true" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Employees Table - Mobile optimized */}
      <div className="bg-white shadow-sm overflow-hidden sm:rounded-md border border-gray-100">
        <ul className="divide-y divide-gray-200">
          {employees.map((employee, index) => (
            <li key={employee.id} className="animate-fadeIn hover:bg-gray-50 transition-all duration-200" style={{ animationDelay: `${index * 100}ms` }} role="listitem">
              <div className="px-4 py-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center ring-2 ring-purple-50 transition-all duration-200 hover:ring-purple-100 hover:shadow-md" aria-hidden="true">
                        <span className="text-sm sm:text-base font-medium text-purple-600">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3 sm:ml-4 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <p className="text-sm sm:text-base font-medium text-gray-900">
                          {employee.name}
                        </p>
                        <span className={`mt-1 sm:mt-0 sm:ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${
                          employee.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`} aria-label={`Payment status: ${employee.isActive ? 'Active' : 'Inactive'}`}>
                          {employee.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="mt-1">
                        <p className="text-xs sm:text-sm text-gray-500">{employee.position}</p>
                        <p className="text-xs text-gray-400 font-mono" title={employee.address} aria-label={`Wallet address: ${employee.address}`}>
                          {employee.address.slice(0, 6)}...{employee.address.slice(-4)}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium" aria-label={`Monthly salary: ${parseFloat(employee.salary).toLocaleString()} cUSDT`}>
                          Salary: {parseFloat(employee.salary).toLocaleString()} cUSDT/month
                        </p>
                        {employee.streamId && (
                          <p className="text-xs text-gray-500" title={employee.streamId} aria-label={`Payment stream ID: ${employee.streamId}`}>
                            Stream: {employee.streamId.slice(0, 8)}...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-3" role="group" aria-label={`Actions for ${employee.name}`}>
                    <button
                      onClick={() => handleToggleEmployee(employee.id)}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 min-h-[44px] ${
                        employee.isActive
                          ? 'bg-red-100 text-red-800 hover:bg-red-200 hover:shadow-md focus:ring-red-500'
                          : 'bg-green-100 text-green-800 hover:bg-green-200 hover:shadow-md focus:ring-green-500'
                      }`}
                      aria-label={employee.isActive ? `Pause salary for ${employee.name}` : `Resume salary for ${employee.name}`}
                      title={employee.isActive ? 'Pause payment stream' : 'Resume payment stream'}
                    >
                      {employee.isActive ? (
                        <>
                          <PauseIcon className="h-3 w-3 mr-1 sm:mr-2" aria-hidden="true" />
                          <span className="hidden sm:inline">Pause</span>
                        </>
                      ) : (
                        <>
                          <PlayIcon className="h-3 w-3 mr-1 sm:mr-2" aria-hidden="true" />
                          <span className="hidden sm:inline">Resume</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setShowRemoveModal(true);
                      }}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 min-h-[44px]"
                      aria-label={`Remove ${employee.name} from payroll`}
                      title="Remove employee"
                    >
                      <TrashIcon className="h-3 w-3 mr-1 sm:mr-2" aria-hidden="true" />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        {employees.length === 0 && (
          <div className="text-center py-12 animate-fadeIn">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 mb-4">
              <UserIcon className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No employees yet</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Start building your team by adding your first employee to the payroll system.
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Add Your First Employee
              </button>
              <p className="text-xs text-gray-400">
                Employees will receive automated salary payments via blockchain
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-employee-title"
          aria-describedby="add-employee-description"
        >
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 id="add-employee-title" className="text-lg font-medium text-gray-900">Add New Employee</h3>
                  <p className="mt-1 text-sm text-gray-500">Create a new employee and set up their salary stream</p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setFormErrors({});
                    setNewEmployee({ name: '', walletAddress: '', position: '', salary: '' });
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-4 sm:px-6 py-4">
              <p className="text-sm text-gray-600 mb-4" id="modal-description">
                Add a new team member to your payroll system. They will receive automated salary payments via blockchain.
              </p>
              <form onSubmit={(e) => { e.preventDefault(); handleAddEmployee(); }} className="space-y-4" role="form" aria-labelledby="add-employee-title" aria-describedby="modal-description">
                <fieldset className="space-y-4">
                  <legend className="sr-only">Employee Information</legend>
                <div>
                  <label htmlFor="employee-name" className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    id="employee-name"
                    type="text"
                    value={newEmployee.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewEmployee(prev => ({ ...prev, name: value }));
                      if (value.trim()) validateField('name', value);
                      else setFormErrors(prev => ({ ...prev, name: undefined }));
                    }}
                    onBlur={(e) => validateField('name', e.target.value)}
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm transition-all duration-200 ${
                      formErrors.name 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                        : newEmployee.name && !formErrors.name 
                        ? 'border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50'
                        : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                    }`}
                    placeholder="John Doe"
                    required
                    aria-describedby="employee-name-help"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.name}
                    </p>
                  )}
                  <p id="employee-name-help" className="sr-only">Enter the full name of the employee</p>
                </div>
                <div>
                  <label htmlFor="employee-address" className="block text-sm font-medium text-gray-700">Wallet Address *</label>
                  <input
                    id="employee-address"
                    type="text"
                    value={newEmployee.walletAddress}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewEmployee(prev => ({ ...prev, walletAddress: value }));
                      if (value.trim()) validateField('walletAddress', value);
                      else setFormErrors(prev => ({ ...prev, walletAddress: undefined }));
                    }}
                    onBlur={(e) => validateField('walletAddress', e.target.value)}
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm font-mono transition-all duration-200 ${
                      formErrors.walletAddress 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                        : newEmployee.walletAddress && !formErrors.walletAddress 
                        ? 'border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50'
                        : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                    }`}
                    placeholder="0x1234567890123456789012345678901234567890"
                    required
                    aria-describedby="employee-address-help"
                  />
                  {formErrors.walletAddress && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.walletAddress}
                    </p>
                  )}
                  <p id="employee-address-help" className="mt-1 text-xs text-gray-500">
                    Enter a valid Ethereum wallet address (42 characters starting with 0x)
                  </p>
                </div>
                <div>
                  <label htmlFor="employee-position" className="block text-sm font-medium text-gray-700">Position *</label>
                  <input
                    id="employee-position"
                    type="text"
                    value={newEmployee.position}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewEmployee(prev => ({ ...prev, position: value }));
                      if (value.trim()) validateField('position', value);
                      else setFormErrors(prev => ({ ...prev, position: undefined }));
                    }}
                    onBlur={(e) => validateField('position', e.target.value)}
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm transition-all duration-200 ${
                      formErrors.position 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                        : newEmployee.position && !formErrors.position 
                        ? 'border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50'
                        : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                    }`}
                    placeholder="Software Engineer"
                    required
                    aria-describedby="employee-position-help"
                  />
                  {formErrors.position && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.position}
                    </p>
                  )}
                  <p id="employee-position-help" className="mt-1 text-xs text-gray-500">
                    Enter the employee's job title or position
                  </p>
                </div>
                <div>
                  <label htmlFor="employee-salary" className="block text-sm font-medium text-gray-700">Monthly Salary (cUSDT) *</label>
                  <div className="relative">
                    <input
                      id="employee-salary"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newEmployee.salary}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNewEmployee(prev => ({ ...prev, salary: value }));
                        if (value.trim()) validateField('salary', value);
                        else setFormErrors(prev => ({ ...prev, salary: undefined }));
                      }}
                      onBlur={(e) => validateField('salary', e.target.value)}
                      className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm transition-all duration-200 pr-16 ${
                        formErrors.salary 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                          : newEmployee.salary && !formErrors.salary 
                          ? 'border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50'
                          : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                      }`}
                      placeholder="5000"
                      required
                      aria-describedby="employee-salary-help"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">cUSDT</span>
                    </div>
                  </div>
                  {formErrors.salary && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.salary}
                    </p>
                  )}
                  <p id="employee-salary-help" className="mt-1 text-xs text-gray-500">
                    Enter the monthly salary amount (max: 1,000,000 cUSDT)
                  </p>
                  </div>
                  </fieldset>
                 <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6 pt-4 border-t border-gray-200">
                   <button
                     type="button"
                     onClick={() => {
                       setShowModal(false);
                       setFormErrors({});
                       setNewEmployee({ name: '', walletAddress: '', position: '', salary: '' });
                     }}
                     className="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 min-h-[44px]"
                     aria-label="Cancel adding employee"
                   >
                     Cancel
                   </button>
                   <button
                     type="submit"
                     disabled={isCreatingStream || Object.values(formErrors).some(error => error) || !newEmployee.name || !newEmployee.walletAddress || !newEmployee.position || !newEmployee.salary}
                     className={`w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-medium border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 min-h-[44px] ${
                       isCreatingStream || Object.values(formErrors).some(error => error) || !newEmployee.name || !newEmployee.walletAddress || !newEmployee.position || !newEmployee.salary
                         ? 'text-gray-400 bg-gray-300 cursor-not-allowed'
                         : 'text-white bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
                     }`}
                     aria-label={isCreatingStream ? 'Creating employee stream...' : 'Add employee to payroll'}
                   >
                     {isCreatingStream ? (
                       <div className="flex items-center justify-center">
                         <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                         Creating Stream...
                       </div>
                     ) : (
                       <div className="flex items-center justify-center">
                         <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                         </svg>
                         Add Employee
                       </div>
                     )}
                   </button>
                 </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Remove Employee Confirmation Modal */}
      {showRemoveModal && selectedEmployee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 animate-fadeIn" onClick={() => setShowRemoveModal(false)}>
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <TrashIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Remove Employee</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to remove <span className="font-medium text-gray-900">{selectedEmployee.name}</span> from the payroll? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => setShowRemoveModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleRemoveEmployee(selectedEmployee.id);
                    setShowRemoveModal(false);
                    setSelectedEmployee(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}