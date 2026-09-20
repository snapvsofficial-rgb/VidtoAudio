import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  where,
  limit
} from 'firebase/firestore';
import { db, hasFirebaseConfig } from '../firebase';
import { BlogPost, SEOTemplateConfig, FormatTogglesConfig, SiteSettingsConfig } from '../types';

export const DEFAULT_SEO_TEMPLATE = 
  "Converting your {INPUT} video files to {OUTPUT} audio is perfect for saving space and extracting high-fidelity sound. Unlike cloud services, our on-device engine processes the {INPUT} completely offline, ensuring your data never leaves your browser.";

export const DEFAULT_FORMAT_TOGGLES: FormatTogglesConfig = {
  wav: true,
  mp3: true,
  aac: true,
  flac: true,
  ogg: true,
  m4a: true,
  wma: true,
  opus: true,
  aiff: true
};

export const DEFAULT_SITE_SETTINGS: SiteSettingsConfig = {
  primaryColor: '#14b8a6', // Teal
  siteMetaTitle: 'VidToAudio - Free, Offline & On-Device Audio Converter',
  footerText: 'VidToAudio. All rights reserved. 100% On-Device Audio Extraction.',
  vercelDeployHook: ''
};

// --- SEO Template Management (Cloud Firestore) ---
export async function fetchSEOTemplate(): Promise<string> {
  if (!hasFirebaseConfig) return DEFAULT_SEO_TEMPLATE;
  try {
    const docRef = doc(db, 'config', 'seo_template');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as SEOTemplateConfig;
      if (data && data.template) {
        return data.template;
      }
    }
  } catch (err: any) {
    if (err?.message?.includes('offline') || err?.code === 'unavailable') {
      console.warn('[Firestore] Using default SEO template (offline mode).');
    } else {
      console.warn('Failed to fetch SEO template from Firestore:', err?.message || err);
    }
  }
  return DEFAULT_SEO_TEMPLATE;
}

