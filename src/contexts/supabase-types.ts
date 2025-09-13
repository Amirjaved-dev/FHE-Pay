import { Database } from '../../supabase/client';

export type UserProfile = Database['public']['Tables']['users']['Row'];
export type Company = Database['public']['Tables']['companies']['Row'];
export type Employee = Database['public']['Tables']['employees']['Row'];

// Employee with joined users data
export type EmployeeWithUser = Employee & {
  users: UserProfile;
};