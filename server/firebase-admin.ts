import admin from 'firebase-admin';

let firebaseAdmin: admin.app.App | null = null;

export function initializeFirebaseAdmin() {
  if (firebaseAdmin) {
    return firebaseAdmin;
  }

  try {
    // Initialize with service account (preferred for production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    // Fallback: Initialize with project ID only (works for token verification)
    else if (process.env.VITE_FIREBASE_PROJECT_ID) {
      firebaseAdmin = admin.initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      });
    } else {
      console.warn('⚠️  Firebase Admin not configured. User sync will not work.');
      console.warn('   Add FIREBASE_SERVICE_ACCOUNT or VITE_FIREBASE_PROJECT_ID to secrets.');
      return null;
    }

    console.log('✅ Firebase Admin initialized');
    return firebaseAdmin;
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    return null;
  }
}

export function getFirebaseAdmin() {
  if (!firebaseAdmin) {
    return initializeFirebaseAdmin();
  }
  return firebaseAdmin;
}

export async function verifyFirebaseToken(idToken: string): Promise<admin.auth.DecodedIdToken | null> {
  const app = getFirebaseAdmin();
  if (!app) {
    throw new Error('Firebase Admin not initialized');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}
