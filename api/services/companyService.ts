import { supabase } from '../config/supabase';
import { Database } from '../../supabase/client';
import { ValidationError, NotFoundError } from '../middleware/errorHandler';

type CompanyUpdate = Database['public']['Tables']['companies']['Update'];

export class CompanyService {
  // Create a new company
  static async createCompany(companyData: {
    name: string;
    description?: string;
    owner_id: string;
    wallet_address?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: companyData.name,
          description: companyData.description,
          owner_id: companyData.owner_id,
          wallet_address: companyData.wallet_address,
        })
        .select()
        .single();

      if (error) {
        if (error.message.includes('duplicate key')) {
          throw new ValidationError('Company with this name already exists');
        }
        throw new ValidationError(`Failed to create company: ${error.message}`);
      }
      return data;
    } catch (error) {
      console.error('Create company error:', error);
      throw error;
    }
  }

  // Get company by ID
  static async getCompanyById(companyId: string) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      if (error) {
        throw new ValidationError(`Failed to fetch company: ${error.message}`);
      }

      if (!data) {
        throw new NotFoundError('Company not found');
      }
      return data;
    } catch (error) {
      console.error('Get company error:', error);
      throw error;
    }
  }

  // Get companies by owner
  static async getCompaniesByOwner(ownerId: string) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new ValidationError(`Failed to fetch companies: ${error.message}`);
      }
      return data;
    } catch (error) {
      console.error('Get companies by owner error:', error);
      throw error;
    }
  }

  // Update company
  static async updateCompany(companyId: string, updates: CompanyUpdate) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', companyId)
        .select()
        .single();

      if (error) {
        throw new ValidationError(`Failed to update company: ${error.message}`);
      }

      if (!data) {
        throw new NotFoundError('Company not found or update failed');
      }
      return data;
    } catch (error) {
      console.error('Update company error:', error);
      throw error;
    }
  }

  // Add employee to company
  static async addEmployee(employeeData: {
    company_id: string;
    user_id: string;
    position?: string;
    salary?: number;
    wallet_address?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert({
          company_id: employeeData.company_id,
          user_id: employeeData.user_id,
          position: employeeData.position,
          salary: employeeData.salary,
          wallet_address: employeeData.wallet_address,
          status: 'active' as const,
        })
        .select(`
          *,
          users!inner(*)
        `)
        .single();

      if (error) {
        if (error.message.includes('duplicate key')) {
          throw new ValidationError('Employee already exists in this company');
        }
        throw new ValidationError(`Failed to add employee: ${error.message}`);
      }
      return data;
    } catch (error) {
      console.error('Add employee error:', error);
      throw error;
    }
  }

  // Get company employees
  static async getCompanyEmployees(companyId: string) {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          users!inner(*)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new ValidationError(`Failed to fetch employees: ${error.message}`);
      }
      return data;
    } catch (error) {
      console.error('Get company employees error:', error);
      throw error;
    }
  }

  // Update employee
  static async updateEmployee(employeeId: string, updates: {
    position?: string;
    salary?: number;
    status?: 'active' | 'inactive' | 'pending';
    wallet_address?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', employeeId)
        .select(`
          *,
          users!inner(*)
        `)
        .single();

      if (error) {
        throw new ValidationError(`Failed to update employee: ${error.message}`);
      }

      if (!data) {
        throw new NotFoundError('Employee not found or update failed');
      }
      return data;
    } catch (error) {
      console.error('Update employee error:', error);
      throw error;
    }
  }

  // Remove employee from company
  static async removeEmployee(employeeId: string) {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update({ status: 'inactive' as const })
        .eq('id', employeeId)
        .select()
        .single();

      if (error) {
        throw new ValidationError(`Failed to remove employee: ${error.message}`);
      }
      return data;
    } catch (error) {
      console.error('Remove employee error:', error);
      throw error;
    }
  }

  // Get employee by user ID and company ID
  static async getEmployeeByUserAndCompany(userId: string, companyId: string) {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          users!inner(*),
          companies!inner(*)
        `)
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .single();

      if (error) {
        throw new ValidationError(`Failed to fetch employee: ${error.message}`);
      }

      if (!data) {
        throw new NotFoundError('Employee not found');
      }
      return data;
    } catch (error) {
      console.error('Get employee by user and company error:', error);
      throw error;
    }
  }
}