export async function saveSEOTemplate(template: string): Promise<void> {
  if (!hasFirebaseConfig) return;
  const cleanTemplate = template.trim();
  const docRef = doc(db, 'config', 'seo_template');
  await setDoc(docRef, {
    template: cleanTemplate,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

// --- Format Toggles Management (Cloud Firestore) ---
export async function fetchFormatToggles(): Promise<FormatTogglesConfig> {
  if (!hasFirebaseConfig) return { ...DEFAULT_FORMAT_TOGGLES };
  try {
    const docRef = doc(db, 'config', 'format_toggles');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as { enabledFormats: FormatTogglesConfig };
      if (data && data.enabledFormats) {
        return { ...DEFAULT_FORMAT_TOGGLES, ...data.enabledFormats };
      }
    }
  } catch (err: any) {
    if (err?.message?.includes('offline') || err?.code === 'unavailable') {
      console.warn('[Firestore] Using default format toggles (offline mode).');
    } else {
      console.warn('Failed to fetch format toggles from Firestore:', err?.message || err);
    }
  }
  return { ...DEFAULT_FORMAT_TOGGLES };
}

export async function saveFormatToggles(toggles: FormatTogglesConfig): Promise<void> {
  if (!hasFirebaseConfig) return;
  const docRef = doc(db, 'config', 'format_toggles');
  await setDoc(docRef, {
    enabledFormats: toggles,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

// --- Site Settings Management (Cloud Firestore) ---
export async function fetchSiteSettings(): Promise<SiteSettingsConfig> {
  if (!hasFirebaseConfig) return { ...DEFAULT_SITE_SETTINGS };
  try {
    const docRef = doc(db, 'config', 'site_settings');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as SiteSettingsConfig;
      if (data) {
        return { ...DEFAULT_SITE_SETTINGS, ...data };
      }
    }
  } catch (err: any) {
    if (err?.message?.includes('offline') || err?.code === 'unavailable') {
      console.warn('[Firestore] Using default site settings (offline mode).');
    } else {
      console.warn('Failed to fetch site settings from Firestore:', err?.message || err);
    }
  }
  return { ...DEFAULT_SITE_SETTINGS };
}

export async function saveSiteSettings(settings: SiteSettingsConfig): Promise<void> {
  if (!hasFirebaseConfig) return;
  const merged: SiteSettingsConfig = { ...DEFAULT_SITE_SETTINGS, ...settings };
  const docRef = doc(db, 'config', 'site_settings');
  await setDoc(docRef, {
    ...merged,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export const DEFAULT_BLOG_POSTS: BlogPost[] = [
  {
    id: 'default_post_1',
    title: 'MP4 to WAV vs. MP3: Complete Audio Fidelity & Compression Guide',
    slug: 'mp4-to-wav-vs-mp3-fidelity-guide',
    excerpt: 'Detailed technical comparison between uncompressed PCM WAV and perceptual MP3 encoding for video audio extraction.',
    authorEmail: 'editorial@vidtoaudio.com',
    createdAt: new Date('2026-03-15'),
    updatedAt: new Date('2026-03-15'),
    published: true,
    translations: {
      es: {
        title: 'MP4 a WAV frente a MP3: Guía completa de fidelidad de audio y compresión',
        excerpt: 'Comparativa técnica detallada entre WAV PCM sin comprimir y codificación perceptiva MP3 para extracción de audio de vídeo.',
        content: `Al extraer audio de clips de vídeo en alta definición (MP4, MKV, MOV), la elección entre **WAV** y **MP3** determina fundamentalmente el rango dinámico, la latencia de procesamiento y el espacio de almacenamiento.

A continuación, una comparativa técnica detallada de los principales formatos de audio:

| Formato de Audio | Tasa de Bits / Profundidad | Tipo de Compresión | Fidelidad Sin Pérdida | Velocidad en Navegador | Uso Recomendado |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **WAV (PCM)** | 1.411 kbps / 16 bits | Sin compresión | Sí (100%) | ⚡ Ultra Rápida (Nativa) | Edición en DAW, Masterización, Archivo |
| **MP3 (LAME)** | 128 - 320 kbps | Pérdida perceptiva | No | ⚡ Muy Rápida | Podcasts, Dispositivos Móviles, Streaming |
| **AAC (M4A)** | 128 - 320 kbps | Pérdida transformada | No | ⚡ Rápida | Ecosistema Apple, Subidas a YouTube |
| **FLAC** | ~800 kbps (VBR) | Comprimido sin pérdida | Sí (100%) | ⏱ Moderada | Escucha audiófila, Archivo digital |
| **OPUS** | 6 - 510 kbps (VBR) | Híbrido moderno | No | ⚡ Alta Eficiencia | Voz de baja latencia, Streaming web |

### Por qué el formato WAV sin comprimir es crucial en producción de vídeo

A diferencia de los algoritmos psicoacústicos que eliminan frecuencias por encima de 16kHz a 20kHz, el formato PCM WAV de 16 o 24 bits captura con total exactitud la amplitud de cada muestra:

> "Volver a comprimir una pista AAC de MP4 en MP3 produce pérdida generacional. Exportar directamente a WAV preserva la forma de onda decodificada intacta, sin artefactos de cuantificación secundarios."

### Relación entre tasa de bits y tamaño de archivo

| Duración del Audio | WAV (16-bit 44.1kHz) | MP3 (320 kbps) | MP3 (192 kbps) |
| :--- | :---: | :---: | :---: |
| 1 Minuto | ~10,5 MB | ~2,4 MB | ~1,4 MB |
| 5 Minutos | ~52,5 MB | ~12,0 MB | ~7,2 MB |
| 30 Minutos | ~315,0 MB | ~72,0 MB | ~43,2 MB |
| 60 Minutos | ~630,0 MB | ~144,0 MB | ~86,4 MB |

### Recomendación final

- Para **compartir rápidamente, podcasts o escuchar en smartphones**: Elige **MP3 a 320kbps**.
- Para **edición posterior de vídeo en Premiere Pro, DaVinci Resolve o Audacity**: Elige siempre **WAV**.
`
      },
      fr: {
        title: 'MP4 vers WAV vs MP3 : Guide complet de fidélité audio et de compression',
        excerpt: 'Comparaison technique détaillée entre le format WAV PCM non compressé et l\'encodage perceptuel MP3 pour l\'extraction audio vidéo.',
        content: `Lors de l'extraction audio à partir de clips vidéo haute définition (MP4, MKV, MOV), le choix entre **WAV** et **MP3** dicte fondamentalement la plage dynamique, la vitesse de traitement et l'espace disque.

Voici une comparaison technique côte à côte des principaux formats audio de sortie :

| Format Audio | Débit / Résolution | Type de Compression | Fidélité Sans Perte | Vitesse Navigateur | Cas d'Usage Idéal |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **WAV (PCM)** | 1 411 kbps / 16-bit | Non compressé | Oui (100%) | ⚡ Ultra Rapide (Natif) | Montage DAW, Mastering, Archivage |
| **MP3 (LAME)** | 128 - 320 kbps | Perte perceptuelle | Non | ⚡ Très Rapide | Podcasts, Mobiles, Streaming |
| **AAC (M4A)** | 128 - 320 kbps | Perte transformée | Non | ⚡ Rapide | Écosystème Apple, Uploads YouTube |
| **FLAC** | ~800 kbps (VBR) | Compressé sans perte | Oui (100%) | ⏱ Modérée | Écoute audiophile, Archivage |
| **OPUS** | 6 - 510 kbps (VBR) | Hybride moderne | Non | ⚡ Haute Efficacité | Voix faible latence, Streaming moderne |

### Pourquoi le WAV non compressé est essentiel pour la production vidéo

Contrairement aux algorithmes psychoacoustiques avec perte qui éliminent les fréquences inaudibles au-dessus de 16kHz à 20kHz, le format PCM WAV 16-bit ou 24-bit capture fidèlement chaque amplitude :

> "Recompresser une piste AAC déjà compressée dans un MP4 vers du MP3 entraîne une perte générationnelle. Exporter directement vers WAV préserve le signal PCM décodé sans artefacts de quantification secondaires."

### Compromis entre débit binaire et taille de fichier

| Durée de la Piste Audio | WAV (16-bit 44.1kHz) | MP3 (320 kbps) | MP3 (192 kbps) |
| :--- | :---: | :---: | :---: |
| 1 Minute | ~10,5 Mo | ~2,4 Mo | ~1,4 Mo |
| 5 Minutes | ~52,5 Mo | ~12,0 Mo | ~7,2 Mo |
| 30 Minutes | ~315,0 Mo | ~72,0 Mo | ~43,2 Mo |
| 60 Minutes | ~630,0 Mo | ~144,0 Mo | ~86,4 Mo |

### Recommandation finale

- Pour **le partage rapide, les podcasts ou l'écoute nomade** : Choisissez **MP3 à 320kbps**.
- Pour **le montage vidéo sous Premiere Pro, DaVinci Resolve ou Audacity** : Choisissez toujours **WAV**.
`
      }
    },
    title_es: 'MP4 a WAV frente a MP3: Guía completa de fidelidad de audio y compresión',
    excerpt_es: 'Comparativa técnica detallada entre WAV PCM sin comprimir y codificación perceptiva MP3 para extracción de audio de vídeo.',
    title_fr: 'MP4 vers WAV vs MP3 : Guide complet de fidélité audio et de compression',
    excerpt_fr: 'Comparaison technique détaillée entre le format WAV PCM non compressé et l\'encodage perceptuel MP3 pour l\'extraction audio vidéo.',
    content: `When extracting audio from high-definition video clips (MP4, MKV, MOV), choosing between **WAV** and **MP3** fundamentally dictates dynamic range, processing latency, and storage footprint.

Here is a side-by-side technical comparison of major output audio formats:

| Audio Format | Bitrate / Depth | Compression Type | Lossless Fidelity | Browser Processing Speed | Best Suited For |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **WAV (PCM)** | 1,411 kbps / 16-bit | Uncompressed | Yes (100%) | ⚡ Ultra Fast (Native) | DAW Editing, Mastering, Archival |
| **MP3 (LAME)** | 128 - 320 kbps | Perceptual Lossy | No | ⚡ Very Fast | Podcasts, Mobile Devices, Streaming |
| **AAC (M4A)** | 128 - 320 kbps | Transform Lossy | No | ⚡ Fast | Apple Ecosystem, YouTube Uploads |
| **FLAC** | ~800 kbps (VBR) | Lossless Compressed | Yes (100%) | ⏱ Moderate | Audiophile Listening, Archival |
| **OPUS** | 6 - 510 kbps (VBR) | Modern Hybrid | No | ⚡ High Efficiency | Low-latency Voice, Modern Web Streaming |

### Why Uncompressed WAV Matters for Video Production

Unlike lossy psychoacoustic algorithms that discard inaudible frequencies above 16kHz to 20kHz, uncompressed 16-bit or 24-bit PCM WAV captures every sample amplitude accurately:

> "Re-compressing an already compressed MP4 AAC track into MP3 causes generational loss. Exporting directly to WAV preserves the decoded PCM waveform pristine without secondary quantization artifacts."

### Bitrate vs. File Size Trade-Offs

| Audio Stream Duration | WAV (16-bit 44.1kHz) | MP3 (320 kbps) | MP3 (192 kbps) |
| :--- | :---: | :---: | :---: |
| 1 Minute | ~10.5 MB | ~2.4 MB | ~1.4 MB |
| 5 Minutes | ~52.5 MB | ~12.0 MB | ~7.2 MB |
| 30 Minutes | ~315.0 MB | ~72.0 MB | ~43.2 MB |
| 60 Minutes | ~630.0 MB | ~144.0 MB | ~86.4 MB |

### Summary Recommendation

- For **quick sharing, podcasts, or music listening on phones**: Choose **MP3 at 320kbps**.
- For **further video editing in Premiere Pro, DaVinci Resolve, or Audacity**: Always choose **WAV**.
`
  },
  {
    id: 'default_post_2',
    title: 'How to Extract Audio from Video 100% Offline in Your Browser',
    slug: 'how-to-extract-audio-from-video-offline',
    excerpt: 'Learn how WebAssembly and client-side FFmpeg allow you to extract audio from huge MP4 files without uploading a single byte to cloud servers.',
    authorEmail: 'editorial@vidtoaudio.com',
    createdAt: new Date('2026-03-10'),
    updatedAt: new Date('2026-03-10'),
    published: true,
    translations: {
      es: {
        title: 'Cómo extraer audio de vídeo 100% offline en tu navegador',
        excerpt: 'Descubre cómo WebAssembly y FFmpeg en el cliente te permiten extraer audio de archivos MP4 gigantes sin subir ningún byte a servidores externos.',
        content: `Los conversores en línea convencionales exigen subir tus grabaciones confidenciales a servidores en la nube. VidToAudio adopta una arquitectura moderna basada en **WebAssembly (WASM)**.

### Conversores en la nube tradicionales frente a VidToAudio local

| Característica de Seguridad y Rendimiento | Conversores en la Nube Tradicionales | VidToAudio con WASM Local |
| :--- | :---: | :---: |
| **Privacidad y Seguridad** | Vídeo subido a un servidor externo | Cero subidas; 100% en sandbox del navegador |
| **Límite de Tamaño** | Límites estrictos (frecuentemente 50MB - 100MB gratis) | Prácticamente ilimitado (GBs procesados en memoria local) |
| **Tiempos de Espera** | Lentos (restringidos por la velocidad de subida) | Acceso instantáneo a archivos locales (cero subida) |
| **Interrupciones del Servidor** | Falla cuando los servidores colapsan | Funciona incluso sin conexión activa a internet |
| **Velocidad de Procesamiento** | En cola detrás de otros usuarios | Aceleración por hardware directa en tu CPU |

### Cómo funciona entre bastidores

Cuando arrastras un archivo MP4, MOV o MKV a VidToAudio:

1. **Sistema de Archivos Virtual (MEMFS)**: El vídeo se asigna a un sistema de archivos en memoria seguro y aislado.
2. **Canalización WebAssembly**: Binarios compilados de FFmpeg ejecutan la demultiplexación y decodificación de audio en Web Workers en paralelo.
3. **Descarga de Flujo Blob**: El flujo de audio resultante se convierte en una URL Blob nativa del navegador para su descarga local instantánea.

> "Tu vídeo nunca viaja por internet público. Las entrevistas sensibles, vídeos familiares privados y grabaciones corporativas confidenciales permanecen completamente protegidos en tu equipo."
`
      },
      fr: {
        title: 'Comment extraire l\'audio d\'une vidéo 100% hors-ligne dans votre navigateur',
        excerpt: 'Découvrez comment WebAssembly et FFmpeg côté client vous permettent d\'extraire l\'audio de volumineux fichiers MP4 sans envoyer le moindre octet sur le cloud.',
        content: `Les convertisseurs en ligne classiques exigent d'envoyer vos enregistrements vidéo confidentiels sur des serveurs cloud distants. VidToAudio adopte une approche architecturale moderne reposant sur **WebAssembly (WASM)**.

### Convertisseurs cloud classiques vs VidToAudio en local

| Fonctionnalité de Sécurité & Vitesse | Convertisseurs Cloud Traditionnels | VidToAudio Local WASM |
| :--- | :---: | :---: |
| **Confidentialité & Sécurité** | Vidéo transférée sur serveur tiers | Aucun transfert ; 100% exécuté dans le navigateur |
| **Limite de Taille** | Limites sévères (souvent 50 Mo - 100 Mo gratuits) | Quasiment illimité (Go traités via la mémoire locale) |
| **Temps d'Attente de Téléversement** | Lent (dépendant de votre débit montant) | Accès immédiat aux fichiers locaux (zéro upload) |
| **Pannes de Serveur** | Échec en cas de surcharge des serveurs tiers | Fonctionne même sans connexion internet active |
| **Vitesse d'Exécution** | Mis en file d'attente avec d'autres utilisateurs | Accélération matérielle directe sur votre processeur |

### Fonctionnement en coulisses

Lorsque vous glissez un fichier MP4, MOV ou MKV dans VidToAudio :

1. **Système de Fichiers Virtuel (MEMFS)** : La vidéo est mappée dans un système de fichiers en mémoire sécurisé et sandboxé.
2. **Pipeline WebAssembly** : Des binaires compilés de FFmpeg exécutent le démultiplexage et le décodage audio dans des Web Workers en parallèle.
3. **Téléchargement Flux Blob** : Le flux audio produit est converti en URL Blob native pour un téléchargement local immédiat.

> "Votre vidéo ne transite jamais sur l'internet public. Vos interviews sensibles, vos vidéos personnelles et vos enregistrements d'entreprise restent totalement protégés sur votre machine."
`
      }
    },
    title_es: 'Cómo extraer audio de vídeo 100% offline en tu navegador',
    excerpt_es: 'Descubre cómo WebAssembly y FFmpeg en el cliente te permiten extraer audio de archivos MP4 gigantes sin subir ningún byte a servidores externos.',
    title_fr: 'Comment extraire l\'audio d\'une vidéo 100% hors-ligne dans votre navigateur',
    excerpt_fr: 'Découvrez comment WebAssembly et FFmpeg côté client vous permettent d\'extraire l\'audio de volumineux fichiers MP4 sans envoyer le moindre octet sur le cloud.',
    content: `Traditional online converters require uploading your confidential video footage to third-party cloud servers. VidToAudio takes a fundamentally modern architectural approach using **WebAssembly (WASM)**.

### Traditional Cloud Converters vs. On-Device VidToAudio

| Security & Performance Feature | Traditional Cloud Converters | VidToAudio On-Device WASM |
| :--- | :---: | :---: |
| **Privacy & Security** | Video uploaded to external server | Zero uploads; 100% runs inside browser sandbox |
| **File Size Limit** | Strict limits (often 50MB - 100MB free) | Virtually unlimited (GBs handled via local memory) |
| **Upload Wait Times** | Slow (limited by home internet upload speed) | Instant local file access (zero upload time) |
| **Server Outages** | Fails when third-party servers crash | Works even offline without active internet connection |
| **Processing Speed** | Queued behind other users | Direct hardware acceleration on your CPU |

### How It Works Behind the Scenes

When you drop an MP4, MOV, or MKV file into VidToAudio:

1. **Virtual Filesystem (MEMFS)**: The video file is mapped into a secure, sandboxed in-memory filesystem.
2. **WebAssembly Pipeline**: Compiled FFmpeg binaries execute demuxing and audio decoding in parallel Web Workers.
3. **Blob Stream Download**: The resulting audio stream is converted into a native browser Blob URL for instant local download.

> "Your video never traverses the public internet. Sensitive interviews, private family videos, and confidential corporate footage remain completely secure on your machine."
`
  },
  {
    id: 'default_post_3',
    title: 'Lossless Audio Extraction Explained: Bit-for-Bit Stream Copy',
    slug: 'lossless-audio-extraction-explained',
    excerpt: 'Demystifying direct stream copying vs re-encoding when converting video files to audio.',
    authorEmail: 'editorial@vidtoaudio.com',
    createdAt: new Date('2026-03-05'),
    updatedAt: new Date('2026-03-05'),
    published: true,
    translations: {
      es: {
        title: 'Extracción de audio sin pérdida explicada: Copia directa de flujo bit a bit',
        excerpt: 'Explicación de la copia directa de flujo frente a la recodificación al convertir archivos de vídeo a audio.',
        content: `Al extraer audio de formatos contenedores modernos como MP4 o MKV, muchos usuarios piensan erróneamente que todas las conversiones recodifican el audio.

### Métodos de extracción de audio comparados

| Método de Extracción | Uso de CPU | Velocidad de Conversión | Recompresión de Audio | Pérdida de Calidad Original |
| :--- | :---: | :---: | :---: | :---: |
| **Demultiplexado Directo** | Mínimo (<5%) | Instantáneo (<1s) | No | 0% (Bit a bit idéntico) |
| **Transcodificación PCM (WAV)** | Bajo (10-20%) | Rápido (2-5s) | Decodifica a audio raw | 0% (Expansión sin pérdida) |
| **Recodificación con Pérdida (MP3)** | Moderado (40-60%) | Normal (5-15s) | Codifica mediante LAME | Reducción psicoacústica leve |

Para obtener la máxima velocidad y fidelidad, elige el formato de salida que mejor se adapte a tu flujo de trabajo.
`
      },
      fr: {
        title: 'Extraction audio sans perte expliquée : Copie de flux bit à bit',
        excerpt: 'Démystifier la copie de flux directe par rapport au ré-encodage lors de la conversion de fichiers vidéo en audio.',
        content: `Lors de l'extraction audio à partir de conteneurs modernes tels que MP4 ou MKV, de nombreux utilisateurs pensent à tort que toutes les conversions ré-encodent l'audio.

### Méthodes d'extraction audio comparées

| Méthode d'Extraction | Utilisation CPU | Vitesse de Conversion | Recompression Audio | Perte de Qualité Originale |
| :--- | :---: | :---: | :---: | :---: |
| **Démultiplexage Direct** | Minimal (<5%) | Instantané (<1s) | Non | 0% (Bit à bit identique) |
| **Transcodage PCM (WAV)** | Faible (10-20%) | Rapide (2-5s) | Décode en audio brut | 0% (Décompression sans perte) |
| **Ré-encodage avec Perte (MP3)** | Modéré (40-60%) | Normal (5-15s) | Encode via LAME | Légère réduction psychoacoustique |

Pour une vitesse et une fidélité maximales, sélectionnez le format de sortie le mieux adapté à vos besoins !
`
      }
    },
    title_es: 'Extracción de audio sin pérdida explicada: Copia directa de flujo bit a bit',
    excerpt_es: 'Explicación de la copia directa de flujo frente a la recodificación al convertir archivos de vídeo a audio.',
    title_fr: 'Extraction audio sans perte expliquée : Copie de flux bit à bit',
    excerpt_fr: 'Démystifier la copie de flux directe par rapport au ré-encodage lors de la conversion de fichiers vidéo en audio.',
    content: `When extracting audio from modern container formats like MP4 or MKV, many users mistakenly believe all conversions re-encode the audio. 

### Audio Extraction Methods Compared

| Extraction Method | CPU Usage | Conversion Speed | Audio Re-compression | Original Quality Loss |
| :--- | :---: | :---: | :---: | :---: |
| **Direct Stream Demux** | Minimal (<5%) | Instantaneous (<1s) | No | 0% (Bit-for-bit identical) |
| **PCM Transcode (WAV)** | Low (10-20%) | Fast (2-5s) | Decodes to raw audio | 0% (Lossless expansion) |
| **Lossy Re-encode (MP3)** | Moderate (40-60%) | Normal (5-15s) | Encodes via LAME | Minor psychoacoustic reduction |

For maximum speed and fidelity, select the output format that best matches your target workflow!
`
  }
];

// --- Blog Posts Management (Cloud Firestore) ---
export async function fetchAllBlogs(): Promise<BlogPost[]> {
  if (!hasFirebaseConfig) return [...DEFAULT_BLOG_POSTS];
  try {
    const blogsCol = collection(db, 'blogs');
    const q = query(blogsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const posts: BlogPost[] = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || 'Untitled Post',
          slug: data.slug || d.id,
          content: data.content || '',
          excerpt: data.excerpt || '',
          authorEmail: data.authorEmail || 'Admin',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
          published: data.published !== false,
          translations: data.translations,
          title_es: data.title_es,
          excerpt_es: data.excerpt_es,
          content_es: data.content_es,
          title_fr: data.title_fr,
          excerpt_fr: data.excerpt_fr,
          content_fr: data.content_fr
        };
      });
      // Also merge any default posts not yet in Firestore
      for (const defPost of DEFAULT_BLOG_POSTS) {
        if (!posts.some(p => p.slug === defPost.slug)) {
          posts.push(defPost);
        }
      }
      return posts;
    }
  } catch (err: any) {
    if (err?.message?.includes('offline') || err?.code === 'unavailable') {
      console.warn('[Firestore] Blogs unavailable in offline mode, using defaults.');
    } else {
      console.warn('Failed to fetch blogs from Firestore:', err?.message || err);
    }
  }
  return [...DEFAULT_BLOG_POSTS];
}

export async function fetchBlogBySlug(slug: string): Promise<BlogPost | null> {
  const defaultMatch = DEFAULT_BLOG_POSTS.find(p => 
    p.slug === slug || 
    p.translations?.es?.slug === slug || 
    p.translations?.fr?.slug === slug
  );
  if (!hasFirebaseConfig) return defaultMatch || null;
  try {
    const blogsCol = collection(db, 'blogs');
    const q = query(blogsCol, where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const d = snapshot.docs[0];
      const data = d.data();
      return {
        id: d.id,
        title: data.title || 'Untitled',
        slug: data.slug || slug,
        content: data.content || '',
        excerpt: data.excerpt || '',
        authorEmail: data.authorEmail || 'Admin',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        published: data.published !== false,
        translations: data.translations,
        title_es: data.title_es,
        excerpt_es: data.excerpt_es,
        content_es: data.content_es,
        title_fr: data.title_fr,
        excerpt_fr: data.excerpt_fr,
        content_fr: data.content_fr
      };
    }
  } catch (err: any) {
    if (err?.message?.includes('offline') || err?.code === 'unavailable') {
      console.warn('[Firestore] Blog unavailable in offline mode.');
    } else {
      console.warn('Failed to fetch blog by slug from Firestore:', err?.message || err);
    }
  }
  return defaultMatch || null;
}

export async function saveBlogPost(post: Partial<BlogPost>): Promise<string> {
  const blogsCol = collection(db, 'blogs');
  const slug = (post.slug?.trim() || post.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'post').toLowerCase();
  const postData: any = {
    title: post.title?.trim() || 'Untitled Article',
    slug,
    content: post.content || '',
    excerpt: post.excerpt?.trim() || (post.content ? post.content.slice(0, 160).replace(/[#*`]/g, '') + '...' : ''),
    authorEmail: post.authorEmail || 'admin@vidtoaudio.com',
    updatedAt: serverTimestamp(),
    published: post.published !== false
  };

  if (post.translations) postData.translations = post.translations;
  if (post.title_es) postData.title_es = post.title_es;
  if (post.excerpt_es) postData.excerpt_es = post.excerpt_es;
  if (post.content_es) postData.content_es = post.content_es;
  if (post.title_fr) postData.title_fr = post.title_fr;
  if (post.excerpt_fr) postData.excerpt_fr = post.excerpt_fr;
  if (post.content_fr) postData.content_fr = post.content_fr;

  if (post.id) {
    const docRef = doc(db, 'blogs', post.id);
    await setDoc(docRef, postData, { merge: true });
    return post.id;
  } else {
    postData.createdAt = serverTimestamp();
    const newDocRef = doc(blogsCol);
    await setDoc(newDocRef, postData);
    return newDocRef.id;
  }
}

export async function deleteBlogPost(id: string): Promise<void> {
  const docRef = doc(db, 'blogs', id);
  await deleteDoc(docRef);
}
