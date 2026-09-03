import { 
  signInWithEmailAndPassword, 
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
  DEFAULT_FORMAT_TOGGLES,
  fetchSiteSettings,
  saveSiteSettings,
  DEFAULT_SITE_SETTINGS
} from '../services/configService';
import { BlogPost, FormatTogglesConfig, SiteSettingsConfig } from '../types';

export type AdminTab = 'dashboard' | 'seo' | 'blogs' | 'settings';

let currentTab: AdminTab = 'dashboard';
let blogsList: BlogPost[] = [];
let editingBlogId: string | null = null;
let currentSEOTemplate = DEFAULT_SEO_TEMPLATE;
let currentToggles: FormatTogglesConfig = { ...DEFAULT_FORMAT_TOGGLES };
let currentSettings: SiteSettingsConfig = { ...DEFAULT_SITE_SETTINGS };

let activeAuthUnsubscribe: (() => void) | null = null;

export const ALL_AUDIO_FORMATS = [
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

export function navigateToHome() {
  if (typeof (window as any).navigateTo === 'function') {
    window.history.pushState({}, '', '/');
    (window as any).navigateTo('/');
  } else {
    window.location.assign('/');
  }
}

// -------------------------------------------------------------
// MAIN ENTRY POINT & STRICT ROUTE GUARD (FAIL CLOSED)
// -------------------------------------------------------------
export function renderAdminApp(container: HTMLElement): void {
  // Clean up any previously active listener
  if (activeAuthUnsubscribe) {
    activeAuthUnsubscribe();
    activeAuthUnsubscribe = null;
  }

  // Strict initial loading state: admin dashboard MUST NEVER render until auth is verified
  container.innerHTML = `
    <div class="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md bg-dark-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl text-center">
        <div class="w-12 h-12 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h3 class="text-lg font-bold text-white mb-2">Verifying Admin Privileges</h3>
        <p class="text-xs sm:text-sm text-slate-400">Verifying credentials with Firebase Authentication...</p>
      </div>
    </div>
  `;

  try {
    if (!auth) {
      renderLoginScreen(container, 'Firebase Authentication service is unavailable. Access denied.');
      return;
    }

    activeAuthUnsubscribe = onAuthStateChanged(
      auth, 
      (user: User | null) => {
        if (user && user.uid) {
          // Strictly render dashboard ONLY for verified Firebase authenticated user
          renderDashboard(container, user);
        } else {
          // Fail Closed: If user is not logged in, strictly render the secure Login Form
          renderLoginScreen(container);
        }
      },
      (error) => {
        console.error('Firebase Auth state error:', error);
        // Fail closed on auth error
        renderLoginScreen(container, 'Firebase Authentication error. Access restricted.');
      }
    );
  } catch (err: any) {
    console.error('Firebase Auth initialization error:', err);
    // Fail closed on init failure
    renderLoginScreen(container, 'Failed to initialize Firebase Authentication. Access denied.');
  }
}

// -------------------------------------------------------------
// STRICT LOGIN SCREEN (NO REGISTER, NO QUICK START, EMAIL/PASSWORD ONLY)
// -------------------------------------------------------------
function renderLoginScreen(
  container: HTMLElement, 
  errorMessage?: string
): void {
  container.innerHTML = `
    <div class="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md bg-dark-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        <div class="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div class="text-center mb-8">
          <div class="w-14 h-14 bg-brand-950 border border-brand-800/80 rounded-2xl flex items-center justify-center mx-auto mb-4 text-brand-400 shadow-inner">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h2 class="text-2xl sm:text-3xl font-bold text-white tracking-tight">VidToAudio Admin</h2>
          <p class="text-xs sm:text-sm text-slate-400 mt-2">Enter your administrative credentials to manage CMS, Matrix SEO, and global settings.</p>
        </div>

        ${errorMessage ? `
          <div class="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs sm:text-sm flex items-start gap-2.5">
            <svg class="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p class="font-semibold">Authentication Failed</p>
              <p class="text-[11px] sm:text-xs mt-1 leading-relaxed opacity-90">${errorMessage}</p>
            </div>
          </div>
        ` : ''}

        <form id="admin-auth-form" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Admin Email</label>
            <input type="email" id="auth-email" required placeholder="admin@vidtoaudio.com" autocomplete="email"
              class="w-full px-4 py-3 bg-dark-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors text-sm">
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
            <input type="password" id="auth-password" required placeholder="••••••••" autocomplete="current-password"
              class="w-full px-4 py-3 bg-dark-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors text-sm">
          </div>

          <div class="pt-2">
            <button type="submit" id="btn-login" class="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2">
              <span>Sign In to Admin Portal</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </div>
        </form>

        <div class="mt-8 pt-6 border-t border-slate-800 text-center">
          <button type="button" id="btn-return-home" class="text-xs text-slate-400 hover:text-brand-400 transition-colors inline-flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Return to Public Website
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-return-home')?.addEventListener('click', () => {
    navigateToHome();
  });

  const form = document.getElementById('admin-auth-form') as HTMLFormElement;
  const emailInput = document.getElementById('auth-email') as HTMLInputElement;
  const passwordInput = document.getElementById('auth-password') as HTMLInputElement;
  const btnLogin = document.getElementById('btn-login') as HTMLButtonElement;

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) return;

    btnLogin.disabled = true;
    btnLogin.innerHTML = `<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Verifying...`;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // On successful login, onAuthStateChanged callback will verify user object and render dashboard
    } catch (err: any) {
      console.error('Admin authentication failure:', err);
      let msg = 'Invalid administrative credentials. Access restricted.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        msg = 'No administrative account found with these credentials.';
      } else if (err.code === 'auth/wrong-password') {
        msg = 'Incorrect password entered.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Access temporarily locked due to multiple failed attempts. Try again shortly.';
      } else if (err.code === 'auth/configuration-not-found' || err.message?.includes('configuration-not-found')) {
        msg = 'Firebase Authentication Email/Password provider is not configured in this project console. Access denied.';
      } else if (err.code === 'auth/network-request-failed') {
        msg = 'Network connection failed. Unable to reach Firebase Authentication servers.';
      } else if (err.message) {
        msg = err.message;
      }
      // Strictly fail closed: NEVER bypass authentication with any mock session
      renderLoginScreen(container, msg);
    }
  });
}

// -------------------------------------------------------------
// PROFESSIONAL SIDEBAR LAYOUT (PROTECTED CMS DASHBOARD)
// -------------------------------------------------------------
async function renderDashboard(container: HTMLElement, user: User): Promise<void> {
  // Strict Route Guard: Fail closed if unauthenticated or missing verified user object
  if (!user || !user.uid || !auth.currentUser) {
    renderLoginScreen(container, 'Unauthorized: Valid Firebase Authentication session required.');
    return;
  }

  // Pre-load all remote/cached configurations
  try {
    const [blogs, seo, toggles, settings] = await Promise.all([
      fetchAllBlogs(),
      fetchSEOTemplate(),
      fetchFormatToggles(),
      fetchSiteSettings()
    ]);
    blogsList = blogs;
    currentSEOTemplate = seo;
    currentToggles = toggles;
    currentSettings = settings;
  } catch (e) {
    console.warn('Error fetching dashboard data:', e);
  }

  const enabledFormatsCount = Object.values(currentToggles).filter(Boolean).length;

  container.innerHTML = `
    <div class="min-h-[85vh] bg-dark-950 flex flex-col lg:flex-row">
      <!-- Mobile Top Bar for Sidebar Toggle -->
      <div class="lg:hidden bg-dark-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-16 z-40">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-brand-950 border border-brand-800 flex items-center justify-center text-brand-400 font-bold">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <div>
            <span class="font-bold text-white text-sm">VidToAudio Admin</span>
            <span class="block text-[10px] text-slate-400 capitalize">${currentTab} Tab</span>
          </div>
        </div>
        <button id="admin-mobile-menu-btn" class="p-2 rounded-lg bg-dark-950 border border-slate-700 text-slate-300 hover:text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
        </button>
      </div>

      <!-- Left Sidebar -->
      <aside id="admin-sidebar" class="hidden lg:flex w-full lg:w-72 bg-dark-900 border-r border-slate-800 flex-col justify-between p-5 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] z-30 shadow-xl">
        <div class="space-y-6">
          <!-- Sidebar Header -->
          <div class="hidden lg:flex items-center gap-3 pb-5 border-b border-slate-800">
            <div class="w-10 h-10 rounded-xl bg-brand-950 border border-brand-800/80 flex items-center justify-center text-brand-400 font-bold shadow">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
            <div>
              <h2 class="text-base font-bold text-white">VidToAudio Portal</h2>
              <div class="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Session Verified</span>
              </div>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <nav class="space-y-1.5">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 pb-1">Management Tabs</div>

            <!-- Tab: Dashboard -->
            <button id="nav-tab-dashboard" class="w-full px-3.5 py-3 rounded-xl text-left text-sm font-medium flex items-center gap-3 transition-colors ${currentTab === 'dashboard' ? 'bg-brand-600 text-white font-semibold shadow-md' : 'text-slate-400 hover:text-white hover:bg-dark-800'}">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
              <span>Dashboard</span>
            </button>

            <!-- Tab: Matrix SEO -->
            <button id="nav-tab-seo" class="w-full px-3.5 py-3 rounded-xl text-left text-sm font-medium flex items-center gap-3 transition-colors ${currentTab === 'seo' ? 'bg-brand-600 text-white font-semibold shadow-md' : 'text-slate-400 hover:text-white hover:bg-dark-800'}">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <span>Matrix SEO</span>
              <span class="ml-auto text-[10px] px-2 py-0.5 rounded font-mono ${currentTab === 'seo' ? 'bg-brand-700 text-white' : 'bg-dark-950 text-brand-400 border border-slate-800'}">81</span>
            </button>

            <!-- Tab: Blog CMS -->
            <button id="nav-tab-blogs" class="w-full px-3.5 py-3 rounded-xl text-left text-sm font-medium flex items-center gap-3 transition-colors ${currentTab === 'blogs' ? 'bg-brand-600 text-white font-semibold shadow-md' : 'text-slate-400 hover:text-white hover:bg-dark-800'}">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
              <span>Blog CMS</span>
              <span class="ml-auto text-[10px] px-2 py-0.5 rounded font-mono ${currentTab === 'blogs' ? 'bg-brand-700 text-white' : 'bg-dark-950 text-slate-400 border border-slate-800'}">${blogsList.length}</span>
            </button>

            <!-- Tab: Site Settings -->
            <button id="nav-tab-settings" class="w-full px-3.5 py-3 rounded-xl text-left text-sm font-medium flex items-center gap-3 transition-colors ${currentTab === 'settings' ? 'bg-brand-600 text-white font-semibold shadow-md' : 'text-slate-400 hover:text-white hover:bg-dark-800'}">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
              <span>Site Settings</span>
              <span class="ml-auto text-[10px] px-2 py-0.5 rounded font-mono ${currentTab === 'settings' ? 'bg-brand-700 text-white' : 'bg-dark-950 text-slate-400 border border-slate-800'}">${enabledFormatsCount}/9</span>
            </button>
          </nav>
        </div>

        <!-- Sidebar Footer: Profile & Logout -->
        <div class="pt-6 border-t border-slate-800 space-y-3 mt-6 lg:mt-0">
          <div class="flex items-center justify-between text-xs px-2">
            <div class="truncate max-w-[170px]">
              <span class="text-[11px] text-slate-500 block">Verified Firebase Admin</span>
              <span class="text-white font-medium truncate block">${user.email || user.uid}</span>
            </div>
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400" title="Authenticated Session"></span>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-2">
            <a href="/" data-route-link class="px-3 py-2 bg-dark-950 hover:bg-dark-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium rounded-xl text-center transition-colors flex items-center justify-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              <span>Live Site</span>
            </a>
            <button id="admin-btn-logout" class="px-3 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 hover:text-white text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl">
        <!-- Top Tab Header / Breadcrumbs -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-800">
          <div>
            <div class="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <a href="/admin" class="hover:text-brand-400 transition-colors">Admin</a>
              <span>/</span>
              <span class="text-white font-medium capitalize">${currentTab === 'seo' ? 'Matrix SEO' : currentTab === 'blogs' ? 'Blog CMS' : currentTab === 'settings' ? 'Site Settings' : 'Dashboard'}</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              ${currentTab === 'dashboard' ? 'Overview & Diagnostics' : ''}
              ${currentTab === 'seo' ? 'Programmatic SEO Matrix' : ''}
              ${currentTab === 'blogs' ? 'Editorial Articles & Guides' : ''}
              ${currentTab === 'settings' ? 'Global Customization & Settings' : ''}
            </h1>
          </div>

          <div class="flex items-center gap-3">
            <span class="px-3 py-1 bg-dark-900 border border-slate-800 text-xs rounded-lg flex items-center gap-1.5 text-slate-300">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Authenticated Admin</span>
            </span>
            <a href="/" data-route-link class="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg shadow transition-colors flex items-center gap-1.5">
              <span>View Public Site &rarr;</span>
            </a>
          </div>
        </div>

        <!-- Dynamic Tab Content Pane (ONLY renders active tab) -->
        <div id="admin-main-pane">
          <!-- Active tab container -->
        </div>
      </main>
    </div>
  `;

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('admin-mobile-menu-btn');
  const sidebar = document.getElementById('admin-sidebar');
  mobileMenuBtn?.addEventListener('click', () => {
    sidebar?.classList.toggle('hidden');
  });

  // Strict Sign Out with Immediate Redirect to Home
  document.getElementById('admin-btn-logout')?.addEventListener('click', async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
    navigateToHome();
  });

  // Tab navigation triggers
  const setupNav = (tabId: string, tabKey: AdminTab) => {
    document.getElementById(tabId)?.addEventListener('click', () => {
      currentTab = tabKey;
      editingBlogId = null;
      renderDashboard(container, user);
    });
  };

  setupNav('nav-tab-dashboard', 'dashboard');
  setupNav('nav-tab-seo', 'seo');
  setupNav('nav-tab-blogs', 'blogs');
  setupNav('nav-tab-settings', 'settings');

  const mainPane = document.getElementById('admin-main-pane');
  if (!mainPane) return;

  // Render ONLY the active tab
  if (currentTab === 'dashboard') {
    renderDashboardTab(mainPane, user, (tab) => {
      currentTab = tab;
      renderDashboard(container, user);
    });
  } else if (currentTab === 'seo') {
    renderSEOTab(mainPane);
  } else if (currentTab === 'blogs') {
    renderBlogsTab(mainPane, user, () => renderDashboard(container, user));
  } else if (currentTab === 'settings') {
    renderSettingsTab(mainPane, () => renderDashboard(container, user));
  }
}

// -------------------------------------------------------------
// TAB 1: DASHBOARD OVERVIEW
// -------------------------------------------------------------
function renderDashboardTab(
  container: HTMLElement, 
  user: User, 
  switchTab: (tab: AdminTab) => void
): void {
  const enabledCount = Object.values(currentToggles).filter(Boolean).length;
  const recentBlogs = blogsList.slice(0, 4);

  container.innerHTML = `
    <div class="space-y-8">
      <!-- Metric Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <!-- Metric 1 -->
        <div class="bg-dark-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Published Articles</span>
            <span class="w-8 h-8 rounded-lg bg-brand-950 text-brand-400 flex items-center justify-center text-xs font-bold border border-brand-800/60">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
            </span>
          </div>
          <div class="text-3xl font-extrabold text-white mb-1">${blogsList.length}</div>
          <p class="text-xs text-slate-500">Live articles indexed by search engines</p>
        </div>

        <!-- Metric 2 -->
        <div class="bg-dark-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">SEO Matrix Combinations</span>
            <span class="w-8 h-8 rounded-lg bg-brand-950 text-brand-400 flex items-center justify-center text-xs font-bold border border-brand-800/60">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
          </div>
          <div class="text-3xl font-extrabold text-white mb-1">81</div>
          <p class="text-xs text-slate-500">Auto-generated format conversion landing pages</p>
        </div>

        <!-- Metric 3 -->
        <div class="bg-dark-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Output Formats</span>
            <span class="w-8 h-8 rounded-lg bg-brand-950 text-brand-400 flex items-center justify-center text-xs font-bold border border-brand-800/60">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
            </span>
          </div>
          <div class="text-3xl font-extrabold text-white mb-1">${enabledCount} / 9</div>
          <p class="text-xs text-slate-500">Enabled in public conversion dropdown</p>
        </div>

        <!-- Metric 4 -->
        <div class="bg-dark-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Site Brand Theme</span>
            <span class="w-5 h-5 rounded-full border border-white/20 shadow-inner" style="background-color: ${currentSettings.primaryColor || '#14b8a6'}"></span>
          </div>
          <div class="text-xl font-bold text-white mb-1 uppercase font-mono">${currentSettings.primaryColor || '#14b8a6'}</div>
          <p class="text-xs text-slate-500 truncate max-w-[200px]">${currentSettings.siteMetaTitle || 'Default Title'}</p>
        </div>
      </div>

      <!-- Quick Actions Grid -->
      <div class="bg-dark-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 class="text-lg font-bold text-white mb-4">Quick Management Actions</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button id="dash-act-blog" class="p-4 bg-dark-950 hover:bg-dark-800 border border-slate-800 hover:border-brand-500 rounded-xl text-left transition-all group">
            <div class="w-9 h-9 rounded-lg bg-brand-950 text-brand-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            </div>
            <div class="font-semibold text-white text-sm">Write New Article</div>
            <p class="text-xs text-slate-400 mt-1">Add a technical guide or conversion tutorial to /blog.</p>
          </button>

          <button id="dash-act-seo" class="p-4 bg-dark-950 hover:bg-dark-800 border border-slate-800 hover:border-brand-500 rounded-xl text-left transition-all group">
            <div class="w-9 h-9 rounded-lg bg-brand-950 text-brand-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </div>
            <div class="font-semibold text-white text-sm">Edit SEO Matrix Copy</div>
            <p class="text-xs text-slate-400 mt-1">Update programmatic templates for all 81 format pages.</p>
          </button>

          <button id="dash-act-settings" class="p-4 bg-dark-950 hover:bg-dark-800 border border-slate-800 hover:border-brand-500 rounded-xl text-left transition-all group">
            <div class="w-9 h-9 rounded-lg bg-brand-950 text-brand-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
            </div>
            <div class="font-semibold text-white text-sm">Theme & Site Settings</div>
            <p class="text-xs text-slate-400 mt-1">Change theme color, site meta title, and footer text.</p>
          </button>

          <button id="dash-act-rebuild" class="p-4 bg-dark-950 hover:bg-dark-800 border border-slate-800 hover:border-brand-500 rounded-xl text-left transition-all group">
            <div class="w-9 h-9 rounded-lg bg-brand-950 text-brand-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            </div>
            <div class="font-semibold text-white text-sm">Trigger Vercel Rebuild</div>
            <p class="text-xs text-slate-400 mt-1">Dispatch Vercel deploy hook to regenerate static sitemap.</p>
          </button>
        </div>
      </div>

      <!-- Recent Articles Table -->
      <div class="bg-dark-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div>
            <h2 class="text-lg font-bold text-white">Recent Published Articles</h2>
            <p class="text-xs text-slate-400">Manage published guides or create new articles in the Blog CMS.</p>
          </div>
          <button id="dash-view-all-blogs" class="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors">
            Open Blog CMS &rarr;
          </button>
        </div>

        ${recentBlogs.length === 0 ? `
          <div class="py-8 text-center text-slate-500 text-xs">
            No articles created yet. Click "Write New Article" to publish your first guide.
          </div>
        ` : `
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr class="text-slate-400 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-800/80">
                  <th class="pb-2.5 px-2">Title</th>
                  <th class="pb-2.5 px-2">Slug</th>
                  <th class="pb-2.5 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 text-slate-300">
                ${recentBlogs.map(b => `
                  <tr class="hover:bg-dark-800/40 transition-colors">
                    <td class="py-3 px-2 font-medium text-white max-w-sm truncate">${b.title}</td>
                    <td class="py-3 px-2 font-mono text-xs text-slate-400 max-w-[140px] truncate">/blog/${b.slug}</td>
                    <td class="py-3 px-2 text-right space-x-2 whitespace-nowrap">
                      <a href="/blog/${b.slug}" data-route-link class="text-xs text-slate-400 hover:text-brand-400 transition-colors px-2 py-1 bg-dark-950 border border-slate-800 rounded">
                        View
                      </a>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;

  document.getElementById('dash-act-blog')?.addEventListener('click', () => {
    editingBlogId = '';
    switchTab('blogs');
  });
  document.getElementById('dash-act-seo')?.addEventListener('click', () => switchTab('seo'));
  document.getElementById('dash-act-settings')?.addEventListener('click', () => switchTab('settings'));
  document.getElementById('dash-view-all-blogs')?.addEventListener('click', () => switchTab('blogs'));
  
  document.getElementById('dash-act-rebuild')?.addEventListener('click', () => {
    switchTab('settings');
    setTimeout(() => {
      const hookInput = document.getElementById('setting-vercel-hook') as HTMLInputElement;
      hookInput?.focus();
    }, 100);
  });
}

// -------------------------------------------------------------
// TAB 2: MATRIX SEO TEMPLATE MANAGER
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
// TAB 3: BLOG CMS
// -------------------------------------------------------------
function renderBlogsTab(
  container: HTMLElement, 
  user: User, 
  refresh: () => void
): void {
  const editingBlog = editingBlogId ? blogsList.find(b => b.id === editingBlogId) : null;
  const isCreatingNew = editingBlogId === '';

  // Render Blog Editor Form if editing or creating
  if (editingBlog || isCreatingNew) {
    container.innerHTML = `
      <div class="bg-dark-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div class="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <button id="btn-cancel-blog" class="p-1.5 rounded-lg bg-dark-950 border border-slate-700 text-slate-400 hover:text-white transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </button>
            <h2 class="text-xl font-bold text-white">
              ${isCreatingNew ? 'Create New Article' : 'Edit Article: ' + (editingBlog?.title || '')}
            </h2>
          </div>
          <button type="button" id="btn-cancel-blog-top" class="text-xs text-slate-400 hover:text-slate-200">
            Cancel
          </button>
        </div>

        <form id="blog-editor-form" class="space-y-6">
          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Article Title</label>
            <input type="text" id="blog-title" required value="${editingBlog?.title || ''}" 
              placeholder="e.g. How to Extract WAV Audio from 4K Video Offline"
              class="w-full px-4 py-3 bg-dark-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm">
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">URL Slug</label>
            <div class="flex items-center">
              <span class="px-3 py-3 bg-dark-950 border border-r-0 border-slate-700 rounded-l-xl text-xs text-slate-500 font-mono">/blog/</span>
              <input type="text" id="blog-slug" required value="${editingBlog?.slug || ''}" 
                placeholder="how-to-extract-wav-audio-offline"
                class="w-full px-4 py-3 bg-dark-950 border border-slate-700 rounded-r-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm font-mono">
            </div>
            <p class="text-[11px] text-slate-500 mt-1">Leave empty or type title to auto-generate clean SEO URL slug.</p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Meta Description / Excerpt</label>
            <input type="text" id="blog-excerpt" value="${editingBlog?.excerpt || ''}" 
              placeholder="Short 1-2 sentence overview for Google search snippets..."
              class="w-full px-4 py-3 bg-dark-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm">
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Content (Markdown Supported)</label>
            <textarea id="blog-content" rows="12" required
              placeholder="# Article Heading&#10;&#10;Write your guide content here using Markdown..."
              class="w-full px-4 py-3 bg-dark-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm font-mono leading-relaxed">${editingBlog?.content || ''}</textarea>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-slate-800">
            <button type="button" id="btn-cancel-blog-bottom" class="px-4 py-2.5 text-xs text-slate-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" id="btn-save-blog" class="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold shadow-lg transition-all flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              <span>Publish Article to Firestore</span>
            </button>
          </div>
        </form>
      </div>
    `;

    const titleInput = document.getElementById('blog-title') as HTMLInputElement;
    const slugInput = document.getElementById('blog-slug') as HTMLInputElement;

    if (isCreatingNew) {
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
    document.getElementById('btn-cancel-blog-top')?.addEventListener('click', cancelHandler);
    document.getElementById('btn-cancel-blog-bottom')?.addEventListener('click', cancelHandler);

    const form = document.getElementById('blog-editor-form') as HTMLFormElement;
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('btn-save-blog') as HTMLButtonElement;
      saveBtn.disabled = true;
      saveBtn.innerHTML = `<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Publishing...`;

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
                    <td class="py-3 px-2 font-mono text-xs text-slate-400 max-w-[140px] truncate">/blog/${b.slug}</td>
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
    editingBlogId = '';
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
// TAB 4: SITE SETTINGS (GLOBAL THEME, TITLE, FOOTER, VERCEL HOOK & TOGGLES)
// -------------------------------------------------------------
function renderSettingsTab(container: HTMLElement, refresh: () => void): void {
  container.innerHTML = `
    <div class="space-y-8">
      <!-- Global Variables & Customization Card -->
      <div class="bg-dark-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div class="pb-4 border-b border-slate-800">
          <h2 class="text-xl font-bold text-white">Global Variables & Theme Customization</h2>
          <p class="text-xs text-slate-400 mt-1">Configure global styling, meta titles, and footer text saved directly to Firestore.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Primary Theme Color -->
          <div class="space-y-3">
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Primary Theme Color</label>
            <div class="flex items-center gap-3">
              <input type="color" id="setting-theme-color-picker" value="${currentSettings.primaryColor || '#14b8a6'}" 
                class="w-12 h-11 bg-dark-950 border border-slate-700 rounded-xl cursor-pointer p-1">
              <input type="text" id="setting-theme-color-hex" value="${currentSettings.primaryColor || '#14b8a6'}" 
                class="w-32 px-3 py-2.5 bg-dark-950 border border-slate-700 rounded-xl text-white font-mono text-xs uppercase focus:outline-none focus:border-brand-500">
              <div id="theme-color-preview-badge" class="px-3 py-2 rounded-xl text-xs font-semibold text-white shadow-md flex items-center gap-1.5" style="background-color: ${currentSettings.primaryColor || '#14b8a6'}">
                <span>Active Tone</span>
              </div>
            </div>

            <!-- Color Presets -->
            <div class="flex items-center gap-2 pt-1">
              <span class="text-[11px] text-slate-500">Presets:</span>
              <button type="button" data-color-preset="#14b8a6" class="w-6 h-6 rounded-full bg-[#14b8a6] border border-white/20 hover:scale-110 transition-transform" title="Teal (Default)"></button>
              <button type="button" data-color-preset="#3b82f6" class="w-6 h-6 rounded-full bg-[#3b82f6] border border-white/20 hover:scale-110 transition-transform" title="Royal Blue"></button>
              <button type="button" data-color-preset="#8b5cf6" class="w-6 h-6 rounded-full bg-[#8b5cf6] border border-white/20 hover:scale-110 transition-transform" title="Purple"></button>
              <button type="button" data-color-preset="#10b981" class="w-6 h-6 rounded-full bg-[#10b981] border border-white/20 hover:scale-110 transition-transform" title="Emerald"></button>
              <button type="button" data-color-preset="#f59e0b" class="w-6 h-6 rounded-full bg-[#f59e0b] border border-white/20 hover:scale-110 transition-transform" title="Amber"></button>
              <button type="button" data-color-preset="#ef4444" class="w-6 h-6 rounded-full bg-[#ef4444] border border-white/20 hover:scale-110 transition-transform" title="Rose Red"></button>
            </div>
          </div>

          <!-- Site Meta Title -->
          <div class="space-y-2">
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Site Meta Title</label>
            <input type="text" id="setting-site-title" value="${currentSettings.siteMetaTitle || 'VidToAudio - Free, Offline & On-Device Audio Converter'}" 
              placeholder="e.g. VidToAudio - Free, Offline & On-Device Audio Converter"
              class="w-full px-4 py-2.5 bg-dark-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm">
            <p class="text-[11px] text-slate-500">Default &lt;title&gt; and Open Graph title displayed on homepage and search results.</p>
          </div>

          <!-- Global Footer Text -->
          <div class="space-y-2 md:col-span-2">
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Global Footer Disclaimer / Text</label>
            <input type="text" id="setting-footer-text" value="${currentSettings.footerText || 'VidToAudio. All rights reserved. 100% On-Device Audio Extraction.'}" 
              placeholder="e.g. VidToAudio. All rights reserved. 100% On-Device Audio Extraction."
              class="w-full px-4 py-2.5 bg-dark-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm">
            <p class="text-[11px] text-slate-500">Appears next to the copyright year in the public website footer.</p>
          </div>
        </div>
      </div>

      <!-- Vercel Deployment & Sitemap Trigger Card -->
      <div class="bg-dark-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
        <div class="pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-bold text-white">Vercel Deploy Hook & Sitemap Trigger</h2>
            <span class="px-2 py-0.5 rounded text-[10px] bg-brand-950 text-brand-400 border border-brand-800 font-mono">Instant CI/CD</span>
          </div>
          <p class="text-xs text-slate-400 mt-1">Rebuild the static site and update sitemap.xml with any newly created blog articles on Vercel.</p>
        </div>

        <div class="space-y-3">
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Vercel Deploy Hook URL</label>
          <div class="flex flex-col sm:flex-row gap-3">
            <input type="url" id="setting-vercel-hook" value="${currentSettings.vercelDeployHook || ''}" 
              placeholder="https://api.vercel.com/v1/integrations/deploy/prj_.../..."
              class="flex-1 px-4 py-3 bg-dark-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-xs sm:text-sm font-mono">
            <button type="button" id="btn-trigger-rebuild" class="px-5 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-lg">
              <svg class="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              <span>Rebuild Site Now</span>
            </button>
          </div>
          <div id="rebuild-status-msg" class="hidden text-xs p-3 rounded-xl border"></div>
          <p class="text-[11px] text-slate-500 leading-relaxed">
            Tip: You can create a deploy hook in Vercel under <em>Project Settings &rarr; Git &rarr; Deploy Hooks</em>. Triggering this hook runs <code class="text-brand-400 font-mono">npm run build</code> which executes <code class="text-brand-400 font-mono">generate-sitemap.js</code> to generate updated dynamic sitemaps.
          </p>
        </div>
      </div>

      <!-- Audio Format Availability Card -->
      <div class="bg-dark-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 class="text-xl font-bold text-white">Audio Format Availability</h2>
            <p class="text-xs text-slate-400 mt-0.5">Toggle format availability for the public web audio extraction dropdown and matrix.</p>
          </div>
          <span class="text-xs text-slate-400 font-mono bg-dark-950 px-3 py-1.5 rounded-lg border border-slate-800">
            9 Codecs Supported
          </span>
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
      </div>

      <!-- Master Save Action Bar -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-dark-900 border border-slate-800 rounded-2xl shadow-xl">
        <div>
          <span class="text-sm font-semibold text-white">Save All Configuration Changes</span>
          <p class="text-xs text-slate-400">Syncs theme colors, site meta title, footer text, and audio toggles with Firestore.</p>
        </div>
        <button id="btn-save-all-settings" class="w-full sm:w-auto px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold shadow-lg transition-all flex items-center justify-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          <span>Save All Settings to Firestore</span>
        </button>
      </div>

      <div id="settings-status-msg" class="hidden text-xs text-center font-medium"></div>
    </div>
  `;

  // Color picker sync
  const colorPicker = document.getElementById('setting-theme-color-picker') as HTMLInputElement;
  const colorHex = document.getElementById('setting-theme-color-hex') as HTMLInputElement;
  const previewBadge = document.getElementById('theme-color-preview-badge');

  function setColor(hex: string) {
    if (colorPicker) colorPicker.value = hex;
    if (colorHex) colorHex.value = hex.toUpperCase();
    if (previewBadge) previewBadge.style.backgroundColor = hex;
  }

  colorPicker?.addEventListener('input', () => setColor(colorPicker.value));
  colorHex?.addEventListener('input', () => {
    let val = colorHex.value.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      setColor(val);
    }
  });

  container.querySelectorAll('[data-color-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.getAttribute('data-color-preset');
      if (preset) setColor(preset);
    });
  });

  // Trigger Rebuild Site via Vercel Hook
  const btnTriggerRebuild = document.getElementById('btn-trigger-rebuild') as HTMLButtonElement;
  const hookInput = document.getElementById('setting-vercel-hook') as HTMLInputElement;
  const rebuildStatus = document.getElementById('rebuild-status-msg');

  btnTriggerRebuild?.addEventListener('click', async () => {
    const url = hookInput.value.trim();
    if (!url) {
      if (rebuildStatus) {
        rebuildStatus.className = 'text-xs p-3 rounded-xl border bg-amber-950/60 border-amber-800 text-amber-300';
        rebuildStatus.textContent = 'Please enter a valid Vercel Deploy Hook URL first.';
        rebuildStatus.classList.remove('hidden');
      }
      return;
    }

    btnTriggerRebuild.disabled = true;
    btnTriggerRebuild.innerHTML = `<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> <span>Dispatching...</span>`;

    if (rebuildStatus) {
      rebuildStatus.className = 'text-xs p-3 rounded-xl border bg-dark-950 border-slate-700 text-slate-300';
      rebuildStatus.textContent = 'Sending deployment trigger to Vercel...';
      rebuildStatus.classList.remove('hidden');
    }

    try {
      const response = await fetch(url, { method: 'POST' });
      if (response.ok) {
        if (rebuildStatus) {
          rebuildStatus.className = 'text-xs p-3 rounded-xl border bg-emerald-950/60 border-emerald-800 text-emerald-300';
          rebuildStatus.textContent = 'Vercel Deployment Dispatched! Build in progress. Dynamic sitemaps and updates will be live in ~60 seconds.';
        }
      } else {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
    } catch (err: any) {
      if (rebuildStatus) {
        rebuildStatus.className = 'text-xs p-3 rounded-xl border bg-blue-950/60 border-blue-800 text-blue-300';
        rebuildStatus.textContent = `Deploy signal transmitted to hook URL: ${err.message || 'Trigger accepted'}.`;
      }
    } finally {
      btnTriggerRebuild.disabled = false;
      btnTriggerRebuild.innerHTML = `<svg class="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg><span>Rebuild Site Now</span>`;
    }
  });

  // Master Save Button
  document.getElementById('btn-save-all-settings')?.addEventListener('click', async () => {
    const saveBtn = document.getElementById('btn-save-all-settings') as HTMLButtonElement;
    const statusMsg = document.getElementById('settings-status-msg');

    const primaryColor = (document.getElementById('setting-theme-color-hex') as HTMLInputElement).value.trim() || '#14b8a6';
    const siteMetaTitle = (document.getElementById('setting-site-title') as HTMLInputElement).value.trim();
    const footerText = (document.getElementById('setting-footer-text') as HTMLInputElement).value.trim();
    const vercelDeployHook = (document.getElementById('setting-vercel-hook') as HTMLInputElement).value.trim();

    const newToggles: FormatTogglesConfig = {};
    container.querySelectorAll('input[data-toggle-format]').forEach(el => {
      const checkbox = el as HTMLInputElement;
      const key = checkbox.getAttribute('data-toggle-format');
      if (key) newToggles[key] = checkbox.checked;
    });

    saveBtn.disabled = true;
    saveBtn.innerHTML = `<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Saving to Firestore...`;

    try {
      const newSettings: SiteSettingsConfig = {
        primaryColor,
        siteMetaTitle,
        footerText,
        vercelDeployHook
      };

      await Promise.all([
        saveSiteSettings(newSettings),
        saveFormatToggles(newToggles)
      ]);

      currentSettings = newSettings;
      currentToggles = newToggles;

      // Apply globally to client right away
      if (typeof (window as any).applyGlobalSettings === 'function') {
        (window as any).applyGlobalSettings(newSettings, newToggles);
      }

      saveBtn.disabled = false;
      saveBtn.innerHTML = `<span>Save All Settings to Firestore</span>`;

      if (statusMsg) {
        statusMsg.className = 'text-xs text-center font-medium text-brand-400 bg-brand-950/60 border border-brand-800/80 rounded-lg p-3';
        statusMsg.textContent = 'All global variables and format toggles saved to Firestore and applied live across VidToAudio!';
        statusMsg.classList.remove('hidden');
        setTimeout(() => statusMsg.classList.add('hidden'), 5000);
      }
    } catch (err: any) {
      alert('Error saving site settings: ' + err.message);
      saveBtn.disabled = false;
      saveBtn.innerHTML = `Retry Save`;
    }
  });
}
