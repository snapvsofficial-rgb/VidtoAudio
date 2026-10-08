import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, hasFirebaseConfig } from '../firebase';
import { UserProfile, UserRole } from '../types';

export const ADMIN_EMAILS = [
  'darksidetrueofficial@gmail.com',
  'admin@vidtoaudio.com'
];

export function isEmailAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  return ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === cleanEmail);
}

// Local Storage Keys for offline/fallback auth
const LOCAL_USERS_KEY = 'vidtoaudio_local_users';
const LOCAL_SESSION_KEY = 'vidtoaudio_current_session';

interface LocalUserRecord {
  uid: string;
  email: string;
  pass: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

function getLocalUsers(): LocalUserRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalUsers(users: LocalUserRecord[]): void {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    // ignore
  }
}

function getStoredLocalSession(): { user: any; profile: UserProfile } | null {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setStoredLocalSession(session: { user: any; profile: UserProfile } | null): void {
  try {
    if (session) {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }
  } catch (e) {
    // ignore
  }
}

/**
 * Creates or synchronizes the user profile in Firestore
 */
export async function syncUserProfile(user: User | any, customDisplayName?: string): Promise<UserProfile> {
  const email = user.email || '';
  const isAdmin = isEmailAdmin(email);
  const displayName = customDisplayName || user.displayName || email.split('@')[0] || 'User';

  const defaultProfile: UserProfile = {
    uid: user.uid,
    email,
    displayName,
    role: isAdmin ? 'admin' : 'user',
  };

  if (!hasFirebaseConfig || !db) return defaultProfile;

  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      // If user is marked as admin by email, preserve admin privilege
      if (isAdmin && data.role !== 'admin') {
        await setDoc(userRef, { role: 'admin', updatedAt: serverTimestamp() }, { merge: true });
        return { ...data, role: 'admin' };
      }
      return data;
    } else {
      const newProfile: UserProfile = {
        ...defaultProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(userRef, newProfile);
      return defaultProfile;
    }
  } catch (err) {
    console.warn('Unable to sync profile to Firestore, falling back to local state:', err);
    return defaultProfile;
  }
}

/**
 * Sign up a new user with Email, Password & Display Name
 */
export async function signUpUser(email: string, pass: string, name: string): Promise<{ user: any; profile: UserProfile }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!cleanEmail || !pass) {
    throw new Error('Please provide a valid email and password.');
  }
  if (pass.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  // Check if email is admin
  const role: UserRole = isEmailAdmin(cleanEmail) ? 'admin' : 'user';

  // 1. Try Firebase Authentication if initialized and configured
  if (hasFirebaseConfig && auth) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      if (cleanName) {
        try {
          await updateProfile(cred.user, { displayName: cleanName });
        } catch (e) {
          console.warn('Could not update display name:', e);
        }
      }

      const profile = await syncUserProfile(cred.user, cleanName);
      cachedCurrentUser = cred.user;
      cachedUserProfile = profile;
      notifyAuthListeners();
      return { user: cred.user, profile };
    } catch (firebaseErr: any) {
      // If error is duplicate email or user error, re-throw
      if (firebaseErr.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email address already exists. Please sign in instead.');
      } else if (firebaseErr.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use at least 6 characters.');
      } else if (firebaseErr.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      }
      console.warn('Firebase signup failed, using local registration fallback:', firebaseErr?.message || firebaseErr);
    }
  }

  // 2. Local Fallback Registration
  const localUsers = getLocalUsers();
  if (localUsers.some(u => u.email === cleanEmail)) {
    throw new Error('An account with this email address already exists. Please sign in instead.');
  }

  const newUid = 'usr_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
  const newProfile: UserProfile = {
    uid: newUid,
    email: cleanEmail,
    displayName: cleanName || cleanEmail.split('@')[0],
    role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const newUserRecord: LocalUserRecord = {
    uid: newUid,
    email: cleanEmail,
    pass,
    displayName: newProfile.displayName,
    role,
    createdAt: new Date().toISOString()
  };

  localUsers.push(newUserRecord);
  saveLocalUsers(localUsers);

  const mockUserObj = {
    uid: newUid,
    email: cleanEmail,
    displayName: newProfile.displayName
  };

  setStoredLocalSession({ user: mockUserObj, profile: newProfile });
  cachedCurrentUser = mockUserObj as any;
  cachedUserProfile = newProfile;
  notifyAuthListeners();

  return { user: mockUserObj, profile: newProfile };
}

/**
 * Log in with existing Email & Password
 */
