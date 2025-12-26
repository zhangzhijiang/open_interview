// services/authService.ts
import { 
  signInAnonymously,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth, googleProvider } from './firebase/config';

/**
 * Sign in anonymously (for guest users)
 */
export async function signInAsGuest(): Promise<User> {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error: any) {
    console.error('Anonymous sign-in error:', error);
    // Provide more helpful error message
    if (error.code === 'auth/admin-restricted-operation') {
      throw new Error('Anonymous authentication is not enabled. Please enable it in Firebase Console or sign in with Google.');
    }
    throw new Error(`Failed to sign in as guest: ${error.message}`);
  }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    throw new Error(`Failed to sign in with Google: ${error.message}`);
  }
}

/**
 * Sign out the current user
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error(`Failed to sign out: ${error.message}`);
  }
}

/**
 * Listen to authentication state changes
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get the current authenticated user
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Check if current user is anonymous
 */
export function isAnonymousUser(): boolean {
  return auth.currentUser?.isAnonymous ?? false;
}

