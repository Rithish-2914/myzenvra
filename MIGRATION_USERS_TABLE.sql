-- Migration: Add users table for Firebase user sync
-- Run this in Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add updated_at trigger
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table (least privilege)
-- Only service role (backend) can read/write users table
-- This protects PII (emails, names) from being exposed to unauthenticated clients
-- All user queries should go through authenticated API endpoints
CREATE POLICY "Service role has full access to users"
  ON users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Migrate existing admin_users to users table (if any exist)
-- This will preserve existing admin access
INSERT INTO users (firebase_uid, email, name, role, created_at)
SELECT 
  'admin_' || id::text AS firebase_uid,  -- Temporary firebase_uid for existing admins
  email,
  name,
  'admin' AS role,
  created_at
FROM admin_users
WHERE email NOT IN (SELECT email FROM users)
ON CONFLICT (email) DO NOTHING;

-- Note: After migration, existing admins should:
-- 1. Sign up with Firebase using the same email
-- 2. Their Firebase UID will replace the temporary 'admin_' prefix
-- 3. Role will be preserved as 'admin'
