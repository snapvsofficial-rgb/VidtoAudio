import { BlogPost, BlogPostTranslation } from '../types';
import { SupportedLanguage } from '../i18n/translations/types';

export interface LocalizedBlogContent {
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  isDynamicTranslation: boolean;
  lang: SupportedLanguage;
}

// Common technical vocabulary dictionaries for fallback translation
const DICT_ES: Record<string, string> = {
  // Headings & Phrases
  'Complete Audio Fidelity & Compression Guide': 'Guía completa de fidelidad de audio y compresión',
  'Detailed technical comparison between uncompressed PCM WAV and perceptual MP3 encoding for video audio extraction.': 'Comparativa técnica detallada entre WAV PCM sin comprimir y codificación perceptiva MP3 para extracción de audio de vídeo.',
  'Why Uncompressed WAV Matters for Video Production': 'Por qué el formato WAV sin comprimir es crucial en producción de vídeo',
  'Bitrate vs. File Size Trade-Offs': 'Relación entre tasa de bits y tamaño de archivo',
  'Summary Recommendation': 'Recomendación final',
  'Traditional Cloud Converters vs. On-Device VidToAudio': 'Conversores en la nube tradicionales frente a VidToAudio local',
  'How It Works Behind the Scenes': 'Cómo funciona entre bastidores',
  'How to Extract Audio from Video 100% Offline in Your Browser': 'Cómo extraer audio de vídeo 100% offline en tu navegador',
  'Learn how WebAssembly and client-side FFmpeg allow you to extract audio from huge MP4 files without uploading a single byte to cloud servers.': 'Descubre cómo WebAssembly y FFmpeg en el cliente te permiten extraer audio de archivos MP4 gigantes sin subir ningún byte a servidores externos.',
  'Lossless Audio Extraction Explained: Bit-for-Bit Stream Copy': 'Extracción de audio sin pérdida explicada: Copia directa de flujo bit a bit',
  'Demystifying direct stream copying vs re-encoding when converting video files to audio.': 'Explicación de la copia directa de flujo frente a la recodificación al convertir archivos de vídeo a audio.',
  'Audio Extraction Methods Compared': 'Métodos de extracción de audio comparados',

  // Table Headers
  'Audio Format': 'Formato de Audio',
  'Bitrate / Depth': 'Tasa de Bits / Profundidad',
  'Compression Type': 'Tipo de Compresión',
  'Lossless Fidelity': 'Fidelidad Sin Pérdida',
  'Browser Processing Speed': 'Velocidad en Navegador',
  'Best Suited For': 'Uso Recomendado',
  'Security & Performance Feature': 'Característica de Seguridad y Rendimiento',
  'Traditional Cloud Converters': 'Conversores en la Nube Tradicionales',
  'VidToAudio On-Device WASM': 'VidToAudio con WASM Local',
  'Audio Stream Duration': 'Duración del Audio',
  'Extraction Method': 'Método de Extracción',
  'CPU Usage': 'Uso de CPU',
  'Conversion Speed': 'Velocidad de Conversión',
  'Audio Re-compression': 'Recompresión de Audio',
  'Original Quality Loss': 'Pérdida de Calidad Original',

  // Table values
  'Uncompressed': 'Sin compresión',
  'Perceptual Lossy': 'Pérdida perceptiva',
  'Transform Lossy': 'Pérdida transformada',
  'Lossless Compressed': 'Comprimido sin pérdida',
  'Modern Hybrid': 'Híbrido moderno',
  'Yes (100%)': 'Sí (100%)',
  'No': 'No',
  'Ultra Fast (Native)': 'Ultra Rápida (Nativa)',
  'Very Fast': 'Muy Rápida',
  'Fast': 'Rápida',
  'Moderate': 'Moderada',
  'High Efficiency': 'Alta Eficiencia',
  'Instantaneous (<1s)': 'Instantáneo (<1s)',
  'Fast (2-5s)': 'Rápido (2-5s)',
  'Normal (5-15s)': 'Normal (5-15s)',
  'Minimal (<5%)': 'Mínimo (<5%)',
  'Low (10-20%)': 'Bajo (10-20%)',
  'Moderate (40-60%)': 'Moderado (40-60%)',
  '0% (Bit-for-bit identical)': '0% (Bit a bit idéntico)',
  '0% (Lossless expansion)': '0% (Expansión sin pérdida)',
  'Minor psychoacoustic reduction': 'Reducción psicoacústica leve',
  'DAW Editing, Mastering, Archival': 'Edición en DAW, Masterización, Archivo',
  'Podcasts, Mobile Devices, Streaming': 'Podcasts, Dispositivos Móviles, Streaming',
  'Apple Ecosystem, YouTube Uploads': 'Ecosistema Apple, Subidas a YouTube',
  'Audiophile Listening, Archival': 'Escucha audiófila, Archivo digital',
  'Low-latency Voice, Modern Web Streaming': 'Voz de baja latencia, Streaming web moderno',
  'Universal playback': 'Reproducción universal',
  'Audio editing & mastering': 'Edición y masterización de audio',
  'Audiophile archiving': 'Archivado audiófilo',

  // Common sentence fragments
  'When extracting audio from': 'Al extraer audio de',
  'Choosing between': 'Elegir entre',
  'Here is a side-by-side': 'A continuación se muestra una comparativa',
  'Unlike lossy psychoacoustic algorithms': 'A diferencia de los algoritmos psicoacústicos con pérdida',
  'Traditional online converters require uploading your confidential video footage to third-party cloud servers.': 'Los conversores en línea convencionales exigen subir tus grabaciones confidenciales a servidores en la nube.',
  'VidToAudio takes a fundamentally modern architectural approach using': 'VidToAudio adopta una arquitectura moderna basada en',
  'When you drop an': 'Cuando arrastras un archivo',
  'Virtual Filesystem (MEMFS)': 'Sistema de Archivos Virtual (MEMFS)',
  'WebAssembly Pipeline': 'Canalización WebAssembly',
  'Blob Stream Download': 'Descarga de Flujo Blob',
  'Your video never traverses the public internet.': 'Tu vídeo nunca viaja por internet público.',
  'For maximum speed and fidelity, select the output format that best matches your target workflow!': 'Para obtener la máxima velocidad y fidelidad, elige el formato de salida que mejor se adapte a tu flujo de trabajo.',
  'Choose': 'Elige',
  'Always choose': 'Elige siempre'
};

