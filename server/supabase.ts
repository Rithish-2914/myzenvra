import { createClient } from '@supabase/supabase-js';

// Use placeholder values if secrets aren't configured yet
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn('⚠️  Missing Supabase environment variables. Please add SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY to your secrets.');
  console.warn('⚠️  See SETUP.md for configuration instructions.');
}

// Public client for read operations
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin client with service role key for admin operations
// Note: Service role key bypasses RLS - use only on server for admin operations
export const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : supabase; // Fallback to anon key if service role not configured
