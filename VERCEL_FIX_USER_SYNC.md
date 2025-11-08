# ✅ Fixed: User Sync 405 Error on Vercel

## The Problem
When deployed to Vercel, the `/api/users/sync` endpoint was returning a **405 Method Not Allowed** error, causing:
- ❌ User authentication sync to fail
- ❌ "Unexpected end of JSON input" error in browser console

## The Solution Applied

### 1. Updated `api/index.ts`
The Vercel serverless function now:
- ✅ Initializes Firebase Admin before handling requests
- ✅ Properly handles POST requests to `/api/users/sync`
- ✅ Sets explicit CORS headers for all API routes
- ✅ Handles OPTIONS preflight requests correctly
- ✅ Adds detailed logging for debugging

## Required: Set Environment Variables in Vercel

### Critical Firebase Environment Variables

You **MUST** add these environment variables to your Vercel project for user sync to work:

#### Option 1: Using Firebase Service Account (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Copy the entire JSON content
6. In Vercel, add this environment variable:
   ```
   FIREBASE_SERVICE_ACCOUNT=<paste the entire JSON here>
   ```

#### Option 2: Using Project ID Only (Simpler, but less secure)
In Vercel, add:
```
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
```

### Other Required Environment Variables

Make sure you also have these set in Vercel:

```bash
# Supabase (Required)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Firebase Frontend (Required - must start with VITE_)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# JWT Secret (for admin authentication)
JWT_SECRET=<generate a random 32+ character string>
```

## How to Deploy the Fix

### Step 1: Commit and Push Changes
```bash
git add api/index.ts
git commit -m "Fix: User sync 405 error on Vercel deployment"
git push
```

### Step 2: Configure Environment Variables
1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add all the environment variables listed above
5. Make sure to add them for all environments (Production, Preview, Development)

### Step 3: Redeploy
Vercel will automatically redeploy when you push changes. Or manually redeploy from the Vercel dashboard.

### Step 4: Test
1. Visit your deployed site
2. Try to log in with your Firebase account
3. Check the browser console - you should see:
   - ✅ "🔄 Syncing user to Supabase..."
   - ✅ "✅ User synced to Supabase:"
   - ✅ "✅ User profile fetched:"

## Troubleshooting

### Still getting 405 error?
- Check Vercel function logs in the dashboard
- Verify `FIREBASE_SERVICE_ACCOUNT` or `VITE_FIREBASE_PROJECT_ID` is set
- Make sure the environment variables are saved and deployment restarted

### Getting "Firebase Admin not initialized" error?
- You're missing the Firebase environment variables
- Add either `FIREBASE_SERVICE_ACCOUNT` (recommended) or `VITE_FIREBASE_PROJECT_ID`
- Redeploy after adding variables

### JSON parsing error?
- This happens when the API returns an error instead of JSON
- Check Vercel function logs to see the actual error
- Most likely cause: missing environment variables

## Checking Vercel Logs

To see what's happening on Vercel:
1. Go to your Vercel dashboard
2. Click on your project
3. Go to the **Deployments** tab
4. Click on the latest deployment
5. Click on **Functions** → **api/index**
6. You'll see logs including:
   - `📥 POST /api/users/sync`
   - `🔄 Initializing Firebase Admin...`
   - Any errors that occur

---

**Your user sync should now work on Vercel! 🚀**
