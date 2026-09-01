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
import { db } from '../firebase';
import { BlogPost, SEOTemplateConfig, FormatTogglesConfig } from '../types';

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

// --- SEO Template Management ---
export async function fetchSEOTemplate(): Promise<string> {
  try {
    const docRef = doc(db, 'config', 'seo_template');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as SEOTemplateConfig;
      if (data && data.template) {
        return data.template;
      }
    }
  } catch (err) {
    console.warn('Could not fetch remote SEO template, using default:', err);
  }
  return DEFAULT_SEO_TEMPLATE;
}

export async function saveSEOTemplate(template: string): Promise<void> {
  const docRef = doc(db, 'config', 'seo_template');
  await setDoc(docRef, {
    template: template.trim(),
    updatedAt: serverTimestamp()
  }, { merge: true });
}

// --- Format Toggles Management ---
export async function fetchFormatToggles(): Promise<FormatTogglesConfig> {
  try {
    const docRef = doc(db, 'config', 'format_toggles');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as { enabledFormats: FormatTogglesConfig };
      if (data && data.enabledFormats) {
        return { ...DEFAULT_FORMAT_TOGGLES, ...data.enabledFormats };
      }
    }
  } catch (err) {
    console.warn('Could not fetch remote format toggles, using defaults:', err);
  }
  return { ...DEFAULT_FORMAT_TOGGLES };
}

export async function saveFormatToggles(toggles: FormatTogglesConfig): Promise<void> {
  const docRef = doc(db, 'config', 'format_toggles');
  await setDoc(docRef, {
    enabledFormats: toggles,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

// --- Blog Posts Management ---
export async function fetchAllBlogs(): Promise<BlogPost[]> {
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
  } catch (err) {
    console.warn('Could not fetch blogs, returning empty list:', err);
    return [];
  }
}

export async function fetchBlogBySlug(slug: string): Promise<BlogPost | null> {
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
  } catch (err) {
    console.warn('Error fetching blog by slug:', err);
  }
  return null;
}

export async function saveBlogPost(post: Partial<BlogPost>): Promise<string> {
  const blogsCol = collection(db, 'blogs');
  const postData: any = {
    title: post.title?.trim() || 'Untitled Article',
    slug: (post.slug?.trim() || post.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'post').toLowerCase(),
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
