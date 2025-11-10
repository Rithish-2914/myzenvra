import { createClient } from '@supabase/supabase-js';

// Use env variables
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateProductImages() {
  console.log('Updating product images...');

  // Update Oversized Beige Hoodie
  const { error: error1 } = await supabase
    .from('products')
    .update({ 
      image_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=1000&q=80&fit=crop'
    })
    .eq('slug', 'oversized-beige-hoodie');

  if (error1) console.error('Error updating hoodie:', error1);
  else console.log('✓ Updated Oversized Beige Hoodie');

  // Update Black Oversized Tee
  const { error: error2 } = await supabase
    .from('products')
    .update({ 
      image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&q=80&fit=crop'
    })
    .eq('slug', 'black-oversized-tee');

  if (error2) console.error('Error updating tee:', error2);
  else console.log('✓ Updated Black Oversized Tee');

  // Update Wide Leg Beige Pants
  const { error: error3 } = await supabase
    .from('products')
    .update({ 
      image_url: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&h=1000&q=80&fit=crop'
    })
    .eq('slug', 'wide-leg-beige-pants');

  if (error3) console.error('Error updating pants:', error3);
  else console.log('✓ Updated Wide Leg Beige Pants');

  console.log('\nAll product images updated successfully!');
}

updateProductImages();
