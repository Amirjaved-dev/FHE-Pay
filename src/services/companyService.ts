/**
 * Company Service for handling company and employee-related API calls
 */

import { apiClient, ApiResponse } from './apiClient';

export interface Company {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  contract_address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  user_id: string;
  company_id: string;
  position: string | null;
  salary_amount: number | null;
  salary_token: string | null;
  stream_id: string | null;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
  // Joined user data
  users?: {
    id: string;
    email: string;
    full_name: string | null;
    wallet_address: string | null;
  };
}

export interface CreateCompanyData {
  name: string;
  description?: string;
  owner_id: string;
  wallet_address?: string;
}

export interface UpdateCompanyData {
  name?: string;
  description?: string;
  contract_address?: string;
}

export interface CreateEmployeeData {
  user_id: string;
  company_id: string;
  position?: string;
  salary_amount?: number;
  salary_token?: string;
  stream_id?: string;
}

export interface UpdateEmployeeData {
  position?: string;
  salary_amount?: number;
  salary_token?: string;
  stream_id?: string;
  status?: 'active' | 'inactive' | 'pending';
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

class CompanyService {
  /**
   * Create a new company
   */
  async createCompany(companyData: CreateCompanyData): Promise<Company> {
    const response = await apiClient.post<ApiResponse<{ company: Company }>>('/api/companies', companyData);
    return response.company;
  }

  /**
   * Get company by ID
   */
  async getCompanyById(id: string): Promise<Company> {
    const response = await apiClient.get<ApiResponse<{ company: Company }>>(`/api/companies/${id}`);
    return response.company;
  }

  /**
   * Get companies by owner
   */
  async getCompaniesByOwner(ownerId: string, options?: PaginationOptions): Promise<Company[]> {
    const response = await apiClient.get<ApiResponse<{ companies: Company[] }>>(
      `/api/companies/owner/${ownerId}`,
      options
    );
    return response.companies || [];
  }

  /**
   * Update company
   */
  async updateCompany(id: string, updates: UpdateCompanyData): Promise<Company> {
    const response = await apiClient.put<ApiResponse<{ company: Company }>>(`/api/companies/${id}`, updates);
    return response.company;
  }

  /**
   * Delete company
   */
  async deleteCompany(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<ApiResponse>(`/api/companies/${id}`);
    return {
      message: response.message || 'Company deleted successfully'
    };
  }

  /**
   * Add employee to company
   */
  async addEmployee(employeeData: CreateEmployeeData): Promise<Employee> {
    const response = await apiClient.post<ApiResponse<{ employee: Employee }>>(
      `/api/companies/${employeeData.company_id}/employees`,
      employeeData
    );
    return response.employee;
  }

  /**
   * Get employees by company
   */
  async getEmployeesByCompany(companyId: string, options?: PaginationOptions): Promise<Employee[]> {
    const response = await apiClient.get<ApiResponse<{ employees: Employee[] }>>(
      `/api/companies/${companyId}/employees`,
      options
    );
    return response.employees || [];
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(companyId: string, employeeId: string): Promise<Employee> {
    const response = await apiClient.get<ApiResponse<{ employee: Employee }>>(
      `/api/companies/${companyId}/employees/${employeeId}`
    );
    return response.employee;
  }

  /**
   * Update employee
   */
  async updateEmployee(companyId: string, employeeId: string, updates: UpdateEmployeeData): Promise<Employee> {
    const response = await apiClient.put<ApiResponse<{ employee: Employee }>>(
      `/api/companies/${companyId}/employees/${employeeId}`,
      updates
    );
    return response.employee;
  }

  /**
   * Remove employee from company
   */
  async removeEmployee(companyId: string, employeeId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<ApiResponse>(
      `/api/companies/${companyId}/employees/${employeeId}`
    );
    return {
      message: response.message || 'Employee removed successfully'
    };
  }

  /**
   * Get all companies (admin only)
   */
  async getAllCompanies(options?: PaginationOptions): Promise<Company[]> {
    const response = await apiClient.get<ApiResponse<{ companies: Company[] }>>('/api/companies', options);
    return response.companies || [];
  }

  /**
   * Search companies by name
   */
  async searchCompanies(query: string, options?: PaginationOptions): Promise<Company[]> {
    const response = await apiClient.get<ApiResponse<{ companies: Company[] }>>('/api/companies/search', {
      q: query,
      ...options
    });
    return response.companies || [];
  }

  /**
   * Get company statistics
   */
  async getCompanyStats(companyId: string): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    totalSalaryAmount: number;
    averageSalary: number;
  }> {
    const response = await apiClient.get<ApiResponse<{
      stats: {
        totalEmployees: number;
        activeEmployees: number;
        totalSalaryAmount: number;
        averageSalary: number;
      }
    }>>(`/api/companies/${companyId}/stats`);
    return response.stats;
  }
}

// Export singleton instance
export const companyService = new CompanyService();
export default companyService;