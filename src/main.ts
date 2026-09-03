import { 
  fetchSEOTemplate, 
  fetchFormatToggles, 
  fetchSiteSettings,
  fetchBlogBySlug,
  DEFAULT_SEO_TEMPLATE, 
  DEFAULT_FORMAT_TOGGLES,
  DEFAULT_SITE_SETTINGS
} from './services/configService';
import { FormatTogglesConfig, SiteSettingsConfig } from './types';

// Format definitions
export const validInputs = ['mp4', 'mkv', 'avi', 'webm', 'mov', 'flv', 'wmv', 'hevc', 'm4v'];
export const validOutputs = ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'wma', 'opus', 'aiff'];

export const formatDisplayNames: Record<string, string> = {
  wav: 'WAV (Lossless, High Quality)',
  mp3: 'MP3 (Compressed, Universal)',
  aac: 'AAC (Advanced Audio Coding)',
  flac: 'FLAC (Free Lossless Audio Codec)',
  ogg: 'OGG (Vorbis Audio)',
  m4a: 'M4A (Apple Audio)',
  wma: 'WMA (Windows Media Audio)',
  opus: 'OPUS (High Efficiency Audio)',
  aiff: 'AIFF (Audio Interchange Format)'
};

// Cached dynamic configs from Firestore
let cachedSEOTemplate = DEFAULT_SEO_TEMPLATE;
let cachedFormatToggles: FormatTogglesConfig = { ...DEFAULT_FORMAT_TOGGLES };
let cachedSiteSettings: SiteSettingsConfig = { ...DEFAULT_SITE_SETTINGS };

/**
 * Dynamically applies global site settings across the entire app
 * (Primary Theme Color, Site Title, and Footer Text)
 */
export function applyGlobalSettings(settings: Partial<SiteSettingsConfig>, toggles?: FormatTogglesConfig) {
  if (!settings) return;

  // 1. Primary Theme Color injection
  if (settings.primaryColor) {
    cachedSiteSettings.primaryColor = settings.primaryColor;
    let styleTag = document.getElementById('dynamic-brand-styles') as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'dynamic-brand-styles';
      document.head.appendChild(styleTag);
    }
    const color = settings.primaryColor;
    styleTag.innerHTML = `
      :root {
        --brand-custom: ${color};
      }
      .text-brand-300, .text-brand-400, .text-brand-500 { color: ${color} !important; }
      .bg-brand-600, .bg-brand-500 { background-color: ${color} !important; }
      .hover\\:bg-brand-500:hover, .hover\\:bg-brand-600:hover { filter: brightness(1.15) !important; }
      .border-brand-500, .border-brand-400, .border-brand-800 { border-color: ${color} !important; }
      .focus\\:border-brand-500:focus { border-color: ${color} !important; }
      .focus\\:ring-brand-500:focus { --tw-ring-color: ${color} !important; }
    `;
  }

  // 2. Global Site Meta Title
  if (settings.siteMetaTitle) {
    cachedSiteSettings.siteMetaTitle = settings.siteMetaTitle;
    const currentRoute = parseRoute(window.location.pathname);
    if (currentRoute.type === 'converter' && currentRoute.isFallback) {
      document.title = settings.siteMetaTitle;
      updateMetaTag('og:title', settings.siteMetaTitle, true);
    }
  }

  // 3. Global Footer Text
  if (settings.footerText) {
    cachedSiteSettings.footerText = settings.footerText;
    const footerCustomText = document.getElementById('footer-custom-text');
    if (footerCustomText) {
      footerCustomText.textContent = settings.footerText;
    }
  }

  // 4. Update format toggles if supplied
  if (toggles) {
    cachedFormatToggles = { ...toggles };
    renderMatrixLinks();
    updateFormatDropdown();
  }
}

// Expose globally for Admin save callbacks
if (typeof window !== 'undefined') {
  (window as any).applyGlobalSettings = applyGlobalSettings;
}

