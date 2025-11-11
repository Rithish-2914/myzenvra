-- Add payment_method and payment_status columns to orders table
-- Run this in Supabase SQL Editor

-- Add payment_method column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'cod' CHECK (payment_method IN ('cod', 'upi', 'card'));
  END IF;
END $$;

-- Add payment_status column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed'));
  END IF;
END $$;

-- Create index for payment_method
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);

-- Create index for payment_status
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Completion message
DO $$ 
BEGIN
  RAISE NOTICE '✅ Payment fields migration completed successfully!';
  RAISE NOTICE 'Added columns: payment_method, payment_status';
  RAISE NOTICE 'Created indexes for better query performance';
END $$;
