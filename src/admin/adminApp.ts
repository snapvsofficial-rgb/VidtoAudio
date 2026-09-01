import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { auth } from '../firebase';
import { 
  fetchAllBlogs, 
  saveBlogPost, 
  deleteBlogPost, 
  fetchSEOTemplate, 
  saveSEOTemplate, 
  DEFAULT_SEO_TEMPLATE,
  fetchFormatToggles, 
  saveFormatToggles, 
  DEFAULT_FORMAT_TOGGLES 
} from '../services/configService';
import { BlogPost, FormatTogglesConfig } from '../types';

type AdminTab = 'blogs' | 'seo' | 'toggles';

let currentTab: AdminTab = 'blogs';
let blogsList: BlogPost[] = [];
let editingBlogId: string | null = null;
let currentSEOTemplate = DEFAULT_SEO_TEMPLATE;
let currentToggles: FormatTogglesConfig = { ...DEFAULT_FORMAT_TOGGLES };

const ALL_AUDIO_FORMATS = [
  { key: 'wav', name: 'WAV', desc: 'Lossless, Uncompressed High Quality Audio', ext: 'wav' },
  { key: 'mp3', name: 'MP3', desc: 'Universal Compressed Audio (libmp3lame)', ext: 'mp3' },
  { key: 'aac', name: 'AAC', desc: 'Advanced Audio Coding for mobile & web', ext: 'aac' },
  { key: 'flac', name: 'FLAC', desc: 'Free Lossless Audio Codec', ext: 'flac' },
  { key: 'ogg', name: 'OGG', desc: 'Open Source Ogg Vorbis Audio', ext: 'ogg' },
  { key: 'm4a', name: 'M4A', desc: 'Apple MPEG-4 Audio Format', ext: 'm4a' },
  { key: 'wma', name: 'WMA', desc: 'Windows Media Audio', ext: 'wma' },
  { key: 'opus', name: 'OPUS', desc: 'High Efficiency Speech & Music Codec', ext: 'opus' },
  { key: 'aiff', name: 'AIFF', desc: 'Audio Interchange File Format (Apple PCM)', ext: 'aiff' }
];

export function renderAdminApp(container: HTMLElement): void {
  // Check auth state
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      renderLoginScreen(container);
    } else {
      renderDashboard(container, user);
    }
  });
}

// -------------------------------------------------------------
// 1. LOGIN / REGISTER SCREEN
// -------------------------------------------------------------
function renderLoginScreen(container: HTMLElement, errorMessage?: string): void {
  container.innerHTML = `
    <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md bg-dark-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        <div class="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div class="text-center mb-8">
          <div class="w-14 h-14 bg-brand-950 border border-brand-800/80 rounded-2xl flex items-center justify-center mx-auto mb-4 text-brand-400 shadow-inner">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h2 class="text-2xl sm:text-3xl font-bold text-white tracking-tight">Admin Portal</h2>
          <p class="text-xs sm:text-sm text-slate-400 mt-2">Sign in to manage blog articles, SEO templates & audio format toggles.</p>
        </div>

        ${errorMessage ? `
          <div class="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs sm:text-sm flex items-start gap-2.5">
            <svg class="w-5 h-5 flex-shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>${errorMessage}</span>
          </div>
        ` : ''}

        <form id="admin-auth-form" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
            <input type="email" id="auth-email" required placeholder="admin@vidtoaudio.com" 
              class="w-full px-4 py-3 bg-dark-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors text-sm">
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
            <input type="password" id="auth-password" required placeholder="••••••••" 
              class="w-full px-4 py-3 bg-dark-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors text-sm">
          </div>

          <div class="pt-2 flex flex-col gap-3">
            <button type="submit" id="btn-login" class="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2">
              <span>Sign In as Admin</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>

            <button type="button" id="btn-register" class="w-full py-2.5 px-4 bg-dark-950 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium rounded-xl text-xs transition-colors">
              Create Admin Account
            </button>
          </div>
        </form>

        <div class="mt-8 pt-6 border-t border-slate-800 text-center">
          <a href="/" data-route-link class="text-xs text-slate-400 hover:text-brand-400 transition-colors inline-flex items-center gap-1">
            &larr; Return to Public Converter
          </a>
        </div>
      </div>
    </div>
  `;

  const form = document.getElementById('admin-auth-form') as HTMLFormElement;
  const emailInput = document.getElementById('auth-email') as HTMLInputElement;
  const passwordInput = document.getElementById('auth-password') as HTMLInputElement;
  const btnLogin = document.getElementById('btn-login') as HTMLButtonElement;
  const btnRegister = document.getElementById('btn-register') as HTMLButtonElement;

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) return;

    btnLogin.disabled = true;
    btnLogin.innerHTML = `<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Authenticating...`;

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error('Login error:', err);
      let msg = err.message || 'Authentication failed. Please check credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid credentials or user does not exist. Click "Create Admin Account" if you are setting up for the first time.';
      } else if (err.code === 'auth/wrong-password') {
        msg = 'Incorrect password entered.';
      }
      renderLoginScreen(container, msg);
    }
  });

  btnRegister?.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || password.length < 6) {
      renderLoginScreen(container, 'Please enter a valid email and password (min 6 characters) to register as admin.');
      return;
    }

    btnRegister.disabled = true;
    btnRegister.innerHTML = `Creating account...`;

    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error('Register error:', err);
      renderLoginScreen(container, err.message || 'Registration failed.');
    }
  });
}

