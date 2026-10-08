export type SupportedLanguage = 
  | 'en' // English
  | 'de' // German
  | 'fr' // French
  | 'es' // Spanish
  | 'it' // Italian
  | 'nl' // Dutch
  | 'sv' // Swedish
  | 'pl' // Polish
  | 'pt' // Portuguese
  | 'el' // Greek
  | 'sk' // Slovak
  | 'tr' // Turkish
  | 'uk' // Ukrainian
  | 'ru' // Russian
  | 'ja' // Japanese
  | 'ko' // Korean
  | 'zh' // Chinese
  | 'ar' // Arabic
  | 'id' // Indonesian
  | 'th' // Thai
  | 'vi'; // Vietnamese

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  locale: string;
  dir?: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    locale: 'en-US',
    dir: 'ltr'
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    locale: 'de-DE',
    dir: 'ltr'
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    locale: 'fr-FR',
    dir: 'ltr'
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    locale: 'es-ES',
    dir: 'ltr'
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    locale: 'it-IT',
    dir: 'ltr'
  },
  nl: {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
    locale: 'nl-NL',
    dir: 'ltr'
  },
  sv: {
    code: 'sv',
    name: 'Swedish',
    nativeName: 'Svenska',
    flag: '🇸🇪',
    locale: 'sv-SE',
    dir: 'ltr'
  },
  pl: {
    code: 'pl',
    name: 'Polish',
    nativeName: 'Polski',
    flag: '🇵🇱',
    locale: 'pl-PL',
    dir: 'ltr'
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
    locale: 'pt-BR',
    dir: 'ltr'
  },
  el: {
    code: 'el',
    name: 'Greek',
    nativeName: 'Ελληνικά',
    flag: '🇬🇷',
    locale: 'el-GR',
    dir: 'ltr'
  },
  sk: {
    code: 'sk',
    name: 'Slovak',
    nativeName: 'Slovenčina',
    flag: '🇸🇰',
    locale: 'sk-SK',
    dir: 'ltr'
  },
  tr: {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    locale: 'tr-TR',
    dir: 'ltr'
  },
  uk: {
    code: 'uk',
    name: 'Ukrainian',
    nativeName: 'Українська',
    flag: '🇺🇦',
    locale: 'uk-UA',
    dir: 'ltr'
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    locale: 'ru-RU',
    dir: 'ltr'
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    locale: 'ja-JP',
    dir: 'ltr'
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    locale: 'ko-KR',
    dir: 'ltr'
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '简体中文',
    flag: '🇨🇳',
    locale: 'zh-CN',
    dir: 'ltr'
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    locale: 'ar-SA',
    dir: 'rtl'
  },
  id: {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    flag: '🇮🇩',
    locale: 'id-ID',
    dir: 'ltr'
  },
  th: {
    code: 'th',
    name: 'Thai',
    nativeName: 'ไทย',
    flag: '🇹🇭',
    locale: 'th-TH',
    dir: 'ltr'
  },
  vi: {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    locale: 'vi-VN',
    dir: 'ltr'
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
    contactUs?: string;
    languageLabel?: string;
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
    audioPreview?: string;
    trimAudio?: string;
    cropSelection?: string;
    waveformHint?: string;
    durationLabel?: string;
    sampleRateLabel?: string;
    sizeLabel?: string;
    convertedTracks?: string;
    actions?: string;
    sequentialOffline?: string;
  };
  batchSeo?: {
    badge: string;
    subBadge: string;
    title: string;
    desc: string;
    b1: string;
    b2: string;
    b3: string;
  };
  whyWeBuilt?: {
    title: string;
    p1: string;
    p2: string;
    lastUpdated: string;
  };
  howItWorks: {
    title: string;
    step1Title: string;
    step1Desc: string;
    step1Badge?: string;
    step2Title: string;
    step2Desc: string;
    step2Badge?: string;
    step3Title: string;
    step3Desc: string;
    step3Badge?: string;
    step4Title: string;
    step4Desc: string;
    step4Badge?: string;
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
    p1Title: string;
    p1Desc: string;
    p2Title: string;
    p2Desc: string;
    p3Title: string;
    p3Desc: string;
    p4Title: string;
    p4Desc: string;
    contactHeading: string;
    contactEmailText: string;
    privacyPolicy: string;
    termsOfService: string;
    c1Title?: string;
    c1Desc?: string;
    c2Title?: string;
    c2Desc?: string;
    publisherTitle?: string;
    publisherDesc?: string;
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
    backTooltip: string;
    defaultProjectTitle: string;
    offlineBadge: string;
    aspect16_9: string;
    aspect9_16: string;
    aspect1_1: string;
    aspect4_5: string;
    tryDemoBtn: string;
    exportBtn: string;
    demoModalBtn: string;
    tabEdit: string;
    tabEditShort: string;
    tabMedia: string;
    tabAudio: string;
    tabText: string;
    tabFilters: string;
    tabAdjust: string;
    noVideoLoaded: string;
    noVideoDesc: string;
    addMediaBtn: string;
    rewindTooltip: string;
    playPauseTooltip: string;
    fastForwardTooltip: string;
    splitBtn: string;
    splitTooltip: string;
    timelineHeader: string;
    zoomLabel: string;
    videoTrack: string;
    audioTrack: string;
    textTrack: string;
    demoModalTitle: string;
    demoModalDesc: string;
    demoModalOfflineBadge: string;
    loadDemoBtn: string;
    uploadOwnBtn: string;
    privacyNoticeModal: string;
    exportModalTitle: string;
    exportModalSubtitle: string;
    exportWasmBadge: string;
    downloadFinalVideo: string;
    exportDoneBtn: string;
    exportEmptyAlert: string;
    exportFailedAlert: string;
    mediaTabTitle: string;
    mediaFilesCount: string;
    importBoxTitle: string;
    importBoxFormats: string;
    loadDemoSampleBtn: string;
    clipsInProject: string;
    noClipSelected: string;
    playbackSpeed: string;
    trimClipRange: string;
    startTrimOffset: string;
    endTrimOffset: string;
    splitAtPlayhead: string;
    deleteClipBtn: string;
    splitAlert: string;
    audioTabTitle: string;
    addSynthBgmBtn: string;
    importCustomAudioBtn: string;
    volFadeSection: string;
    masterVolume: string;
    audioFadeIn: string;
    textTabTitle: string;
    addNewTitleBtn: string;
    textCaptionLabel: string;
    stylePresetLabel: string;
    stylePlain: string;
    styleBubble: string;
    styleGlow: string;
    styleCinema: string;
    textColorLabel: string;
    fontSizeLabel: string;
    deleteTextBtn: string;
    noTextSelected: string;
    defaultNewCaption: string;
    filtersTabTitle: string;
    presetsLabel: string;
    presetNormal: string;
    presetCinematic: string;
    presetVintage: string;
    presetWarm: string;
    presetCool: string;
    presetGrayscale: string;
    presetCyberpunk: string;
    filterBrightness: string;
    filterContrast: string;
    filterSaturation: string;
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
    readyTitle?: string;
    downloadBtn?: string;
    popularLabel?: string;
    matrixTitle?: string;
    matrixSubtitle?: string;
    matrixBadge?: string;
    disclaimer?: string;
    contact?: string;
  };
}
