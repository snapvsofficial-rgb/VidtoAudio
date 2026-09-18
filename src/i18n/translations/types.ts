export type SupportedLanguage = 'en' | 'es' | 'fr';

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  locale: string;
}

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    locale: 'en-US'
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    locale: 'es-ES'
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    locale: 'fr-FR'
  }
};

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export interface TranslationDictionary {
  nav: {
    home: string;
    converters: string;
    blog: string;
    editor: string;
    about: string;
    privacy: string;
    admin: string;
    getApp: string;
    terms: string;
  };
  hero: {
    homeTitle: string;
    homeSubtitle: string;
    popularConverters: string;
    amazonAppstore: string;
    directApkDownload: string;
    trustOffline: string;
    trustQueue: string;
    trustBitrate: string;
    trustNoUploads: string;
  };
  converter: {
    tryItHereHome: string;
    tryItHereMatrix: string;
    subtitleHome: string;
    subtitleMatrix: string;
    dropzoneTextHome: string;
    dropzoneTextMatrix: string;
    noFilesChosen: string;
    filesSelectedOne: string;
    filesSelectedMulti: string;
    supportsFormats: string;
    outputFormat: string;
    audioQuality: string;
    extractAudio: string;
    extractAudioCount: string;
    outputSummary: string;
    qualityStudio: string;
    qualityHigh: string;
    qualityStandard: string;
    processingInitializing: string;
    processingConverting: string;
    processingPleaseWait: string;
    successTitle: string;
    successSubtitle: string;
    downloadTrack: string;
    downloadAllZip: string;
    convertAnother: string;
    reset: string;
    play: string;
    pause: string;
    trimSelection: string;
    applyTrim: string;
    cropAudioSelection: string;
    errorTitle: string;
    errorMessage: string;
    tryAgain: string;
  };
  howItWorks: {
    title: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
  };
  features: {
    title: string;
    f1Title: string;
    f1Desc: string;
    f2Title: string;
    f2Desc: string;
    f3Title: string;
    f3Desc: string;
    f4Title: string;
    f4Desc: string;
    f5Title: string;
    f5Desc: string;
    f6Title: string;
    f6Desc: string;
  };
  screenshot: {
    title: string;
    subtitle: string;
    s1: string;
    s2: string;
    s3: string;
    s4: string;
  };
  comparison: {
    title: string;
    p1: string;
    p2: string;
    dataUploaded: string;
    serverWaitTime: string;
    privacyStatus: string;
    secureLocal: string;
  };
  homeFaq: {
    title: string;
    subtitle: string;
    q1: string;
    a1: string;
    q2: string;
    a2: string;
    q3: string;
    a3: string;
    q4: string;
    a4: string;
    q5: string;
    a5: string;
    q6: string;
    a6: string;
  };
  about: {
    missionBadge: string;
    title: string;
    subtitle: string;
    c1Title: string;
    c1Desc: string;
    c2Title: string;
    c2Desc: string;
    publisherTitle: string;
    publisherDesc: string;
  };
  matrix: {
    breadcrumbHome: string;
    breadcrumbConverters: string;
    heroTitle: string;
    heroSubtitle: string;
    pageMetaTitle: string;
    pageMetaDesc: string;
    techSpecBadge: string;
    techSpecSubtitle: string;
    howToExtractHeading: string;
    faqSectionTitle: string;
    faqSectionSubtitle: string;
    ratingHeading: string;
    ratingSubheading: string;
    ratingVerifiedUsers: string;
    ratingYourRating: string;
    ratingSubmitFeedback: string;
    ratingThankYou: string;
    ratingBasedOn: string;
    allConvertersTitle: string;
    allConvertersSubtitle: string;
    convertLabel: string;
  };
  editor: {
    title: string;
    metaTitle: string;
    metaDesc: string;
    backBtn: string;
    offlineBadge: string;
    tryDemoBtn: string;
    exportBtn: string;
    importMedia: string;
    demoModalTitle: string;
    demoModalDesc: string;
    loadDemoBtn: string;
    uploadOwnBtn: string;
    tabMedia: string;
    tabAudio: string;
    tabText: string;
    tabFilters: string;
    tabAdjust: string;
  };
  blog: {
    metaTitle: string;
    metaDesc: string;
    badge: string;
    heading: string;
    subtitle: string;
    readMore: string;
    shareArticle: string;
    backToArticles: string;
    loadingText: string;
  };
  footer: {
    brandSubtitle: string;
    privacyNotice: string;
    rightsReserved: string;
    privacyPolicy: string;
    termsOfService: string;
  };
}
