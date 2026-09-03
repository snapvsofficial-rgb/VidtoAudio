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
