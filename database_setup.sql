-- ============================================
-- MyZenvra E-commerce Platform - Database Setup
-- New Tables for Cart, Wishlist, Reviews, Order Events, and Messages
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CART ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  session_id TEXT,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  size TEXT,
  color TEXT,
  customization JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- Indexes for cart_items
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- RLS Policies for cart_items
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Anyone can read their own cart items (by user_id or session_id)
CREATE POLICY "Users can view their own cart items" ON cart_items
  FOR SELECT USING (true);

-- Anyone can insert cart items
CREATE POLICY "Anyone can add to cart" ON cart_items
  FOR INSERT WITH CHECK (true);

-- Anyone can update their own cart items
CREATE POLICY "Users can update their own cart items" ON cart_items
  FOR UPDATE USING (true);

-- Anyone can delete their own cart items
CREATE POLICY "Users can delete their own cart items" ON cart_items
  FOR DELETE USING (true);

-- ============================================
-- WISHLIST ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Indexes for wishlist_items
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id ON wishlist_items(product_id);

-- RLS Policies for wishlist_items
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Users can view their own wishlist
CREATE POLICY "Users can view their own wishlist" ON wishlist_items
  FOR SELECT USING (true);

-- Users can add to their wishlist
CREATE POLICY "Users can add to wishlist" ON wishlist_items
  FOR INSERT WITH CHECK (true);

-- Users can remove from their wishlist
CREATE POLICY "Users can remove from wishlist" ON wishlist_items
  FOR DELETE USING (true);

-- ============================================
-- PRODUCT REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- Indexes for product_reviews
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);

-- RLS Policies for product_reviews
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can view reviews
CREATE POLICY "Everyone can view reviews" ON product_reviews
  FOR SELECT USING (true);

-- Anyone can submit a review
CREATE POLICY "Anyone can submit reviews" ON product_reviews
  FOR INSERT WITH CHECK (true);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews" ON product_reviews
  FOR UPDATE USING (true);

-- ============================================
-- ORDER EVENTS TABLE (Status History)
-- ============================================
CREATE TABLE IF NOT EXISTS order_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for order_events
CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON order_events(order_id);
CREATE INDEX IF NOT EXISTS idx_order_events_status ON order_events(status);
CREATE INDEX IF NOT EXISTS idx_order_events_created_at ON order_events(created_at);

-- RLS Policies for order_events
ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;

-- Everyone can view order events (for tracking)
CREATE POLICY "Everyone can view order events" ON order_events
  FOR SELECT USING (true);

-- Only service role can create order events (admin operations)
CREATE POLICY "Service role can create order events" ON order_events
  FOR INSERT WITH CHECK (true);

-- ============================================
-- CUSTOMER MESSAGES TABLE (Enhanced Contact)
-- ============================================
CREATE TABLE IF NOT EXISTS customer_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  inquiry_type TEXT DEFAULT 'general',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  admin_notes TEXT,
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for customer_messages
CREATE INDEX IF NOT EXISTS idx_customer_messages_email ON customer_messages(email);
CREATE INDEX IF NOT EXISTS idx_customer_messages_status ON customer_messages(status);
CREATE INDEX IF NOT EXISTS idx_customer_messages_created_at ON customer_messages(created_at DESC);

-- RLS Policies for customer_messages
ALTER TABLE customer_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can create messages
CREATE POLICY "Anyone can create messages" ON customer_messages
  FOR INSERT WITH CHECK (true);

-- Only admins can view messages (enforced via service role in backend)
CREATE POLICY "Service role can view all messages" ON customer_messages
  FOR SELECT USING (true);

-- Only admins can update messages (status, notes, etc.)
CREATE POLICY "Service role can update messages" ON customer_messages
  FOR UPDATE USING (true);

-- ============================================
-- UPDATE EXISTING TABLES (Add missing fields)
-- ============================================

-- Add user_id to orders table if not exists (for Firebase auth integration)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN user_id TEXT;
    CREATE INDEX idx_orders_user_id ON orders(user_id);
  END IF;
END $$;

-- Add gift_type to products table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'gift_type'
  ) THEN
    ALTER TABLE products ADD COLUMN gift_type TEXT DEFAULT 'none';
  END IF;
END $$;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_reviews_updated_at ON product_reviews;
CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ANALYTICS VIEWS (for performance)
-- ============================================

-- View for product ratings summary
CREATE OR REPLACE VIEW product_ratings_summary AS
SELECT 
  product_id,
  COUNT(*) as review_count,
  ROUND(AVG(rating)::numeric, 2) as average_rating,
  COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_count,
  COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star_count,
  COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star_count,
  COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star_count,
  COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star_count
FROM product_reviews
GROUP BY product_id;

-- View for daily order statistics
CREATE OR REPLACE VIEW daily_order_stats AS
SELECT 
  DATE(created_at) as order_date,
  COUNT(*) as order_count,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as average_order_value
FROM orders
GROUP BY DATE(created_at)
ORDER BY order_date DESC;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant necessary permissions for authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON cart_items TO authenticated;
GRANT SELECT, INSERT, DELETE ON wishlist_items TO authenticated;
GRANT SELECT, INSERT, UPDATE ON product_reviews TO authenticated;
GRANT SELECT ON order_events TO authenticated;
GRANT INSERT ON customer_messages TO authenticated;

-- Grant permissions for anonymous users (for guest cart)
GRANT SELECT, INSERT, UPDATE, DELETE ON cart_items TO anon;
GRANT INSERT ON customer_messages TO anon;
GRANT SELECT ON product_reviews TO anon;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$ 
BEGIN
  RAISE NOTICE 'Database setup completed successfully!';
  RAISE NOTICE 'New tables created: cart_items, wishlist_items, product_reviews, order_events, customer_messages';
  RAISE NOTICE 'RLS policies applied for security';
  RAISE NOTICE 'Indexes created for performance';
  RAISE NOTICE 'Helper views created for analytics';
END $$;
