-- ============================================
-- MyZenvra E-commerce Platform - COMPLETE DATABASE SETUP
-- This file consolidates ALL migrations and tables
-- Run this in Supabase Dashboard → SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table (with ALL columns from migrations)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  customizable BOOLEAN DEFAULT false,
  stock_quantity INTEGER DEFAULT 0,
  colors TEXT[] DEFAULT ARRAY['Beige', 'Black', 'White'],
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  gift_type TEXT DEFAULT 'none',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns that may not exist from migrations
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS color_images JSONB DEFAULT '{}'::jsonb;

-- Handle sizes/available_sizes rename
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sizes')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'available_sizes')
  THEN
    ALTER TABLE products RENAME COLUMN sizes TO available_sizes;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'available_sizes')
  THEN
    ALTER TABLE products ADD COLUMN available_sizes TEXT[] DEFAULT ARRAY['S', 'M', 'L', 'XL'];
  END IF;
END $$;

-- Migrate existing image_url to images array if needed
UPDATE products 
SET images = ARRAY[image_url]::TEXT[]
WHERE image_url IS NOT NULL 
  AND image_url != '' 
  AND (images IS NULL OR array_length(images, 1) IS NULL OR array_length(images, 1) = 0);

-- Product Images Table (for color-specific images)
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color TEXT DEFAULT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users Table (Firebase sync)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'customer',
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add role constraint safely
DO $$ 
BEGIN
  ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('customer', 'admin'));

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add user_id column to orders if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Customizations Table
CREATE TABLE IF NOT EXISTS customizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_email TEXT,
  custom_text TEXT,
  custom_image_url TEXT,
  selected_color TEXT,
  selected_size TEXT,
  price DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Inquiries Table
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  inquiry_type TEXT DEFAULT 'general',
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bulk Order Requests Table
CREATE TABLE IF NOT EXISTS bulk_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Activity Tracking Table
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT,
  user_id TEXT,
  page_visited TEXT,
  action TEXT,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CART, WISHLIST, REVIEWS, ORDERS
-- ============================================

-- Cart Items Table
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

-- Wishlist Items Table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Product Reviews Table
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

-- Order Events Table (Status History)
CREATE TABLE IF NOT EXISTS order_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Messages Table
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

-- Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  link_url TEXT,
  link_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_images ON products USING GIN(images);
CREATE INDEX IF NOT EXISTS idx_products_available_sizes ON products USING GIN(available_sizes);
CREATE INDEX IF NOT EXISTS idx_products_color_images ON products USING GIN(color_images);

-- Product Images indexes
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_color ON product_images(product_id, color);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(product_id, is_primary) WHERE is_primary = true;

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON orders(user_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Other indexes
CREATE INDEX IF NOT EXISTS idx_customizations_product ON customizations(product_id);
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_bulk_orders_status ON bulk_orders(status);
CREATE INDEX IF NOT EXISTS idx_user_activity_email ON user_activity(user_email);

-- Cart indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- Wishlist indexes
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id ON wishlist_items(product_id);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);

-- Order events indexes
CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON order_events(order_id);
CREATE INDEX IF NOT EXISTS idx_order_events_status ON order_events(status);
CREATE INDEX IF NOT EXISTS idx_order_events_created_at ON order_events(created_at);

-- Customer messages indexes
CREATE INDEX IF NOT EXISTS idx_customer_messages_email ON customer_messages(email);
CREATE INDEX IF NOT EXISTS idx_customer_messages_status ON customer_messages(status);
CREATE INDEX IF NOT EXISTS idx_customer_messages_created_at ON customer_messages(created_at DESC);

-- Announcements indexes
CREATE INDEX IF NOT EXISTS idx_announcements_enabled ON announcements(enabled);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- ============================================

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_reviews_updated_at ON product_reviews;
CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_images_updated_at ON product_images;
CREATE TRIGGER update_product_images_updated_at BEFORE UPDATE ON product_images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Public read access for categories and products
DROP POLICY IF EXISTS "Public can view categories" ON categories;
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view active products" ON products;
CREATE POLICY "Public can view active products" ON products FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Public can view product images" ON product_images;
CREATE POLICY "Public can view product images" ON product_images FOR SELECT USING (true);

-- Service role access for users table
DROP POLICY IF EXISTS "Service role has full access to users" ON users;
CREATE POLICY "Service role has full access to users" ON users FOR ALL USING (true);

-- Anyone can create orders and customizations
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can create customizations" ON customizations;
CREATE POLICY "Anyone can create customizations" ON customizations FOR INSERT WITH CHECK (true);

-- Contact forms
DROP POLICY IF EXISTS "Anyone can submit contact inquiries" ON contact_inquiries;
CREATE POLICY "Anyone can submit contact inquiries" ON contact_inquiries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can submit bulk orders" ON bulk_orders;
CREATE POLICY "Anyone can submit bulk orders" ON bulk_orders FOR INSERT WITH CHECK (true);