// -------------------------------------------------------------
// 2. MAIN DASHBOARD LAYOUT & STATE
// -------------------------------------------------------------
async function renderDashboard(container: HTMLElement, user: User): Promise<void> {
  // Pre-load data
  try {
    const [blogs, seo, toggles] = await Promise.all([
      fetchAllBlogs(),
      fetchSEOTemplate(),
      fetchFormatToggles()
    ]);
    blogsList = blogs;
    currentSEOTemplate = seo;
    currentToggles = toggles;
  } catch (e) {
    console.warn('Error loading dashboard data:', e);
  }

  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Admin Top Nav Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-brand-950 border border-brand-800 flex items-center justify-center text-brand-400 font-bold">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold text-white">VidToAudio Administration</h1>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-950 text-brand-400 border border-brand-800">Live Sync</span>
            </div>
            <p class="text-xs text-slate-400">${user.email || 'Admin User'}</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <a href="/" data-route-link class="px-3.5 py-2 bg-dark-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors inline-flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            View Public Site
          </a>
          <button id="admin-btn-logout" class="px-3.5 py-2 bg-red-950/50 hover:bg-red-900/60 border border-red-800/80 text-red-300 text-xs font-medium rounded-xl transition-colors inline-flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Sign Out
          </button>
        </div>
      </div>

      <!-- Dashboard Grid: Sidebar + Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <!-- Sidebar Navigation -->
        <aside class="lg:col-span-1 bg-dark-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
          <button id="nav-tab-blogs" class="w-full px-4 py-3 rounded-xl text-left text-sm font-medium flex items-center gap-3 transition-colors ${currentTab === 'blogs' ? 'bg-brand-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-dark-800'}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
            <span>Blog CMS</span>
            <span class="ml-auto px-2 py-0.5 rounded text-[11px] ${currentTab === 'blogs' ? 'bg-brand-700 text-white' : 'bg-dark-950 text-slate-400'}">${blogsList.length}</span>
          </button>

          <button id="nav-tab-seo" class="w-full px-4 py-3 rounded-xl text-left text-sm font-medium flex items-center gap-3 transition-colors ${currentTab === 'seo' ? 'bg-brand-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-dark-800'}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <span>SEO Template Manager</span>
          </button>

          <button id="nav-tab-toggles" class="w-full px-4 py-3 rounded-xl text-left text-sm font-medium flex items-center gap-3 transition-colors ${currentTab === 'toggles' ? 'bg-brand-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-dark-800'}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
            <span>Format Toggles</span>
            <span class="ml-auto px-2 py-0.5 rounded text-[11px] ${currentTab === 'toggles' ? 'bg-brand-700 text-white' : 'bg-dark-950 text-slate-400'}">
              ${Object.values(currentToggles).filter(Boolean).length}/9
            </span>
          </button>

          <div class="pt-4 border-t border-slate-800/80 px-2 text-[11px] text-slate-500">
            Firestore Database: <br/>
            <span class="font-mono text-[10px] text-slate-400">concise-producer-n1wkv</span>
          </div>
        </aside>

        <!-- Main Tab Pane -->
        <section id="admin-main-pane" class="lg:col-span-3">
          <!-- Dynamically populated tab content -->
        </section>
      </div>
    </div>
  `;

  // Attach event handlers
  document.getElementById('admin-btn-logout')?.addEventListener('click', async () => {
    await signOut(auth);
  });

  document.getElementById('nav-tab-blogs')?.addEventListener('click', () => {
    currentTab = 'blogs';
    renderDashboard(container, user);
  });

  document.getElementById('nav-tab-seo')?.addEventListener('click', () => {
    currentTab = 'seo';
    renderDashboard(container, user);
  });

  document.getElementById('nav-tab-toggles')?.addEventListener('click', () => {
    currentTab = 'toggles';
    renderDashboard(container, user);
  });

  const mainPane = document.getElementById('admin-main-pane');
  if (!mainPane) return;

  if (currentTab === 'blogs') {
    renderBlogsTab(mainPane, user, () => renderDashboard(container, user));
  } else if (currentTab === 'seo') {
    renderSEOTab(mainPane);
  } else if (currentTab === 'toggles') {
    renderTogglesTab(mainPane);
  }
}

// -------------------------------------------------------------
// TAB 1: BLOG CMS
// -------------------------------------------------------------
function renderBlogsTab(container: HTMLElement, user: User, refresh: () => void): void {
  const editingBlog = editingBlogId ? blogsList.find(b => b.id === editingBlogId) : null;

  if (editingBlogId !== null) {
    // Render Blog Editor Form (Create or Edit)
    container.innerHTML = `
      <div class="bg-dark-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div class="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 class="text-xl font-bold text-white">${editingBlog ? 'Edit Blog Article' : 'Create New Blog Article'}</h2>
            <p class="text-xs text-slate-400 mt-0.5">Write technical guides and articles with live Markdown support.</p>
          </div>
          <button id="btn-cancel-blog" class="px-4 py-2 bg-dark-950 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition-colors">
            Cancel
          </button>
        </div>

        <form id="blog-editor-form" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Article Title</label>
              <input type="text" id="blog-title" required value="${editingBlog?.title || ''}" placeholder="e.g. How to Extract Lossless Audio from 4K MP4 Videos" 
                class="w-full px-4 py-3 bg-dark-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">URL Slug</label>
              <div class="relative">
                <span class="absolute left-3 top-3 text-slate-500 text-sm font-mono">/blog/</span>
                <input type="text" id="blog-slug" required value="${editingBlog?.slug || ''}" placeholder="extract-audio-from-mp4" 
                  class="w-full pl-16 pr-4 py-3 bg-dark-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm font-mono">
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Short Excerpt (SEO Summary)</label>
            <input type="text" id="blog-excerpt" value="${editingBlog?.excerpt || ''}" placeholder="A brief 1-2 sentence overview for search snippets..." 
              class="w-full px-4 py-2.5 bg-dark-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm">
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Markdown Content</label>
              <span class="text-[11px] text-slate-500">Supports # H1, ## H2, **bold**, lists, code blocks, and blockquotes</span>
            </div>
            <textarea id="blog-content" required rows="14" placeholder="# Introduction\n\nExplain how on-device audio extraction works..." 
              class="w-full px-4 py-3 bg-dark-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm font-mono leading-relaxed">${editingBlog?.content || ''}</textarea>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" id="btn-cancel-blog-bottom" class="px-5 py-2.5 bg-dark-950 hover:bg-slate-800 text-slate-300 rounded-xl text-sm font-medium border border-slate-700 transition-colors">
              Cancel
            </button>
            <button type="submit" id="btn-save-blog" class="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold shadow-lg transition-all flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              <span>${editingBlog ? 'Update Article' : 'Publish Article'}</span>
            </button>
          </div>
        </form>
      </div>
    `;

    const titleInput = document.getElementById('blog-title') as HTMLInputElement;
    const slugInput = document.getElementById('blog-slug') as HTMLInputElement;

    // Auto-generate slug on title typing if new blog
    if (!editingBlog) {
      titleInput?.addEventListener('input', () => {
        slugInput.value = titleInput.value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      });
    }

    const cancelHandler = () => {
      editingBlogId = null;
      refresh();
    };
    document.getElementById('btn-cancel-blog')?.addEventListener('click', cancelHandler);
    document.getElementById('btn-cancel-blog-bottom')?.addEventListener('click', cancelHandler);

    const form = document.getElementById('blog-editor-form') as HTMLFormElement;
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('btn-save-blog') as HTMLButtonElement;
      saveBtn.disabled = true;
      saveBtn.innerHTML = `<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Saving...`;

      try {
        const title = titleInput.value;
        const slug = slugInput.value.trim();
        const excerpt = (document.getElementById('blog-excerpt') as HTMLInputElement).value;
        const content = (document.getElementById('blog-content') as HTMLTextAreaElement).value;

        await saveBlogPost({
          id: editingBlog?.id,
          title,
          slug,
          excerpt,
          content,
          authorEmail: user.email || 'Admin',
          published: true
        });

        editingBlogId = null;
        refresh();
      } catch (err: any) {
        alert('Error saving blog article: ' + err.message);
        saveBtn.disabled = false;
        saveBtn.innerHTML = `Retry Save`;
      }
    });
    return;
  }

  // Render Blogs List
  container.innerHTML = `
    <div class="bg-dark-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 class="text-xl font-bold text-white">Articles & Technical Guides</h2>
          <p class="text-xs text-slate-400 mt-0.5">Manage published content across the public /blog section.</p>
        </div>
        <button id="btn-create-blog" class="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-all flex items-center gap-2 self-start sm:self-auto">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          <span>Create Article</span>
        </button>
      </div>

      ${blogsList.length === 0 ? `
        <div class="py-16 text-center border border-dashed border-slate-800 rounded-xl p-8">
          <div class="w-12 h-12 bg-dark-950 text-slate-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
          </div>
          <h3 class="text-base font-semibold text-white mb-1">No Articles in Firestore</h3>
          <p class="text-xs text-slate-400 max-w-sm mx-auto mb-4">Click "Create Article" to write and publish your first guide.</p>
          <button id="btn-create-blog-empty" class="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold transition-all">
            + Create Article Now
          </button>
        </div>
      ` : `
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                <th class="pb-3 px-2">Title</th>
                <th class="pb-3 px-2">Slug</th>
                <th class="pb-3 px-2">Date</th>
                <th class="pb-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-slate-300">
              ${blogsList.map(b => {
                const dateStr = b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently';
                return `
                  <tr class="hover:bg-dark-800/40 transition-colors">
                    <td class="py-3 px-2 font-medium text-white max-w-xs truncate">${b.title}</td>
                    <td class="py-3 px-2 font-mono text-xs text-slate-400 max-w-[140px] truncate">/${b.slug}</td>
                    <td class="py-3 px-2 text-xs text-slate-500 whitespace-nowrap">${dateStr}</td>
                    <td class="py-3 px-2 text-right whitespace-nowrap space-x-2">
                      <a href="/blog/${b.slug}" data-route-link class="inline-block text-xs text-slate-400 hover:text-brand-400 transition-colors px-2 py-1 rounded bg-dark-950 border border-slate-800">
                        View
                      </a>
                      <button data-edit-id="${b.id}" class="text-xs text-brand-400 hover:text-brand-300 font-medium px-2 py-1 rounded bg-brand-950/60 border border-brand-800/60 transition-colors">
                        Edit
                      </button>
                      <button data-delete-id="${b.id}" class="text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1 rounded bg-red-950/40 border border-red-800/50 transition-colors">
                        Delete
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;

  document.getElementById('btn-create-blog')?.addEventListener('click', () => {
    editingBlogId = ''; // empty string represents new blog
    refresh();
  });
  document.getElementById('btn-create-blog-empty')?.addEventListener('click', () => {
    editingBlogId = '';
    refresh();
  });

  container.querySelectorAll('[data-edit-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      editingBlogId = btn.getAttribute('data-edit-id');
      refresh();
    });
  });

  container.querySelectorAll('[data-delete-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-delete-id');
      if (!id) return;
      if (confirm('Are you sure you want to delete this blog article from Firestore? This cannot be undone.')) {
        btn.innerHTML = '...';
        await deleteBlogPost(id);
        blogsList = blogsList.filter(b => b.id !== id);
        refresh();
      }
    });
  });
}

