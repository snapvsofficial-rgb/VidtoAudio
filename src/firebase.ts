import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, setLogLevel } from 'firebase/firestore';

// Suppress noisy internal gRPC/WebChannel connection retry logs when backend is offline
setLogLevel('silent');

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const hasFirebaseConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID;
export const db = (databaseId && databaseId !== '(default)') 
  ? getFirestore(app, databaseId) 
  : getFirestore(app);

export default app;


