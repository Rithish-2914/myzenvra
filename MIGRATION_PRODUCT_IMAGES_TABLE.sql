-- ============================================
-- Migration: Create Product Images Table for Color-Specific Images
-- Purpose: Allow admin to assign different images to different color variants
-- ============================================

-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color TEXT DEFAULT NULL,  -- NULL means default/shared image for all colors
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_color ON product_images(product_id, color);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(product_id, is_primary) WHERE is_primary = true;

-- Migrate existing images from products table to product_images
-- This creates default images (color=NULL) from the existing images array
DO $$
DECLARE
  prod RECORD;
  img TEXT;
  img_order INTEGER;
BEGIN
  FOR prod IN SELECT id, images FROM products WHERE images IS NOT NULL AND array_length(images, 1) > 0
  LOOP
    img_order := 0;
    FOREACH img IN ARRAY prod.images
    LOOP
      INSERT INTO product_images (product_id, color, image_url, display_order, is_primary)
      VALUES (prod.id, NULL, img, img_order, img_order = 0)
      ON CONFLICT DO NOTHING;
      img_order := img_order + 1;
    END LOOP;
  END LOOP;
END $$;

-- Add comment for documentation
COMMENT ON TABLE product_images IS 'Stores product images with optional color associations. color=NULL means default/shared images.';
COMMENT ON COLUMN product_images.color IS 'Color variant this image belongs to. NULL means default/shared image for all colors.';
COMMENT ON COLUMN product_images.is_primary IS 'Whether this is the primary image for this color variant';
COMMENT ON COLUMN product_images.display_order IS 'Order in which to display images (0 = first)';