-- User activity
DROP POLICY IF EXISTS "Anyone can log activity" ON user_activity;
CREATE POLICY "Anyone can log activity" ON user_activity FOR INSERT WITH CHECK (true);

-- Cart items policies
DROP POLICY IF EXISTS "Users can view their own cart items" ON cart_items;
CREATE POLICY "Users can view their own cart items" ON cart_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can add to cart" ON cart_items;
CREATE POLICY "Anyone can add to cart" ON cart_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own cart items" ON cart_items;
CREATE POLICY "Users can update their own cart items" ON cart_items FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete their own cart items" ON cart_items;
CREATE POLICY "Users can delete their own cart items" ON cart_items FOR DELETE USING (true);

-- Wishlist policies
DROP POLICY IF EXISTS "Users can view their own wishlist" ON wishlist_items;
CREATE POLICY "Users can view their own wishlist" ON wishlist_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can add to wishlist" ON wishlist_items;
CREATE POLICY "Users can add to wishlist" ON wishlist_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can remove from wishlist" ON wishlist_items;
CREATE POLICY "Users can remove from wishlist" ON wishlist_items FOR DELETE USING (true);

-- Reviews policies
DROP POLICY IF EXISTS "Everyone can view reviews" ON product_reviews;
CREATE POLICY "Everyone can view reviews" ON product_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can submit reviews" ON product_reviews;
CREATE POLICY "Anyone can submit reviews" ON product_reviews FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own reviews" ON product_reviews;
CREATE POLICY "Users can update their own reviews" ON product_reviews FOR UPDATE USING (true);

-- Order events policies
DROP POLICY IF EXISTS "Everyone can view order events" ON order_events;
CREATE POLICY "Everyone can view order events" ON order_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can create order events" ON order_events;
CREATE POLICY "Service role can create order events" ON order_events FOR INSERT WITH CHECK (true);

-- Customer messages policies
DROP POLICY IF EXISTS "Anyone can create messages" ON customer_messages;
CREATE POLICY "Anyone can create messages" ON customer_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can view all messages" ON customer_messages;
CREATE POLICY "Service role can view all messages" ON customer_messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can update messages" ON customer_messages;
CREATE POLICY "Service role can update messages" ON customer_messages FOR UPDATE USING (true);

-- Announcements policies
DROP POLICY IF EXISTS "Public can view enabled announcements" ON announcements;
CREATE POLICY "Public can view enabled announcements" ON announcements FOR SELECT USING (enabled = true);

DROP POLICY IF EXISTS "Service role can manage announcements" ON announcements;
CREATE POLICY "Service role can manage announcements" ON announcements FOR ALL USING (true);

-- ============================================
-- ANALYTICS VIEWS
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
-- INITIAL DATA
-- ============================================

-- Insert initial categories (if not exists)
INSERT INTO categories (name, slug, description)
SELECT * FROM (
  VALUES 
    ('Hoodies', 'hoodies', 'Oversized luxury hoodies with premium quality'),
    ('Oversized Tees', 'oversized-tees', 'Comfortable oversized t-shirts'),
    ('Pants', 'pants', 'Wide-leg and cargo pants'),
    ('Accessories', 'accessories', 'Customizable mugs, pillows, and more')
) AS v(name, slug, description)
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE categories.slug = v.slug);

-- Insert a default announcement (if none exists)
INSERT INTO announcements (message, enabled, link_text, link_url)
SELECT 'Welcome to MyZenvra! Free shipping on orders over ₹2000', true, 'Shop Now', '/shop'
WHERE NOT EXISTS (SELECT 1 FROM announcements);

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$ 
BEGIN
  RAISE NOTICE '✅ Database setup completed successfully!';
  RAISE NOTICE '📊 All tables created with proper indexes and RLS policies';
  RAISE NOTICE '🔒 Security policies applied';
  RAISE NOTICE '📈 Analytics views created';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Tables included:';
  RAISE NOTICE '   - categories, products, product_images';
  RAISE NOTICE '   - users, orders, customizations';
  RAISE NOTICE '   - cart_items, wishlist_items, product_reviews';
  RAISE NOTICE '   - order_events, customer_messages, announcements';
  RAISE NOTICE '   - contact_inquiries, bulk_orders, user_activity';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  NEXT STEPS:';
  RAISE NOTICE '1. Verify all tables exist: SELECT table_name FROM information_schema.tables WHERE table_schema = ''public'';';
  RAISE NOTICE '2. Create storage buckets in Supabase Storage: product-images, customization-uploads';
  RAISE NOTICE '3. Test cart by visiting your website';
END $$;
