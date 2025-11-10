-- Clear old orphaned cart items
-- Run this in Supabase SQL Editor to clean up old session data

DELETE FROM cart_items 
WHERE session_id IS NOT NULL;

-- This will clear all guest cart items so users can start fresh
-- Cart items for logged-in users (with user_id) will not be affected
