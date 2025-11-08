# 🚀 Deploy to Vercel - Quick Start Guide

Your application is **ready to deploy**! Follow these steps to get it live on Vercel.

## ✅ Pre-Flight Checklist

Your project already has:
- ✅ Serverless API functions in `/api` directory
- ✅ Optimized Vite build configuration
- ✅ Proper vercel.json routing configuration
- ✅ CORS headers configured
- ✅ Environment variable structure

## 🎯 IMPORTANT: Consolidated API Structure

Your API has been consolidated from 17 individual serverless functions into **1 Express-based function** to work within Vercel's Hobby plan (12 function limit).

**What Changed:**
- ✅ All API routes now handled by `/api/index.ts`
- ✅ Uses your existing Express server from `server/routes.ts`
- ✅ Same endpoints, same functionality, just 1 function instead of 17
- ✅ No code changes needed on frontend

## 📝 Step 1: Prepare Environment Variables

You'll need to add these environment variables in Vercel. Get them from your Supabase and Firebase dashboards.

### Supabase Variables
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Firebase Variables (Frontend - must have VITE_ prefix)
```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123...
```

### JWT Secret (Generate a new one)
Run this command in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then add the output as:
```
JWT_SECRET=<the generated hex string>
```

## 🚀 Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com/new

2. **Import Your Repository**:
   - Click "Add New Project"
   - Import your Git repository (GitHub, GitLab, or Bitbucket)

3. **Configure Build Settings**:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`
   - Leave everything else as default

4. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add ALL the variables from Step 1 above
   - Make sure to add them for **Production**, **Preview**, and **Development**

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (this will create a preview deployment)
vercel

# After testing preview, deploy to production
vercel --prod
```

**Important**: After deploying via CLI, you still need to add environment variables through the Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all variables from Step 1

## 🔍 Step 3: Verify Deployment

After deployment, test these endpoints:

### Frontend
- Visit your deployment URL (e.g., `https://your-app.vercel.app`)
- Navigate through pages: Home, Shop, About, Contact
- Check if images load correctly

### API Routes
Test these in your browser or with curl:

```bash
# Check categories (should return JSON array)
curl https://your-app.vercel.app/api/categories

# Check products (should return JSON array)
curl https://your-app.vercel.app/api/products

# Test admin session (should return 401 unauthorized)
curl https://your-app.vercel.app/api/admin/session
```

## ⚠️ Common Issues & Solutions

### Issue 1: "API returns 404"
**Cause**: API routes not deploying correctly  
**Fix**: 
- Verify `api/` directory exists in your repository
- Check that vercel.json is in the root directory
- Redeploy the project

### Issue 2: "Firebase auth not working"
**Cause**: Missing or incorrect Firebase environment variables  
**Fix**:
- Double-check all `VITE_FIREBASE_*` variables in Vercel dashboard
- Make sure they have the `VITE_` prefix
- Add your Vercel domain to Firebase authorized domains:
  1. Go to Firebase Console → Authentication → Settings
  2. Add your Vercel domain under "Authorized domains"

### Issue 3: "Blank page after deployment"
**Cause**: Build output directory mismatch  
**Fix**:
- Verify Output Directory is set to `dist/public` in Vercel settings
- Check browser console for errors
- Redeploy

### Issue 4: "CORS errors"
**Cause**: Missing CORS headers  
**Fix**: Already configured in vercel.json, but if issues persist:
- Check that the frontend is making requests to the same domain
- Verify cookies are being sent with requests

### Issue 5: "Admin login fails"
**Cause**: Missing or incorrect JWT_SECRET  
**Fix**:
- Generate a new JWT_SECRET (see Step 1)
- Add it to Vercel environment variables
- Redeploy the project

## 📱 Step 4: Configure Firebase Authorized Domains

For Firebase Authentication to work on your deployed domain:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Add your Vercel domain: `your-app.vercel.app`
6. If you have a custom domain, add that too

## 🔐 Step 5: Create Admin User in Supabase

To access the admin dashboard, create an admin user:

1. Generate password hash:
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('yourpassword', 10));"
```

2. Go to Supabase Dashboard → SQL Editor

3. Run this SQL:
```sql
INSERT INTO admin_users (email, password_hash, name, role)
VALUES (
  'admin@yourdomain.com',
  '<paste the bcrypt hash from step 1>',
  'Admin User',
  'admin'
);
```

## ✅ Deployment Complete!

Your app should now be live at: `https://your-app.vercel.app`

### Next Steps:
1. Test all functionality (shopping, cart, checkout)
2. Set up a custom domain (optional)
3. Monitor logs in Vercel dashboard
4. Add products and categories via admin dashboard

## 🆘 Need Help?

If you encounter issues:
1. Check Vercel deployment logs (Functions tab)
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Check Supabase logs for database errors

## 📖 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

---

**Happy Deploying! 🎉**
