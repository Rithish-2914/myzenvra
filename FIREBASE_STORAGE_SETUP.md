# Firebase Storage Setup for myzenvra

## Overview
The application uses Firebase Storage for uploading and managing category images directly from the admin dashboard.

## Firebase Storage Rules

To enable admin-only uploads to the `categories` folder, configure your Firebase Storage security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated admins to upload category images
    match /categories/{imageId} {
      allow read: if true; // Public read access for displaying images
      allow write: if request.auth != null; // Only authenticated users can upload
      allow delete: if request.auth != null; // Only authenticated users can delete
    }
    
    // Block all other paths by default
    match /{allPaths=**} {
      allow read: if false;
      allow write: if false;
    }
  }
}
```

### Enhanced Security (Recommended)

For stricter access control, limit uploads to users with admin role:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.role == 'admin';
    }
    
    // Category images - admin only uploads
    match /categories/{imageId} {
      allow read: if true; // Public read
      allow write, delete: if isAdmin();
    }
    
    // Product images (if needed later)
    match /products/{imageId} {
      allow read: if true;
      allow write, delete: if isAdmin();
    }
    
    // Block all other paths
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## File Validation

The ImageUpload component automatically validates:
- **File Type**: Only images (JPG, PNG, WEBP)
- **File Size**: Maximum 5MB
- **Unique Names**: Generated with timestamp + random ID to prevent collisions

## Storage Structure

```
gs://your-bucket-name/
├── categories/
│   ├── 1731410123456_abc123.jpg
│   ├── 1731410234567_def456.png
│   └── ...
└── (other folders for future use)
```

## Usage in Admin Dashboard

1. Navigate to **Admin Dashboard > Categories**
2. Click "Add Category" or edit an existing category
3. Use the image upload section to:
   - **Drag & drop** an image, OR
   - **Click** to browse and select
4. Watch the **upload progress** bar
5. Image automatically saves to Firebase Storage
6. Download URL is saved to category in Supabase database

## Environment Variables Required

Make sure these are set in your Replit Secrets:
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

## Troubleshooting

### "Firebase Storage is not configured" Error
- Check that all Firebase environment variables are set
- Verify Firebase project has Storage enabled
- Check that storage bucket name matches in Firebase Console

### Upload Fails
- Verify Firebase Storage rules allow authenticated uploads
- Check file size (must be < 5MB)
- Ensure file is a valid image format

### Images Don't Display
- Check Storage rules allow public read access
- Verify the download URL is correctly saved to database
- Check browser console for CORS errors
