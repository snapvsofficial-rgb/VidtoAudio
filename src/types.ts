import { SupportedLanguage } from './i18n/translations/types';

export interface BlogPostTranslation {
  title?: string;
  excerpt?: string;
  content?: string;
  slug?: string;
}

export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  authorEmail?: string;
  createdAt?: any;
  updatedAt?: any;
  published?: boolean;
  // Multilingual support
  translations?: Partial<Record<SupportedLanguage, BlogPostTranslation>>;
  title_es?: string;
  excerpt_es?: string;
  content_es?: string;
  title_fr?: string;
  excerpt_fr?: string;
  content_fr?: string;
}

export interface SEOTemplateConfig {
  template: string;
  updatedAt?: any;
}

export interface FormatTogglesConfig {
  [formatKey: string]: boolean;
}

export interface SiteSettingsConfig {
  primaryColor?: string;
  siteMetaTitle?: string;
  footerText?: string;
  vercelDeployHook?: string;
  updatedAt?: any;
}
