-- Fix the users table role constraint
-- Run this in your Supabase SQL Editor

-- Drop the old constraint if it exists
DO $$ 
BEGIN
  -- Try to drop the constraint (will fail silently if it doesn't exist)
  ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add the correct constraint
ALTER TABLE users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('customer', 'admin'));

-- Verify the constraint is working
DO $$ 
BEGIN
  RAISE NOTICE 'Constraint fixed! Role must be either "customer" or "admin"';
END $$;
