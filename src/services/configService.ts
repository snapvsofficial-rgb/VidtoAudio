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

// --- Local storage fallback keys ---
const LS_SEO_KEY = 'vidtoaudio_seo_template';
const LS_TOGGLES_KEY = 'vidtoaudio_format_toggles';
const LS_BLOGS_KEY = 'vidtoaudio_local_blogs';
const LS_SETTINGS_KEY = 'vidtoaudio_site_settings';

// --- Resilience & Connection Health Tracker ---
let firestoreReachable: boolean | null = null;
let lastReachabilityCheck = 0;
const REACHABILITY_COOLDOWN_MS = 60000; // 1 min cooldown before retrying backend if disabled/offline

function withTimeout<T>(promise: Promise<T>, ms = 1500): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Firestore connection timeout')), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

function canAttemptFirestore(): boolean {
  if (firestoreReachable === false) {
    if (Date.now() - lastReachabilityCheck < REACHABILITY_COOLDOWN_MS) {
      return false;
    }
  }
  return true;
}

function markFirestoreOffline(err?: unknown) {
  firestoreReachable = false;
  lastReachabilityCheck = Date.now();
  // Keep error non-intrusive and prevent noisy console errors
  if (err && process.env.NODE_ENV !== 'production') {
    const msg = (err as any)?.message || String(err);
    if (!msg.includes('offline') && !msg.includes('timeout')) {
      console.info('[ConfigService] Operating in local offline storage mode:', msg);
    }
  }
}

function markFirestoreOnline() {
  firestoreReachable = true;
  lastReachabilityCheck = Date.now();
}

export function getFirestoreConnectionStatus() {
  return {
    isOnline: firestoreReachable === true,
    isOffline: firestoreReachable === false,
    message: firestoreReachable === false 
      ? 'Local Storage Mode (Cloud Firestore API pending in GCP project vidtoaudio)'
      : 'Cloud Firestore Connected'
  };
}

// --- SEO Template Management ---
export async function fetchSEOTemplate(): Promise<string> {
  if (canAttemptFirestore()) {
    try {
      const docRef = doc(db, 'config', 'seo_template');
      const docSnap = await withTimeout(getDoc(docRef), 1200);
      if (docSnap.exists()) {
        const data = docSnap.data() as SEOTemplateConfig;
        if (data && data.template) {
          localStorage.setItem(LS_SEO_KEY, data.template);
          markFirestoreOnline();
          return data.template;
        }
      }
    } catch (err) {
      markFirestoreOffline(err);
    }
  }
  const cached = localStorage.getItem(LS_SEO_KEY);
  return cached || DEFAULT_SEO_TEMPLATE;
}

export async function saveSEOTemplate(template: string): Promise<void> {
  const cleanTemplate = template.trim();
  localStorage.setItem(LS_SEO_KEY, cleanTemplate);
  if (canAttemptFirestore()) {
    try {
      const docRef = doc(db, 'config', 'seo_template');
      await withTimeout(setDoc(docRef, {
        template: cleanTemplate,
        updatedAt: serverTimestamp()
      }, { merge: true }), 2000);
      markFirestoreOnline();
    } catch (err) {
      markFirestoreOffline(err);
    }
  }
}

// --- Format Toggles Management ---
export async function fetchFormatToggles(): Promise<FormatTogglesConfig> {
  if (canAttemptFirestore()) {
    try {
      const docRef = doc(db, 'config', 'format_toggles');
      const docSnap = await withTimeout(getDoc(docRef), 1200);
      if (docSnap.exists()) {
        const data = docSnap.data() as { enabledFormats: FormatTogglesConfig };
        if (data && data.enabledFormats) {
          const merged = { ...DEFAULT_FORMAT_TOGGLES, ...data.enabledFormats };
          localStorage.setItem(LS_TOGGLES_KEY, JSON.stringify(merged));
          markFirestoreOnline();
          return merged;
        }
      }
    } catch (err) {
      markFirestoreOffline(err);
    }
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
  if (canAttemptFirestore()) {
    try {
      const docRef = doc(db, 'config', 'format_toggles');
      await withTimeout(setDoc(docRef, {
        enabledFormats: toggles,
        updatedAt: serverTimestamp()
      }, { merge: true }), 2000);
      markFirestoreOnline();
    } catch (err) {
      markFirestoreOffline(err);
    }
  }
}

// --- Site Settings Management (Global Theme, Meta Title, Footer, Deploy Hook) ---
export async function fetchSiteSettings(): Promise<SiteSettingsConfig> {
  if (canAttemptFirestore()) {
    try {
      const docRef = doc(db, 'config', 'site_settings');
      const docSnap = await withTimeout(getDoc(docRef), 1200);
      if (docSnap.exists()) {
        const data = docSnap.data() as SiteSettingsConfig;
        if (data) {
          const merged: SiteSettingsConfig = { ...DEFAULT_SITE_SETTINGS, ...data };
          localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(merged));
          markFirestoreOnline();
          return merged;
        }
      }
    } catch (err) {
      markFirestoreOffline(err);
    }
  }
  const cached = localStorage.getItem(LS_SETTINGS_KEY);
  if (cached) {
    try {
      return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(cached) };
    } catch {
      // fallback
    }
  }
  return { ...DEFAULT_SITE_SETTINGS };
}