const DICT_FR: Record<string, string> = {
  // Headings & Phrases
  'Complete Audio Fidelity & Compression Guide': 'Guide complet de fidélité audio et de compression',
  'Detailed technical comparison between uncompressed PCM WAV and perceptual MP3 encoding for video audio extraction.': 'Comparaison technique détaillée entre le format WAV PCM non compressé et l\'encodage perceptuel MP3 pour l\'extraction audio vidéo.',
  'Why Uncompressed WAV Matters for Video Production': 'Pourquoi le WAV non compressé est essentiel pour la production vidéo',
  'Bitrate vs. File Size Trade-Offs': 'Compromis entre débit binaire et taille de fichier',
  'Summary Recommendation': 'Recommandation finale',
  'Traditional Cloud Converters vs. On-Device VidToAudio': 'Convertisseurs cloud classiques vs VidToAudio en local',
  'How It Works Behind the Scenes': 'Fonctionnement en coulisses',
  'How to Extract Audio from Video 100% Offline in Your Browser': 'Comment extraire l\'audio d\'une vidéo 100% hors-ligne dans votre navigateur',
  'Learn how WebAssembly and client-side FFmpeg allow you to extract audio from huge MP4 files without uploading a single byte to cloud servers.': 'Découvrez comment WebAssembly et FFmpeg côté client vous permettent d\'extraire l\'audio de volumineux fichiers MP4 sans envoyer le moindre octet sur le cloud.',
  'Lossless Audio Extraction Explained: Bit-for-Bit Stream Copy': 'Extraction audio sans perte expliquée : Copie de flux bit à bit',
  'Demystifying direct stream copying vs re-encoding when converting video files to audio.': 'Démystifier la copie de flux directe par rapport au ré-encodage lors de la conversion de fichiers vidéo en audio.',
  'Audio Extraction Methods Compared': 'Méthodes d\'extraction audio comparées',

  // Table Headers
  'Audio Format': 'Format Audio',
  'Bitrate / Depth': 'Débit / Résolution',
  'Compression Type': 'Type de Compression',
  'Lossless Fidelity': 'Fidélité Sans Perte',
  'Browser Processing Speed': 'Vitesse Navigateur',
  'Best Suited For': 'Cas d\'Usage Idéal',
  'Security & Performance Feature': 'Fonctionnalité de Sécurité & Vitesse',
  'Traditional Cloud Converters': 'Convertisseurs Cloud Traditionnels',
  'VidToAudio On-Device WASM': 'VidToAudio Local WASM',
  'Audio Stream Duration': 'Durée de la Piste Audio',
  'Extraction Method': 'Méthode d\'Extraction',
  'CPU Usage': 'Utilisation Processeur',
  'Conversion Speed': 'Vitesse de Conversion',
  'Audio Re-compression': 'Recompression Audio',
  'Original Quality Loss': 'Perte de Qualité Originale',

  // Table values
  'Uncompressed': 'Non compressé',
  'Perceptual Lossy': 'Perte perceptuelle',
  'Transform Lossy': 'Perte transformée',
  'Lossless Compressed': 'Compressé sans perte',
  'Modern Hybrid': 'Hybride moderne',
  'Yes (100%)': 'Oui (100%)',
  'No': 'Non',
  'Ultra Fast (Native)': 'Ultra Rapide (Natif)',
  'Very Fast': 'Très Rapide',
  'Fast': 'Rapide',
  'Moderate': 'Modérée',
  'High Efficiency': 'Haute Efficacité',
  'Instantaneous (<1s)': 'Instantané (<1s)',
  'Fast (2-5s)': 'Rapide (2-5s)',
  'Normal (5-15s)': 'Normal (5-15s)',
  'Minimal (<5%)': 'Minimal (<5%)',
  'Low (10-20%)': 'Faible (10-20%)',
  'Moderate (40-60%)': 'Modéré (40-60%)',
  '0% (Bit-for-bit identical)': '0% (Bit à bit identique)',
  '0% (Lossless expansion)': '0% (Décompression sans perte)',
  'Minor psychoacoustic reduction': 'Légère réduction psychoacoustique',
  'DAW Editing, Mastering, Archival': 'Montage DAW, Mastering, Archivage',
  'Podcasts, Mobile Devices, Streaming': 'Podcasts, Mobiles, Streaming',
  'Apple Ecosystem, YouTube Uploads': 'Écosystème Apple, Uploads YouTube',
  'Audiophile Listening, Archival': 'Écoute audiophile, Archivage',
  'Low-latency Voice, Modern Web Streaming': 'Voix faible latence, Streaming moderne',
  'Universal playback': 'Lecture universelle',
  'Audio editing & mastering': 'Montage et mastering audio',
  'Audiophile archiving': 'Archivage audiophile',

  // Common sentence fragments
  'When extracting audio from': 'Lors de l\'extraction audio à partir de',
  'Choosing between': 'Le choix entre',
  'Here is a side-by-side': 'Voici une comparaison côte à côte',
  'Unlike lossy psychoacoustic algorithms': 'Contrairement aux algorithmes psychoacoustiques avec perte',
  'Traditional online converters require uploading your confidential video footage to third-party cloud servers.': 'Les convertisseurs en ligne classiques exigent d\'envoyer vos enregistrements vidéo confidentiels sur des serveurs cloud distants.',
  'VidToAudio takes a fundamentally modern architectural approach using': 'VidToAudio adopte une approche architecturale moderne reposant sur',
  'When you drop an': 'Lorsque vous glissez un fichier',
  'Virtual Filesystem (MEMFS)': 'Système de Fichiers Virtuel (MEMFS)',
  'WebAssembly Pipeline': 'Pipeline WebAssembly',
  'Blob Stream Download': 'Téléchargement Flux Blob',
  'Your video never traverses the public internet.': 'Votre vidéo ne transite jamais sur l\'internet public.',
  'For maximum speed and fidelity, select the output format that best matches your target workflow!': 'Pour une vitesse et une fidélité maximales, sélectionnez le format de sortie le mieux adapté à vos besoins !',
  'Choose': 'Choisissez',
  'Always choose': 'Choisissez toujours'
};