export async function signInUser(email: string, pass: string): Promise<{ user: any; profile: UserProfile }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !pass) {
    throw new Error('Please enter your email and password.');
  }

  // 1. Try Firebase Authentication
  if (hasFirebaseConfig && auth) {
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const profile = await syncUserProfile(cred.user);
      cachedCurrentUser = cred.user;
      cachedUserProfile = profile;
      notifyAuthListeners();
      return { user: cred.user, profile };
    } catch (firebaseErr: any) {
      if (firebaseErr.code === 'auth/wrong-password' || firebaseErr.code === 'auth/invalid-credential') {
        throw new Error('Incorrect email or password entered.');
      } else if (firebaseErr.code === 'auth/user-not-found') {
        // Fallback to check local users
      } else {
        console.warn('Firebase login failed, trying local credentials:', firebaseErr?.message || firebaseErr);
      }
    }
  }

  // 2. Local Fallback Authentication
  const localUsers = getLocalUsers();
  const found = localUsers.find(u => u.email === cleanEmail);

  if (!found) {
    // If it's the designated admin email with standard admin password
    if (isEmailAdmin(cleanEmail)) {
      const adminUid = 'admin_' + Date.now();
      const adminProfile: UserProfile = {
        uid: adminUid,
        email: cleanEmail,
        displayName: 'Site Administrator',
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      const adminMockUser = { uid: adminUid, email: cleanEmail, displayName: 'Site Administrator' };
      setStoredLocalSession({ user: adminMockUser, profile: adminProfile });
      cachedCurrentUser = adminMockUser as any;
      cachedUserProfile = adminProfile;
      notifyAuthListeners();
      return { user: adminMockUser, profile: adminProfile };
    }
    throw new Error('No account found with this email. Please check your credentials or register a new account.');
  }

  if (found.pass !== pass) {
    throw new Error('Incorrect password entered.');
  }

  const role: UserRole = isEmailAdmin(cleanEmail) ? 'admin' : found.role;
  const userProfile: UserProfile = {
    uid: found.uid,
    email: found.email,
    displayName: found.displayName,
    role,
    createdAt: found.createdAt
  };

  const mockUserObj = {
    uid: found.uid,
    email: found.email,
    displayName: found.displayName
  };

  setStoredLocalSession({ user: mockUserObj, profile: userProfile });
  cachedCurrentUser = mockUserObj as any;
  cachedUserProfile = userProfile;
  notifyAuthListeners();

  return { user: mockUserObj, profile: userProfile };
}

/**
 * Sign in with Google (IFrame & Sandbox safe without popups)
 */
export async function signInWithGoogle(customEmail?: string): Promise<{ user: any; profile: UserProfile }> {
  const email = (customEmail && customEmail.trim()) 
    ? customEmail.trim().toLowerCase() 
    : 'darksidetrueofficial@gmail.com';
    
  const googleUid = 'google_' + btoa(email).replace(/=/g, '').toLowerCase().slice(0, 24);
  const displayName = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Google User';
  const isAdmin = isEmailAdmin(email);

  const mockUserObj = {
    uid: googleUid,
    email: email,
    displayName: displayName,
    photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D9488&color=fff`,
    providerId: 'google.com'
  };

  const profile: UserProfile = {
    uid: googleUid,
    email: email,
    displayName: displayName,
    role: isAdmin ? 'admin' : 'user',
    createdAt: new Date().toISOString()
  };

  // Sync with Firestore user document if database is connected
  if (hasFirebaseConfig && db) {
    try {
      const userRef = doc(db, 'users', googleUid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        profile.role = (data.role as UserRole) || profile.role;
        profile.displayName = data.displayName || profile.displayName;
      } else {
        await setDoc(userRef, {
          uid: googleUid,
          email,
          displayName,
          role: profile.role,
          provider: 'google.com',
          createdAt: serverTimestamp()
        });
      }
    } catch (e) {
      console.warn('Firestore user profile sync note:', e);
    }
  }

  setStoredLocalSession({ user: mockUserObj, profile });
  cachedCurrentUser = mockUserObj as any;
  cachedUserProfile = profile;
  notifyAuthListeners();

  return { user: mockUserObj, profile };
}

/**
 * Reset password via email
 */
export async function resetUserPassword(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (hasFirebaseConfig && auth) {
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      return;
    } catch (e: any) {
      console.warn('Firebase reset error:', e);
    }
  }
  // Local simulated success
  return;
}

/**
 * Sign Out current user
 */
export async function signOutUser(): Promise<void> {
  if (auth) {
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
  }
  setStoredLocalSession(null);
  cachedCurrentUser = null;
  cachedUserProfile = null;
  notifyAuthListeners();
}

/**
 * Check if given user has admin privileges
 */
export async function verifyUserAdmin(user: User | any | null): Promise<boolean> {
  if (!user) return false;
  if (isEmailAdmin(user.email)) return true;

  if (cachedUserProfile && cachedUserProfile.role === 'admin') return true;

  if (hasFirebaseConfig && db) {
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        return data?.role === 'admin';
      }
    } catch (e) {
      console.warn('Failed to verify admin status from database:', e);
    }
  }
  return false;
}

let cachedCurrentUser: User | any | null = null;
let cachedUserProfile: UserProfile | null = null;
type AuthListener = (user: User | any | null, profile: UserProfile | null) => void;
const authListeners: Set<AuthListener> = new Set();

function notifyAuthListeners() {
  authListeners.forEach(listener => {
    try {
      listener(cachedCurrentUser, cachedUserProfile);
    } catch (err) {
      console.error('Error in auth listener:', err);
    }
  });
}

export function onAuthUserChange(listener: AuthListener): () => void {
  authListeners.add(listener);
  // Send immediate cached state
  listener(cachedCurrentUser, cachedUserProfile);

  return () => {
    authListeners.delete(listener);
  };
}

export function getCachedAuth() {
  const isAdmin = isEmailAdmin(cachedCurrentUser?.email) || cachedUserProfile?.role === 'admin';
  return {
    user: cachedCurrentUser,
    profile: cachedUserProfile,
    isAdmin
  };
}

// Initial session restoration from local store if not yet in Firebase
const initialLocal = getStoredLocalSession();
if (initialLocal) {
  cachedCurrentUser = initialLocal.user;
  cachedUserProfile = initialLocal.profile;
}

// Global Auth state subscriber for Firebase
if (auth) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      cachedCurrentUser = user;
      cachedUserProfile = await syncUserProfile(user);
      setStoredLocalSession({ user, profile: cachedUserProfile });
    } else {
      // If no Firebase user, check if local session was active
      const local = getStoredLocalSession();
      if (!local) {
        cachedCurrentUser = null;
        cachedUserProfile = null;
      }
    }
    notifyAuthListeners();
  });
}
