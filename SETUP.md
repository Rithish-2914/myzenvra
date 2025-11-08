# myzenvra - Setup Guide

This guide will help you set up Firebase Authentication and Supabase Database & Storage for the myzenvra e-commerce platform.

## Prerequisites

- A Firebase account (https://firebase.google.com/)
- A Supabase account (https://supabase.com/)
- Node.js installed on your system

## Part 1: Firebase Setup (Authentication)

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `myzenvra`
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication

1. In your Firebase project, click "Authentication" in the left sidebar
2. Click "Get started"
3. Enable **Google Sign-In**:
   - Click on "Google" provider
   - Toggle "Enable"
   - Enter support email
   - Click "Save"
4. Enable **Email/Password**:
   - Click on "Email/Password" provider
   - Toggle "Enable"
   - Click "Save"

### Step 3: Get Firebase Configuration

1. Click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps"
4. Click the web icon `</>`
5. Register your app with nickname: `myzenvra-web`
6. Copy the configuration object - you'll need these values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 4: Add Firebase Secrets to Replit

In your Replit project, add these secrets (Tools → Secrets):

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Part 2: Supabase Setup (Database & Storage)

### Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New project"
3. Enter project name: `myzenvra`
4. Create a strong database password (save this!)
5. Select a region close to your users
6. Click "Create new project" (takes 2-3 minutes)

### Step 2: Get Supabase Credentials

1. Once the project is ready, go to Settings → API
2. Copy the following:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...` - ⚠️ **KEEP THIS SECRET!**)

### Step 3: Add Supabase Secrets to Replit

In your Replit project, add these secrets:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

⚠️ **IMPORTANT:** The service_role key bypasses all Row Level Security (RLS) policies. Only use it on the server-side for admin operations. Never expose it to the client!

### Step 4: Create Database Schema

Go to Supabase Dashboard → SQL Editor and run the following SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  customizable BOOLEAN DEFAULT false,
  stock_quantity INTEGER DEFAULT 0,
  sizes TEXT[] DEFAULT ARRAY['S', 'M', 'L', 'XL'],
  colors TEXT[] DEFAULT ARRAY['Beige', 'Black', 'White'],
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
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

-- Customizations Table
CREATE TABLE customizations (
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
CREATE TABLE contact_inquiries (
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
CREATE TABLE bulk_orders (
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
CREATE TABLE user_activity (
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
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_orders_user_email ON orders(user_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_customizations_product ON customizations(product_id);
CREATE INDEX idx_contact_status ON contact_inquiries(status);
CREATE INDEX idx_bulk_orders_status ON bulk_orders(status);
CREATE INDEX idx_user_activity_email ON user_activity(user_email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial categories
INSERT INTO categories (name, slug, description) VALUES
  ('Hoodies', 'hoodies', 'Oversized luxury hoodies with premium quality'),
  ('Oversized Tees', 'oversized-tees', 'Comfortable oversized t-shirts'),
  ('Pants', 'pants', 'Wide-leg and cargo pants'),
  ('Accessories', 'accessories', 'Customizable mugs, pillows, and more');

-- Insert sample products (replace image URLs with actual uploaded images)
INSERT INTO products (name, slug, description, price, category_id, image_url, customizable, stock_quantity) VALUES
  (
    'Oversized Beige Hoodie',
    'oversized-beige-hoodie',
    'Premium quality oversized hoodie in classic beige. Perfect for the Old Money aesthetic.',
    2499.00,
    (SELECT id FROM categories WHERE slug = 'hoodies'),
    'https://placeholder.com/hoodie-beige.jpg',
    true,
    50
  ),
  (
    'Black Oversized Tee',
    'black-oversized-tee',
    'Ultra-comfortable oversized black tee made from premium cotton.',
    1299.00,
    (SELECT id FROM categories WHERE slug = 'oversized-tees'),
    'https://placeholder.com/tee-black.jpg',
    true,
    100
  ),
  (
    'Wide Leg Beige Pants',
    'wide-leg-beige-pants',
    'Elegant wide-leg pants in neutral beige tone.',
    2199.00,
    (SELECT id FROM categories WHERE slug = 'pants'),
    'https://placeholder.com/pants-beige.jpg',
    false,
    30
  );

-- Create a default admin user (password: admin123 - CHANGE THIS!)
-- You'll need to hash this password properly in your application
INSERT INTO admin_users (email, password_hash, name, role) VALUES
  ('admin@myzenvra.com', '$2a$10$example.hash.here', 'Admin', 'admin');
```

### Step 5: Set Up Storage Buckets

1. In Supabase Dashboard, go to Storage
2. Create the following buckets:
   - **product-images** (Public)
   - **customization-uploads** (Public)
   - **category-images** (Public)

3. For each bucket, set the following policy:
   - Go to the bucket → Policies
   - Add policy for SELECT (public read):
     ```sql
     CREATE POLICY "Public Access"
     ON storage.objects FOR SELECT
     USING ( bucket_id = 'product-images' );
     ```
   - Add policy for INSERT (authenticated users):
     ```sql
     CREATE POLICY "Authenticated users can upload"
     ON storage.objects FOR INSERT
     WITH CHECK ( bucket_id = 'product-images' );
     ```

### Step 6: Enable Row Level Security (RLS) Policies

Run this SQL to set up basic security:

```sql
-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Public read access for categories and products
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can view active products" ON products FOR SELECT USING (active = true);

-- Users can create orders and customizations
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create customizations" ON customizations FOR INSERT WITH CHECK (true);

-- Contact forms can be submitted by anyone
CREATE POLICY "Anyone can submit contact inquiries" ON contact_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can submit bulk orders" ON bulk_orders FOR INSERT WITH CHECK (true);

-- User activity can be logged
CREATE POLICY "Anyone can log activity" ON user_activity FOR INSERT WITH CHECK (true);

-- Admin policies (you'll need to implement proper auth checks)
-- For now, we'll allow insert/update/delete from service role only
CREATE POLICY "Service role can manage categories" ON categories FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage products" ON products FOR ALL USING (auth.role() = 'service_role');
```

## Part 3: Application Configuration

### Environment Variables

Make sure all these secrets are set in your Replit project:

```bash
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Session (already set)
SESSION_SECRET=
```

## Part 4: Admin Dashboard Access

### Default Admin Credentials

**Email:** admin@myzenvra.com  
**Password:** admin123

⚠️ **IMPORTANT:** Change the admin password immediately after first login!

### Admin Dashboard URL

Once the application is running:
- Admin Dashboard: `https://your-app.replit.dev/admin`
- Admin Login: `https://your-app.replit.dev/admin/login`

## Part 5: Testing the Setup

1. Start your application
2. Visit the home page to ensure products load
3. Try adding a product to cart
4. Test the customization form
5. Access the admin dashboard at `/admin/login`
6. Login with admin credentials
7. Try adding a new category
8. Try adding a new product

## Troubleshooting

### Firebase Issues
- **Auth not working:** Verify Firebase config in Replit secrets
- **Google Sign-In fails:** Check authorized domains in Firebase Console → Authentication → Settings → Authorized domains

### Supabase Issues
- **Connection errors:** Verify SUPABASE_URL and SUPABASE_ANON_KEY
- **Can't create records:** Check RLS policies are set correctly
- **Images not uploading:** Verify storage buckets are created and public

### Common Errors
- **CORS errors:** Add your Replit domain to Supabase Dashboard → Settings → API → CORS
- **Network errors:** Check if Supabase project is paused (free tier pauses after inactivity)

## Next Steps

1. Upload actual product images to Supabase Storage
2. Update product image URLs in the database
3. Customize the admin dashboard branding
4. Set up email notifications for orders
5. Configure payment gateway (Stripe/Razorpay)

## Security Best Practices

1. **Never commit secrets to Git**
2. **Change default admin password**
3. **Use environment variables for all sensitive data**
4. **Implement proper authentication for admin routes**
5. **Regularly backup your Supabase database**
6. **Monitor user activity and logs**

## Support

For issues or questions:
- Email: hello@myzenvra.com
- Check Supabase docs: https://supabase.com/docs
- Check Firebase docs: https://firebase.google.com/docs
