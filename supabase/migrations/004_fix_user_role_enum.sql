-- Fix user_role enum to use consistent values
-- Change 'company' to 'owner' to match validation schema

-- Remove the default constraint temporarily
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;

-- Create new enum type with correct values
CREATE TYPE user_role_new AS ENUM ('admin', 'owner', 'employee');

-- Update the users table to use the new enum, mapping 'company' to 'owner'
ALTER TABLE users ALTER COLUMN role TYPE user_role_new USING 
  CASE 
    WHEN role::text = 'company' THEN 'owner'::user_role_new
    ELSE role::text::user_role_new
  END;

-- Drop the old enum type and rename the new one
DROP TYPE user_role;
ALTER TYPE user_role_new RENAME TO user_role;

-- Restore the default value with the correct type
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'employee'::user_role;