// -------------------------------------------------------------
// TAB 2: SEO TEMPLATE MANAGER
// -------------------------------------------------------------
function renderSEOTab(container: HTMLElement): void {
  container.innerHTML = `
    <div class="bg-dark-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8">
      <div>
        <h2 class="text-xl font-bold text-white">Dynamic SEO Description Template</h2>
        <p class="text-xs text-slate-400 mt-1">
          Customize the programmatic copy that appears dynamically across all 81 format matrix pages.
        </p>
      </div>

      <!-- Variable Helper Badges -->
      <div class="bg-dark-950 border border-slate-800 rounded-xl p-4">
        <div class="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Available Template Variables</div>
        <div class="flex flex-wrap gap-2 text-xs">
          <button type="button" data-insert-var="{INPUT}" class="px-2.5 py-1 bg-dark-900 border border-slate-700 hover:border-brand-500 text-brand-400 rounded-lg font-mono transition-colors">
            + {INPUT}
          </button>
          <button type="button" data-insert-var="{OUTPUT}" class="px-2.5 py-1 bg-dark-900 border border-slate-700 hover:border-brand-500 text-brand-400 rounded-lg font-mono transition-colors">
            + {OUTPUT}
          </button>
        </div>
        <p class="text-[11px] text-slate-500 mt-2">Click any variable tag to insert it at your cursor position.</p>
      </div>

      <!-- Editor Textarea -->
      <div class="space-y-2">
        <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider">SEO Description Template</label>
        <textarea id="seo-template-input" rows="4" 
          class="w-full px-4 py-3 bg-dark-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm leading-relaxed">${currentSEOTemplate}</textarea>
      </div>

      <!-- Live Preview Component -->
      <div class="bg-dark-950 border border-slate-800 rounded-xl p-5 space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <span class="text-xs font-semibold text-brand-400 uppercase tracking-wider">Interactive Live Preview</span>
          <div class="flex items-center gap-2 text-xs">
            <span class="text-slate-500">Test Format:</span>
            <select id="preview-in-select" class="bg-dark-900 border border-slate-700 rounded px-2 py-1 text-white text-xs">
              <option value="MP4">MP4</option>
              <option value="MKV">MKV</option>
              <option value="HEVC">HEVC</option>
              <option value="WEBM">WEBM</option>
              <option value="MOV">MOV</option>
            </select>
            <span class="text-slate-500">&rarr;</span>
            <select id="preview-out-select" class="bg-dark-900 border border-slate-700 rounded px-2 py-1 text-white text-xs">
              <option value="WAV">WAV</option>
              <option value="MP3">MP3</option>
              <option value="AAC">AAC</option>
              <option value="FLAC">FLAC</option>
              <option value="OGG">OGG</option>
            </select>
          </div>
        </div>

        <p id="seo-live-preview-box" class="text-slate-300 text-sm leading-relaxed italic bg-dark-900/60 p-4 rounded-lg border border-slate-800/80">
          <!-- Preview will update here -->
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <button id="btn-reset-seo" class="text-xs text-slate-400 hover:text-slate-200 transition-colors">
          Reset to System Default
        </button>
        <button id="btn-save-seo" class="w-full sm:w-auto px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold shadow-lg transition-all flex items-center justify-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          <span>Save SEO Template to Firestore</span>
        </button>
      </div>
      <div id="seo-status-msg" class="hidden text-xs text-center font-medium"></div>
    </div>
  `;

  const input = document.getElementById('seo-template-input') as HTMLTextAreaElement;
  const previewBox = document.getElementById('seo-live-preview-box');
  const inSelect = document.getElementById('preview-in-select') as HTMLSelectElement;
  const outSelect = document.getElementById('preview-out-select') as HTMLSelectElement;

  function updatePreview() {
    if (!previewBox || !input) return;
    const inVal = inSelect?.value || 'MP4';
    const outVal = outSelect?.value || 'WAV';
    const rendered = input.value
      .replace(/\{INPUT\}/gi, inVal)
      .replace(/\{OUTPUT\}/gi, outVal);
    previewBox.textContent = `"${rendered}"`;
  }

  input?.addEventListener('input', updatePreview);
  inSelect?.addEventListener('change', updatePreview);
  outSelect?.addEventListener('change', updatePreview);
  updatePreview();

  // Insert variable tags
  container.querySelectorAll('[data-insert-var]').forEach(btn => {
    btn.addEventListener('click', () => {
      const variable = btn.getAttribute('data-insert-var');
      if (!variable || !input) return;
      const start = input.selectionStart || input.value.length;
      const end = input.selectionEnd || input.value.length;
      input.value = input.value.substring(0, start) + variable + input.value.substring(end);
      input.focus();
      input.selectionStart = input.selectionEnd = start + variable.length;
      updatePreview();
    });
  });

  document.getElementById('btn-reset-seo')?.addEventListener('click', () => {
    if (confirm('Reset SEO template back to original default?')) {
      if (input) input.value = DEFAULT_SEO_TEMPLATE;
      updatePreview();
    }
  });

  document.getElementById('btn-save-seo')?.addEventListener('click', async () => {
    const saveBtn = document.getElementById('btn-save-seo') as HTMLButtonElement;
    const statusMsg = document.getElementById('seo-status-msg');
    const newTemplate = input.value.trim();
    if (!newTemplate) return;

    saveBtn.disabled = true;
    saveBtn.innerHTML = `<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Saving to Firestore...`;

    try {
      await saveSEOTemplate(newTemplate);
      currentSEOTemplate = newTemplate;
      saveBtn.disabled = false;
      saveBtn.innerHTML = `<span>Save SEO Template to Firestore</span>`;

      if (statusMsg) {
        statusMsg.className = 'text-xs text-center font-medium text-brand-400 bg-brand-950/60 border border-brand-800/80 rounded-lg p-2.5';
        statusMsg.textContent = 'SEO template successfully synced with Firestore and applied to public matrix!';
        statusMsg.classList.remove('hidden');
        setTimeout(() => statusMsg.classList.add('hidden'), 5000);
      }
    } catch (err: any) {
      alert('Failed to save SEO template: ' + err.message);
      saveBtn.disabled = false;
      saveBtn.innerHTML = `Retry Save`;
    }
  });
}

