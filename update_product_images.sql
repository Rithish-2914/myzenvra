-- Update product images with working Unsplash URLs
-- Run this in Supabase SQL Editor

-- Update Oversized Beige Hoodie (neutral beige hoodie)
UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=1000&q=80&fit=crop'
WHERE slug = 'oversized-beige-hoodie';

-- Update Black Oversized Tee (black t-shirt)
UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&q=80&fit=crop'
WHERE slug = 'black-oversized-tee';

-- Update Wide Leg Beige Pants (neutral pants)
UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&h=1000&q=80&fit=crop'
WHERE slug = 'wide-leg-beige-pants';
