import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Fallback configuration from provisioned Firebase project
const defaultFirebaseConfig = {
  apiKey: "AIzaSyASZDEuXbckR84oMfLk5oqC7utivaYkaOw",
  authDomain: "concise-producer-n1wkv.firebaseapp.com",
  projectId: "concise-producer-n1wkv",
  storageBucket: "concise-producer-n1wkv.firebasestorage.app",
  messagingSenderId: "743066767402",
  appId: "1:743066767402:web:030a2ef72e2374ee817353",
  firestoreDatabaseId: "ai-studio-vidtoaudio-61b7ddf1-3de3-4e17-89d3-3fcc60ecf01c"
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultFirebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultFirebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultFirebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultFirebaseConfig.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || defaultFirebaseConfig.firestoreDatabaseId;
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

export default app;
