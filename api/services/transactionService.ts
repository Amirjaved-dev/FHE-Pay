import { supabase } from '../config/supabase';
import { Database } from '../../supabase/client';
import { ValidationError, NotFoundError } from '../middleware/errorHandler';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

// Type for transaction with joined data
type TransactionWithJoins = Transaction & {
  employees: Database['public']['Tables']['employees']['Row'] & {
    users: Database['public']['Tables']['users']['Row'];
  };
  companies: Database['public']['Tables']['companies']['Row'];
};

export class TransactionService {
  // Create a new transaction record
  static async createTransaction(transactionData: {
    company_id: string;
    employee_id: string;
    amount: number;
    transaction_type: 'stream_create' | 'withdraw' | 'fund' | 'cancel';
    blockchain_tx_hash?: string;
    encrypted_amount?: string;
    description?: string;
  }): Promise<TransactionWithJoins> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          company_id: transactionData.company_id,
          employee_id: transactionData.employee_id,
          amount: transactionData.amount,
          transaction_type: transactionData.transaction_type,
          transaction_hash: transactionData.blockchain_tx_hash || '',
          status: 'pending' as const,
        })
        .select(`
          *,
          employees!inner(
            *,
            users!inner(*)
          ),
          companies!inner(*)
        `)
        .single();

      if (error) {
        if (error.message.includes('duplicate key')) {
          throw new ValidationError('Transaction with this hash already exists');
        }
        throw new ValidationError(`Failed to create transaction: ${error.message}`);
      }
      return data;
    } catch (error) {
      console.error('Create transaction error:', error);
      throw error;
    }
  }

  // Get transaction by ID
  static async getTransactionById(transactionId: string): Promise<TransactionWithJoins> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          employees!inner(
            *,
            users!inner(*)
          ),
          companies!inner(*)
        `)
        .eq('id', transactionId)
        .single();

      if (error) {
        throw new ValidationError(`Failed to fetch transaction: ${error.message}`);
      }

      if (!data) {
        throw new NotFoundError('Transaction not found');
      }
      return data;
    } catch (error) {
      console.error('Get transaction error:', error);
      throw error;
    }
  }

  // Get transactions by company
  static async getTransactionsByCompany(
    companyId: string,
    options?: {
      limit?: number;
      offset?: number;
      status?: 'pending' | 'confirmed' | 'failed';
      transaction_type?: 'stream_create' | 'withdraw' | 'fund' | 'cancel';
    }
  ): Promise<TransactionWithJoins[]> {
    try {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          employees!inner(
            *,
            users!inner(*)
          ),
          companies!inner(*)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.transaction_type) {
        query = query.eq('transaction_type', options.transaction_type);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw new ValidationError(`Failed to fetch transactions: ${error.message}`);
      }
      return data;
    } catch (error) {
      console.error('Get transactions by company error:', error);
      throw error;
    }
  }

  // Get transactions by employee
  static async getTransactionsByEmployee(
    employeeId: string,
    options?: {
      limit?: number;
      offset?: number;
      status?: 'pending' | 'confirmed' | 'failed';
    }
  ): Promise<TransactionWithJoins[]> {
    try {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          employees!inner(
            *,
            users!inner(*)
          ),
          companies!inner(*)
        `)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw new ValidationError(`Failed to fetch transactions: ${error.message}`);
      }
      return data;
    } catch (error) {
      console.error('Get transactions by employee error:', error);
      throw error;
    }
  }

  // Update transaction status
  static async updateTransactionStatus(
    transactionId: string,
    status: 'pending' | 'confirmed' | 'failed',
    blockchainTxHash?: string
  ): Promise<TransactionWithJoins> {
    try {
      const updates: TransactionUpdate = { status };
      
      if (blockchainTxHash) {
        updates.transaction_hash = blockchainTxHash;
      }

      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', transactionId)
        .select(`
          *,
          employees!inner(
            *,
            users!inner(*)
          ),
          companies!inner(*)
        `)
        .single();

      if (error) {
        throw new ValidationError(`Failed to update transaction: ${error.message}`);
      }

      if (!data) {
        throw new NotFoundError('Transaction not found or update failed');
      }
      return data;
    } catch (error) {
      console.error('Update transaction status error:', error);
      throw error;
    }
  }

  // Sync blockchain transaction
  static async syncBlockchainTransaction(transactionData: {
    blockchain_tx_hash: string;
    company_id: string;
    employee_id: string;
    amount: number;
    transaction_type: 'stream_create' | 'withdraw' | 'fund' | 'cancel';
  }): Promise<TransactionWithJoins> {
    try {
      // Check if transaction already exists
      const { data: existingTx } = await supabase
        .from('transactions')
        .select('id')
        .eq('transaction_hash', transactionData.blockchain_tx_hash)
        .maybeSingle();

      if (existingTx) {
        // Update existing transaction
        return await this.updateTransactionStatus(
          existingTx.id,
          'confirmed',
          transactionData.blockchain_tx_hash
        );
      } else {
        // Create new transaction record
        return await this.createTransaction({
          company_id: transactionData.company_id,
          employee_id: transactionData.employee_id,
          amount: transactionData.amount,
          transaction_type: transactionData.transaction_type,
          blockchain_tx_hash: transactionData.blockchain_tx_hash,
        });
      }
    } catch (error) {
      console.error('Sync blockchain transaction error:', error);
      throw error;
    }
  }

  // Get transaction statistics for a company
  static async getCompanyTransactionStats(companyId: string): Promise<{
    total_transactions: number;
    total_amount: number;
    pending_transactions: number;
    confirmed_transactions: number;
    failed_transactions: number;
    by_type: {
      stream_create: number;
      withdraw: number;
      fund: number;
      cancel: number;
    };
  }> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, transaction_type, status')
        .eq('company_id', companyId) as {
        data: Array<{
          amount: number | null;
          transaction_type: 'stream_create' | 'withdraw' | 'fund' | 'cancel';
          status: 'pending' | 'confirmed' | 'failed';
        }> | null;
        error: unknown;
      };

      if (error) throw error;

      const stats = {
        total_transactions: data.length,
        total_amount: data.reduce((sum, tx) => sum + tx.amount, 0),
        pending_transactions: data.filter(tx => tx.status === 'pending').length,
        confirmed_transactions: data.filter(tx => tx.status === 'confirmed').length,
        failed_transactions: data.filter(tx => tx.status === 'failed').length,
        by_type: {
          stream_create: data.filter(tx => tx.transaction_type === 'stream_create').length,
          withdraw: data.filter(tx => tx.transaction_type === 'withdraw').length,
          fund: data.filter(tx => tx.transaction_type === 'fund').length,
          cancel: data.filter(tx => tx.transaction_type === 'cancel').length,
        },
      };

      return stats;
    } catch (error) {
      console.error('Get company transaction stats error:', error);
      throw error;
    }
  }
}