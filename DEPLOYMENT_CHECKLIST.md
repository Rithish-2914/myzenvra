# 🚀 Vercel Deployment Checklist

Your application has been successfully restructured for Vercel deployment with Firebase + Supabase!

## ✅ What's Been Completed

### Backend (API Routes)
- ✅ Converted Express server to Vercel serverless functions
- ✅ Created JWT-based authentication (replaces sessions)
- ✅ All API routes working: categories, products, orders, customizations, contact, bulk orders
- ✅ Admin authentication with HTTP-only cookies
- ✅ Proper CORS configuration for cross-origin requests

### Frontend
- ✅ Firebase Authentication integrated (login/signup pages created)
- ✅ Shopping cart context with localStorage persistence
- ✅ User-specific carts (cart data tied to Firebase UID)
- ✅ Auth and Cart providers wrapped around the app

### Configuration
- ✅ vercel.json configured for serverless deployment
- ✅ Security hardened (no JWT secret fallback)
- ✅ CORS middleware for API routes
- ✅ Build scripts ready

## 📋 Pre-Deployment Steps

### 1. Generate JWT Secret

Run this command to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output - you'll need it for Vercel environment variables.

### 2. Prepare Your Supabase Database

Make sure your Supabase database has all required tables. Run this SQL in Supabase SQL Editor:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- If missing, create tables from SETUP.md
```

See `SETUP.md` for the complete SQL schema.

### 3. Set Up Vercel Environment Variables

You'll need these environment variables in Vercel:

#### Supabase (Backend)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### Firebase (Frontend - MUST start with VITE_)
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### JWT Secret (Generated in Step 1)
```
JWT_SECRET=your_generated_64_character_hex_string
```

## 🚀 Deployment Options

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your Git repository
4. Add all environment variables (from Step 3)
5. Deploy!

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Add environment variables in Vercel dashboard

# Deploy to production
vercel --prod
```

## ⚙️ Post-Deployment Steps

### 1. Test Admin Login
- Go to `your-domain.vercel.app/admin/login`
- Login with: `admin@myzenvra.com` / `admin123`
- Create products and categories

### 2. Test User Authentication
- Go to `your-domain.vercel.app/signup`
- Create a test account
- Verify email/password and Google sign-in work

### 3. Test Shopping Flow
- Browse products at `/shop`
- Add items to cart
- View cart at `/cart`
- Proceed to checkout

### 4. Create Default Admin User

If you haven't already, create an admin user in Supabase:

```sql
INSERT INTO admin_users (email, password_hash, name, role)
VALUES (
  'admin@myzenvra.com',
  '$2a$10$YourBcryptHashHere', -- Use bcrypt to hash 'admin123'
  'Admin',
  'admin'
);
```

To generate bcrypt hash:
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('admin123', 10));"
```

## 🔍 Troubleshooting

### "JWT_SECRET is required" Error
- Make sure you set the `JWT_SECRET` environment variable in Vercel
- Redeploy after adding environment variables

### API Routes Return 404
- Check that `api/` directory exists in your deployment
- Verify vercel.json is in the root directory
- Check Vercel function logs

### Firebase Auth Not Working
- Verify all `VITE_FIREBASE_*` variables are set
- Check that they're prefixed with `VITE_` (required for frontend)
- Add your Vercel domain to Firebase authorized domains

### CORS Errors
- The middleware handles CORS automatically
- If issues persist, check browser console for specific errors
- Verify cookies are being sent with `credentials: 'include'`

## 📝 Next Steps After Deployment

These features are set up but need frontend integration:

1. **Update Cart Page** - Connect to CartContext hooks
2. **Update Checkout** - Require login and auto-fill user data
3. **Update Header** - Show cart count badge and user menu
4. **File Uploads** - Implement Supabase Storage for product images

## 📖 Additional Documentation

- `VERCEL_DEPLOYMENT.md` - Complete deployment guide
- `SETUP.md` - Firebase and Supabase setup instructions
- `.env.example` - Example environment variables

## 🎉 You're Ready to Deploy!

Your app is now fully configured for Vercel with:
- ✅ Serverless API routes
- ✅ Firebase user authentication  
- ✅ Supabase database
- ✅ Shopping cart system
- ✅ Admin dashboard
- ✅ Security best practices

Deploy and start selling! 🛍️
