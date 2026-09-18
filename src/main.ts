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
import { 
  generateFormatArticle, 
  generateFormatFAQAccordionHTML, 
  generateFormatFAQSchema 
} from './utils/formatSEOContent';
import { renderRatingWidget } from './components/RatingWidget';
import {
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  extractLanguageFromPath,
  buildLocalizedPath,
  getCurrentLanguage,
  setCurrentLanguage,
  getTranslations,
  interpolate,
  updateHreflangTags
} from './i18n';
import { updateEditorLanguage } from './editor/videoEditorApp';

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
      .border-brand-500, .border-brand-600 { border-color: ${color} !important; }
      .bg-brand-500, .bg-brand-600 { background-color: ${color} !important; }
      .hover\\:bg-brand-500:hover { background-color: ${color} !important; opacity: 0.9; }
      .focus\\:ring-brand-500:focus { --tw-ring-color: ${color} !important; }
      .selection\\:bg-brand-500::selection { background-color: ${color} !important; }
    `;
  }

  // 2. Dynamic Browser Title for Homepage
  if (settings.siteMetaTitle) {
    cachedSiteSettings.siteMetaTitle = settings.siteMetaTitle;
    const currentRoute = parseRoute(window.location.pathname);
    if (currentRoute.type === 'converter' && currentRoute.isFallback && currentRoute.lang === 'en') {
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
    renderMatrixLinks(getCurrentLanguage());
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

export interface ParsedRoute {
  type: 'converter' | 'admin' | 'editor' | 'blog-list' | 'blog-post';
  lang: SupportedLanguage;
  rawPath: string;
  cleanPath: string;
  canonicalPath: string;
  input?: string;
  output?: string;
  displayInput?: string;
  isFallback?: boolean;
  slug?: string;
  path?: string;
}

/**
 * Updates the Top Navigation Bar active states (Home, Converters, Blog, About, Privacy, Admin)
 */
export function updateNavbarActiveState(pathname: string) {
  const route = parseRoute(pathname);
  const cleanPath = (route.cleanPath || '/').toLowerCase().split('?')[0].split('#')[0].replace(/\/$/, '') || '/';

  // Desktop navigation items
  const navItems = {
    home: document.getElementById('nav-link-home'),
    converters: document.getElementById('nav-link-converters'),
    blog: document.getElementById('nav-link-blog'),
    editor: document.getElementById('nav-link-editor'),
    about: document.getElementById('nav-link-about'),
    privacy: document.getElementById('nav-link-privacy'),
    admin: document.getElementById('nav-link-admin'),
  };

  // Mobile navigation items
  const mobItems = {
    home: document.getElementById('mob-link-home'),
    converters: document.getElementById('mob-link-converters'),
    blog: document.getElementById('mob-link-blog'),
    editor: document.getElementById('mob-link-editor'),
    about: document.getElementById('mob-link-about'),
    privacy: document.getElementById('mob-link-privacy'),
  };

  const resetEl = (el: HTMLElement | null) => {
    if (!el) return;
    el.classList.remove('bg-dark-800', 'text-brand-400', 'border', 'border-brand-500/50', 'text-teal-400');
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
  } else if (route.type === 'editor') {
    activeEl(navItems.editor);
    activeEl(mobItems.editor);
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

export function parseRoute(pathname: string): ParsedRoute {
  let raw = (pathname || (typeof window !== 'undefined' ? window.location.pathname : '/')).toLowerCase().trim();
  raw = raw.split('?')[0].split('#')[0];

  // Handle GitHub Pages SPA redirection patterns if present (e.g., /?/admin or ?p=/admin)
  if (typeof window !== 'undefined' && window.location.search) {
    const search = window.location.search;
    if (search.startsWith('?/')) {
      raw = search.slice(2).split('&')[0];
    } else {
      const matchParam = search.match(/[?&](?:p|path|route)=([^&]+)/);
      if (matchParam) {
        raw = decodeURIComponent(matchParam[1]).toLowerCase();
      }
    }
  }

  // 1. Extract language prefix
  const { lang, cleanPath: cleanWithoutLang } = extractLanguageFromPath(raw);
  let clean = cleanWithoutLang.replace(/^\/+|\/+$/g, '').replace(/\.html$/, '');

  if (!clean || clean === '404') {
    return { 
      type: 'converter', 
      lang, 
      rawPath: raw, 
      cleanPath: '/', 
      canonicalPath: buildLocalizedPath('/', lang), 
      input: 'mp4', 
      output: 'mp3', 
      isFallback: true 
    };
  }

  if (clean === 'admin' || clean.startsWith('admin/')) {
    return { 
      type: 'admin', 
      lang, 
      rawPath: raw, 
      cleanPath: '/admin', 
      canonicalPath: '/admin', 
      path: '/admin' 
    };
  }

  if (clean === 'editor' || clean === 'video-editor' || clean.startsWith('editor/')) {
    return { 
      type: 'editor', 
      lang, 
      rawPath: raw, 
      cleanPath: '/editor', 
      canonicalPath: buildLocalizedPath('/editor', lang), 
      path: '/editor' 
    };
  }

  if (clean === 'blog') {
    return { 
      type: 'blog-list', 
      lang, 
      rawPath: raw, 
      cleanPath: '/blog', 
      canonicalPath: buildLocalizedPath('/blog', lang), 
      path: '/blog' 
    };
  }

  if (clean.startsWith('blog/')) {
    const slug = clean.replace(/^blog\//, '');
    return { 
      type: 'blog-post', 
      lang, 
      rawPath: raw, 
      cleanPath: `/blog/${slug}`, 
      canonicalPath: buildLocalizedPath(`/blog/${slug}`, lang), 
      slug, 
      path: `/blog/${slug}` 
    };
  }

  // Pattern match /{input}-to-{output} or /convert-{input}-to-{output}
  const match = clean.match(/^(?:convert-)?([a-z0-9]+)-to-([a-z0-9]+)$/);
  if (match) {
    const inExt = match[1];
    const outExt = match[2];

    if (inExt === 'video' && validOutputs.includes(outExt)) {
      return { 
        type: 'converter', 
        lang, 
        rawPath: raw, 
        cleanPath: `/video-to-${outExt}`, 
        canonicalPath: buildLocalizedPath(`/video-to-${outExt}`, lang), 
        input: 'mp4', 
        output: outExt, 
        isFallback: false, 
        displayInput: 'Video' 
      };
    }

    if (validInputs.includes(inExt) && validOutputs.includes(outExt)) {
      return { 
        type: 'converter', 
        lang, 
        rawPath: raw, 
        cleanPath: `/${inExt}-to-${outExt}`, 
        canonicalPath: buildLocalizedPath(`/${inExt}-to-${outExt}`, lang), 
        input: inExt, 
        output: outExt, 
        isFallback: false 
      };
    }
  }

  return { 
    type: 'converter', 
    lang, 
    rawPath: raw, 
    cleanPath: '/', 
    canonicalPath: buildLocalizedPath('/', lang), 
    input: 'mp4', 
    output: 'mp3', 
    isFallback: true 
  };
}

// Render dynamic matrix footer links localized
export function renderMatrixLinks(lang: SupportedLanguage = getCurrentLanguage()) {
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
      a.href = buildLocalizedPath(`/${inExt}-to-${outExt}`, lang);
      a.setAttribute('data-route-link', '');
      a.className = 'text-xs text-slate-400 hover:text-brand-400 transition-colors py-0.5 whitespace-nowrap overflow-hidden text-ellipsis';
      a.textContent = `${inUpper} to ${outUpper}`;
      linkList.appendChild(a);
    });

    col.appendChild(linkList);
    matrixContainer.appendChild(col);
  });
}

// Generate dynamic SEO description card from Firestore template or localized fallback
export function generateSEOContent(inExt: string, outExt: string, lang: SupportedLanguage = 'en'): string {
  const inUpper = inExt.toUpperCase();
  const outUpper = outExt.toUpperCase();
  const t = getTranslations(lang);

  const customText = cachedSEOTemplate
    .replace(/\{INPUT\}/gi, inUpper)
    .replace(/\{OUTPUT\}/gi, outUpper);

  const localizedBadge = lang === 'es' 
    ? 'Información de Conversión en Dispositivo' 
    : (lang === 'fr' ? 'Aperçu de la Conversion Locale' : 'On-Device Conversion Overview');

  const localizedTitle = lang === 'es'
    ? `Extracción de Audio ${inUpper} a ${outUpper} Sin Conexión`
    : (lang === 'fr' ? `Extraction Audio ${inUpper} vers ${outUpper} Hors Ligne` : `Offline ${inUpper} to ${outUpper} Audio Extraction`);

  return `
    <div class="bg-dark-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
      <div class="absolute -right-12 -top-12 w-40 h-40 bg-brand-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div class="flex items-center gap-2 mb-4">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-950 text-brand-400 border border-brand-800/60">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          ${localizedBadge}
        </span>
        <span class="text-xs text-slate-500 font-mono">${inUpper} &rarr; ${outUpper}</span>
      </div>
      <h3 class="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">${localizedTitle}</h3>
      <p class="text-slate-300 leading-relaxed text-sm sm:text-base mb-6">
        ${customText}
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-brand-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          <span><strong>100% Offline:</strong> ${t.hero.trustNoUploads}</span>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-brand-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          <span><strong>High Fidelity:</strong> Native ${outUpper}</span>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-brand-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          <span><strong>Hardware Accelerated:</strong> WebAssembly CPU</span>
        </div>
      </div>
    </div>
  `;
}

// Generate dynamic FAQs for format combinations localized
export function generateDynamicFAQs(inExt: string, outExt: string, lang: SupportedLanguage = 'en'): string {
  const inUpper = inExt.toUpperCase();
  const outUpper = outExt.toUpperCase();

  const faqs = {
    en: [
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
    ],
    es: [
      {
        q: `¿Existe un límite de tamaño para convertir ${inUpper} a ${outUpper}?`,
        a: `Dado que VidToAudio se ejecuta de forma local en tu navegador mediante WebAssembly y aceleración por hardware, no hay límites artificiales de subida a la nube al convertir ${inUpper} a ${outUpper}. Puedes extraer audio de vídeos pesados sin enviar ni un solo byte a servidores externos.`
      },
      {
        q: `¿Por qué extraer ${outUpper} de ${inUpper} sin conexión?`,
        a: `Hacer la conversión sin conexión garantiza privacidad absoluta, velocidad inmediata sin restricciones de ancho de banda y cero gasto de datos móviles. Tu vídeo ${inUpper} nunca sale de tu dispositivo.`
      },
      {
        q: `¿Qué calidad de audio obtendré al convertir ${inUpper} a ${outUpper}?`,
        a: `El motor de conversión conserva la frecuencia de muestreo y la fidelidad original del archivo ${inUpper}. Exportar a ${outUpper} proporciona un sonido nítido con control total sobre tasas de bits y compresión sin pérdidas.`
      }
    ],
    fr: [
      {
        q: `Y a-t-il une limite de taille pour convertir ${inUpper} en ${outUpper} ?`,
        a: `Comme VidToAudio s’exécute localement dans votre navigateur via WebAssembly et accélération matérielle, il n’y a aucune limite de taille imposée par le cloud. Vous pouvez convertir de gros fichiers ${inUpper} sans téléverser le moindre octet sur un serveur distant.`
      },
      {
        q: `Pourquoi extraire ${outUpper} depuis ${inUpper} hors ligne ?`,
        a: `L'extraction hors ligne garantit une confidentialité totale, une vitesse instantanée sans étranglement de bande passante et zéro consommation de données mobiles. Vos vidéos ${inUpper} restent strictement sur votre machine.`
      },
      {
        q: `Quelle est la qualité sonore en convertissant ${inUpper} en ${outUpper} ?`,
        a: `Notre moteur préserve la fréquence d'échantillonnage et la fidélité native du fichier source ${inUpper}. L'exportation en ${outUpper} offre une restitution limpide avec contrôle des débits binaires et prise en charge sans perte.`
      }
    ]
  }[lang] || [
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
    const lang = getCurrentLanguage();
    const t = getTranslations(lang);
    formatSummary.textContent = interpolate(t.converter.outputSummary, {
      format: selectedOptionText,
      bitrate: '320kbps'
    });
  }
}