// Meta Tag Helper Functions for SEO Perfection
export function updateMetaTag(name: string, content: string, isProperty = false) {
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function updateCanonical(url: string) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

export function updateRobots(allowIndex = true) {
  updateMetaTag('robots', allowIndex ? 'index, follow, max-image-preview:large' : 'noindex, nofollow');
}

/**
 * Updates the Top Navigation Bar active states (Home, Converters, Blog, About, Privacy, Admin)
 */
export function updateNavbarActiveState(pathname: string) {
  const route = parseRoute(pathname);
  const cleanPath = (pathname || window.location.pathname || '/').toLowerCase().split('?')[0].split('#')[0].replace(/\/$/, '') || '/';

  // Desktop navigation items
  const navItems = {
    home: document.getElementById('nav-link-home'),
    converters: document.getElementById('nav-link-converters'),
    blog: document.getElementById('nav-link-blog'),
    about: document.getElementById('nav-link-about'),
    privacy: document.getElementById('nav-link-privacy'),
    admin: document.getElementById('nav-link-admin'),
  };

  // Mobile navigation items
  const mobItems = {
    home: document.getElementById('mob-link-home'),
    converters: document.getElementById('mob-link-converters'),
    blog: document.getElementById('mob-link-blog'),
    about: document.getElementById('mob-link-about'),
    privacy: document.getElementById('mob-link-privacy'),
  };

  const resetEl = (el: HTMLElement | null) => {
    if (!el) return;
    el.classList.remove('bg-dark-800', 'text-brand-400', 'border', 'border-brand-500/50');
    el.classList.add('text-slate-300');
  };

  const activeEl = (el: HTMLElement | null) => {
    if (!el) return;
    el.classList.remove('text-slate-300');
    el.classList.add('bg-dark-800', 'text-brand-400', 'border', 'border-brand-500/50');
  };

  Object.values(navItems).forEach(resetEl);
  Object.values(mobItems).forEach(resetEl);

  if (route.type === 'admin') {
    activeEl(navItems.admin);
  } else if (route.type === 'blog-list' || route.type === 'blog-post') {
    activeEl(navItems.blog);
    activeEl(mobItems.blog);
  } else if (cleanPath.includes('privacy')) {
    activeEl(navItems.privacy);
    activeEl(mobItems.privacy);
  } else if (route.type === 'converter' && !route.isFallback) {
    activeEl(navItems.converters);
    activeEl(mobItems.converters);
  } else {
    // Default homepage
    activeEl(navItems.home);
    activeEl(mobItems.home);
  }
}

export function parseRoute(pathname: string) {
  let clean = (pathname || window.location.pathname || '/').toLowerCase().trim();
  clean = clean.split('?')[0].split('#')[0];
  clean = clean.replace(/^\/+|\/+$/g, '');
  clean = clean.replace(/\.html$/, '');

  // Handle GitHub Pages SPA redirection patterns if present (e.g., /?/admin or ?p=/admin)
  if (typeof window !== 'undefined' && window.location.search) {
    const search = window.location.search;
    if (search.startsWith('?/')) {
      clean = search.slice(2).split('&')[0].replace(/^\/+|\/+$/g, '').replace(/\.html$/, '');
    } else {
      const matchParam = search.match(/[?&](?:p|path|route)=([^&]+)/);
      if (matchParam) {
        clean = decodeURIComponent(matchParam[1]).toLowerCase().replace(/^\/+|\/+$/g, '').replace(/\.html$/, '');
      }
    }
  }

  if (!clean || clean === '404') {
    return { type: 'converter', input: 'mp4', output: 'wav', isFallback: true, canonicalPath: '/' };
  }

  if (clean === 'admin' || clean.startsWith('admin/')) {
    return { type: 'admin', path: '/admin' };
  }

  if (clean === 'blog') {
    return { type: 'blog-list', path: '/blog' };
  }

  if (clean.startsWith('blog/')) {
    const slug = clean.replace(/^blog\//, '');
    return { type: 'blog-post', slug, path: `/blog/${slug}` };
  }

  // Pattern match /{input}-to-{output} or /convert-{input}-to-{output}
  const match = clean.match(/^(?:convert-)?([a-z0-9]+)-to-([a-z0-9]+)$/);
  if (match) {
    const inExt = match[1];
    const outExt = match[2];

    if (inExt === 'video' && validOutputs.includes(outExt)) {
      return { type: 'converter', input: 'mp4', output: outExt, isFallback: false, canonicalPath: `/video-to-${outExt}`, displayInput: 'Video' };
    }

    if (validInputs.includes(inExt) && validOutputs.includes(outExt)) {
      return { type: 'converter', input: inExt, output: outExt, isFallback: false, canonicalPath: `/${inExt}-to-${outExt}` };
    }
  }

  return { type: 'converter', input: 'mp4', output: 'wav', isFallback: true, canonicalPath: '/' };
}

// Render dynamic matrix footer links
export function renderMatrixLinks() {
  const matrixContainer = document.getElementById('all-converters-matrix');
  if (!matrixContainer) return;

  matrixContainer.innerHTML = '';

  validInputs.forEach(inExt => {
    const inUpper = inExt.toUpperCase();
    const col = document.createElement('div');
    col.className = 'bg-dark-900/80 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col gap-2 hover:border-slate-700 transition-colors';

    const title = document.createElement('div');
    title.className = 'flex items-center gap-1.5 pb-2 border-b border-slate-800/80 text-slate-300 font-semibold text-xs tracking-wider uppercase';
    title.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-brand-400"></span> ${inUpper}`;
    col.appendChild(title);

    const linkList = document.createElement('div');
    linkList.className = 'flex flex-col gap-1';

    validOutputs.forEach(outExt => {
      const isEnabled = cachedFormatToggles[outExt] !== false;
      if (!isEnabled) return; // Only show enabled outputs

      const outUpper = outExt.toUpperCase();
      const a = document.createElement('a');
      a.href = `/${inExt}-to-${outExt}`;
      a.setAttribute('data-route-link', '');
      a.className = 'text-xs text-slate-400 hover:text-brand-400 transition-colors py-0.5 whitespace-nowrap overflow-hidden text-ellipsis';
      a.textContent = `${inUpper} to ${outUpper}`;
      linkList.appendChild(a);
    });

    col.appendChild(linkList);
    matrixContainer.appendChild(col);
  });
}

// Generate dynamic SEO description card from Firestore template
export function generateSEOContent(inExt: string, outExt: string): string {
  const inUpper = inExt.toUpperCase();
  const outUpper = outExt.toUpperCase();

  // Substitute {INPUT} and {OUTPUT} in the remote Firestore template
  const customText = cachedSEOTemplate
    .replace(/\{INPUT\}/gi, inUpper)
    .replace(/\{OUTPUT\}/gi, outUpper);

  return `
    <div class="bg-dark-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
      <div class="absolute -right-12 -top-12 w-40 h-40 bg-brand-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div class="flex items-center gap-2 mb-4">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-950 text-brand-400 border border-brand-800/60">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          On-Device Conversion Overview
        </span>
        <span class="text-xs text-slate-500 font-mono">${inUpper} &rarr; ${outUpper}</span>
      </div>
      <h3 class="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">Offline ${inUpper} to ${outUpper} Audio Extraction</h3>
      <p class="text-slate-300 leading-relaxed text-sm sm:text-base mb-6">
        ${customText}
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-brand-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          <span><strong>100% Offline:</strong> Zero data uploads</span>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-brand-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          <span><strong>High Fidelity:</strong> Native ${outUpper} stream</span>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-brand-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          <span><strong>Hardware Accelerated:</strong> Direct CPU speed</span>
        </div>
      </div>
    </div>
  `;
}

// Generate dynamic FAQs for format combinations
export function generateDynamicFAQs(inExt: string, outExt: string): string {
  const inUpper = inExt.toUpperCase();
  const outUpper = outExt.toUpperCase();

  const faqs = [
    {
      q: `Is there a file size limit for ${inUpper} to ${outUpper} conversion?`,
      a: `Because VidToAudio runs locally in your browser and on your device using WebAssembly and hardware acceleration, there is no artificial cloud file size limit for converting ${inUpper} to ${outUpper}. You can extract audio from large ${inUpper} files without uploading a single byte to external servers.`
    },
    {
      q: `Why extract ${outUpper} from ${inUpper} offline?`,
      a: `Extracting ${outUpper} from ${inUpper} offline ensures complete privacy, instant conversion speeds without bandwidth throttling, and zero cellular data usage. Your ${inUpper} video never leaves your phone or browser, guaranteeing confidential handling of personal recordings.`
    },
    {
      q: `What audio quality can I expect when converting ${inUpper} to ${outUpper}?`,
      a: `Our conversion engine retains the original sample rate and audio fidelity from your source ${inUpper} file. Exporting to ${outUpper} gives you pristine audio reproduction with full user control over bitrates and lossless encoding.`
    }
  ];

  return faqs.map((faq, index) => `
    <div class="bg-dark-900 border border-brand-900/50 hover:border-brand-500/50 rounded-xl p-6 transition-colors shadow-lg">
      <div class="flex items-start gap-3">
        <span class="w-6 h-6 rounded-full bg-brand-900/60 text-brand-400 border border-brand-700/50 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">${index + 1}</span>
        <div>
          <h3 class="text-lg font-semibold text-white mb-2">${faq.q}</h3>
          <p class="text-slate-400 text-sm leading-relaxed">${faq.a}</p>
        </div>
      </div>
    </div>
  `).join('');
}

// Synchronize dropdown options with enabled format toggles
export function updateFormatDropdown(selectedExt?: string) {
  const formatSelect = (document.getElementById('output-format') || document.getElementById('format-select')) as HTMLSelectElement;
  if (!formatSelect) return;

  const currentVal = selectedExt || formatSelect.value || 'wav';
  formatSelect.innerHTML = '';

  validOutputs.forEach(outExt => {
    const isEnabled = cachedFormatToggles[outExt] !== false;
    if (isEnabled) {
      const opt = document.createElement('option');
      opt.value = outExt;
      opt.textContent = formatDisplayNames[outExt] || outExt.toUpperCase();
      formatSelect.appendChild(opt);
    }
  });

  // Ensure current selection is valid or default to first enabled
  if (formatSelect.querySelector(`option[value="${currentVal}"]`)) {
    formatSelect.value = currentVal;
  } else if (formatSelect.options.length > 0) {
    formatSelect.selectedIndex = 0;
  }

  const formatSummary = document.getElementById('format-summary');
  if (formatSummary) {
    const selectedOptionText = formatSelect.options[formatSelect.selectedIndex]?.text || formatSelect.value.toUpperCase();
    formatSummary.textContent = `Output: ${selectedOptionText}`;
  }
}

// Master Route Applicator with Strict SEO Perfection & Security Guards
export async function navigateTo(pathname = window.location.pathname) {
  const route = parseRoute(pathname);

  const publicConverterView = document.getElementById('public-converter-view');
  const dynamicRouteView = document.getElementById('dynamic-route-view');

  // Update top navigation bar active links
  updateNavbarActiveState(pathname);

  if (route.type === 'admin') {
    // -----------------------------------------------------------------
    // PROTECTED ADMIN ROUTE: Lazy-load admin bundle on demand
    // -----------------------------------------------------------------
    if (publicConverterView) publicConverterView.classList.add('hidden');
    if (dynamicRouteView) {
      dynamicRouteView.classList.remove('hidden');
      dynamicRouteView.innerHTML = `
        <div class="py-24 text-center">
          <div class="w-10 h-10 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-slate-400 text-sm font-medium">Loading Protected Admin Portal...</p>
        </div>
      `;

      // Code-split and lazy-load admin app module
      const { renderAdminApp } = await import('./admin/adminApp');
      renderAdminApp(dynamicRouteView);
    }

    // SEO Rule for Admin: Strictly noindex to prevent indexing of internal admin tools
    document.title = 'Admin Portal | VidToAudio';
    updateRobots(false);
    updateCanonical('https://vidtoaudio.com/admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // Public pages must be indexed by search engines
  updateRobots(true);

  if (route.type === 'blog-list' || route.type === 'blog-post') {
    // -----------------------------------------------------------------
    // PUBLIC BLOG ROUTE: Lazy-load blog module
    // -----------------------------------------------------------------
    if (publicConverterView) publicConverterView.classList.add('hidden');
    if (dynamicRouteView) {
      dynamicRouteView.classList.remove('hidden');
      dynamicRouteView.innerHTML = `
        <div class="py-24 text-center">
          <div class="w-10 h-10 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-slate-400 text-sm font-medium">Loading Blog Articles...</p>
        </div>
      `;

      const { renderBlogView } = await import('./blog/blogApp');
      await renderBlogView(dynamicRouteView, route.type === 'blog-post' ? route.slug : undefined);
    }

    if (route.type === 'blog-list') {
      // Blog Directory Meta Tags
      const blogTitle = 'Audio Extraction Guides & Technical Tutorials | VidToAudio Blog';
      const blogDesc = 'In-depth tutorials on video-to-audio extraction, audio codec benchmarks (MP3 vs WAV vs FLAC), and private offline processing.';
      const blogUrl = 'https://vidtoaudio.com/blog';

      document.title = blogTitle;
      updateMetaTag('description', blogDesc);
      updateCanonical(blogUrl);
      updateMetaTag('og:title', blogTitle, true);
      updateMetaTag('og:description', blogDesc, true);
      updateMetaTag('og:url', blogUrl, true);
      updateMetaTag('og:type', 'website', true);
      updateMetaTag('twitter:card', 'summary_large_image');
      updateMetaTag('twitter:title', blogTitle);
      updateMetaTag('twitter:description', blogDesc);
    } else {
      // Single Article Dynamic Meta Tags
      const slug = route.slug;
      const article = await fetchBlogBySlug(slug);
      const articleTitle = article?.title 
        ? `${article.title} | VidToAudio` 
        : `${slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} | VidToAudio Blog`;
      const articleDesc = article?.excerpt || 'Discover technical audio extraction insights and lossless audio tips.';
      const articleUrl = `https://vidtoaudio.com/blog/${slug}`;

      document.title = articleTitle;
      updateMetaTag('description', articleDesc);
      updateCanonical(articleUrl);
      updateMetaTag('og:title', articleTitle, true);
      updateMetaTag('og:description', articleDesc, true);
      updateMetaTag('og:url', articleUrl, true);
      updateMetaTag('og:type', 'article', true);
      updateMetaTag('twitter:card', 'summary_large_image');
      updateMetaTag('twitter:title', articleTitle);
      updateMetaTag('twitter:description', articleDesc);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // -----------------------------------------------------------------
  // CONVERTER & HOMEPAGE ROUTE: Show main tool & update SEO tags & matrix
  // -----------------------------------------------------------------
  if (dynamicRouteView) dynamicRouteView.classList.add('hidden');
  if (publicConverterView) publicConverterView.classList.remove('hidden');

  const inUpper = route.displayInput || (route.input ? route.input.toUpperCase() : 'MP4');
  const outUpper = route.output ? route.output.toUpperCase() : 'WAV';

  if (route.isFallback) {
    // 1. Root / Homepage Dynamic Meta Tags
    const homeTitle = cachedSiteSettings.siteMetaTitle || 'VidToAudio - Free, Offline & On-Device Audio Converter';
    const homeDesc = 'Extract high-quality audio (MP3, WAV, AAC, FLAC, OGG, M4A) from video 100% offline in your browser. Private, hardware-accelerated, and free.';
    const homeUrl = 'https://vidtoaudio.com/';

    document.title = homeTitle;
    updateMetaTag('description', homeDesc);
    updateCanonical(homeUrl);
    updateMetaTag('og:title', homeTitle, true);
    updateMetaTag('og:description', homeDesc, true);
    updateMetaTag('og:url', homeUrl, true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', homeTitle);
    updateMetaTag('twitter:description', homeDesc);
  } else {
    // 2. Programmatic /{input}-to-{output} Landing Page Meta Tags
    const pageTitle = `Convert ${inUpper} to ${outUpper} Audio Offline & Free | VidToAudio`;
    const pageDesc = `Extract high-quality ${outUpper} audio from ${inUpper} video files securely on your device with zero uploads. Lossless and fast.`;
    const pageUrl = `https://vidtoaudio.com${route.canonicalPath}`;

    document.title = pageTitle;
    updateMetaTag('description', pageDesc);
    updateCanonical(pageUrl);
    updateMetaTag('og:title', pageTitle, true);
    updateMetaTag('og:description', pageDesc, true);
    updateMetaTag('og:url', pageUrl, true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', pageTitle);
    updateMetaTag('twitter:description', pageDesc);
  }

  // 3. Dynamic main <h1> text
  const heroTitleHighlight = document.getElementById('hero-title-highlight');
  if (heroTitleHighlight) {
    heroTitleHighlight.textContent = `${inUpper} to ${outUpper} Converter`;
  }
  const heroTitleSub = document.getElementById('hero-title-sub');
  if (heroTitleSub) {
    heroTitleSub.textContent = 'Free, Offline & On-Device';
  }

  const converterTitle = document.getElementById('converter-title');
  if (converterTitle) {
    converterTitle.textContent = `Try it here: Free ${inUpper} to ${outUpper} Converter`;
  }

  // 4. Dynamic Upload Box Text
  const dropzoneText = document.getElementById('dropzone-text');
  if (dropzoneText) {
    dropzoneText.textContent = `Click to select ${inUpper} video`;
  }

  // 5. Update dropdown options & selection based on active toggles
  updateFormatDropdown(route.output);

  // 6. Inject Dynamic SEO Description Block (fetched from Firestore)
  const seoContainer = document.getElementById('dynamic-seo-content');
  if (seoContainer) {
    seoContainer.innerHTML = generateSEOContent(route.input || 'mp4', route.output || 'wav');
  }

  // 7. Inject Dynamic FAQ Block
  const faqContainer = document.getElementById('dynamic-faq');
  if (faqContainer) {
    faqContainer.innerHTML = generateDynamicFAQs(route.input || 'mp4', route.output || 'wav');
  }

  // 8. Update active states for route pills and matrix links
  const normalizedPath = (pathname || '/').toLowerCase().split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
  document.querySelectorAll('[data-route-link]').forEach(link => {
    const href = (link.getAttribute('href') || '').toLowerCase().replace(/\/$/, '') || '/';
    const parsed = parseRoute(href);
    const isMatch = (parsed.type === 'converter' && parsed.input === route.input && parsed.output === route.output) ||
                    (href === normalizedPath) ||
                    (normalizedPath === '/' && href === '/mp4-to-wav');

    if (link.classList.contains('px-3')) {
      if (isMatch) {
        link.classList.add('border-brand-500', 'text-brand-400', 'bg-dark-800');
        link.classList.remove('border-slate-700', 'text-slate-300', 'bg-dark-900');
      } else {
        link.classList.remove('border-brand-500', 'text-brand-400', 'bg-dark-800');
        link.classList.add('border-slate-700', 'text-slate-300', 'bg-dark-900');
      }
    }
  });
}

// Expose navigateTo globally
if (typeof window !== 'undefined') {
  (window as any).navigateTo = navigateTo;
}

// Setup responsive navbar interactions (toggle menu & in-page smooth scrolls)
function initNavbarInteractions() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('mobile-nav-menu');
  const hamburger = document.getElementById('hamburger-icon');
  const closeIcon = document.getElementById('close-icon');

  if (toggleBtn && menu) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = menu.classList.contains('hidden');
      if (isHidden) {
        menu.classList.remove('hidden');
        hamburger?.classList.add('hidden');
        closeIcon?.classList.remove('hidden');
      } else {
        menu.classList.add('hidden');
        hamburger?.classList.remove('hidden');
        closeIcon?.classList.add('hidden');
      }
    });

    // Close mobile menu whenever a menu link is tapped
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.add('hidden');
        hamburger?.classList.remove('hidden');
        closeIcon?.classList.add('hidden');
      });
    });
  }

  // Handle smooth scroll for anchors like /#all-converters-section and /#about
  document.querySelectorAll('a[href^="/#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href) return;
      const targetId = href.replace('/#', '');
      
      const currentRoute = parseRoute(window.location.pathname);
      if (currentRoute.type !== 'converter' || !currentRoute.isFallback) {
        e.preventDefault();
        window.history.pushState({}, '', '/');
        navigateTo('/').then(() => {
          setTimeout(() => {
            const targetEl = document.getElementById(targetId);
            if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        });
      } else {
        e.preventDefault();
        const targetEl = document.getElementById(targetId);
        if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// Initialize Application
async function initApp() {
  // 1. Synchronous initial setup
  initNavbarInteractions();
  applyGlobalSettings(cachedSiteSettings);
  renderMatrixLinks();
  await navigateTo(window.location.pathname);

  // 2. Intercept all SPA route links
  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement)?.closest('[data-route-link]') as HTMLAnchorElement | null;
    if (!target) return;

    const href = target.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto')) {
      return;
    }

    e.preventDefault();
    if (window.location.pathname !== href) {
      window.history.pushState({}, '', href);
    }
    navigateTo(href);
  });

  // 3. Handle browser back/forward navigation
  window.addEventListener('popstate', () => {
    navigateTo(window.location.pathname);
  });

  // 4. Non-blocking background fetch of remote configurations
  fetchRemoteConfigs();
}

async function fetchRemoteConfigs() {
  try {
    const [seo, toggles, settings] = await Promise.all([
      fetchSEOTemplate(),
      fetchFormatToggles(),
      fetchSiteSettings()
    ]);
    cachedSEOTemplate = seo;
    cachedFormatToggles = toggles;
    cachedSiteSettings = settings;

    applyGlobalSettings(settings, toggles);
    renderMatrixLinks();
    updateFormatDropdown();
    
    // If currently on a converter page, re-inject SEO content
    const currentRoute = parseRoute(window.location.pathname);
    if (currentRoute.type === 'converter') {
      const seoContainer = document.getElementById('dynamic-seo-content');
      if (seoContainer) {
        seoContainer.innerHTML = generateSEOContent(currentRoute.input || 'mp4', currentRoute.output || 'wav');
      }
    }
  } catch (e) {
    console.warn('Using default configurations for SEO, Toggles and Settings:', e);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

