-- ============================================
-- Migration: Add color_images JSONB column to products table
-- Purpose: Map each color variant to its specific images
-- Format: { "Black": ["url1", "url2"], "White": ["url3"], "Beige": ["url4"] }
-- ============================================

-- Add color_images column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'color_images'
  ) THEN
    ALTER TABLE products ADD COLUMN color_images JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_color_images ON products USING GIN(color_images);

-- Add comment for documentation
COMMENT ON COLUMN products.color_images IS 'Maps color names to arrays of image URLs. Format: {"Black": ["url1", "url2"], "White": ["url3"]}';