// -------------------------------------------------------------
// TAB 3: FORMAT TOGGLES
// -------------------------------------------------------------
function renderTogglesTab(container: HTMLElement): void {
  container.innerHTML = `
    <div class="bg-dark-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 class="text-xl font-bold text-white">Audio Format Availability</h2>
          <p class="text-xs text-slate-400 mt-0.5">Toggle format availability for the public web audio extraction dropdown.</p>
        </div>
        <button id="btn-save-toggles" class="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-all flex items-center gap-2 self-start sm:self-auto">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          <span>Save Changes</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="formats-toggle-grid">
        ${ALL_AUDIO_FORMATS.map(f => {
          const isEnabled = currentToggles[f.key] !== false;
          return `
            <div class="bg-dark-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex items-center justify-between transition-colors">
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-white text-sm">${f.name}</span>
                  <span class="text-[10px] font-mono px-1.5 py-0.5 rounded ${isEnabled ? 'bg-brand-950 text-brand-400 border border-brand-800/60' : 'bg-slate-900 text-slate-500 border border-slate-800'}">
                    .${f.ext}
                  </span>
                </div>
                <p class="text-xs text-slate-400 mt-1 max-w-[220px]">${f.desc}</p>
              </div>

              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" data-toggle-format="${f.key}" ${isEnabled ? 'checked' : ''} class="sr-only peer">
                <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
              </label>
            </div>
          `;
        }).join('')}
      </div>

      <div id="toggles-status-msg" class="hidden text-xs text-center font-medium"></div>
    </div>
  `;

  document.getElementById('btn-save-toggles')?.addEventListener('click', async () => {
    const saveBtn = document.getElementById('btn-save-toggles') as HTMLButtonElement;
    const statusMsg = document.getElementById('toggles-status-msg');

    const newToggles: FormatTogglesConfig = {};
    container.querySelectorAll('input[data-toggle-format]').forEach(el => {
      const checkbox = el as HTMLInputElement;
      const key = checkbox.getAttribute('data-toggle-format');
      if (key) {
        newToggles[key] = checkbox.checked;
      }
    });

    saveBtn.disabled = true;
    saveBtn.innerHTML = `<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Saving...`;

    try {
      await saveFormatToggles(newToggles);
      currentToggles = newToggles;
      saveBtn.disabled = false;
      saveBtn.innerHTML = `<span>Save Changes</span>`;

      if (statusMsg) {
        statusMsg.className = 'text-xs text-center font-medium text-brand-400 bg-brand-950/60 border border-brand-800/80 rounded-lg p-2.5';
        statusMsg.textContent = 'Audio format settings updated in Firestore and synced with public converter!';
        statusMsg.classList.remove('hidden');
        setTimeout(() => statusMsg.classList.add('hidden'), 5000);
      }
    } catch (err: any) {
      alert('Failed to save format toggles: ' + err.message);
      saveBtn.disabled = false;
      saveBtn.innerHTML = `Retry Save`;
    }
  });
}
