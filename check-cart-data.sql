-- Check what's in the cart_items table
-- Run this in Supabase SQL Editor to see what data exists

SELECT 
  id,
  user_id,
  session_id,
  product_id,
  quantity,
  size,
  color,
  created_at
FROM cart_items
ORDER BY created_at DESC
LIMIT 20;
