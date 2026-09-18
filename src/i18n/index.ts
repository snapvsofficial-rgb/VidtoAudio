import { SupportedLanguage, TranslationDictionary, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './translations/types';
import { enTranslations } from './translations/en';
import { esTranslations } from './translations/es';
import { frTranslations } from './translations/fr';

const TRANSLATION_MAP: Record<SupportedLanguage, TranslationDictionary> = {
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations
};

let currentLanguage: SupportedLanguage = DEFAULT_LANGUAGE;

/**
 * Parses language code from URL path (e.g. /es/... -> 'es', /fr/... -> 'fr', otherwise 'en')
 */
export function extractLanguageFromPath(pathname: string): { lang: SupportedLanguage; cleanPath: string } {
  const normalized = (pathname || '/').trim();
  const segments = normalized.split('?')[0].split('#')[0].split('/').filter(Boolean);

  if (segments.length > 0) {
    const firstSegment = segments[0].toLowerCase();
    if (firstSegment === 'es') {
      const remaining = '/' + segments.slice(1).join('/');
      return { lang: 'es', cleanPath: remaining === '/' ? '/' : remaining };
    }
    if (firstSegment === 'fr') {
      const remaining = '/' + segments.slice(1).join('/');
      return { lang: 'fr', cleanPath: remaining === '/' ? '/' : remaining };
    }
  }

  return { lang: 'en', cleanPath: normalized.split('?')[0].split('#')[0] || '/' };
}

/**
 * Builds localized path prefix
 */
export function buildLocalizedPath(path: string, lang: SupportedLanguage): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === 'en') {
    return clean;
  }
  return clean === '/' ? `/${lang}` : `/${lang}${clean}`;
}

/**
 * Get current active language
 */
export function getCurrentLanguage(): SupportedLanguage {
  return currentLanguage;
}

/**
 * Set active language
 */
export function setCurrentLanguage(lang: SupportedLanguage): void {
  if (SUPPORTED_LANGUAGES[lang]) {
    currentLanguage = lang;
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }
}

/**
 * Get full translation dictionary for active language
 */
export function getTranslations(lang: SupportedLanguage = currentLanguage): TranslationDictionary {
  return TRANSLATION_MAP[lang] || enTranslations;
}

/**
 * Helper to interpolate translation variables like {INPUT}, {OUTPUT}, {count}
 */
export function interpolate(text: string, params: Record<string, string | number>): string {
  if (!text) return '';
  let result = text;
  for (const [key, value] of Object.entries(params)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, String(value));
  }
  return result;
}

/**
 * Updates hreflang links in document.head
 */
export function updateHreflangTags(canonicalPathWithoutLang: string): void {
  if (typeof document === 'undefined') return;

  const clean = canonicalPathWithoutLang.startsWith('/') ? canonicalPathWithoutLang : `/${canonicalPathWithoutLang}`;
  const base = 'https://vidtoaudio.com';

  const hreflangMap: Record<string, string> = {
    'en': clean === '/' ? `${base}/` : `${base}${clean}`,
    'es': clean === '/' ? `${base}/es` : `${base}/es${clean}`,
    'fr': clean === '/' ? `${base}/fr` : `${base}/fr${clean}`,
    'x-default': clean === '/' ? `${base}/` : `${base}${clean}`
  };

  // Remove previous hreflang tags if any
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

  // Insert fresh tags
  for (const [langCode, href] of Object.entries(hreflangMap)) {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = langCode;
    link.href = href;
    document.head.appendChild(link);
  }
}

export * from './translations/types';
