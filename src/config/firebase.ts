import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

/**
 * Centralized Firebase Configuration
 * Ensures Firebase is initialized only once.
 * Exports initialized services for use throughout the app.
 */

// const firebaseConfig = {
//   apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
// };

const firebaseConfig = {
  apiKey: "AIzaSyADg_qwALwH0uczYEBfhOL-0nY_nWddjLQ",
  authDomain: "snap-clone-2b5a1.firebaseapp.com",
  projectId: "snap-clone-2b5a1",
  storageBucket: "snap-clone-2b5a1.firebasestorage.app",
  messagingSenderId: "623291393519",
  appId: "1:623291393519:web:7a5ea1fb45acce1333821a",
  // measurementId: "G-076PTSP8ZH"
};

// Initialize Firebase App
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log('🔥 Firebase initialized successfully');
  console.log('📊 Project ID:', firebaseConfig.projectId);
} else {
  app = getApp();
}

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app; 