/**
 * Update UI text in HTML layout according to the active language
 */
export function applyLanguageToUI(lang: SupportedLanguage) {
  setCurrentLanguage(lang);
  const t = getTranslations(lang);

  // 1. Navigation Desktop & Mobile
  const navLinkHome = document.getElementById('nav-link-home');
  const navLinkConverters = document.getElementById('nav-link-converters');
  const navLinkBlog = document.getElementById('nav-link-blog');
  const navLinkEditor = document.getElementById('nav-link-editor');
  const navLinkAbout = document.getElementById('nav-link-about');
  const navLinkPrivacy = document.getElementById('nav-link-privacy');
  const navLinkAdmin = document.getElementById('nav-link-admin');

  if (navLinkHome) {
    navLinkHome.textContent = t.nav.home;
    navLinkHome.setAttribute('href', buildLocalizedPath('/', lang));
  }
  if (navLinkConverters) {
    navLinkConverters.textContent = t.nav.converters;
    navLinkConverters.setAttribute('href', `${buildLocalizedPath('/', lang)}#all-converters-section`);
  }
  if (navLinkBlog) {
    navLinkBlog.textContent = t.nav.blog;
    navLinkBlog.setAttribute('href', buildLocalizedPath('/blog', lang));
  }
  if (navLinkEditor) {
    navLinkEditor.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span> ${t.nav.editor}`;
    navLinkEditor.setAttribute('href', buildLocalizedPath('/editor', lang));
  }
  if (navLinkAbout) {
    navLinkAbout.textContent = t.nav.about;
    navLinkAbout.setAttribute('href', `${buildLocalizedPath('/', lang)}#about`);
  }
  if (navLinkPrivacy) {
    navLinkPrivacy.textContent = t.nav.privacy;
  }
  if (navLinkAdmin) {
    const span = navLinkAdmin.querySelector('span');
    if (span) span.textContent = t.nav.admin;
  }

  // Mobile Links
  const mobLinkHome = document.getElementById('mob-link-home');
  const mobLinkConverters = document.getElementById('mob-link-converters');
  const mobLinkBlog = document.getElementById('mob-link-blog');
  const mobLinkEditor = document.getElementById('mob-link-editor');
  const mobLinkAbout = document.getElementById('mob-link-about');
  const mobLinkPrivacy = document.getElementById('mob-link-privacy');

  if (mobLinkHome) {
    mobLinkHome.textContent = t.nav.home;
    mobLinkHome.setAttribute('href', buildLocalizedPath('/', lang));
  }
  if (mobLinkConverters) {
    mobLinkConverters.textContent = t.nav.converters;
    mobLinkConverters.setAttribute('href', `${buildLocalizedPath('/', lang)}#all-converters-section`);
  }
  if (mobLinkBlog) {
    mobLinkBlog.textContent = t.nav.blog;
    mobLinkBlog.setAttribute('href', buildLocalizedPath('/blog', lang));
  }
  if (mobLinkEditor) {
    const spanText = mobLinkEditor.querySelector('span:first-child');
    if (spanText) spanText.textContent = t.nav.editor;
    mobLinkEditor.setAttribute('href', buildLocalizedPath('/editor', lang));
  }
  if (mobLinkAbout) {
    mobLinkAbout.textContent = t.nav.about;
    mobLinkAbout.setAttribute('href', `${buildLocalizedPath('/', lang)}#about`);
  }
  if (mobLinkPrivacy) {
    mobLinkPrivacy.textContent = t.nav.privacy;
  }

  // 2. Trust Bar
  const trustBarSection = document.getElementById('trust-bar-section');
  if (trustBarSection) {
    const items = trustBarSection.querySelectorAll('.flex.items-center.gap-2');
    if (items.length >= 4) {
      const span0 = items[0].lastChild;
      if (span0) span0.textContent = ` ${t.hero.trustOffline}`;
      const span1 = items[1].lastChild;
      if (span1) span1.textContent = ` ${t.hero.trustQueue}`;
      const span2 = items[2].lastChild;
      if (span2) span2.textContent = ` ${t.hero.trustBitrate}`;
      const span3 = items[3].lastChild;
      if (span3) span3.textContent = ` ${t.hero.trustNoUploads}`;
    }
  }

  // 3. Converter Form labels & buttons
  const outputFormatLabel = document.querySelector('label[for="output-format"]');
  if (outputFormatLabel) outputFormatLabel.textContent = t.converter.outputFormat;

  const audioBitrateLabel = document.querySelector('label[for="audio-bitrate"]');
  if (audioBitrateLabel) audioBitrateLabel.textContent = t.converter.audioQuality;

  const convertBtn = document.getElementById('convert-btn');
  if (convertBtn && convertBtn.hasAttribute('disabled')) {
    convertBtn.textContent = t.converter.extractAudio;
  }

  const audioBitrateSelect = document.getElementById('audio-bitrate') as HTMLSelectElement | null;
  if (audioBitrateSelect && audioBitrateSelect.options.length >= 3) {
    audioBitrateSelect.options[0].text = t.converter.qualityStudio;
    audioBitrateSelect.options[1].text = t.converter.qualityHigh;
    audioBitrateSelect.options[2].text = t.converter.qualityStandard;
  }

  const successTitle = document.getElementById('success-title');
  if (successTitle) successTitle.textContent = t.converter.successTitle;

  const successSubtitle = document.getElementById('success-subtitle');
  if (successSubtitle) successSubtitle.textContent = t.converter.successSubtitle.replace('{count}', '1');

  const downloadZipBtnText = document.getElementById('download-zip-btn-text');
  if (downloadZipBtnText) downloadZipBtnText.textContent = t.converter.downloadAllZip.replace('{count}', '1');

  const convertAnotherBtn = document.getElementById('convert-another-btn');
  if (convertAnotherBtn) {
    const span = convertAnotherBtn.querySelector('span');
    if (span) span.textContent = t.converter.convertAnother;
  }

  // 4. Update Language Switcher UI Active States
  document.querySelectorAll('[data-lang-switch]').forEach(btn => {
    const targetLang = btn.getAttribute('data-lang-switch');
    if (targetLang === lang) {
      btn.classList.add('bg-brand-600', 'text-white');
      btn.classList.remove('text-slate-400', 'hover:text-white');
    } else {
      btn.classList.remove('bg-brand-600', 'text-white');
      btn.classList.add('text-slate-400', 'hover:text-white');
    }
  });

  // 5. Matrix Section Headers
  const allConvertersSection = document.getElementById('all-converters-section');
  if (allConvertersSection) {
    const h3 = allConvertersSection.querySelector('h3');
    if (h3) h3.textContent = t.matrix.allConvertersTitle;
    const p = allConvertersSection.querySelector('p');
    if (p) p.textContent = t.matrix.allConvertersSubtitle;
  }

  // 6. Popular Converters quick links at top
  const heroPopularLinks = document.getElementById('hero-popular-links');
  if (heroPopularLinks) {
    const labelSpan = heroPopularLinks.querySelector('span');
    if (labelSpan) labelSpan.textContent = t.hero.popularConverters;
    heroPopularLinks.querySelectorAll('a[data-route-link]').forEach(a => {
      const href = a.getAttribute('href') || '';
      const cleanHref = href.replace(/^\/(?:es|fr)/, '');
      a.setAttribute('href', buildLocalizedPath(cleanHref, lang));
    });
  }

  // 7. Footer text
  const footerCustomText = document.getElementById('footer-custom-text');
  if (footerCustomText) {
    footerCustomText.textContent = t.footer.rightsReserved;
  }

  // 8. Update Video Editor UI in-place if active
  updateEditorLanguage(lang);
}

