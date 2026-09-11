import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  where,
  limit
} from 'firebase/firestore';
import { db, hasFirebaseConfig } from '../firebase';
import { BlogPost, SEOTemplateConfig, FormatTogglesConfig, SiteSettingsConfig } from '../types';

export const DEFAULT_SEO_TEMPLATE = 
  "Converting your {INPUT} video files to {OUTPUT} audio is perfect for saving space and extracting high-fidelity sound. Unlike cloud services, our on-device engine processes the {INPUT} completely offline, ensuring your data never leaves your browser.";

export const DEFAULT_FORMAT_TOGGLES: FormatTogglesConfig = {
  wav: true,
  mp3: true,
  aac: true,
  flac: true,
  ogg: true,
  m4a: true,
  wma: true,
  opus: true,
  aiff: true
};

export const DEFAULT_SITE_SETTINGS: SiteSettingsConfig = {
  primaryColor: '#14b8a6', // Teal
  siteMetaTitle: 'VidToAudio - Free, Offline & On-Device Audio Converter',
  footerText: 'VidToAudio. All rights reserved. 100% On-Device Audio Extraction.',
  vercelDeployHook: ''
};

// --- SEO Template Management (Cloud Firestore) ---
export async function fetchSEOTemplate(): Promise<string> {
  if (!hasFirebaseConfig) return DEFAULT_SEO_TEMPLATE;
  try {
    const docRef = doc(db, 'config', 'seo_template');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as SEOTemplateConfig;
      if (data && data.template) {
        return data.template;
      }
    }
  } catch (err: any) {
    if (err?.message?.includes('offline') || err?.code === 'unavailable') {
      console.warn('[Firestore] Using default SEO template (offline mode).');
    } else {
      console.warn('Failed to fetch SEO template from Firestore:', err?.message || err);
    }
  }
  return DEFAULT_SEO_TEMPLATE;
}

export async function saveSEOTemplate(template: string): Promise<void> {
  if (!hasFirebaseConfig) return;
  const cleanTemplate = template.trim();
  const docRef = doc(db, 'config', 'seo_template');
  await setDoc(docRef, {
    template: cleanTemplate,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

// --- Format Toggles Management (Cloud Firestore) ---
export async function fetchFormatToggles(): Promise<FormatTogglesConfig> {
  if (!hasFirebaseConfig) return { ...DEFAULT_FORMAT_TOGGLES };
  try {
    const docRef = doc(db, 'config', 'format_toggles');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as { enabledFormats: FormatTogglesConfig };
      if (data && data.enabledFormats) {
        return { ...DEFAULT_FORMAT_TOGGLES, ...data.enabledFormats };
      }
    }
  } catch (err: any) {
    if (err?.message?.includes('offline') || err?.code === 'unavailable') {
      console.warn('[Firestore] Using default format toggles (offline mode).');
    } else {
      console.warn('Failed to fetch format toggles from Firestore:', err?.message || err);
    }
  }
  return { ...DEFAULT_FORMAT_TOGGLES };
}

export async function saveFormatToggles(toggles: FormatTogglesConfig): Promise<void> {
  if (!hasFirebaseConfig) return;
  const docRef = doc(db, 'config', 'format_toggles');
  await setDoc(docRef, {
    enabledFormats: toggles,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

// --- Site Settings Management (Cloud Firestore) ---
export async function fetchSiteSettings(): Promise<SiteSettingsConfig> {
  if (!hasFirebaseConfig) return { ...DEFAULT_SITE_SETTINGS };
  try {
    const docRef = doc(db, 'config', 'site_settings');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as SiteSettingsConfig;
      if (data) {
        return { ...DEFAULT_SITE_SETTINGS, ...data };
      }
    }
  } catch (err: any) {
    if (err?.message?.includes('offline') || err?.code === 'unavailable') {
      console.warn('[Firestore] Using default site settings (offline mode).');
    } else {
      console.warn('Failed to fetch site settings from Firestore:', err?.message || err);
    }
  }
  return { ...DEFAULT_SITE_SETTINGS };
}

export async function saveSiteSettings(settings: SiteSettingsConfig): Promise<void> {
  if (!hasFirebaseConfig) return;
  const merged: SiteSettingsConfig = { ...DEFAULT_SITE_SETTINGS, ...settings };
  const docRef = doc(db, 'config', 'site_settings');
  await setDoc(docRef, {
    ...merged,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

// --- Blog Posts Management (Cloud Firestore) ---
export async function fetchAllBlogs(): Promise<BlogPost[]> {
  if (!hasFirebaseConfig) return [];
  try {
    const blogsCol = collection(db, 'blogs');
    const q = query(blogsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title || 'Untitled Post',
        slug: data.slug || d.id,
        content: data.content || '',
        excerpt: data.excerpt || '',
        authorEmail: data.authorEmail || 'Admin',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        published: data.published !== false
      };
    });
  } catch (err: any) {
    if (err?.message?.includes('offline') || err?.code === 'unavailable') {
      console.warn('[Firestore] Blogs unavailable in offline mode.');
    } else {
      console.warn('Failed to fetch blogs from Firestore:', err?.message || err);
    }
    return [];
  }
}

export async function fetchBlogBySlug(slug: string): Promise<BlogPost | null> {
  if (!hasFirebaseConfig) return null;
  try {
    const blogsCol = collection(db, 'blogs');
    const q = query(blogsCol, where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const d = snapshot.docs[0];
      const data = d.data();
      return {
        id: d.id,
        title: data.title || 'Untitled',
        slug: data.slug || slug,
        content: data.content || '',
        excerpt: data.excerpt || '',
        authorEmail: data.authorEmail || 'Admin',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        published: data.published !== false
      };
    }
  } catch (err: any) {
    if (err?.message?.includes('offline') || err?.code === 'unavailable') {
      console.warn('[Firestore] Blog unavailable in offline mode.');
    } else {
      console.warn('Failed to fetch blog by slug from Firestore:', err?.message || err);
    }
  }
  return null;
}

export async function saveBlogPost(post: Partial<BlogPost>): Promise<string> {
  const blogsCol = collection(db, 'blogs');
  const slug = (post.slug?.trim() || post.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'post').toLowerCase();
  const postData: any = {
    title: post.title?.trim() || 'Untitled Article',
    slug,
    content: post.content || '',
    excerpt: post.excerpt?.trim() || (post.content ? post.content.slice(0, 160).replace(/[#*`]/g, '') + '...' : ''),
    authorEmail: post.authorEmail || 'admin@vidtoaudio.com',
    updatedAt: serverTimestamp(),
    published: post.published !== false
  };

  if (post.id) {
    const docRef = doc(db, 'blogs', post.id);
    await setDoc(docRef, postData, { merge: true });
    return post.id;
  } else {
    postData.createdAt = serverTimestamp();
    const newDocRef = doc(blogsCol);
    await setDoc(newDocRef, postData);
    return newDocRef.id;
  }
}

export async function deleteBlogPost(id: string): Promise<void> {
  const docRef = doc(db, 'blogs', id);
  await deleteDoc(docRef);
}
