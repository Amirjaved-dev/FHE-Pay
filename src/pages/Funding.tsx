import { useState, useEffect, useCallback } from 'react';
import { 
  BanknotesIcon,
  PlusIcon,
  ArrowUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { contractService } from '../services/contractService';
import { useWallet } from '../hooks/useWallet';
import toast from 'react-hot-toast';

interface FundingHistory {
  id: string;
  amount: string;
  currency: 'cUSDT' | 'cETH';
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
}

export default function Funding() {
  const { address } = useWallet();
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [fundingHistory, setFundingHistory] = useState<FundingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<'cUSDT' | 'cETH'>('cUSDT');
  const [isDepositing, setIsDepositing] = useState(false);

  const loadFundingData = useCallback(async (isRetry = false) => {
    if (!address) return;
    
    try {
      setLoading(true);
      if (!isRetry) {
        setError(null);
      }
      
      // Simulate occasional failures for testing
      if (Math.random() < 0.12 && retryCount < 2) {
        throw new Error('Failed to connect to blockchain network');
      }
      
      // Load current balance
      const balance = await contractService.getEncryptedBalance(address, address);
      setCurrentBalance(balance);
      
      // Mock funding history - in real app, this would come from contract events
      setFundingHistory([
        {
          id: '1',
          amount: '50000',
          currency: 'cUSDT',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'completed',
          txHash: '0x1234567890abcdef1234567890abcdef12345678'
        },
        {
          id: '2',
          amount: '25000',
          currency: 'cUSDT',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          status: 'completed',
          txHash: '0xabcdef1234567890abcdef1234567890abcdef12'
        },
        {
          id: '3',
          amount: '10000',
          currency: 'cUSDT',
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
          status: 'completed',
          txHash: '0x567890abcdef1234567890abcdef1234567890ab'
        }
      ]);
      setRetryCount(0);
    } catch (error) {
      console.error('Error loading funding data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load funding data';
      setError(errorMessage);
      
      if (retryCount < 3) {
        toast.error(`${errorMessage}. Retrying...`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => loadFundingData(true), 2000 * (retryCount + 1));
      } else {
        toast.error('Failed to load funding data after multiple attempts');
      }
    } finally {
      setLoading(false);
    }
  }, [address, retryCount]);

  const handleRetry = () => {
    setRetryCount(0);
    loadFundingData();
  };

  useEffect(() => {
    loadFundingData();
  }, [loadFundingData]);

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setIsDepositing(true);
      
      // Deposit funds
      const txHash = await contractService.depositFunds({
        amount: parseFloat(depositAmount),
        tokenType: 'USDT' as 'USDT' | 'ETH'
      });
      
      // Add to history
      const newDeposit: FundingHistory = {
        id: Date.now().toString(),
        amount: depositAmount,
        currency: selectedCurrency,
        timestamp: new Date(),
        status: 'completed',
        txHash
      };
      
      setFundingHistory(prev => [newDeposit, ...prev]);
      setCurrentBalance(prev => prev + parseFloat(depositAmount));
      setDepositAmount('');
      setShowDepositModal(false);
      toast.success('Funds deposited successfully!');
    } catch (error) {
      console.error('Error depositing funds:', error);
      toast.error('Failed to deposit funds');
    } finally {
      setIsDepositing(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <div className="animate-pulse space-y-2">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>

        {/* Balance Card Skeleton */}
        <div className="bg-gray-200 overflow-hidden shadow rounded-lg animate-pulse">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gray-300 rounded"></div>
              </div>
              <div className="ml-5 w-0 flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Skeleton */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="animate-pulse flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 bg-gray-200 rounded"></div>
                  </div>
                  <div className="ml-5 w-0 flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && retryCount >= 3) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-red-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Unable to Load Funding Data</h3>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Payroll Funding</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your company's payroll funds with encrypted deposits.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowDepositModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Deposit Funds
          </button>
        </div>
      </div>

      {/* Balance Card - Mobile optimized */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 overflow-hidden shadow rounded-lg">
        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BanknotesIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div className="ml-3 sm:ml-5 w-0 flex-1">
              <dl>
                <dt className="text-xs sm:text-sm font-medium text-purple-100">
                  Current Balance
                </dt>
                <dd className="text-xl sm:text-3xl font-bold text-white">
                  {currentBalance.toLocaleString()} cUSDT
                </dd>
              </dl>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => setShowDepositModal(true)}
                className="inline-flex items-center px-3 py-2 border border-white/20 text-xs sm:text-sm font-medium rounded-md text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Funds
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Funding Statistics - Mobile optimized */}
      <div className="grid grid-cols-1 gap-3 sm:gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-3 sm:p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <ArrowUpIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-3 sm:ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500">
                    Total Deposited
                  </dt>
                  <dd className="text-sm sm:text-lg font-medium text-gray-900">
                    {fundingHistory
                      .filter(h => h.status === 'completed')
                      .reduce((sum, h) => sum + parseFloat(h.amount), 0)
                      .toLocaleString()} cUSDT
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-3 sm:p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <BanknotesIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-3 sm:ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500">
                    This Month
                  </dt>
                  <dd className="text-sm sm:text-lg font-medium text-gray-900">
                    {fundingHistory
                      .filter(h => {
                        const now = new Date();
                        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                        return h.timestamp >= monthStart && h.status === 'completed';
                      })
                      .reduce((sum, h) => sum + parseFloat(h.amount), 0)
                      .toLocaleString()} cUSDT
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-3 sm:p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-3 sm:ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500">
                    Transactions
                  </dt>
                  <dd className="text-sm sm:text-lg font-medium text-gray-900">
                    {fundingHistory.filter(h => h.status === 'completed').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Funding History - Mobile optimized */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">
                Funding History
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Recent deposits and funding transactions.
              </p>
            </div>
            <div className="mt-3 sm:mt-0">
              <button
                onClick={() => setShowDepositModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                aria-label="Add funds to company wallet"
              >
                <PlusIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                Add Funds
              </button>
            </div>
          </div>
        </div>
        <ul className="divide-y divide-gray-200">
          {fundingHistory.map((transaction) => (
            <li key={transaction.id}>
              <div className="px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        transaction.status === 'completed' ? 'bg-green-100' :
                        transaction.status === 'pending' ? 'bg-yellow-100' :
                        'bg-red-100'
                      }`}>
                        {getStatusIcon(transaction.status)}
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Deposited {parseFloat(transaction.amount).toLocaleString()} {transaction.currency}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {formatTimeAgo(transaction.timestamp)}
                      </p>
                      {transaction.txHash && (
                        <p className="text-xs text-gray-400 font-mono">
                          {transaction.txHash.slice(0, 10)}...{transaction.txHash.slice(-8)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        {fundingHistory.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <BanknotesIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No funding history</h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Start by making your first deposit.
            </p>
            <div className="mt-4 sm:mt-6">
              <button
                type="button"
                onClick={() => setShowDepositModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Deposit Funds
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="deposit-modal-title"
          aria-describedby="deposit-modal-description"
        >
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 id="deposit-modal-title" className="text-lg font-medium text-gray-900 mb-4">Deposit Funds</h3>
              <p id="deposit-modal-description" className="sr-only">Add funds to your company wallet for payroll payments</p>
              <form onSubmit={(e) => { e.preventDefault(); handleDeposit(); }} className="space-y-4">
                <div>
                  <label htmlFor="currency-select" className="block text-sm font-medium text-gray-700">Currency *</label>
                  <select
                    id="currency-select"
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value as 'cUSDT' | 'cETH')}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    required
                    aria-describedby="currency-help"
                  >
                    <option value="cUSDT">cUSDT (Confidential USDT)</option>
                    <option value="cETH">cETH (Confidential ETH)</option>
                  </select>
                  <p id="currency-help" className="sr-only">Select the type of cryptocurrency to deposit</p>
                </div>
                <div>
                  <label htmlFor="deposit-amount" className="block text-sm font-medium text-gray-700">Amount *</label>
                  <input
                    id="deposit-amount"
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="10000"
                    min="0"
                    step="0.01"
                    required
                    aria-describedby="amount-help"
                  />
                  <p id="amount-help" className="sr-only">Enter the amount to deposit in the selected currency</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-md" role="note" aria-labelledby="privacy-note">
                  <p id="privacy-note" className="text-sm text-blue-800">
                    <strong>Note:</strong> Funds will be encrypted using FHE technology to ensure complete privacy.
                  </p>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowDepositModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    aria-label="Cancel deposit"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDepositing}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={isDepositing ? 'Processing deposit...' : 'Confirm deposit'}
                  >
                    {isDepositing ? 'Depositing...' : 'Deposit Funds'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}