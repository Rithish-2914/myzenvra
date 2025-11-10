-- ============================================
-- Migration: Add Multiple Images and Tags Support to Products
-- ============================================

-- Add images column (array of text for multiple images)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'images'
  ) THEN
    ALTER TABLE products ADD COLUMN images TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Migrate existing image_url data to images array if images is empty
UPDATE products 
SET images = ARRAY[image_url]::TEXT[]
WHERE image_url IS NOT NULL 
  AND image_url != '' 
  AND (images IS NULL OR array_length(images, 1) IS NULL OR array_length(images, 1) = 0);

-- Add tags column for better product recommendations
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'tags'
  ) THEN
    ALTER TABLE products ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Rename sizes to available_sizes for clarity
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'available_sizes'
  ) THEN
    -- If sizes column exists, rename it
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'sizes'
    ) THEN
      ALTER TABLE products RENAME COLUMN sizes TO available_sizes;
    ELSE
      -- Otherwise create available_sizes
      ALTER TABLE products ADD COLUMN available_sizes TEXT[] DEFAULT ARRAY['S', 'M', 'L', 'XL'];
    END IF;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_images ON products USING GIN(images);
CREATE INDEX IF NOT EXISTS idx_products_available_sizes ON products USING GIN(available_sizes);

-- Add comment for documentation
COMMENT ON COLUMN products.images IS 'Array of product image URLs (max 5 images)';
COMMENT ON COLUMN products.tags IS 'Product tags for search and recommendations (normalized to lowercase)';
COMMENT ON COLUMN products.available_sizes IS 'Available sizes to display in frontend (e.g., XS, S, M, L, XL, XXL, 2XL, 3XL)';
