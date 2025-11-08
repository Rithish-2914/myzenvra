# Vercel Deployment Guide

This application has been restructured to work on Vercel's serverless platform while maintaining Firebase and Supabase integration.

## Architecture Changes

### What Changed:
- ✅ **Express sessions** → JWT-based authentication (HTTP-only cookies)
- ✅ **Single Express server** → Individual Vercel serverless functions
- ✅ **Firebase** - Still used for user authentication (ready to implement)
- ✅ **Supabase** - Still used for database and storage

### What Stayed the Same:
- All database tables and schemas
- Firebase configuration
- Supabase configuration
- Frontend React application
- All business logic

## Deployment Steps

### 1. Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2. Set Environment Variables in Vercel

Go to your Vercel project settings and add these environment variables:

#### Supabase Variables
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### Firebase Variables (Frontend - must start with VITE_)
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

#### JWT Secret (for admin authentication)
```
JWT_SECRET=your_random_secret_key_here_minimum_32_characters
```

**⚠️ IMPORTANT:** Generate a strong JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard
1. Go to https://vercel.com/new
2. Import your Git repository
3. Vercel will automatically detect the configuration
4. Add environment variables in the dashboard
5. Click "Deploy"

#### Option B: Deploy via CLI
```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### 4. Configure Supabase RLS (Row Level Security)

Your Supabase database needs proper RLS policies. Run this SQL in Supabase SQL Editor:

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

-- Public can create orders, customizations, inquiries
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create customizations" ON customizations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create inquiries" ON contact_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create bulk orders" ON bulk_orders FOR INSERT WITH CHECK (true);

-- Only service role (backend) can manage data
-- Admin operations are handled via service_role key in backend
```

## API Routes Structure

All API routes are now serverless functions:

```
/api/admin/login       - POST  - Admin login
/api/admin/logout      - POST  - Admin logout
/api/admin/session     - GET   - Check admin session

/api/categories        - GET   - List categories (public)
/api/categories        - POST  - Create category (admin)
/api/categories/[id]   - PUT   - Update category (admin)
/api/categories/[id]   - DELETE- Delete category (admin)

/api/products          - GET   - List products (public)
/api/products          - POST  - Create product (admin)
/api/products/[id]     - GET   - Get product (public)
/api/products/[id]     - PUT   - Update product (admin)
/api/products/[id]     - DELETE- Delete product (admin)

/api/orders            - POST  - Create order (public)
/api/orders            - GET   - List orders (admin)
/api/orders/[id]       - PUT   - Update order status (admin)

... (similar structure for other resources)
```

## Authentication Flow

### Admin Authentication
1. Admin logs in at `/admin/login`
2. Backend verifies credentials against Supabase
3. JWT token issued and set as HTTP-only cookie
4. Cookie automatically sent with all subsequent requests
5. Backend verifies JWT token for protected routes

### User Authentication (To Be Implemented)
1. User signs up/logs in with Firebase Auth
2. Firebase ID token used for API requests
3. Backend verifies Firebase token for user-specific operations

## Testing Locally

```bash
# Install dependencies
npm install

# Run development server (uses Express)
npm run dev

# Build for production
npm run build

# Test production build locally with Vercel CLI
vercel dev
```

## Troubleshooting

### "Unauthorized" errors
- Check that JWT_SECRET is set in Vercel environment variables
- Clear browser cookies and try logging in again

### API routes not working
- Verify all environment variables are set in Vercel
- Check Vercel function logs in the dashboard

### Database connection errors
- Verify Supabase credentials are correct
- Check Supabase dashboard for connection limits

### CORS errors
- The vercel.json includes CORS headers
- If issues persist, check browser console for specific errors

## Next Steps

1. ✅ Deploy to Vercel
2. ⏳ Implement Firebase user authentication on frontend
3. ⏳ Add shopping cart functionality with user authentication
4. ⏳ Complete checkout flow with user login requirement

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Verify all environment variables are set correctly
4. Test API endpoints using tools like Postman or curl
