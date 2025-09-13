/**
 * Transaction Service for handling transaction-related API calls
 */

import { apiClient, ApiResponse } from './apiClient';

export interface Transaction {
  id: string;
  from_user_id: string;
  to_user_id: string;
  company_id: string;
  amount: number;
  token: string;
  transaction_hash: string | null;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  type: 'salary' | 'bonus' | 'reimbursement' | 'other';
  description: string | null;
  created_at: string;
  updated_at: string;
  // Joined user data
  from_user?: {
    id: string;
    email: string;
    full_name: string | null;
    wallet_address: string | null;
  };
  to_user?: {
    id: string;
    email: string;
    full_name: string | null;
    wallet_address: string | null;
  };
  company?: {
    id: string;
    name: string;
  };
}

export interface CreateTransactionData {
  from_user_id: string;
  to_user_id: string;
  company_id: string;
  amount: number;
  token: string;
  type: 'salary' | 'bonus' | 'reimbursement' | 'other';
  description?: string;
}

export interface UpdateTransactionData {
  transaction_hash?: string;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
}

export interface TransactionFilters {
  company_id?: string;
  from_user_id?: string;
  to_user_id?: string;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  type?: 'salary' | 'bonus' | 'reimbursement' | 'other';
  token?: string;
  start_date?: string;
  end_date?: string;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  sort_by?: 'created_at' | 'amount' | 'updated_at';
  sort_order?: 'asc' | 'desc';
}

export interface TransactionStats {
  totalTransactions: number;
  totalAmount: number;
  completedTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  averageAmount: number;
  transactionsByToken: Record<string, {
    count: number;
    totalAmount: number;
  }>;
}

class TransactionService {
  /**
   * Create a new transaction
   */
  async createTransaction(transactionData: CreateTransactionData): Promise<Transaction> {
    const response = await apiClient.post<ApiResponse<{ transaction: Transaction }>>('/api/transactions', transactionData);
    return response.transaction;
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string): Promise<Transaction> {
    const response = await apiClient.get<ApiResponse<{ transaction: Transaction }>>(`/api/transactions/${id}`);
    return response.transaction;
  }

  /**
   * Get transactions with filters and pagination
   */
  async getTransactions(filters?: TransactionFilters, options?: PaginationOptions): Promise<{
    transactions: Transaction[];
    total: number;
    hasMore: boolean;
  }> {
    const params = {
      ...filters,
      ...options
    };
    
    const response = await apiClient.get<ApiResponse<{
      transactions: Transaction[];
      total: number;
      hasMore: boolean;
    }>>('/api/transactions', params);
    
    return {
      transactions: response.transactions || [],
      total: response.total || 0,
      hasMore: response.hasMore || false
    };
  }

  /**
   * Get transactions by company
   */
  async getTransactionsByCompany(companyId: string, options?: PaginationOptions): Promise<{
    transactions: Transaction[];
    total: number;
    hasMore: boolean;
  }> {
    return this.getTransactions({ company_id: companyId }, options);
  }

  /**
   * Get transactions by user (sent or received)
   */
  async getTransactionsByUser(userId: string, type: 'sent' | 'received' | 'all' = 'all', options?: PaginationOptions): Promise<{
    transactions: Transaction[];
    total: number;
    hasMore: boolean;
  }> {
    const filters: TransactionFilters = {};
    
    if (type === 'sent') {
      filters.from_user_id = userId;
    } else if (type === 'received') {
      filters.to_user_id = userId;
    }
    // For 'all', we'll let the backend handle filtering by user involvement
    
    const params = {
      ...filters,
      ...options,
      user_id: type === 'all' ? userId : undefined
    };
    
    const response = await apiClient.get<ApiResponse<{
      transactions: Transaction[];
      total: number;
      hasMore: boolean;
    }>>('/api/transactions', params);
    
    return {
      transactions: response.transactions || [],
      total: response.total || 0,
      hasMore: response.hasMore || false
    };
  }

  /**
   * Update transaction
   */
  async updateTransaction(id: string, updates: UpdateTransactionData): Promise<Transaction> {
    const response = await apiClient.put<ApiResponse<{ transaction: Transaction }>>(`/api/transactions/${id}`, updates);
    return response.transaction;
  }

  /**
   * Cancel transaction (if pending)
   */
  async cancelTransaction(id: string): Promise<Transaction> {
    const response = await apiClient.patch<ApiResponse<{ transaction: Transaction }>>(`/api/transactions/${id}/cancel`);
    return response.transaction;
  }

  /**
   * Retry failed transaction
   */
  async retryTransaction(id: string): Promise<Transaction> {
    const response = await apiClient.patch<ApiResponse<{ transaction: Transaction }>>(`/api/transactions/${id}/retry`);
    return response.transaction;
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(filters?: TransactionFilters): Promise<TransactionStats> {
    const response = await apiClient.get<ApiResponse<{ stats: TransactionStats }>>('/api/transactions/stats', filters);
    return response.stats;
  }

  /**
   * Get company transaction statistics
   */
  async getCompanyTransactionStats(companyId: string): Promise<TransactionStats> {
    return this.getTransactionStats({ company_id: companyId });
  }

  /**
   * Get user transaction statistics
   */
  async getUserTransactionStats(userId: string): Promise<TransactionStats> {
    const response = await apiClient.get<ApiResponse<{ stats: TransactionStats }>>(`/api/transactions/stats/user/${userId}`);
    return response.stats;
  }

  /**
   * Search transactions
   */
  async searchTransactions(query: string, filters?: TransactionFilters, options?: PaginationOptions): Promise<{
    transactions: Transaction[];
    total: number;
    hasMore: boolean;
  }> {
    const params = {
      q: query,
      ...filters,
      ...options
    };
    
    const response = await apiClient.get<ApiResponse<{
      transactions: Transaction[];
      total: number;
      hasMore: boolean;
    }>>('/api/transactions/search', params);
    
    return {
      transactions: response.transactions || [],
      total: response.total || 0,
      hasMore: response.hasMore || false
    };
  }

  /**
   * Export transactions to CSV
   */
  async exportTransactions(filters?: TransactionFilters): Promise<Blob> {
    const response = await apiClient.get('/api/transactions/export', filters, {
      responseType: 'blob'
    });
    return response as Blob;
  }

  /**
   * Get pending transactions count
   */
  async getPendingTransactionsCount(companyId?: string): Promise<number> {
    const filters: TransactionFilters = { status: 'pending' };
    if (companyId) {
      filters.company_id = companyId;
    }
    
    const response = await apiClient.get<ApiResponse<{ count: number }>>('/api/transactions/count', filters);
    return response.count || 0;
  }
}

// Export singleton instance
export const transactionService = new TransactionService();
export default transactionService;