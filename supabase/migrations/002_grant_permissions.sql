-- Grant permissions to authenticated users
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON companies TO authenticated;
GRANT ALL PRIVILEGES ON employees TO authenticated;
GRANT ALL PRIVILEGES ON transactions TO authenticated;

-- Grant basic read access to anonymous users
GRANT SELECT ON users TO anon;
GRANT SELECT ON companies TO anon;
GRANT SELECT ON employees TO anon;
GRANT SELECT ON transactions TO anon;

-- Grant usage on custom types
GRANT USAGE ON TYPE user_role TO authenticated, anon;
GRANT USAGE ON TYPE employee_status TO authenticated, anon;
GRANT USAGE ON TYPE transaction_type TO authenticated, anon;
GRANT USAGE ON TYPE transaction_status TO authenticated, anon;