export async function saveSiteSettings(settings: SiteSettingsConfig): Promise<void> {
  const merged: SiteSettingsConfig = { ...DEFAULT_SITE_SETTINGS, ...settings };
  localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(merged));
  if (canAttemptFirestore()) {
    try {
      const docRef = doc(db, 'config', 'site_settings');
      await withTimeout(setDoc(docRef, {
        ...merged,
        updatedAt: serverTimestamp()
      }, { merge: true }), 2000);
      markFirestoreOnline();
    } catch (err) {
      markFirestoreOffline(err);
    }
  }
}

// --- Default High-Fidelity Technical Blog Posts ---
export const DEFAULT_LOCAL_BLOGS: BlogPost[] = [
  {
    id: 'blog_extract_offline',
    title: 'How to Extract Audio from Video Completely Offline',
    slug: 'how-to-extract-audio-from-video-offline',
    excerpt: 'Learn how modern WebAssembly and HTML5 audio APIs let you extract pristine audio tracks from MP4, MKV, and WebM videos without sending your private files to remote servers.',
    authorEmail: 'team@vidtoaudio.com',
    createdAt: new Date('2026-08-15T10:00:00Z'),
    updatedAt: new Date('2026-08-15T10:00:00Z'),
    published: true,
    content: `# How to Extract Audio from Video Completely Offline

Extracting audio from video files traditionally required uploading gigabytes of private recordings to third-party cloud converters. This workflow introduces latency, bandwidth caps, and serious privacy risks.

With modern browser capabilities like **WebAssembly (Wasm)** and the **Web Audio API**, high-speed audio demuxing and transcoding can execute entirely on your device's local CPU.

## Why Offline On-Device Extraction Matters

- **Zero Upload Latency**: No waiting for multi-gigabyte video files to travel across the internet.
- **Complete Privacy**: Meeting recordings, private interviews, and personal home videos never touch an external server.
- **Unlimited File Size**: Because processing occurs in browser memory and local blobs, network transfer size limits do not apply.
- **Hardware Acceleration**: Multi-threaded SIMD instructions process minutes of video in just seconds.

## Recommended Output Formats

1. **WAV (PCM Uncompressed)**: Perfect for studio mixing, video editing (DaVinci Resolve, Premiere Pro), or archival audio.
2. **MP3**: The universal standard for speech, podcasts, and mobile media players.
3. **FLAC**: Lossless compression offering 40-50% smaller files without sacrificing a single bit of audio quality.
4. **AAC / M4A**: Superior efficiency for Apple devices and streaming playback.
`
  },
  {
    id: 'blog_mp4_wav_mp3',
    title: 'MP4 to WAV vs MP3: The Definitive Audio Fidelity Guide',
    slug: 'mp4-to-wav-vs-mp3-fidelity-guide',
    excerpt: 'Detailed comparison between uncompressed WAV PCM and lossy MP3 encoding. Understand sample rates, bit depths, and when to pick each format.',
    authorEmail: 'engineering@vidtoaudio.com',
    createdAt: new Date('2026-08-20T14:30:00Z'),
    updatedAt: new Date('2026-08-20T14:30:00Z'),
    published: true,
    content: `# MP4 to WAV vs MP3: The Definitive Audio Fidelity Guide

When extracting the soundtrack from an MP4 video, choosing between **WAV** and **MP3** depends entirely on your intended use case.

## Format Comparison Overview

| Parameter | WAV (Linear PCM) | MP3 (MPEG-1 Layer III) |
| :--- | :--- | :--- |
| **Compression** | None (Lossless) | Psychoacoustic (Lossy) |
| **Typical Bitrate** | 1,411 kbps (16-bit 44.1kHz) | 128 - 320 kbps |
| **File Size (5 min)** | ~50 MB | ~5 to 12 MB |
| **Best For** | Audio Editing, Archival, DAW | Podcasts, Sharing, Mobile |

## When to Choose WAV

Choose WAV if you intend to edit the extracted audio in software like Audacity, Reaper, or Final Cut. Every time you re-encode lossy audio (like MP3), generational loss occurs. Starting with uncompressed WAV eliminates cumulative quantization noise.

## When to Choose MP3

Choose MP3 at 320 kbps or 256 kbps for everyday listening, voice memos, lectures, and sharing over email or messaging apps. At 320 kbps, perceptual differences compared to CD quality are indistinguishable to the vast majority of human listeners.
`
  },
  {
    id: 'blog_lossless_explained',
    title: 'Lossless Audio Extraction Explained: Codecs, Bitrates & Latency',
    slug: 'lossless-audio-extraction-explained',
    excerpt: 'Demystifying audio codecs inside container formats. Learn how lossless audio stream copying preserves 100% of the original master audio.',
    authorEmail: 'tech@vidtoaudio.com',
    createdAt: new Date('2026-08-28T09:15:00Z'),
    updatedAt: new Date('2026-08-28T09:15:00Z'),
    published: true,
    content: `# Lossless Audio Extraction Explained: Codecs, Bitrates & Latency

Many people confuse media **containers** (like \`.mp4\`, \`.mkv\`, \`.mov\`) with **codecs** (like AAC, FLAC, PCM, or Opus). 

A container file is simply an envelope that synchronizes multiple elementary streams: video, audio, subtitles, and metadata chapters.

## The Principle of Stream Demuxing

When extracting audio from a container, there are two approaches:

1. **Re-encoding**: The audio track is decoded into raw samples, then encoded again into a new codec. While necessary when changing formats (e.g., MKV with Opus to MP3), it consumes CPU cycles.
2. **Lossless Pass-Through**: If the destination format matches the container's internal codec, the audio track is extracted directly without re-compression, completing in sub-second speeds.

## Codec Suitability Guide

- **FLAC**: Best open-source lossless format for archival.
- **Opus**: The state-of-the-art interactive audio codec, outperforming MP3 and AAC at lower bitrates.
- **ALAC**: Apple's lossless audio codec designed for seamless iOS and macOS integration.
`
  }
];

