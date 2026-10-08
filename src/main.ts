import './index.css';
import { 
  fetchSEOTemplate, 
  fetchFormatToggles, 
  fetchSiteSettings,
  fetchBlogBySlug,
  DEFAULT_SEO_TEMPLATE, 
  DEFAULT_FORMAT_TOGGLES,
  DEFAULT_SITE_SETTINGS
} from './services/configService';
import { getLocalizedBlogPost } from './services/translationService';
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
import { onAuthUserChange, signOutUser, isEmailAdmin } from './services/authService';
import { openAuthModal } from './components/AuthModal';

// Expose i18n and router API immediately for inline scripts
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonMsg = (event?.reason?.message) || String(event?.reason || '');
    if (reasonMsg.includes('Pending promise was never set') || reasonMsg.includes('INTERNAL ASSERTION FAILED')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      console.warn('Safely intercepted Firebase Auth popup assertion in iframe:', reasonMsg);
    }
  });
  window.addEventListener('error', (event) => {
    const errorMsg = event?.message || String(event?.error?.message || '');
    if (errorMsg.includes('Pending promise was never set') || errorMsg.includes('INTERNAL ASSERTION FAILED')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      console.warn('Safely intercepted Firebase Auth error in iframe:', errorMsg);
    }
  });

  (window as any).getTranslations = getTranslations;
  (window as any).getCurrentLanguage = getCurrentLanguage;
  (window as any).SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;
  (window as any).navigateTo = navigateTo;
  (window as any).applyLanguageToUI = applyLanguageToUI;
}

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
  type: 'converter' | 'admin' | 'editor' | 'blog-list' | 'blog-post' | 'about';
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
  } else if (route.type === 'about' || cleanPath.includes('about')) {
    activeEl(navItems.about);
    activeEl(mobItems.about);
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

  if (clean === 'about') {
    return { 
      type: 'about', 
      lang, 
      rawPath: raw, 
      cleanPath: '/about', 
      canonicalPath: buildLocalizedPath('/about', lang), 
      path: '/about' 
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
    ],
    de: [
      {
        q: `Gibt es eine Dateigrößenbeschränkung für die Konvertierung von ${inUpper} in ${outUpper}?`,
        a: `Da VidToAudio lokal in Ihrem Browser mittels WebAssembly und Hardwarebeschleunigung ausgeführt wird, gibt es keine künstlichen Cloud-Beschränkungen. Sie können Audiospuren aus großen ${inUpper}-Dateien extrahieren, ohne ein einziges Byte hochzuladen.`
      },
      {
        q: `Warum ${outUpper} aus ${inUpper} offline im Browser extrahieren?`,
        a: `Die lokale Extraktion im Browser garantiert absolute Privatsphäre, sofortige Verarbeitungsgeschwindigkeit ohne Bandbreitendrosselung und null mobilen Datenverbrauch. Ihre ${inUpper}-Videodatei verlässt zu keinem Zeitpunkt Ihr Gerät.`
      },
      {
        q: `Welche Audioqualität kann ich bei der Konvertierung von ${inUpper} in ${outUpper} erwarten?`,
        a: `Unsere Konvertierungs-Engine bewahrt die ursprüngliche Abtastrate und Audiotreue der ${inUpper}-Quelldatei. Der Export nach ${outUpper} liefert kristallklaren Klang mit voller Kontrolle über Bitraten und verlustfreie Codierung.`
      }
    ],
    it: [
      {
        q: `C'è un limite di dimensione file per la conversione da ${inUpper} a ${outUpper}?`,
        a: `Poiché VidToAudio viene eseguito localmente nel browser tramite WebAssembly, non vi è alcun limite di dimensione cloud. Puoi estrarre tracce audio da file ${inUpper} pesanti senza caricare alcun byte sui server.`
      },
      {
        q: `Perché estrarre ${outUpper} da ${inUpper} offline nel browser?`,
        a: `La conversione locale nel browser garantisce totale privacy, velocità istantanea senza rallentamenti di banda e zero consumo di dati mobili. Il tuo video ${inUpper} non lascia mai il tuo dispositivo.`
      },
      {
        q: `Quale qualità audio posso aspettarmi convertendo ${inUpper} in ${outUpper}?`,
        a: `Il nostro motore conserva la frequenza di campionamento e la fedeltà originale del file ${inUpper}. L'esportazione in ${outUpper} offre una riproduzione acustica impeccabile.`
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
  const currentLangConfig = SUPPORTED_LANGUAGES[lang];

  // 0. Update HTML Document Language & Reading Direction
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
    document.documentElement.dir = (currentLangConfig && currentLangConfig.dir) ? currentLangConfig.dir : 'ltr';
  }

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
  const mobLinkContact = document.getElementById('mob-link-contact');
  const mobLangLabel = document.getElementById('mob-lang-label');
  const mobLinkAdmin = document.getElementById('mob-link-admin');
  const mobLinkGetApp = document.getElementById('mob-link-getapp');

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
  if (mobLinkContact) {
    mobLinkContact.textContent = t.footer?.contact || 'Contact Us';
  }
  if (mobLangLabel) {
    mobLangLabel.textContent = t.nav?.languageLabel || 'Language:';
  }
  if (mobLinkAdmin) {
    mobLinkAdmin.textContent = t.nav.admin;
  }
  if (mobLinkGetApp) {
    mobLinkGetApp.textContent = t.nav.getApp;
  }

  // 2. Trust Bar
  const trustOffline = document.getElementById('trust-offline-text');
  if (trustOffline) trustOffline.textContent = t.hero.trustOffline;
  const trustQueue = document.getElementById('trust-queue-text');
  if (trustQueue) trustQueue.textContent = t.hero.trustQueue;
  const trustBitrate = document.getElementById('trust-bitrate-text');
  if (trustBitrate) trustBitrate.textContent = t.hero.trustBitrate;
  const trustNoUploads = document.getElementById('trust-nouploads-text');
  if (trustNoUploads) trustNoUploads.textContent = t.hero.trustNoUploads;

  const trustBarSection = document.getElementById('trust-bar-section');
  if (trustBarSection && (!trustOffline || !trustQueue || !trustBitrate || !trustNoUploads)) {
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

  // 3. Hero Titles, CTA & Breadcrumbs
  const currentRoute = parseRoute(window.location.pathname);
  const isMatrixPage = currentRoute.type === 'converter' && !currentRoute.isFallback;
  const inUpper = currentRoute.displayInput || (currentRoute.input ? currentRoute.input.toUpperCase() : 'MP4');
  const outUpper = currentRoute.output ? currentRoute.output.toUpperCase() : 'MP3';

  const heroTitle = document.getElementById('hero-title');
  if (heroTitle) {
    heroTitle.textContent = isMatrixPage
      ? interpolate(t.matrix.heroTitle, { INPUT: inUpper, OUTPUT: outUpper })
      : t.hero.homeTitle;
  }
  const heroSubtitle = document.getElementById('hero-subtitle');
  if (heroSubtitle) {
    heroSubtitle.textContent = isMatrixPage
      ? interpolate(t.matrix.heroSubtitle, { INPUT: inUpper, OUTPUT: outUpper })
      : t.hero.homeSubtitle;
  }

  const heroBtnAmazonText = document.getElementById('hero-btn-amazon-text');
  if (heroBtnAmazonText) {
    heroBtnAmazonText.textContent = t.hero.amazonAppstore || 'Amazon Appstore';
  }
  const heroBtnApkText = document.getElementById('hero-btn-apk-text');
  if (heroBtnApkText) {
    heroBtnApkText.textContent = t.hero.directApkDownload || 'Direct APK Download';
  }
  const breadcrumbHome = document.getElementById('breadcrumb-home');
  if (breadcrumbHome) {
    breadcrumbHome.textContent = t.matrix.breadcrumbHome || 'Home';
  }
  const breadcrumbConverters = document.getElementById('breadcrumb-converters');
  if (breadcrumbConverters) {
    breadcrumbConverters.textContent = t.matrix.breadcrumbConverters || 'Converters';
  }
  const heroPopularLabel = document.getElementById('hero-popular-label');
  if (heroPopularLabel) {
    heroPopularLabel.textContent = t.hero.popularConverters;
  }

  // 4. Converter Form labels & buttons
  const converterTitle = document.getElementById('converter-title');
  if (converterTitle) {
    converterTitle.textContent = isMatrixPage
      ? interpolate(t.converter.tryItHereMatrix, { INPUT: inUpper, OUTPUT: outUpper })
      : t.converter.tryItHereHome;
  }

  const converterSubtitle = document.getElementById('converter-subtitle');
  if (converterSubtitle) {
    converterSubtitle.textContent = isMatrixPage
      ? interpolate(t.converter.subtitleMatrix, { INPUT: inUpper, OUTPUT: outUpper })
      : t.converter.subtitleHome;
  }

  const dropzoneText = document.getElementById('dropzone-text');
  if (dropzoneText) {
    dropzoneText.textContent = isMatrixPage
      ? interpolate(t.converter.dropzoneTextMatrix, { INPUT: inUpper, OUTPUT: outUpper })
      : t.converter.dropzoneTextHome;
  }

  const fileNameDisplay = document.getElementById('file-name-display');
  if (fileNameDisplay && !fileNameDisplay.classList.contains('text-brand-400')) {
    fileNameDisplay.textContent = t.converter.noFilesChosen;
  }

  const outputFormatLabel = document.querySelector('label[for="output-format"]');
  if (outputFormatLabel) outputFormatLabel.textContent = t.converter.outputFormat;

  const audioBitrateLabel = document.querySelector('label[for="audio-bitrate"]');
  if (audioBitrateLabel) audioBitrateLabel.textContent = t.converter.audioQuality;

  const dropzoneSupportedFormats = document.getElementById('dropzone-supported-formats');
  if (dropzoneSupportedFormats) {
    dropzoneSupportedFormats.textContent = t.converter.supportsFormats;
  }

  const processingSubtext = document.getElementById('processing-subtext');
  if (processingSubtext) {
    processingSubtext.textContent = t.converter.sequentialOffline || 'Sequential offline processing • Zero server uploads';
  }

  const convertBtn = document.getElementById('convert-btn');
  if (convertBtn && convertBtn.hasAttribute('disabled')) {
    convertBtn.textContent = t.converter.extractAudio;
  }

  const formatSummary = document.getElementById('format-summary');
  const formatSelect = document.getElementById('output-format') as HTMLSelectElement | null;
  const bitrateSelect = document.getElementById('audio-bitrate') as HTMLSelectElement | null;
  if (formatSummary && formatSelect) {
    const selectedOptionText = formatSelect.options[formatSelect.selectedIndex]?.text.split(' ')[0] || formatSelect.value.toUpperCase();
    const bitrateText = bitrateSelect?.value || '320k';
    if (t.converter?.outputSummary) {
      formatSummary.textContent = interpolate(t.converter.outputSummary, {
        format: selectedOptionText,
        bitrate: bitrateText
      });
    }
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

  const batchResultsHeaderText = document.getElementById('batch-results-header-text');
  if (batchResultsHeaderText) {
    batchResultsHeaderText.textContent = t.converter.convertedTracks || 'Converted Tracks';
  }
  const batchResultsHeaderActions = document.getElementById('batch-results-header-actions');
  if (batchResultsHeaderActions) {
    batchResultsHeaderActions.textContent = t.converter.actions || 'Actions';
  }

  // Audio Preview & Trimming Controls
  const playerPreviewTitle = document.getElementById('player-preview-title');
  if (playerPreviewTitle) playerPreviewTitle.textContent = t.converter.audioPreview || 'Audio Preview';

  const playerTrimBtnText = document.getElementById('player-trim-btn-text');
  if (playerTrimBtnText) playerTrimBtnText.textContent = t.converter.trimAudio || 'Trim Audio';

  const trimControlsHint = document.getElementById('trim-controls-hint');
  if (trimControlsHint) trimControlsHint.textContent = t.converter.waveformHint || 'Drag the colored edges on the waveform to select region';

  const applyTrimBtnText = document.getElementById('apply-trim-btn-text');
  if (applyTrimBtnText) applyTrimBtnText.textContent = t.converter.cropSelection || 'Crop Selection';

  // Audio player metadata default labels
  const metaDuration = document.getElementById('meta-duration');
  if (metaDuration && metaDuration.textContent?.includes('--')) {
    metaDuration.textContent = `${t.converter?.durationLabel || 'Duration:'} --`;
  }
  const metaSamplerate = document.getElementById('meta-samplerate');
  if (metaSamplerate && metaSamplerate.textContent?.includes('--')) {
    metaSamplerate.textContent = `${t.converter?.sampleRateLabel || 'Sample Rate:'} --`;
  }
  const metaSize = document.getElementById('meta-size');
  if (metaSize && metaSize.textContent?.includes('--')) {
    metaSize.textContent = `${t.converter?.sizeLabel || 'Size:'} --`;
  }

  // 5. Update Language Switcher UI Active States (Desktop button & mobile select)
  const currentLangFlag = document.getElementById('current-lang-flag');
  const currentLangCode = document.getElementById('current-lang-code');
  if (currentLangFlag && currentLangConfig) {
    currentLangFlag.textContent = currentLangConfig.flag;
  }
  if (currentLangCode && currentLangConfig) {
    currentLangCode.textContent = currentLangConfig.code.toUpperCase();
  }

  const mobileLangSelect = document.getElementById('mobile-lang-select') as HTMLSelectElement | null;
  if (mobileLangSelect && mobileLangSelect.value !== lang) {
    mobileLangSelect.value = lang;
  }

  document.querySelectorAll('[data-lang-switch]').forEach(btn => {
    const targetLang = btn.getAttribute('data-lang-switch');
    if (targetLang === lang) {
      btn.classList.add('bg-brand-600/20', 'text-brand-400', 'font-semibold');
      btn.classList.remove('text-slate-300');
    } else {
      btn.classList.remove('bg-brand-600/20', 'text-brand-400', 'font-semibold');
      btn.classList.add('text-slate-300');
    }
  });

  // 6. Popular Converters quick links at top
  const heroPopularLinks = document.getElementById('hero-popular-links');
  if (heroPopularLinks) {
    heroPopularLinks.querySelectorAll('a[data-route-link]').forEach(a => {
      const href = a.getAttribute('href') || '';
      const cleanHref = href.replace(/^\/(?:[a-z]{2})(?=\/|$)/, '');
      a.setAttribute('href', buildLocalizedPath(cleanHref, lang));
    });
  }

  // 7. Batch Conversion SEO Article
  const batchSeoBadgeText = document.getElementById('batch-seo-badge-text');
  if (batchSeoBadgeText && t.batchSeo?.badge) batchSeoBadgeText.textContent = t.batchSeo.badge;

  const batchSeoSubbadge = document.getElementById('batch-seo-subbadge');
  if (batchSeoSubbadge && t.batchSeo?.subBadge) batchSeoSubbadge.textContent = t.batchSeo.subBadge;

  const batchSeoTitle = document.getElementById('batch-seo-title');
  if (batchSeoTitle && t.batchSeo?.title) batchSeoTitle.textContent = t.batchSeo.title;

  const batchSeoDesc = document.getElementById('batch-seo-desc');
  if (batchSeoDesc && t.batchSeo?.desc) batchSeoDesc.textContent = t.batchSeo.desc;

  const batchSeoB1 = document.getElementById('batch-seo-b1');
  if (batchSeoB1 && t.batchSeo?.b1) {
    const parts = t.batchSeo.b1.split(':');
    batchSeoB1.innerHTML = `<strong>${parts[0]}:</strong>${parts.slice(1).join(':')}`;
  }
  const batchSeoB2 = document.getElementById('batch-seo-b2');
  if (batchSeoB2 && t.batchSeo?.b2) {
    const parts = t.batchSeo.b2.split(':');
    batchSeoB2.innerHTML = `<strong>${parts[0]}:</strong>${parts.slice(1).join(':')}`;
  }
  const batchSeoB3 = document.getElementById('batch-seo-b3');
  if (batchSeoB3 && t.batchSeo?.b3) {
    const parts = t.batchSeo.b3.split(':');
    batchSeoB3.innerHTML = `<strong>${parts[0]}:</strong>${parts.slice(1).join(':')}`;
  }

  // 8. Why We Built Section
  const whyBuiltTitle = document.getElementById('why-built-title');
  if (whyBuiltTitle && t.whyWeBuilt?.title) whyBuiltTitle.textContent = t.whyWeBuilt.title;

  const whyBuiltP1 = document.getElementById('why-built-p1');
  if (whyBuiltP1 && t.whyWeBuilt?.p1) whyBuiltP1.textContent = t.whyWeBuilt.p1;

  const whyBuiltP2 = document.getElementById('why-built-p2');
  if (whyBuiltP2 && t.whyWeBuilt?.p2) whyBuiltP2.textContent = t.whyWeBuilt.p2;

  const whyBuiltUpdated = document.getElementById('why-built-updated');
  if (whyBuiltUpdated && t.whyWeBuilt?.lastUpdated) whyBuiltUpdated.textContent = t.whyWeBuilt.lastUpdated;

  // 9. How It Works Section
  const howTitle = document.getElementById('how-title');
  if (howTitle && t.howItWorks?.title) howTitle.textContent = t.howItWorks.title;

  const howS1Badge = document.getElementById('how-s1-badge');
  if (howS1Badge && t.howItWorks?.step1Badge) howS1Badge.textContent = t.howItWorks.step1Badge;
  const howS1Title = document.getElementById('how-s1-title');
  if (howS1Title && t.howItWorks?.step1Title) howS1Title.textContent = t.howItWorks.step1Title;
  const howS1Desc = document.getElementById('how-s1-desc');
  if (howS1Desc && t.howItWorks?.step1Desc) howS1Desc.textContent = t.howItWorks.step1Desc;

  const howS2Badge = document.getElementById('how-s2-badge');
  if (howS2Badge && t.howItWorks?.step2Badge) howS2Badge.textContent = t.howItWorks.step2Badge;
  const howS2Title = document.getElementById('how-s2-title');
  if (howS2Title && t.howItWorks?.step2Title) howS2Title.textContent = t.howItWorks.step2Title;
  const howS2Desc = document.getElementById('how-s2-desc');
  if (howS2Desc && t.howItWorks?.step2Desc) howS2Desc.textContent = t.howItWorks.step2Desc;

  const howS3Badge = document.getElementById('how-s3-badge');
  if (howS3Badge && t.howItWorks?.step3Badge) howS3Badge.textContent = t.howItWorks.step3Badge;
  const howS3Title = document.getElementById('how-s3-title');
  if (howS3Title && t.howItWorks?.step3Title) howS3Title.textContent = t.howItWorks.step3Title;
  const howS3Desc = document.getElementById('how-s3-desc');
  if (howS3Desc && t.howItWorks?.step3Desc) howS3Desc.textContent = t.howItWorks.step3Desc;

  const howS4Badge = document.getElementById('how-s4-badge');
  if (howS4Badge && t.howItWorks?.step4Badge) howS4Badge.textContent = t.howItWorks.step4Badge;
  const howS4Title = document.getElementById('how-s4-title');
  if (howS4Title && t.howItWorks?.step4Title) howS4Title.textContent = t.howItWorks.step4Title;
  const howS4Desc = document.getElementById('how-s4-desc');
  if (howS4Desc && t.howItWorks?.step4Desc) howS4Desc.textContent = t.howItWorks.step4Desc;

  // 10. Features Section
  const featuresTitle = document.getElementById('features-title');
  if (featuresTitle && t.features?.title) featuresTitle.textContent = t.features.title;

  const feat1Title = document.getElementById('feat-1-title');
  if (feat1Title && t.features?.f1Title) feat1Title.textContent = t.features.f1Title;
  const feat1Desc = document.getElementById('feat-1-desc');
  if (feat1Desc && t.features?.f1Desc) feat1Desc.textContent = t.features.f1Desc;

  const feat2Title = document.getElementById('feat-2-title');
  if (feat2Title && t.features?.f2Title) feat2Title.textContent = t.features.f2Title;
  const feat2Desc = document.getElementById('feat-2-desc');
  if (feat2Desc && t.features?.f2Desc) feat2Desc.textContent = t.features.f2Desc;

  const feat3Title = document.getElementById('feat-3-title');
  if (feat3Title && t.features?.f3Title) feat3Title.textContent = t.features.f3Title;
  const feat3Desc = document.getElementById('feat-3-desc');
  if (feat3Desc && t.features?.f3Desc) feat3Desc.textContent = t.features.f3Desc;

  const feat4Title = document.getElementById('feat-4-title');
  if (feat4Title && t.features?.f4Title) feat4Title.textContent = t.features.f4Title;
  const feat4Desc = document.getElementById('feat-4-desc');
  if (feat4Desc && t.features?.f4Desc) feat4Desc.textContent = t.features.f4Desc;

  const feat5Title = document.getElementById('feat-5-title');
  if (feat5Title && t.features?.f5Title) feat5Title.textContent = t.features.f5Title;
  const feat5Desc = document.getElementById('feat-5-desc');
  if (feat5Desc && t.features?.f5Desc) feat5Desc.textContent = t.features.f5Desc;

  const feat6Title = document.getElementById('feat-6-title');
  if (feat6Title && t.features?.f6Title) feat6Title.textContent = t.features.f6Title;
  const feat6Desc = document.getElementById('feat-6-desc');
  if (feat6Desc && t.features?.f6Desc) feat6Desc.textContent = t.features.f6Desc;

  // 11. Screenshots Showcase
  const screenshotTitle = document.getElementById('screenshot-title');
  if (screenshotTitle && t.screenshot?.title) screenshotTitle.textContent = t.screenshot.title;

  const screenshotSubtitle = document.getElementById('screenshot-subtitle');
  if (screenshotSubtitle && t.screenshot?.subtitle) screenshotSubtitle.textContent = t.screenshot.subtitle;

  const screenshotS1 = document.getElementById('screenshot-s1');
  if (screenshotS1 && t.screenshot?.s1) screenshotS1.textContent = t.screenshot.s1;

  const screenshotS2 = document.getElementById('screenshot-s2');
  if (screenshotS2 && t.screenshot?.s2) screenshotS2.textContent = t.screenshot.s2;

  const screenshotS3 = document.getElementById('screenshot-s3');
  if (screenshotS3 && t.screenshot?.s3) screenshotS3.textContent = t.screenshot.s3;

  const screenshotS4 = document.getElementById('screenshot-s4');
  if (screenshotS4 && t.screenshot?.s4) screenshotS4.textContent = t.screenshot.s4;

  // 12. Comparison Section
  const comparisonTitle = document.getElementById('comparison-title');
  if (comparisonTitle && t.comparison?.title) comparisonTitle.textContent = t.comparison.title;

  const comparisonP1 = document.getElementById('comparison-p1');
  if (comparisonP1 && t.comparison?.p1) comparisonP1.textContent = t.comparison.p1;

  const comparisonP2 = document.getElementById('comparison-p2');
  if (comparisonP2 && t.comparison?.p2) comparisonP2.textContent = t.comparison.p2;

  const comparisonM1Label = document.getElementById('comparison-m1-label');
  if (comparisonM1Label && t.comparison?.dataUploaded) comparisonM1Label.textContent = t.comparison.dataUploaded;

  const comparisonM2Label = document.getElementById('comparison-m2-label');
  if (comparisonM2Label && t.comparison?.serverWaitTime) comparisonM2Label.textContent = t.comparison.serverWaitTime;

  const comparisonM3Label = document.getElementById('comparison-m3-label');
  if (comparisonM3Label && t.comparison?.privacyStatus) comparisonM3Label.textContent = t.comparison.privacyStatus;

  const comparisonM3Value = document.getElementById('comparison-m3-value');
  if (comparisonM3Value && t.comparison?.secureLocal) comparisonM3Value.textContent = t.comparison.secureLocal;

  // 13. FAQ Section
  const faqMainTitle = document.getElementById('faq-main-title');
  if (faqMainTitle && t.homeFaq?.title) faqMainTitle.textContent = t.homeFaq.title;

  const faqMainSubtitle = document.getElementById('faq-main-subtitle');
  if (faqMainSubtitle && t.homeFaq?.subtitle) faqMainSubtitle.textContent = t.homeFaq.subtitle;

  const faqQ1Title = document.getElementById('faq-q1-title');
  if (faqQ1Title && t.homeFaq?.q1) faqQ1Title.textContent = t.homeFaq.q1;
  const faqQ1Ans = document.getElementById('faq-q1-ans');
  if (faqQ1Ans && t.homeFaq?.a1) faqQ1Ans.textContent = t.homeFaq.a1;

  const faqQ2Title = document.getElementById('faq-q2-title');
  if (faqQ2Title && t.homeFaq?.q2) faqQ2Title.textContent = t.homeFaq.q2;
  const faqQ2Ans = document.getElementById('faq-q2-ans');
  if (faqQ2Ans && t.homeFaq?.a2) faqQ2Ans.textContent = t.homeFaq.a2;

  const faqQ3Title = document.getElementById('faq-q3-title');
  if (faqQ3Title && t.homeFaq?.q3) faqQ3Title.textContent = t.homeFaq.q3;
  const faqQ3Ans = document.getElementById('faq-q3-ans');
  if (faqQ3Ans && t.homeFaq?.a3) faqQ3Ans.textContent = t.homeFaq.a3;

  const faqQ4Title = document.getElementById('faq-q4-title');
  if (faqQ4Title && t.homeFaq?.q4) faqQ4Title.textContent = t.homeFaq.q4;
  const faqQ4Ans = document.getElementById('faq-q4-ans');
  if (faqQ4Ans && t.homeFaq?.a4) faqQ4Ans.textContent = t.homeFaq.a4;

  const faqQ5Title = document.getElementById('faq-q5-title');
  if (faqQ5Title && t.homeFaq?.q5) faqQ5Title.textContent = t.homeFaq.q5;
  const faqQ5Ans = document.getElementById('faq-q5-ans');
  if (faqQ5Ans && t.homeFaq?.a5) faqQ5Ans.textContent = t.homeFaq.a5;

  const faqQ6Title = document.getElementById('faq-q6-title');
  if (faqQ6Title && t.homeFaq?.q6) faqQ6Title.textContent = t.homeFaq.q6;
  const faqQ6Ans = document.getElementById('faq-q6-ans');
  if (faqQ6Ans && t.homeFaq?.a6) faqQ6Ans.textContent = t.homeFaq.a6;

  // 14. About Section Localization (4 Pillars & Contact Disclosures)
  const aboutBadge = document.getElementById('about-badge');
  if (aboutBadge) aboutBadge.textContent = t.about.missionBadge;

  const aboutTitle = document.getElementById('about-title');
  if (aboutTitle) aboutTitle.textContent = t.about.title;

  const aboutSubtitle = document.getElementById('about-subtitle');
  if (aboutSubtitle) aboutSubtitle.textContent = t.about.subtitle;

  const aboutP1Title = document.getElementById('about-p1-title');
  if (aboutP1Title) aboutP1Title.textContent = t.about.p1Title;
  const aboutP1Desc = document.getElementById('about-p1-desc');
  if (aboutP1Desc) aboutP1Desc.textContent = t.about.p1Desc;

  const aboutP2Title = document.getElementById('about-p2-title');
  if (aboutP2Title) aboutP2Title.textContent = t.about.p2Title;
  const aboutP2Desc = document.getElementById('about-p2-desc');
  if (aboutP2Desc) aboutP2Desc.textContent = t.about.p2Desc;

  const aboutP3Title = document.getElementById('about-p3-title');
  if (aboutP3Title) aboutP3Title.textContent = t.about.p3Title;
  const aboutP3Desc = document.getElementById('about-p3-desc');
  if (aboutP3Desc) aboutP3Desc.textContent = t.about.p3Desc;

  const aboutP4Title = document.getElementById('about-p4-title');
  if (aboutP4Title) aboutP4Title.textContent = t.about.p4Title;
  const aboutP4Desc = document.getElementById('about-p4-desc');
  if (aboutP4Desc) aboutP4Desc.textContent = t.about.p4Desc;

  const aboutContactHeading = document.getElementById('about-contact-heading');
  if (aboutContactHeading) aboutContactHeading.textContent = t.about.contactHeading;

  const aboutContactEmailText = document.getElementById('about-contact-email-text');
  if (aboutContactEmailText) aboutContactEmailText.textContent = t.about.contactEmailText;

  const aboutPrivacyLink = document.getElementById('about-privacy-link');
  if (aboutPrivacyLink) aboutPrivacyLink.textContent = t.about.privacyPolicy;

  const aboutTermsLink = document.getElementById('about-terms-link');
  if (aboutTermsLink) aboutTermsLink.textContent = t.about.termsOfService;

  const aboutDisclaimerLink = document.getElementById('about-disclaimer-link');
  if (aboutDisclaimerLink) aboutDisclaimerLink.textContent = t.footer?.disclaimer || 'Disclaimer';

  const aboutContactLink = document.getElementById('about-contact-link');
  if (aboutContactLink) aboutContactLink.textContent = t.footer?.contact || 'Contact Us';

  // 15. Footer Section Localization
  const footerReadyHeading = document.getElementById('footer-ready-heading');
  if (footerReadyHeading) footerReadyHeading.textContent = t.footer?.readyTitle || 'Ready to Extract Audio Securely?';

  const footerDownloadBtn = document.getElementById('footer-download-btn');
  if (footerDownloadBtn) footerDownloadBtn.textContent = t.footer?.downloadBtn || 'Download VidToAudio';

  const footerPopularLabel = document.getElementById('footer-popular-label');
  if (footerPopularLabel) footerPopularLabel.textContent = t.footer?.popularLabel || 'Popular Converters:';

  const footerAllConvertersTitle = document.getElementById('footer-all-converters-title');
  if (footerAllConvertersTitle) footerAllConvertersTitle.textContent = t.matrix.allConvertersTitle;

  const footerAllConvertersSubtitle = document.getElementById('footer-all-converters-subtitle');
  if (footerAllConvertersSubtitle) footerAllConvertersSubtitle.textContent = t.matrix.allConvertersSubtitle;

  const footerMatrixBadge = document.getElementById('footer-matrix-badge');
  if (footerMatrixBadge) footerMatrixBadge.textContent = t.footer?.matrixBadge || '81 Matrix Combinations';

  const footerCustomText = document.getElementById('footer-custom-text');
  if (footerCustomText) footerCustomText.textContent = t.footer.rightsReserved;

  const footerBlogLink = document.getElementById('footer-blog-link');
  if (footerBlogLink) footerBlogLink.textContent = t.nav.blog;

  const footerPrivacyLink = document.getElementById('footer-privacy-link');
  if (footerPrivacyLink) footerPrivacyLink.textContent = t.footer.privacyPolicy;

  const footerTermsLink = document.getElementById('footer-terms-link');
  if (footerTermsLink) footerTermsLink.textContent = t.footer.termsOfService;

  const footerDisclaimerLink = document.getElementById('footer-disclaimer-link');
  if (footerDisclaimerLink) footerDisclaimerLink.textContent = t.footer?.disclaimer || 'Disclaimer';

  const footerContactLink = document.getElementById('footer-contact-link');
  if (footerContactLink) footerContactLink.textContent = t.footer?.contact || 'Contact Us';

  const footerPopularLinks = document.getElementById('footer-popular-links');
  if (footerPopularLinks) {
    footerPopularLinks.querySelectorAll('a[data-route-link]').forEach(a => {
      const href = a.getAttribute('href') || '';
      const cleanHref = href.replace(/^\/(?:[a-z]{2})(?=\/|$)/, '');
      a.setAttribute('href', buildLocalizedPath(cleanHref, lang));
    });
  }

  // 16. Refresh Matrix links in footer with active locale prefix
  renderMatrixLinks(lang);

  // 17. Re-render dynamic SEO and format FAQs in target language
  const seoContainer = document.getElementById('dynamic-seo-content');
  const faqContainer = document.getElementById('dynamic-faq');
  if (isMatrixPage) {
    if (seoContainer) {
      seoContainer.innerHTML = generateFormatArticle(currentRoute.input || 'mp4', currentRoute.output || 'mp3', lang);
    }
    const matrixFaqTitle = document.getElementById('matrix-faq-title');
    if (matrixFaqTitle) {
      matrixFaqTitle.textContent = interpolate(t.matrix.faqSectionTitle, { INPUT: inUpper, OUTPUT: outUpper });
    }
    const matrixFaqSubtitle = document.getElementById('matrix-faq-subtitle');
    if (matrixFaqSubtitle) {
      matrixFaqSubtitle.textContent = interpolate(t.matrix.faqSectionSubtitle, { INPUT: inUpper, OUTPUT: outUpper });
    }
    const matrixFaqAccordion = document.getElementById('matrix-faq-accordion');
    if (matrixFaqAccordion) {
      matrixFaqAccordion.innerHTML = generateFormatFAQAccordionHTML(currentRoute.input || 'mp4', currentRoute.output || 'mp3', lang);
    }
    const matrixFaqSchemaScript = document.getElementById('matrix-faq-schema') as HTMLScriptElement | null;
    if (matrixFaqSchemaScript) {
      matrixFaqSchemaScript.textContent = JSON.stringify(generateFormatFAQSchema(currentRoute.input || 'mp4', currentRoute.output || 'mp3', lang));
    }

    // Re-render interactive 5-star rating system with active locale
    const matrixRatingContainer = document.getElementById('matrix-rating-container');
    const matrixRatingSchemaScript = document.getElementById('matrix-rating-schema') as HTMLScriptElement | null;
    if (matrixRatingContainer) {
      const matrixSlug = (currentRoute.input && currentRoute.output)
        ? `${currentRoute.input}-to-${currentRoute.output}`
        : (currentRoute.cleanPath ? currentRoute.cleanPath.replace(/^\//, '') : 'converter');
      renderRatingWidget(
        matrixRatingContainer,
        matrixSlug,
        currentRoute.input || 'mp4',
        currentRoute.output || 'mp3',
        matrixRatingSchemaScript,
        lang
      );
    }
  } else {
    if (faqContainer) {
      faqContainer.innerHTML = generateDynamicFAQs(currentRoute.input || 'mp4', currentRoute.output || 'wav', lang);
    }
  }

  // 18. Update Video Editor UI in-place if active
  updateEditorLanguage(lang);

  // 19. Dispatch custom event so inline audio converter script refreshes labels
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
  }
}

// Master Route Applicator with Strict SEO Perfection & Security Guards
export async function navigateTo(pathname = window.location.pathname) {
  const route = parseRoute(pathname);
  const lang = route.lang;
  const t = getTranslations(lang);

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
      const rawArticle = await fetchBlogBySlug(slug);
      const article = rawArticle ? getLocalizedBlogPost(rawArticle, lang) : null;
      const articleTitle = article?.title 
        ? `${article.title} | VidToAudio` 
        : `${slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} | VidToAudio Blog`;
      const fallbackDesc = lang === 'es'
        ? 'Descubre consejos técnicos de extracción de audio y optimización sin pérdida.'
        : (lang === 'fr'
          ? 'Découvrez nos conseils techniques d\'extraction audio et d\'optimisation sans perte.'
          : 'Discover technical audio extraction insights and lossless audio tips.');
      const articleDesc = article?.excerpt || fallbackDesc;
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
  // ABOUT ROUTE: Direct URL access (/about, /es/about, /fr/about)
  // -----------------------------------------------------------------
  if (route.type === 'about') {
    if (dynamicRouteView) dynamicRouteView.classList.add('hidden');
    if (publicConverterView) publicConverterView.classList.remove('hidden');

    const aboutSection = document.getElementById('about');
    if (aboutSection) aboutSection.classList.remove('hidden');

    const aboutPageTitle = lang === 'es'
      ? `${t.about.title} | Convertidor de Audio Gratuito y Editor Web`
      : (lang === 'fr'
        ? `${t.about.title} | Convertisseur Audio Gratuit et Éditeur Web`
        : `${t.about.title} | 100% Free Client-Side Audio Converter & Editor`);
    const aboutDesc = t.about.subtitle;
    const aboutUrl = `https://vidtoaudio.com${route.canonicalPath}`;

    document.title = aboutPageTitle;
    updateRobots(true);
    updateCanonical(aboutUrl);
    updateMetaTag('description', aboutDesc);
    updateMetaTag('og:title', aboutPageTitle, true);
    updateMetaTag('og:description', aboutDesc, true);
    updateMetaTag('og:url', aboutUrl, true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', aboutPageTitle);
    updateMetaTag('twitter:description', aboutDesc);

    setTimeout(() => {
      const el = document.getElementById('about');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 120);
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
    // Root / Homepage Meta Tags
    const homeTitle = lang === 'en' && cachedSiteSettings.siteMetaTitle 
      ? cachedSiteSettings.siteMetaTitle 
      : (lang === 'en' ? t.hero.homeTitle : t.hero.homeTitle + ' - VidToAudio');
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

    // Render interactive 5-star rating system on Homepage for default MP4 to MP3 converter
    if (matrixRatingSection) matrixRatingSection.classList.remove('hidden');
    if (matrixRatingContainer) {
      renderRatingWidget(
        matrixRatingContainer,
        'mp4-to-mp3',
        'mp4',
        'mp3',
        matrixRatingSchemaScript,
        lang
      );
    }

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

// Expose navigateTo and translation helpers globally
if (typeof window !== 'undefined') {
  (window as any).navigateTo = navigateTo;
  (window as any).getTranslations = getTranslations;
  (window as any).getCurrentLanguage = getCurrentLanguage;
  (window as any).applyLanguageToUI = applyLanguageToUI;
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
  const dropdownWrapper = document.getElementById('lang-dropdown-wrapper');
  const dropdownBtn = document.getElementById('lang-dropdown-btn');
  const dropdownMenu = document.getElementById('lang-dropdown-menu');
  const dropdownItems = document.getElementById('lang-dropdown-items');
  const arrowIcon = document.getElementById('lang-dropdown-arrow');
  const mobileSelect = document.getElementById('mobile-lang-select') as HTMLSelectElement | null;

  // 1. Populate desktop dropdown items
  if (dropdownItems) {
    dropdownItems.innerHTML = '';
    (Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[]).forEach(langKey => {
      const config = SUPPORTED_LANGUAGES[langKey];
      const itemBtn = document.createElement('button');
      itemBtn.type = 'button';
      itemBtn.setAttribute('data-lang-switch', langKey);
      itemBtn.className = 'w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-dark-800 transition-colors group';
      itemBtn.innerHTML = `
        <span class="flex items-center gap-2">
          <span class="text-base">${config.flag}</span>
          <span class="text-slate-200 group-hover:text-white font-medium">${config.nativeName}</span>
          <span class="text-slate-500 text-[11px]">(${config.name})</span>
        </span>
        <span class="font-mono text-[10px] uppercase text-slate-500 group-hover:text-brand-400 font-semibold">${config.code}</span>
      `;
      dropdownItems.appendChild(itemBtn);
    });
  }

  // 2. Populate mobile select options
  if (mobileSelect) {
    mobileSelect.innerHTML = '';
    (Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[]).forEach(langKey => {
      const config = SUPPORTED_LANGUAGES[langKey];
      const opt = document.createElement('option');
      opt.value = langKey;
      opt.textContent = `${config.flag} ${config.nativeName} (${config.name})`;
      mobileSelect.appendChild(opt);
    });

    mobileSelect.addEventListener('change', () => {
      const chosenLang = mobileSelect.value as SupportedLanguage;
      if (!chosenLang || !SUPPORTED_LANGUAGES[chosenLang]) return;
      const currentRoute = parseRoute(window.location.pathname);
      const newPath = buildLocalizedPath(currentRoute.cleanPath, chosenLang);
      if (window.location.pathname !== newPath) {
        window.history.pushState({}, '', newPath);
      }
      navigateTo(newPath);
    });
  }

  // 3. Dropdown toggle interaction
  if (dropdownBtn && dropdownMenu) {
    dropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !dropdownMenu.classList.contains('hidden');
      if (isOpen) {
        dropdownMenu.classList.add('hidden');
        arrowIcon?.classList.remove('rotate-180');
        dropdownBtn.setAttribute('aria-expanded', 'false');
      } else {
        dropdownMenu.classList.remove('hidden');
        arrowIcon?.classList.add('rotate-180');
        dropdownBtn.setAttribute('aria-expanded', 'true');
      }
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!dropdownWrapper?.contains(e.target as Node)) {
        dropdownMenu.classList.add('hidden');
        arrowIcon?.classList.remove('rotate-180');
        dropdownBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 4. Delegated handler for language switch clicks
  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement)?.closest('[data-lang-switch]') as HTMLElement | null;
    if (!target) return;

    const chosenLang = target.getAttribute('data-lang-switch') as SupportedLanguage | null;
    if (!chosenLang || !SUPPORTED_LANGUAGES[chosenLang]) return;

    e.preventDefault();
    if (dropdownMenu) {
      dropdownMenu.classList.add('hidden');
      arrowIcon?.classList.remove('rotate-180');
      dropdownBtn?.setAttribute('aria-expanded', 'false');
    }

    const currentRoute = parseRoute(window.location.pathname);
    const newPath = buildLocalizedPath(currentRoute.cleanPath, chosenLang);

    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }
    navigateTo(newPath);
  });
}

// Top Navigation Bar User Authentication Integration
export function setupNavbarAuth() {
  const navContainer = document.getElementById('nav-auth-container');
  const mobContainer = document.getElementById('mob-auth-container');
  const navAdminLink = document.getElementById('nav-link-admin');
  const mobAdminLink = document.getElementById('mob-link-admin');

  onAuthUserChange((user, profile) => {
    const isLoggedIn = Boolean(user);
    const isAdmin = isEmailAdmin(user?.email) || profile?.role === 'admin';
    const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';
    const email = user?.email || '';
    const initial = displayName.charAt(0).toUpperCase();

    // 1. Control visibility of Admin Links
    if (navAdminLink) {
      if (isAdmin) {
        navAdminLink.classList.remove('hidden');
        navAdminLink.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span class="text-amber-400 font-bold">Admin</span>
        `;
      } else if (isLoggedIn) {
        // Standard user logged in: hide admin link to keep experience clean and protected
        navAdminLink.classList.add('hidden');
      } else {
        // Guest user: show discreet admin link
        navAdminLink.classList.remove('hidden');
        navAdminLink.innerHTML = `
          <svg class="w-3.5 h-3.5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          <span class="hidden sm:inline">Admin</span>
        `;
      }
    }

    if (mobAdminLink) {
      if (isAdmin) {
        mobAdminLink.classList.remove('hidden');
      } else if (isLoggedIn) {
        mobAdminLink.classList.add('hidden');
      } else {
        mobAdminLink.classList.remove('hidden');
      }
    }

    // 2. Render Desktop Nav Auth Widget
    if (navContainer) {
      if (!isLoggedIn) {
        navContainer.innerHTML = `
          <button type="button" id="btn-nav-signin" class="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-dark-900 border border-slate-700/80 hover:border-brand-500 text-brand-400 hover:text-white transition-colors flex items-center gap-1.5 shadow-sm" title="Sign In or Register">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            <span>Sign In</span>
          </button>
        `;
        document.getElementById('btn-nav-signin')?.addEventListener('click', () => {
          openAuthModal('signin');
        });
      } else {
        navContainer.innerHTML = `
          <div class="relative" id="user-menu-root">
            <button type="button" id="btn-user-dropdown" class="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-dark-900 border border-slate-700/80 hover:border-brand-500 text-xs text-white transition-colors">
              <div class="w-5 h-5 rounded-md bg-gradient-to-tr from-brand-600 to-teal-400 text-white font-bold text-[10px] flex items-center justify-center">
                ${initial}
              </div>
              <span class="max-w-[80px] sm:max-w-[100px] truncate font-medium text-slate-200">${displayName}</span>
              <svg class="w-3 h-3 text-slate-400 transition-transform" id="user-dropdown-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div id="user-dropdown-card" class="hidden absolute right-0 mt-1.5 w-56 bg-dark-950 border border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 divide-y divide-slate-800/80">
              <div class="pb-2.5 px-1.5">
                <div class="text-xs font-bold text-white truncate">${displayName}</div>
                <div class="text-[11px] text-slate-400 truncate">${email}</div>
                <div class="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono ${isAdmin ? 'bg-amber-950 text-amber-300 border border-amber-800/80' : 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'}">
                  <span>${isAdmin ? '👑 Administrator' : '✓ Verified Creator'}</span>
                </div>
              </div>
              <div class="pt-2 space-y-1">
                ${isAdmin ? `
                  <a href="/admin" data-route-link class="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium text-amber-400 hover:text-white hover:bg-dark-900 flex items-center gap-2 transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    <span>Admin Control Center</span>
                  </a>
                ` : ''}
                <button type="button" id="btn-user-signout" class="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 flex items-center gap-2 transition-colors">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        `;

        const menuBtn = document.getElementById('btn-user-dropdown');
        const menuCard = document.getElementById('user-dropdown-card');
        const menuArrow = document.getElementById('user-dropdown-arrow');
        menuBtn?.addEventListener('click', (e) => {
          e.stopPropagation();
          const isHidden = menuCard?.classList.contains('hidden');
          if (isHidden) {
            menuCard?.classList.remove('hidden');
            menuArrow?.classList.add('rotate-180');
          } else {
            menuCard?.classList.add('hidden');
            menuArrow?.classList.remove('rotate-180');
          }
        });

        document.addEventListener('click', (e) => {
          if (!menuCard?.contains(e.target as Node) && !menuBtn?.contains(e.target as Node)) {
            menuCard?.classList.add('hidden');
            menuArrow?.classList.remove('rotate-180');
          }
        });

        document.getElementById('btn-user-signout')?.addEventListener('click', async () => {
          await signOutUser();
        });
      }
    }

    // 3. Render Mobile Drawer Auth Widget
    if (mobContainer) {
      if (!isLoggedIn) {
        mobContainer.innerHTML = `
          <button type="button" id="btn-mob-auth-signin" class="w-full py-2.5 px-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            <span>Sign In / Create Account</span>
          </button>
        `;
        document.getElementById('btn-mob-auth-signin')?.addEventListener('click', () => {
          const mobileDrawer = document.getElementById('mobile-nav-menu');
          mobileDrawer?.classList.add('hidden');
          openAuthModal('signin');
        });
      } else {
        mobContainer.innerHTML = `
          <div class="p-3 bg-dark-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <div class="flex items-center gap-2.5 truncate">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-teal-400 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                ${initial}
              </div>
              <div class="truncate">
                <div class="font-bold text-white truncate">${displayName}</div>
                <div class="text-[10px] text-slate-400 truncate">${email}</div>
              </div>
            </div>
            <button type="button" id="btn-mob-auth-signout" class="px-2.5 py-1.5 bg-rose-950/60 border border-rose-800/80 text-rose-300 hover:text-white rounded-lg text-xs font-medium transition-colors">
              Sign Out
            </button>
          </div>
        `;
        document.getElementById('btn-mob-auth-signout')?.addEventListener('click', async () => {
          await signOutUser();
        });
      }
    }
  });
}

// Initialize Application
async function initApp() {
  (window as any).navigateTo = navigateTo;
  (window as any).applyLanguageToUI = applyLanguageToUI;
  (window as any).getTranslations = getTranslations;
  (window as any).getCurrentLanguage = getCurrentLanguage;
  (window as any).SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;

  // 1. Initial setup
  initNavbarInteractions();
  initLanguageSwitchers();
  setupNavbarAuth();
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
