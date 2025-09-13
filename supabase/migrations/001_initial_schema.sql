-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'company', 'employee');
CREATE TYPE employee_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE transaction_type AS ENUM ('stream_create', 'withdraw', 'fund', 'cancel');
CREATE TYPE transaction_status AS ENUM ('pending', 'confirmed', 'failed');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    wallet_address TEXT UNIQUE,
    role user_role DEFAULT 'employee',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contract_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    position TEXT,
    salary_amount DECIMAL(20, 8),
    salary_token TEXT,
    stream_id TEXT,
    status employee_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, company_id)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    transaction_hash TEXT NOT NULL,
    transaction_type transaction_type NOT NULL,
    amount DECIMAL(20, 8),
    token_address TEXT,
    block_number BIGINT,
    status transaction_status DEFAULT 'pending',
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_companies_owner_id ON companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_company_id ON transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_employee_id ON transactions(employee_id);
CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Allow user registration" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Create RLS policies for companies table
CREATE POLICY "Company owners can manage their companies" ON companies
    FOR ALL USING (auth.uid()::text = owner_id::text);

CREATE POLICY "Employees can view their company" ON companies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM employees e 
            JOIN users u ON e.user_id = u.id 
            WHERE e.company_id = companies.id 
            AND u.id::text = auth.uid()::text
        )
    );

-- Create RLS policies for employees table
CREATE POLICY "Company owners can manage employees" ON employees
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM companies c 
            WHERE c.id = employees.company_id 
            AND c.owner_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can view own employee records" ON employees
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = employees.user_id 
            AND u.id::text = auth.uid()::text
        )
    );

-- Create RLS policies for transactions table
CREATE POLICY "Company owners can view company transactions" ON transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM companies c 
            WHERE c.id = transactions.company_id 
            AND c.owner_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Employees can view their transactions" ON transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM employees e 
            JOIN users u ON e.user_id = u.id 
            WHERE e.id = transactions.employee_id 
            AND u.id::text = auth.uid()::text
        )
    );

CREATE POLICY "Company owners can insert transactions" ON transactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM companies c 
            WHERE c.id = transactions.company_id 
            AND c.owner_id::text = auth.uid()::text
        )
    );

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions to anonymous users (for public access)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON users TO anon;
GRANT SELECT ON companies TO anon;
GRANT SELECT ON employees TO anon;
GRANT SELECT ON transactions TO anon;