// --- Blog Posts Management ---
function getLocalBlogs(): BlogPost[] {
  try {
    const data = localStorage.getItem(LS_BLOGS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_LOCAL_BLOGS;
}

function saveLocalBlogs(blogs: BlogPost[]): void {
  try {
    localStorage.setItem(LS_BLOGS_KEY, JSON.stringify(blogs));
  } catch (e) {
    console.warn('Could not write to local blogs cache:', e);
  }
}

export async function fetchAllBlogs(): Promise<BlogPost[]> {
  if (canAttemptFirestore()) {
    try {
      const blogsCol = collection(db, 'blogs');
      const q = query(blogsCol, orderBy('createdAt', 'desc'));
      const snapshot = await withTimeout(getDocs(q), 1500);
      
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
        markFirestoreOnline();
        return remoteBlogs;
      }
    } catch (err) {
      markFirestoreOffline(err);
    }
  }
  return getLocalBlogs();
}

export async function fetchBlogBySlug(slug: string): Promise<BlogPost | null> {
  if (canAttemptFirestore()) {
    try {
      const blogsCol = collection(db, 'blogs');
      const q = query(blogsCol, where('slug', '==', slug), limit(1));
      const snapshot = await withTimeout(getDocs(q), 1200);
      if (!snapshot.empty) {
        const d = snapshot.docs[0];
        const data = d.data();
        markFirestoreOnline();
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
      markFirestoreOffline(err);
    }
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

  if (canAttemptFirestore()) {
    try {
      if (post.id) {
        const docRef = doc(db, 'blogs', post.id);
        await withTimeout(setDoc(docRef, postData, { merge: true }), 2500);
        markFirestoreOnline();
        return post.id;
      } else {
        postData.createdAt = serverTimestamp();
        const newDocRef = doc(blogsCol);
        await withTimeout(setDoc(newDocRef, postData), 2500);
        markFirestoreOnline();
        return newDocRef.id;
      }
    } catch (err) {
      markFirestoreOffline(err);
    }
  }
  return id;
}

export async function deleteBlogPost(id: string): Promise<void> {
  const localList = getLocalBlogs().filter(b => b.id !== id);
  saveLocalBlogs(localList);
  if (canAttemptFirestore()) {
    try {
      const docRef = doc(db, 'blogs', id);
      await withTimeout(deleteDoc(docRef), 2000);
      markFirestoreOnline();
    } catch (err) {
      markFirestoreOffline(err);
    }
  }
}

