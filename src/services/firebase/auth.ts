import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import type { User } from '../../store/slices/auth.slice';

/**
 * Firebase Authentication Service
 * Handles user authentication operations including signup, login, and logout.
 * Integrates with Firestore to store user profile data.
 */

export interface SignupData {
  email: string;
  password: string;
  username: string;
}

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Convert Firebase user to our app user format
 */
function firebaseUserToAppUser(firebaseUser: FirebaseUser): User {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
    createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
    lastLogin: new Date(firebaseUser.metadata.lastSignInTime || Date.now()),
  };
}

/**
 * Sign up a new user with email and password
 */
export async function signUpWithEmail({ email, password, username }: SignupData): Promise<User> {
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update user profile with username
    await updateProfile(firebaseUser, {
      displayName: username,
    });

    // Create user document in Firestore
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      username: username,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });

    return firebaseUserToAppUser(firebaseUser);
  } catch (error: any) {
    console.error('Signup error:', error);
    throw new Error(error.message || 'Failed to create account');
  }
}

/**
 * Sign in user with email and password
 */
export async function signInWithEmail({ email, password }: LoginData): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update last login time
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      lastLogin: serverTimestamp(),
    }, { merge: true });

    return firebaseUserToAppUser(firebaseUser);
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
}

/**
 * Sign out the current user
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Logout error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
}

/**
 * Get current user authentication state
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

/**
 * Check if user is currently authenticated
 */
export function isAuthenticated(): boolean {
  return auth.currentUser !== null;
}

/**
 * Send password reset email to user
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Password reset error:', error);
    throw new Error(error.message || 'Failed to send password reset email');
  }
} 