import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if all required Firebase config values are present
const isFirebaseConfigured = Object.values(firebaseConfig).every(value => value !== undefined && value !== '');

// Initialize Firebase only if properly configured
export const app: FirebaseApp | null = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

// Initialize Firebase Authentication only if app is initialized
export const auth: Auth | null = app ? getAuth(app) : null;

// Initialize Firebase Storage only if app is initialized
export const storage: FirebaseStorage | null = app ? getStorage(app) : null;

// Export auth instance as default
export default auth;
