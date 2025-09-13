-- Fix RLS policies for wallet-based authentication
-- Drop existing policies that rely on auth.uid()
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Company owners can manage their companies" ON companies;
DROP POLICY IF EXISTS "Employees can view their company" ON companies;
DROP POLICY IF EXISTS "Company owners can manage employees" ON employees;
DROP POLICY IF EXISTS "Users can view own employee records" ON employees;
DROP POLICY IF EXISTS "Company owners can view company transactions" ON transactions;
DROP POLICY IF EXISTS "Employees can view their transactions" ON transactions;
DROP POLICY IF EXISTS "Company owners can insert transactions" ON transactions;

-- Create new RLS policies that work with wallet-based authentication
-- Since we're not using Supabase Auth, we'll allow authenticated role full access
-- and use application-level security

-- Users table policies
CREATE POLICY "Allow authenticated users full access to users" ON users
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon users to insert for registration" ON users
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon users to select for login check" ON users
    FOR SELECT TO anon USING (true);

-- Companies table policies
CREATE POLICY "Allow authenticated users full access to companies" ON companies
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon users to select companies" ON companies
    FOR SELECT TO anon USING (true);

-- Employees table policies
CREATE POLICY "Allow authenticated users full access to employees" ON employees
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon users to select employees" ON employees
    FOR SELECT TO anon USING (true);

-- Transactions table policies
CREATE POLICY "Allow authenticated users full access to transactions" ON transactions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon users to select transactions" ON transactions
    FOR SELECT TO anon USING (true);

-- Grant INSERT permissions to anon role for user registration
GRANT INSERT ON users TO anon;
GRANT INSERT ON companies TO anon;
GRANT INSERT ON employees TO anon;
GRANT INSERT ON transactions TO anon;

-- Grant UPDATE permissions to anon role for wallet-based operations
GRANT UPDATE ON users TO anon;
GRANT UPDATE ON companies TO anon;
GRANT UPDATE ON employees TO anon;
GRANT UPDATE ON transactions TO anon;

-- Grant DELETE permissions to anon role
GRANT DELETE ON users TO anon;
GRANT DELETE ON companies TO anon;
GRANT DELETE ON employees TO anon;
GRANT DELETE ON transactions TO anon;