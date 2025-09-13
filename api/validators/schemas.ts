import { z } from 'zod';

// User validation schemas
export const userRegistrationSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['owner', 'admin', 'employee'], {
    errorMap: () => ({ message: 'Role must be owner, admin, or employee' })
  })
});

export const userSignInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const userProfileUpdateSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url('Invalid avatar URL').optional()
});

// Company validation schemas
export const companyCreateSchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  description: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().url('Invalid website URL').optional(),
  wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address').optional()
});

export const companyUpdateSchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters').optional(),
  description: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().url('Invalid website URL').optional(),
  wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address').optional()
});

// Employee validation schemas
export const employeeCreateSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  position: z.string().min(2, 'Position must be at least 2 characters'),
  department: z.string().optional(),
  salary: z.number().positive('Salary must be positive').optional(),
  start_date: z.string().datetime('Invalid start date').optional(),
  wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address').optional(),
  status: z.enum(['active', 'inactive', 'pending'], {
    errorMap: () => ({ message: 'Status must be active, inactive, or pending' })
  }).default('pending')
});

export const employeeUpdateSchema = z.object({
  position: z.string().min(2, 'Position must be at least 2 characters').optional(),
  department: z.string().optional(),
  salary: z.number().positive('Salary must be positive').optional(),
  start_date: z.string().datetime('Invalid start date').optional(),
  wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address').optional(),
  status: z.enum(['active', 'inactive', 'pending'], {
    errorMap: () => ({ message: 'Status must be active, inactive, or pending' })
  }).optional()
});

// Transaction validation schemas
export const transactionCreateSchema = z.object({
  company_id: z.string().uuid('Invalid company ID'),
  employee_id: z.string().uuid('Invalid employee ID').optional(),
  type: z.enum(['salary', 'bonus', 'deposit', 'withdrawal'], {
    errorMap: () => ({ message: 'Type must be salary, bonus, deposit, or withdrawal' })
  }),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('cUSDT'),
  tx_hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash').optional(),
  block_number: z.number().positive('Block number must be positive').optional(),
  metadata: z.record(z.any()).optional()
});

export const transactionUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'failed'], {
    errorMap: () => ({ message: 'Status must be pending, confirmed, or failed' })
  }).optional(),
  tx_hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash').optional(),
  block_number: z.number().positive('Block number must be positive').optional(),
  metadata: z.record(z.any()).optional()
});

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(100)).default('10')
});

export const companyEmployeesQuerySchema = paginationSchema.extend({
  status: z.enum(['active', 'inactive', 'pending']).optional(),
  department: z.string().optional()
});

export const transactionQuerySchema = paginationSchema.extend({
  type: z.enum(['salary', 'bonus', 'deposit', 'withdrawal']).optional(),
  status: z.enum(['pending', 'confirmed', 'failed']).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional()
});

// ID parameter schemas
export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid ID format')
});

export const walletAddressParamSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address')
});