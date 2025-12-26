// services/userProfileService.ts
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase/config';
import { getCurrentUser } from './authService';

export interface UserProfile {
  name: string;
  email?: string;
  resumeText?: string;
  apiKey?: string; // User's own API key for BYOK feature
  isAnonymous: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  settings: {
    theme?: string;
    notifications?: boolean;
    [key: string]: any;
  };
}

/**
 * Save user profile to Firestore
 * Works for both anonymous and authenticated users
 */
export async function saveUserProfile(profile: Partial<UserProfile>): Promise<void> {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('No user logged in');
  }

  const userRef = doc(db, 'users', user.uid);
  
  const profileData = {
    ...profile,
    email: user.email || null,
    isAnonymous: user.isAnonymous,
    updatedAt: serverTimestamp(),
    // Only set createdAt if this is a new profile
    ...(profile.createdAt === undefined && { createdAt: serverTimestamp() }),
  };
  
  await setDoc(userRef, profileData, { merge: true });
}

/**
 * Get user profile from Firestore
 * Works offline - Firestore will use cached data if offline
 */
export async function getUserProfile(userId?: string): Promise<UserProfile | null> {
  const user = getCurrentUser();
  const uid = userId || user?.uid;
  
  if (!uid) {
    return null;
  }

  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Update user settings
 */
export async function updateUserSettings(settings: Partial<UserProfile['settings']>): Promise<void> {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('No user logged in');
  }

  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, {
    settings: settings,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

