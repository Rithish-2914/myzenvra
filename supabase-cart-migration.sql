-- Add Missing Tables for Cart and Announcements
-- Run this in Supabase Dashboard → SQL Editor

-- Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  session_id TEXT,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  size TEXT,
  color TEXT,
  customization JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT cart_items_user_or_session CHECK (
    (user_id IS NOT NULL AND session_id IS NULL) OR 
    (user_id IS NULL AND session_id IS NOT NULL)
  )
);

-- Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  link TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_announcements_enabled ON announcements(enabled);

-- Add triggers for updated_at
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cart_items
-- Allow anyone to read their own cart (by user_id or session_id)
CREATE POLICY "Users can view their own cart items" 
  ON cart_items FOR SELECT 
  USING (true);

-- Allow anyone to insert cart items
CREATE POLICY "Anyone can add to cart" 
  ON cart_items FOR INSERT 
  WITH CHECK (true);

-- Allow anyone to update their own cart items
CREATE POLICY "Users can update their own cart items" 
  ON cart_items FOR UPDATE 
  USING (true);

-- Allow anyone to delete their own cart items
CREATE POLICY "Users can delete their own cart items" 
  ON cart_items FOR DELETE 
  USING (true);

-- Service role can manage all cart items
CREATE POLICY "Service role can manage all cart items" 
  ON cart_items FOR ALL 
  USING (auth.role() = 'service_role');

-- RLS Policies for announcements
-- Public read access for enabled announcements
CREATE POLICY "Public can view enabled announcements" 
  ON announcements FOR SELECT 
  USING (enabled = true);

-- Service role can manage announcements
CREATE POLICY "Service role can manage announcements" 
  ON announcements FOR ALL 
  USING (auth.role() = 'service_role');

-- Insert a sample announcement (optional)
INSERT INTO announcements (message, type, enabled) 
VALUES ('Welcome to myzenvra! Free shipping on orders over ₹2000', 'info', true)
ON CONFLICT DO NOTHING;
