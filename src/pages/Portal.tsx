import { useState, useEffect, useCallback } from 'react';
import { 
  EyeIcon,
  EyeSlashIcon,
  ArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { contractService } from '../services/contractService';
import { useWallet } from '../hooks/useWallet';
import toast from 'react-hot-toast';

interface WithdrawalHistory {
  id: string;
  amount: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
}

export default function Portal() {
  const { address } = useWallet();
  const [encryptedBalance, setEncryptedBalance] = useState<number>(0);
  const [decryptedBalance, setDecryptedBalance] = useState<number>(0);
  const [showBalance, setShowBalance] = useState(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [streamInfo, setStreamInfo] = useState<{
    isActive: boolean;
    monthlySalary: string;
    company: string;
  } | null>(null);

  const loadPortalData = useCallback(async () => {
    if (!address) return;
    
    try {
      setLoading(true);
      
      // Load encrypted balance
      const balance = await contractService.getEncryptedBalance(address, address);
      setEncryptedBalance(balance);
      
      // Mock stream info - in real app, this would come from contract
      setStreamInfo({
        isActive: true,
        monthlySalary: '5000',
        company: 'Tech Corp Inc.'
      });
      
      // Mock withdrawal history
      setWithdrawalHistory([
        {
          id: '1',
          amount: '2500',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          status: 'completed',
          txHash: '0x1234567890abcdef1234567890abcdef12345678'
        },
        {
          id: '2',
          amount: '1000',
          timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
          status: 'completed',
          txHash: '0xabcdef1234567890abcdef1234567890abcdef12'
        }
      ]);
    } catch (error) {
      console.error('Error loading portal data:', error);
      toast.error('Failed to load portal data');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    loadPortalData();
  }, [loadPortalData]);

  const handleDecryptBalance = async () => {
    if (!encryptedBalance) return;
    
    try {
      setIsDecrypting(true);
      // Balance is already decrypted from getEncryptedBalance
       const decrypted = encryptedBalance;
       setDecryptedBalance(decrypted);
      setShowBalance(true);
      toast.success('Balance decrypted successfully');
    } catch (error) {
      console.error('Error decrypting balance:', error);
      toast.error('Failed to decrypt balance');
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(withdrawAmount) > decryptedBalance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      setIsWithdrawing(true);
      
      const txHash = await contractService.withdraw(address);
      
      // Add to withdrawal history
      const newWithdrawal: WithdrawalHistory = {
        id: Date.now().toString(),
        amount: withdrawAmount,
        timestamp: new Date(),
        status: 'completed',
        txHash
      };
      
      setWithdrawalHistory(prev => [newWithdrawal, ...prev]);
      
      // Update balance
      const newBalance = decryptedBalance - parseFloat(withdrawAmount);
      setDecryptedBalance(newBalance);
      
      setWithdrawAmount('');
      setShowWithdrawModal(false);
      toast.success('Withdrawal completed successfully!');
    } catch (error) {
      console.error('Error withdrawing:', error);
      toast.error('Failed to process withdrawal');
    } finally {
      setIsWithdrawing(false);
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!streamInfo?.isActive) {
    return (
      <div className="text-center py-12">
        <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No Active Salary Stream</h3>
        <p className="mt-1 text-sm text-gray-500">
          You don't have an active salary stream. Please contact your company owner.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900">Employee Portal</h1>
          <p className="mt-1 text-sm text-gray-500">
            View your private salary information and manage withdrawals.
          </p>
        </div>
      </div>

      {/* Stream Info */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">Salary Stream</h3>
              <p className="text-blue-100">{streamInfo.company}</p>
              <p className="text-sm text-blue-200">
                Monthly Salary: {parseFloat(streamInfo.monthlySalary).toLocaleString()} cUSDT
              </p>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Available Balance</h3>
                <div className="mt-2">
                  {showBalance ? (
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl font-bold text-gray-900">
                        {decryptedBalance.toLocaleString()} cUSDT
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowBalance(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <EyeSlashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl font-bold text-gray-400">••••••</span>
                      <button
                        type="button"
                        onClick={handleDecryptBalance}
                        disabled={isDecrypting}
                        className="inline-flex items-center text-purple-600 hover:text-purple-800 disabled:opacity-50"
                      >
                        <EyeIcon className="h-5 w-5 mr-1" />
                        {isDecrypting ? 'Decrypting...' : 'Show Balance'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {showBalance && (
              <button
                type="button"
                onClick={() => setShowWithdrawModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <ArrowDownIcon className="-ml-1 mr-2 h-4 w-4" />
                Withdraw
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <EyeSlashIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Your Privacy is Protected
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Your salary information is encrypted using Fully Homomorphic Encryption (FHE). 
                Only you can decrypt and view your balance. Even your company owner cannot see your current balance or withdrawal history.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal History */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Withdrawal History
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Your private withdrawal transactions.
          </p>
        </div>
        <ul className="divide-y divide-gray-200">
          {withdrawalHistory.map((withdrawal) => (
            <li key={withdrawal.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getStatusIcon(withdrawal.status)}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Withdrew {parseFloat(withdrawal.amount).toLocaleString()} cUSDT
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatTimeAgo(withdrawal.timestamp)}
                      </p>
                      {withdrawal.txHash && (
                        <p className="text-xs text-gray-400 font-mono">
                          {withdrawal.txHash.slice(0, 10)}...{withdrawal.txHash.slice(-8)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      withdrawal.status === 'completed' ? 'bg-green-100 text-green-800' :
                      withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        {withdrawalHistory.length === 0 && (
          <div className="text-center py-12">
            <ArrowDownIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No withdrawals yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your withdrawal history will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Withdraw Funds</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount (cUSDT)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="1000"
                    min="0"
                    max={decryptedBalance}
                    step="0.01"
                  />
                </div>
                <div className="text-sm text-gray-500">
                  Available: {decryptedBalance.toLocaleString()} cUSDT
                </div>
                <div className="bg-yellow-50 p-3 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Withdrawals are processed immediately and cannot be reversed.
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleWithdraw}
                  disabled={isWithdrawing}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {isWithdrawing ? 'Processing...' : 'Withdraw'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}