/**
 * Translates a Markdown string into Spanish or French while strictly preserving
 * Markdown syntax, code blocks, tables, lists, links, and bold/italic markup.
 */
export function translateMarkdownText(md: string, targetLang: 'es' | 'fr'): string {
  if (!md) return '';
  const dict = targetLang === 'es' ? DICT_ES : DICT_FR;

  const lines = md.split(/\r?\n/);
  const outLines: string[] = [];
  let inCodeBlock = false;

  for (let line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      outLines.push(line);
      continue;
    }

    if (inCodeBlock) {
      outLines.push(line);
      continue;
    }

    // Preserve table delimiter lines (e.g. | :--- | :---: | ---: |)
    if (/^\s*\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?\s*$/.test(line)) {
      outLines.push(line);
      continue;
    }

    // Apply dictionary replacements
    let translatedLine = line;

    // Apply exact key replacements in descending order of length to prevent substring clashes
    const sortedKeys = Object.keys(dict).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      if (translatedLine.includes(key)) {
        translatedLine = translatedLine.split(key).join(dict[key]);
      }
    }

    // Translate common heading labels if still untranslated
    if (targetLang === 'es') {
      translatedLine = translatedLine
        .replace(/^#\s+Audio Formats Compared/i, '# Comparativa de Formatos de Audio')
        .replace(/^#\s+How to\s+/i, '# Cómo ')
        .replace(/^##\s+How to\s+/i, '## Cómo ')
        .replace(/^###\s+How to\s+/i, '### Cómo ')
        .replace(/^###\s+Summary\b/i, '### Resumen')
        .replace(/^###\s+Conclusion\b/i, '### Conclusión')
        .replace(/\b1 Minute\b/g, '1 Minuto')
        .replace(/\b(\d+)\s+Minutes\b/g, '$1 Minutos')
        .replace(/\bPro tip:/gi, 'Consejo profesional:')
        .replace(/\bFast conversion\b/gi, 'Conversión rápida')
        .replace(/\bLocal WASM FFmpeg\b/gi, 'FFmpeg WASM local');
    } else {
      translatedLine = translatedLine
        .replace(/^#\s+Audio Formats Compared/i, '# Comparaison des Formats Audio')
        .replace(/^#\s+How to\s+/i, '# Comment ')
        .replace(/^##\s+How to\s+/i, '## Comment ')
        .replace(/^###\s+How to\s+/i, '### Comment ')
        .replace(/^###\s+Summary\b/i, '### Résumé')
        .replace(/^###\s+Conclusion\b/i, '### Conclusion')
        .replace(/\b1 Minute\b/g, '1 Minute')
        .replace(/\b(\d+)\s+Minutes\b/g, '$1 Minutes')
        .replace(/\bPro tip:/gi, 'Astuce pro :')
        .replace(/\bFast conversion\b/gi, 'Conversion ultra-rapide')
        .replace(/\bLocal WASM FFmpeg\b/gi, 'FFmpeg WASM en local');
    }

    outLines.push(translatedLine);
  }

  return outLines.join('\n');
}

/**
 * Translates a single text string (title, excerpt) into Spanish or French.
 */
export function translatePlainText(text: string, targetLang: 'es' | 'fr'): string {
  if (!text) return '';
  const dict = targetLang === 'es' ? DICT_ES : DICT_FR;
  let out = text;
  const sortedKeys = Object.keys(dict).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (out.includes(key)) {
      out = out.split(key).join(dict[key]);
    }
  }

  if (targetLang === 'es') {
    out = out
      .replace(/^How to\s+/i, 'Cómo ')
      .replace(/\bvs\.?\b/gi, 'frente a')
      .replace(/\bOffline\b/gi, 'Offline')
      .replace(/\bIn Your Browser\b/gi, 'en tu navegador')
      .replace(/\bAudio Extraction\b/gi, 'Extracción de audio')
      .replace(/\bExplained\b/gi, 'explicada');
  } else {
    out = out
      .replace(/^How to\s+/i, 'Comment ')
      .replace(/\bvs\.?\b/gi, 'vs')
      .replace(/\bOffline\b/gi, 'hors-ligne')
      .replace(/\bIn Your Browser\b/gi, 'dans votre navigateur')
      .replace(/\bAudio Extraction\b/gi, 'Extraction audio')
      .replace(/\bExplained\b/gi, 'expliquée');
  }

  return out;
}

/**
 * Retrieves the localized version of a blog post for the active language.
 * Checks:
 * 1. post.translations?.[lang]
 * 2. Flat properties post[`title_${lang}`], post[`content_${lang}`], etc.
 * 3. LocalStorage cached dynamic translation
 * 4. On-the-fly rule-based & technical dictionary dynamic translation layer
 */
export function getLocalizedBlogPost(post: BlogPost, lang: SupportedLanguage): LocalizedBlogContent {
  const defaultSlug = post.slug || '';
  if (lang === 'en') {
    return {
      title: post.title,
      excerpt: post.excerpt || '',
      content: post.content,
      slug: defaultSlug,
      isDynamicTranslation: false,
      lang: 'en'
    };
  }

  // 1. Structured translations object in BlogPost
  const structured = post.translations?.[lang];
  if (structured && structured.title && structured.content) {
    return {
      title: structured.title,
      excerpt: structured.excerpt || post.excerpt || '',
      content: structured.content,
      slug: structured.slug || defaultSlug,
      isDynamicTranslation: false,
      lang
    };
  }

  // 2. Direct flat fields (e.g. title_es, content_es)
  const flatTitle = (post as any)[`title_${lang}`];
  const flatContent = (post as any)[`content_${lang}`];
  const flatExcerpt = (post as any)[`excerpt_${lang}`];
  if (flatTitle && flatContent) {
    return {
      title: flatTitle,
      excerpt: flatExcerpt || post.excerpt || '',
      content: flatContent,
      slug: defaultSlug,
      isDynamicTranslation: false,
      lang
    };
  }

  // 3. Check client-side cached translation in localStorage
  const cacheKey = `vidtoaudio_blog_trans_${post.id || post.slug}_${lang}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed?.title && parsed?.content) {
        return {
          title: parsed.title,
          excerpt: parsed.excerpt || post.excerpt || '',
          content: parsed.content,
          slug: defaultSlug,
          isDynamicTranslation: true,
          lang
        };
      }
    }
  } catch (e) {
    // Ignore localStorage access errors
  }

  // 4. Dynamic Translation Layer
  const translatedTitle = translatePlainText(post.title, lang);
  const translatedExcerpt = translatePlainText(post.excerpt || '', lang);
  const translatedContent = translateMarkdownText(post.content, lang);

  const result: LocalizedBlogContent = {
    title: translatedTitle,
    excerpt: translatedExcerpt,
    content: translatedContent,
    slug: defaultSlug,
    isDynamicTranslation: true,
    lang
  };

  // Cache in localStorage
  try {
    localStorage.setItem(cacheKey, JSON.stringify({
      title: translatedTitle,
      excerpt: translatedExcerpt,
      content: translatedContent
    }));
  } catch (e) {
    // Ignore cache write quota errors
  }

  return result;
}

/**
 * Helper to auto-translate an article in the Admin panel when saving
 */
export function generateTranslationsForBlogPost(post: { title: string; excerpt?: string; content: string }): {
  es: BlogPostTranslation;
  fr: BlogPostTranslation;
} {
  return {
    es: {
      title: translatePlainText(post.title, 'es'),
      excerpt: translatePlainText(post.excerpt || '', 'es'),
      content: translateMarkdownText(post.content, 'es')
    },
    fr: {
      title: translatePlainText(post.title, 'fr'),
      excerpt: translatePlainText(post.excerpt || '', 'fr'),
      content: translateMarkdownText(post.content, 'fr')
    }
  };
}
