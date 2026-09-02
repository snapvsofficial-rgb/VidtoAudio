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

// --- Local storage fallback keys ---
const LS_SEO_KEY = 'vidtoaudio_seo_template';
const LS_TOGGLES_KEY = 'vidtoaudio_format_toggles';
const LS_BLOGS_KEY = 'vidtoaudio_local_blogs';

// --- SEO Template Management ---
export async function fetchSEOTemplate(): Promise<string> {
  try {
    const docRef = doc(db, 'config', 'seo_template');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as SEOTemplateConfig;
      if (data && data.template) {
        localStorage.setItem(LS_SEO_KEY, data.template);
        return data.template;
      }
    }
  } catch (err) {
    console.warn('Could not fetch remote SEO template, checking local cache:', err);
  }
  const cached = localStorage.getItem(LS_SEO_KEY);
  return cached || DEFAULT_SEO_TEMPLATE;
}

export async function saveSEOTemplate(template: string): Promise<void> {
  const cleanTemplate = template.trim();
  localStorage.setItem(LS_SEO_KEY, cleanTemplate);
  try {
    const docRef = doc(db, 'config', 'seo_template');
    await setDoc(docRef, {
      template: cleanTemplate,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Could not write SEO template to Firestore (cached locally):', err);
  }
}

// --- Format Toggles Management ---
export async function fetchFormatToggles(): Promise<FormatTogglesConfig> {
  try {
    const docRef = doc(db, 'config', 'format_toggles');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as { enabledFormats: FormatTogglesConfig };
      if (data && data.enabledFormats) {
        const merged = { ...DEFAULT_FORMAT_TOGGLES, ...data.enabledFormats };
        localStorage.setItem(LS_TOGGLES_KEY, JSON.stringify(merged));
        return merged;
      }
    }
  } catch (err) {
    console.warn('Could not fetch remote format toggles, checking local cache:', err);
  }
  const cached = localStorage.getItem(LS_TOGGLES_KEY);
  if (cached) {
    try {
      return { ...DEFAULT_FORMAT_TOGGLES, ...JSON.parse(cached) };
    } catch {
      // fallback
    }
  }
  return { ...DEFAULT_FORMAT_TOGGLES };
}

export async function saveFormatToggles(toggles: FormatTogglesConfig): Promise<void> {
  localStorage.setItem(LS_TOGGLES_KEY, JSON.stringify(toggles));
  try {
    const docRef = doc(db, 'config', 'format_toggles');
    await setDoc(docRef, {
      enabledFormats: toggles,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Could not write format toggles to Firestore (cached locally):', err);
  }
}

// --- Blog Posts Management ---
function getLocalBlogs(): BlogPost[] {
  try {
    const data = localStorage.getItem(LS_BLOGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalBlogs(blogs: BlogPost[]): void {
  try {
    localStorage.setItem(LS_BLOGS_KEY, JSON.stringify(blogs));
  } catch (e) {
    console.warn('Could not write to local blogs cache:', e);
  }
}

export async function fetchAllBlogs(): Promise<BlogPost[]> {
  try {
    const blogsCol = collection(db, 'blogs');
    const q = query(blogsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const remoteBlogs = snapshot.docs.map(d => {
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

    if (remoteBlogs.length > 0) {
      saveLocalBlogs(remoteBlogs);
      return remoteBlogs;
    }
  } catch (err) {
    console.warn('Could not fetch remote blogs, falling back to local blogs storage:', err);
  }
  return getLocalBlogs();
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
    console.warn('Error fetching blog by slug from Firestore, searching local cache:', err);
  }
  const localList = getLocalBlogs();
  return localList.find(b => b.slug === slug) || null;
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

  const id = post.id || 'blog_' + Date.now();
  const localList = getLocalBlogs();
  const existingIdx = localList.findIndex(b => b.id === id || b.slug === slug);
  const localItem: BlogPost = {
    id,
    title: postData.title,
    slug: postData.slug,
    content: postData.content,
    excerpt: postData.excerpt,
    authorEmail: postData.authorEmail,
    createdAt: post.createdAt || new Date(),
    updatedAt: new Date(),
    published: postData.published
  };

  if (existingIdx >= 0) {
    localList[existingIdx] = { ...localList[existingIdx], ...localItem };
  } else {
    localList.unshift(localItem);
  }
  saveLocalBlogs(localList);

  try {
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
  } catch (err) {
    console.warn('Could not sync blog to Firestore (saved locally):', err);
    return id;
  }
}

export async function deleteBlogPost(id: string): Promise<void> {
  const localList = getLocalBlogs().filter(b => b.id !== id);
  saveLocalBlogs(localList);
  try {
    const docRef = doc(db, 'blogs', id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Could not delete blog from Firestore (deleted locally):', err);
  }
}