// Master Route Applicator with Strict SEO Perfection & Security Guards
export async function navigateTo(pathname = window.location.pathname) {
  const route = parseRoute(pathname);
  const lang = route.lang;

  // Set active language and re-apply localized strings across UI
  applyLanguageToUI(lang);

  // Update Top Navigation Bar active links
  updateNavbarActiveState(pathname);

  // Inject proper hreflang tags for Google indexation
  updateHreflangTags(route.cleanPath);

  // Re-render Matrix links for the active locale
  renderMatrixLinks(lang);

  const publicConverterView = document.getElementById('public-converter-view');
  const dynamicRouteView = document.getElementById('dynamic-route-view');

  if (route.type === 'admin') {
    if (publicConverterView) publicConverterView.classList.add('hidden');
    if (dynamicRouteView) {
      dynamicRouteView.classList.remove('hidden');
      dynamicRouteView.innerHTML = `
        <div class="py-24 text-center">
          <div class="w-10 h-10 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-slate-400 text-sm font-medium">Loading Protected Admin Portal...</p>
        </div>
      `;

      const { renderAdminApp } = await import('./admin/adminApp');
      renderAdminApp(dynamicRouteView);
    }

    document.title = 'Admin Portal | VidToAudio';
    updateRobots(false);
    updateCanonical('https://vidtoaudio.com/admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (route.type === 'editor') {
    if (publicConverterView) publicConverterView.classList.add('hidden');
    if (dynamicRouteView) {
      dynamicRouteView.classList.remove('hidden');
      const hasExistingEditor = dynamicRouteView.querySelector('#editor-root');
      if (!hasExistingEditor) {
        dynamicRouteView.innerHTML = `
          <div class="py-24 text-center">
            <div class="w-10 h-10 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-slate-400 text-sm font-medium">Initializing VidToAudio Web Video Editor...</p>
          </div>
        `;

        const { renderVideoEditor } = await import('./editor/videoEditorApp');
        renderVideoEditor(dynamicRouteView, lang);
      } else {
        updateEditorLanguage(lang);
      }
    }

    const t = getTranslations(lang);
    const editorTitle = t.editor.metaTitle || 'Free Online Video Editor (CapCut Style, Offline WASM) | VidToAudio';
    const editorDesc = t.editor.metaDesc || 'Professional multi-track web video editor. Trim, cut, add background music, stylish captions, and cinematic filters with 100% private in-browser WebAssembly processing.';
    const editorUrl = `https://vidtoaudio.com${route.canonicalPath}`;

    document.title = editorTitle;
    updateRobots(true);
    updateMetaTag('description', editorDesc);
    updateCanonical(editorUrl);
    updateMetaTag('og:title', editorTitle, true);
    updateMetaTag('og:description', editorDesc, true);
    updateMetaTag('og:url', editorUrl, true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', editorTitle);
    updateMetaTag('twitter:description', editorDesc);

    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // Public pages must be indexed by search engines
  updateRobots(true);

  if (route.type === 'blog-list' || route.type === 'blog-post') {
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
      await renderBlogView(dynamicRouteView, route.type === 'blog-post' ? route.slug : undefined, lang);
    }

    const t = getTranslations(lang);

    if (route.type === 'blog-list') {
      const blogTitle = `${t.blog.heading} | VidToAudio`;
      const blogDesc = t.blog.subtitle;
      const blogUrl = `https://vidtoaudio.com${route.canonicalPath}`;

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
      const slug = route.slug!;
      const article = await fetchBlogBySlug(slug);
      const articleTitle = article?.title 
        ? `${article.title} | VidToAudio` 
        : `${slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} | VidToAudio Blog`;
      const articleDesc = article?.excerpt || 'Discover technical audio extraction insights and lossless audio tips.';
      const articleUrl = `https://vidtoaudio.com${route.canonicalPath}`;

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
  const t = getTranslations(lang);

  if (route.isFallback) {
    // Root / Homepage Meta Tags
    const homeTitle = lang === 'en' && cachedSiteSettings.siteMetaTitle 
      ? cachedSiteSettings.siteMetaTitle 
      : t.hero.homeTitle + ' - VidToAudio';
    const homeDesc = t.hero.homeSubtitle;
    const homeUrl = `https://vidtoaudio.com${route.canonicalPath}`;

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
    // Programmatic Matrix /{input}-to-{output} Landing Page Meta Tags
    const pageTitle = interpolate(t.matrix.pageMetaTitle, { INPUT: inUpper, OUTPUT: outUpper });
    const pageDesc = interpolate(t.matrix.pageMetaDesc, { INPUT: inUpper, OUTPUT: outUpper });
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

  // 3. Layout and section visibility (AdSense strict uniqueness rules)
  const isMatrixPage = !route.isFallback;

  const heroBreadcrumbs = document.getElementById('hero-breadcrumbs');
  const breadcrumbCurrent = document.getElementById('breadcrumb-current');
  const heroSubtitle = document.getElementById('hero-subtitle');
  const heroPopularLinks = document.getElementById('hero-popular-links');
  const heroDownload = document.getElementById('download');
  const trustBarSection = document.getElementById('trust-bar-section');

  const converterTitle = document.getElementById('converter-title');
  const converterSubtitle = document.getElementById('converter-subtitle');
  const dropzoneText = document.getElementById('dropzone-text');

  const batchConversionSeo = document.getElementById('batch-conversion-seo');
  const whyWeBuiltSection = document.getElementById('why-we-built-section');
  const howItWorksSection = document.getElementById('how-it-works');
  const featuresSection = document.getElementById('features');
  const screenshotSection = document.getElementById('screenshot-showcase-section');
  const comparisonSection = document.getElementById('comparison-section');
  const faqSection = document.getElementById('faq');
  const aboutSection = document.getElementById('about');

  const matrixFaqSection = document.getElementById('matrix-faq-section');
  const matrixFaqTitle = document.getElementById('matrix-faq-title');
  const matrixFaqSubtitle = document.getElementById('matrix-faq-subtitle');
  const matrixFaqAccordion = document.getElementById('matrix-faq-accordion');
  const matrixFaqSchemaScript = document.getElementById('matrix-faq-schema') as HTMLScriptElement | null;

  const matrixRatingSection = document.getElementById('matrix-rating-section');
  const matrixRatingContainer = document.getElementById('matrix-rating-container');
  const matrixRatingSchemaScript = document.getElementById('matrix-rating-schema') as HTMLScriptElement | null;

  // Dynamic main <h1> and converter headings (Localized)
  const heroTitle = document.getElementById('hero-title');
  if (heroTitle) {
    if (isMatrixPage) {
      heroTitle.textContent = interpolate(t.matrix.heroTitle, { INPUT: inUpper, OUTPUT: outUpper });
    } else {
      heroTitle.textContent = t.hero.homeTitle;
    }
  }

  if (converterTitle) {
    if (isMatrixPage) {
      converterTitle.textContent = interpolate(t.converter.tryItHereMatrix, { INPUT: inUpper, OUTPUT: outUpper });
    } else {
      converterTitle.textContent = t.converter.tryItHereHome;
    }
  }

  if (converterSubtitle) {
    if (isMatrixPage) {
      converterSubtitle.textContent = interpolate(t.converter.subtitleMatrix, { INPUT: inUpper, OUTPUT: outUpper });
    } else {
      converterSubtitle.textContent = t.converter.subtitleHome;
    }
  }

  // 4. Dynamic Upload Box Text (Localized)
  if (dropzoneText) {
    if (isMatrixPage) {
      dropzoneText.textContent = interpolate(t.converter.dropzoneTextMatrix, { INPUT: inUpper, OUTPUT: outUpper });
    } else {
      dropzoneText.textContent = t.converter.dropzoneTextHome;
    }
  }

  // 5. Update dropdown options & selection based on active toggles
  updateFormatDropdown(route.output);

  // 6. Section Visibility & Content Strategy
  const seoContainer = document.getElementById('dynamic-seo-content');
  const faqContainer = document.getElementById('dynamic-faq');

  if (isMatrixPage) {
    // MATRIX / CONVERTER PAGES (/:slug):
    if (heroBreadcrumbs) {
      heroBreadcrumbs.classList.remove('hidden');
      heroBreadcrumbs.classList.add('flex');
    }
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = `${inUpper} to ${outUpper}`;
    if (heroSubtitle) {
      heroSubtitle.textContent = interpolate(t.matrix.heroSubtitle, { INPUT: inUpper, OUTPUT: outUpper });
    }

    if (heroPopularLinks) heroPopularLinks.classList.add('hidden');
    if (heroDownload) heroDownload.classList.add('hidden');
    if (trustBarSection) trustBarSection.classList.add('hidden');

    if (batchConversionSeo) batchConversionSeo.classList.add('hidden');
    if (whyWeBuiltSection) whyWeBuiltSection.classList.add('hidden');
    if (howItWorksSection) howItWorksSection.classList.add('hidden');
    if (featuresSection) featuresSection.classList.add('hidden');
    if (screenshotSection) screenshotSection.classList.add('hidden');
    if (comparisonSection) comparisonSection.classList.add('hidden');
    if (faqSection) faqSection.classList.add('hidden');
    if (aboutSection) aboutSection.classList.add('hidden');

    // Inject unique, technically rich format description localized in target language
    if (seoContainer) {
      seoContainer.innerHTML = generateFormatArticle(route.input || 'mp4', route.output || 'mp3', lang);
    }

    // Show and render interactive 5-star rating system with active locale
    if (matrixRatingSection) matrixRatingSection.classList.remove('hidden');
    if (matrixRatingContainer) {
      const matrixSlug = (route.input && route.output) ? `${route.input}-to-${route.output}` : (route.cleanPath ? route.cleanPath.replace(/^\//, '') : 'converter');
      renderRatingWidget(
        matrixRatingContainer,
        matrixSlug,
        route.input || 'mp4',
        route.output || 'mp3',
        matrixRatingSchemaScript,
        lang
      );
    }

    // Show and inject dynamic format-specific FAQs accordion in active locale
    if (matrixFaqSection) matrixFaqSection.classList.remove('hidden');
    if (matrixFaqTitle) {
      matrixFaqTitle.textContent = interpolate(t.matrix.faqSectionTitle, { INPUT: inUpper, OUTPUT: outUpper });
    }
    if (matrixFaqSubtitle) {
      matrixFaqSubtitle.textContent = interpolate(t.matrix.faqSectionSubtitle, { INPUT: inUpper, OUTPUT: outUpper });
    }
    if (matrixFaqAccordion) {
      matrixFaqAccordion.innerHTML = generateFormatFAQAccordionHTML(route.input || 'mp4', route.output || 'mp3', lang);
    }
    if (matrixFaqSchemaScript) {
      matrixFaqSchemaScript.textContent = JSON.stringify(generateFormatFAQSchema(route.input || 'mp4', route.output || 'mp3', lang));
    }
  } else {
    // HOMEPAGE (/ or /es or /fr):
    if (heroBreadcrumbs) {
      heroBreadcrumbs.classList.add('hidden');
      heroBreadcrumbs.classList.remove('flex');
    }
    if (heroSubtitle) {
      heroSubtitle.textContent = t.hero.homeSubtitle;
    }

    if (heroPopularLinks) heroPopularLinks.classList.remove('hidden');
    if (heroDownload) heroDownload.classList.remove('hidden');
    if (trustBarSection) trustBarSection.classList.remove('hidden');

    if (batchConversionSeo) batchConversionSeo.classList.remove('hidden');
    if (whyWeBuiltSection) whyWeBuiltSection.classList.remove('hidden');
    if (howItWorksSection) howItWorksSection.classList.remove('hidden');
    if (featuresSection) featuresSection.classList.remove('hidden');
    if (screenshotSection) screenshotSection.classList.remove('hidden');
    if (comparisonSection) comparisonSection.classList.remove('hidden');
    if (faqSection) faqSection.classList.remove('hidden');
    if (aboutSection) aboutSection.classList.remove('hidden');

    if (matrixRatingSection) matrixRatingSection.classList.add('hidden');
    if (matrixRatingContainer) matrixRatingContainer.innerHTML = '';
    if (matrixRatingSchemaScript) matrixRatingSchemaScript.textContent = '{}';

    if (matrixFaqSection) matrixFaqSection.classList.add('hidden');
    if (matrixFaqAccordion) matrixFaqAccordion.innerHTML = '';
    if (matrixFaqSchemaScript) matrixFaqSchemaScript.textContent = '{}';

    if (seoContainer) {
      seoContainer.innerHTML = '';
    }
    if (faqContainer) {
      faqContainer.innerHTML = generateDynamicFAQs(route.input || 'mp4', route.output || 'wav', lang);
    }
  }

  // 8. Update active states for route pills and matrix links
  const normalizedPath = (route.cleanPath || '/').toLowerCase().split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
  document.querySelectorAll('[data-route-link]').forEach(link => {
    const href = (link.getAttribute('href') || '').toLowerCase().replace(/\/$/, '') || '/';
    const parsed = parseRoute(href);
    const isMatch = (parsed.type === 'converter' && parsed.input === route.input && parsed.output === route.output) ||
                    (parsed.cleanPath === normalizedPath) ||
                    (normalizedPath === '/' && parsed.cleanPath === '/mp4-to-wav');

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

    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.add('hidden');
        hamburger?.classList.remove('hidden');
        closeIcon?.classList.add('hidden');
      });
    });
  }

  // Handle smooth scroll for anchors like /#all-converters-section and /#about
  document.querySelectorAll('a[href*="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('http') || href === '#') return;
      
      const hashIndex = href.indexOf('#');
      if (hashIndex === -1) return;
      const targetId = href.substring(hashIndex + 1);
      const pathPart = href.substring(0, hashIndex);

      const currentRoute = parseRoute(window.location.pathname);
      const currentClean = currentRoute.cleanPath;

      if (pathPart && pathPart !== currentClean && pathPart !== '/') {
        // Different page, let router navigate
        return;
      }

      if (currentRoute.type !== 'converter' || !currentRoute.isFallback) {
        e.preventDefault();
        const homePath = buildLocalizedPath('/', currentRoute.lang);
        window.history.pushState({}, '', homePath);
        navigateTo(homePath).then(() => {
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

// Language selector switcher initializer
function initLanguageSwitchers() {
  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement)?.closest('[data-lang-switch]') as HTMLElement | null;
    if (!target) return;

    const chosenLang = target.getAttribute('data-lang-switch') as SupportedLanguage | null;
    if (!chosenLang || !SUPPORTED_LANGUAGES[chosenLang]) return;

    e.preventDefault();
    const currentRoute = parseRoute(window.location.pathname);
    const newPath = buildLocalizedPath(currentRoute.cleanPath, chosenLang);

    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }
    navigateTo(newPath);
  });
}

// Initialize Application
async function initApp() {
  (window as any).navigateTo = navigateTo;
  (window as any).applyLanguageToUI = applyLanguageToUI;

  // 1. Initial setup
  initNavbarInteractions();
  initLanguageSwitchers();
  applyGlobalSettings(cachedSiteSettings);
  
  const initialRoute = parseRoute(window.location.pathname);
  renderMatrixLinks(initialRoute.lang);
  await navigateTo(window.location.pathname);

  // 2. Intercept all SPA route links
  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement)?.closest('[data-route-link]') as HTMLAnchorElement | null;
    if (!target) return;

    const href = target.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto')) {
      return;
    }
    if (href.startsWith('#')) return;

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
    const currentRoute = parseRoute(window.location.pathname);
    renderMatrixLinks(currentRoute.lang);
    updateFormatDropdown();
    
    // If currently on a converter page, re-inject SEO content
    if (currentRoute.type === 'converter') {
      const seoContainer = document.getElementById('dynamic-seo-content');
      if (seoContainer) {
        seoContainer.innerHTML = generateSEOContent(currentRoute.input || 'mp4', currentRoute.output || 'wav', currentRoute.lang);
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
