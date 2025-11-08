import { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { User as SupabaseUser } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  userProfile: SupabaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (firebaseUser: User) => {
    try {
      const idToken = await firebaseUser.getIdToken();
      
      console.log('🔄 Syncing user to Supabase...', firebaseUser.email);
      
      // Sync user to Supabase
      const syncResponse = await fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      if (!syncResponse.ok) {
        const error = await syncResponse.json();
        console.error('❌ User sync failed:', error);
        throw new Error(error.error || 'Failed to sync user');
      }

      const syncResult = await syncResponse.json();
      console.log('✅ User synced to Supabase:', syncResult);

      // Fetch user profile including role
      console.log('🔄 Fetching user profile from Supabase...');
      const response = await fetch('/api/users/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Failed to fetch user profile:', error);
        throw new Error(error.error || 'Failed to fetch profile');
      }

      const profile = await response.json();
      console.log('✅ User profile fetched:', { email: profile.email, role: profile.role });
      setUserProfile(profile);
    } catch (error) {
      console.error('❌ Error in fetchUserProfile:', error);
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user);
    }
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        await fetchUserProfile(user);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase is not configured');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, name: string) => {
    if (!auth) throw new Error('Firebase is not configured');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    await updateProfile(userCredential.user, {
      displayName: name
    });
    
    // Refresh user to get updated profile
    await userCredential.user.reload();
    setUser(auth.currentUser);
  };

  const loginWithGoogle = async () => {
    if (!auth) throw new Error('Firebase is not configured');
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    if (!auth) throw new Error('Firebase is not configured');
    await signOut(auth);
  };

  const value = {
    user,
    userProfile,
    loading,
    isAdmin: userProfile?.role === 'admin',
    login,
    signup,
    loginWithGoogle,
    logout,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
