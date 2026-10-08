import { SupportedLanguage, TranslationDictionary, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './translations/types';
import { enTranslations } from './translations/en';
import { deTranslations } from './translations/de';
import { esTranslations } from './translations/es';
import { frTranslations } from './translations/fr';
import {
  itTranslations,
  nlTranslations,
  svTranslations,
  plTranslations,
  ptTranslations,
  ruTranslations,
  ukTranslations,
  trTranslations,
  elTranslations,
  skTranslations,
  jaTranslations,
  koTranslations,
  zhTranslations,
  arTranslations,
  idTranslations,
  thTranslations,
  viTranslations
} from './translations/globalLanguages';

const TRANSLATION_MAP: Record<SupportedLanguage, TranslationDictionary> = {
  en: enTranslations,
  de: deTranslations,
  es: esTranslations,
  fr: frTranslations,
  it: itTranslations,
  nl: nlTranslations,
  sv: svTranslations,
  pl: plTranslations,
  pt: ptTranslations,
  ru: ruTranslations,
  uk: ukTranslations,
  tr: trTranslations,
  el: elTranslations,
  sk: skTranslations,
  ja: jaTranslations,
  ko: koTranslations,
  zh: zhTranslations,
  ar: arTranslations,
  id: idTranslations,
  th: thTranslations,
  vi: viTranslations
};

let currentLanguage: SupportedLanguage = DEFAULT_LANGUAGE;

/**
 * Parses language code from URL path (e.g. /de/... -> 'de', /es/... -> 'es', otherwise 'en')
 * Also supports query parameter ?lang=xx for hybrid crawler friendliness
 */
export function extractLanguageFromPath(pathname: string, search = ''): { lang: SupportedLanguage; cleanPath: string } {
  // 1. Check query parameter fallback ?lang=xx
  if (search) {
    const params = new URLSearchParams(search);
    const queryLang = (params.get('lang') || '').toLowerCase().trim();
    if (queryLang && (queryLang in SUPPORTED_LANGUAGES)) {
      const normalizedPath = (pathname || '/').trim().split('?')[0].split('#')[0] || '/';
      return { lang: queryLang as SupportedLanguage, cleanPath: normalizedPath };
    }
  }

  const normalized = (pathname || '/').trim();
  const segments = normalized.split('?')[0].split('#')[0].split('/').filter(Boolean);

  if (segments.length > 0) {
    const firstSegment = segments[0].toLowerCase();
    if (firstSegment in SUPPORTED_LANGUAGES && firstSegment !== 'en') {
      const remaining = '/' + segments.slice(1).join('/');
      return { lang: firstSegment as SupportedLanguage, cleanPath: remaining === '/' ? '/' : remaining };
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
      const langConfig = SUPPORTED_LANGUAGES[lang];
      if (langConfig?.dir) {
        document.documentElement.dir = langConfig.dir;
      } else {
        document.documentElement.dir = 'ltr';
      }
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
 * Updates hreflang links in document.head across all 21 supported languages + x-default
 */
export function updateHreflangTags(canonicalPathWithoutLang: string): void {
  if (typeof document === 'undefined') return;

  const clean = canonicalPathWithoutLang.startsWith('/') ? canonicalPathWithoutLang : `/${canonicalPathWithoutLang}`;
  const base = 'https://vidtoaudio.com';

  // Remove previous hreflang tags if any
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

  // Head fragment for optimal insertion
  const fragment = document.createDocumentFragment();

  // 1. Language alternates
  for (const langCode of Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[]) {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = langCode;
    
    if (langCode === 'en') {
      link.href = clean === '/' ? `${base}/` : `${base}${clean}`;
    } else {
      link.href = clean === '/' ? `${base}/${langCode}` : `${base}/${langCode}${clean}`;
    }
    fragment.appendChild(link);
  }

  // 2. x-default pointing to root English version
  const xDefaultLink = document.createElement('link');
  xDefaultLink.rel = 'alternate';
  xDefaultLink.hreflang = 'x-default';
  xDefaultLink.href = clean === '/' ? `${base}/` : `${base}${clean}`;
  fragment.appendChild(xDefaultLink);

  document.head.appendChild(fragment);
}

export * from './translations/types';
