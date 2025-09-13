-- Grant all necessary permissions to anon and authenticated roles
-- This should fix the 406 errors

-- Grant SELECT permissions
GRANT SELECT ON users TO anon;
GRANT SELECT ON companies TO anon;
GRANT SELECT ON employees TO anon;
GRANT SELECT ON transactions TO anon;

GRANT SELECT ON users TO authenticated;
GRANT SELECT ON companies TO authenticated;
GRANT SELECT ON employees TO authenticated;
GRANT SELECT ON transactions TO authenticated;

-- Grant INSERT permissions
GRANT INSERT ON users TO anon;
GRANT INSERT ON companies TO anon;
GRANT INSERT ON employees TO anon;
GRANT INSERT ON transactions TO anon;

GRANT INSERT ON users TO authenticated;
GRANT INSERT ON companies TO authenticated;
GRANT INSERT ON employees TO authenticated;
GRANT INSERT ON transactions TO authenticated;

-- Grant UPDATE permissions
GRANT UPDATE ON users TO anon;
GRANT UPDATE ON companies TO anon;
GRANT UPDATE ON employees TO anon;
GRANT UPDATE ON transactions TO anon;

GRANT UPDATE ON users TO authenticated;
GRANT UPDATE ON companies TO authenticated;
GRANT UPDATE ON employees TO authenticated;
GRANT UPDATE ON transactions TO authenticated;

-- Grant DELETE permissions
GRANT DELETE ON users TO anon;
GRANT DELETE ON companies TO anon;
GRANT DELETE ON employees TO anon;
GRANT DELETE ON transactions TO anon;

GRANT DELETE ON users TO authenticated;
GRANT DELETE ON companies TO authenticated;
GRANT DELETE ON employees TO authenticated;
GRANT DELETE ON transactions TO authenticated;

-- Grant USAGE on sequences (needed for auto-increment IDs)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify permissions
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND grantee IN ('anon', 'authenticated') 
AND table_name IN ('users', 'companies', 'employees', 'transactions')
ORDER BY table_name, grantee, privilege_type;