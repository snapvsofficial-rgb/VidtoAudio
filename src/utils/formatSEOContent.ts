import { SupportedLanguage } from '../i18n';

interface FormatLocalizedText {
  fullName: string;
  category: string;
  description: string;
  typicalAudio: string;
  primaryUse: string;
}

interface FormatLocalizationBundle {
  en: FormatLocalizedText;
  es: FormatLocalizedText;
  fr: FormatLocalizedText;
}

const INPUT_FORMAT_DETAILS_I18N: Record<string, FormatLocalizationBundle> = {
  mp4: {
    en: {
      fullName: "MPEG-4 Part 14 (MP4)",
      category: "Universal Digital Video Container",
      description: "The MPEG-4 Part 14 container is the universal global standard for digital video distribution across smartphones, cameras, and streaming services. MP4 video files typically bundle high-definition video with AAC or MP3 audio tracks.",
      typicalAudio: "AAC-LC, HE-AAC, or MP3 stereo audio at 44.1 kHz / 48 kHz",
      primaryUse: "Everyday camera recordings, social media clips, video podcasts, and mobile screen captures"
    },
    es: {
      fullName: "MPEG-4 Parte 14 (MP4)",
      category: "Contenedor Universal de Vídeo Digital",
      description: "El contenedor MPEG-4 Parte 14 es el estándar global universal para la distribución de vídeo digital en smartphones, cámaras y plataformas de streaming. Los archivos MP4 suelen integrar vídeo de alta definición con pistas de audio AAC o MP3.",
      typicalAudio: "Audio estéreo AAC-LC, HE-AAC o MP3 a 44.1 kHz / 48 kHz",
      primaryUse: "Grabaciones de cámara, clips para redes sociales, podcasts de vídeo y capturas de pantalla móviles"
    },
    fr: {
      fullName: "MPEG-4 Partie 14 (MP4)",
      category: "Conteneur Vidéo Numérique Universel",
      description: "Le conteneur MPEG-4 Partie 14 représente la norme mondiale absolue pour la diffusion vidéo sur smartphones, caméras et services de streaming. Les fichiers MP4 intègrent généralement de la vidéo haute définition avec des pistes audio AAC ou MP3.",
      typicalAudio: "Audio stéréo AAC-LC, HE-AAC ou MP3 à 44.1 kHz / 48 kHz",
      primaryUse: "Enregistrements vidéo du quotidien, réseaux sociaux, podcasts vidéo et captures d’écran mobiles"
    }
  },
  hevc: {
    en: {
      fullName: "High Efficiency Video Coding (HEVC / H.265)",
      category: "Next-Generation Ultra-HD Video Container",
      description: "High Efficiency Video Coding (H.265 / HEVC) delivers advanced video compression engineered for 4K and 8K ultra-high-definition recordings, action cameras (GoPro), drone footage (DJI), and modern iOS/Android smartphones. Extracting the underlying audio track eliminates heavy video decoding overhead.",
      typicalAudio: "High-bitrate AAC, AC3, or uncompressed Linear PCM",
      primaryUse: "4K action cameras, drone videography, cinematic smartphone video, and UHD broadcast footage"
    },
    es: {
      fullName: "Codificación de Vídeo de Alta Eficiencia (HEVC / H.265)",
      category: "Contenedor de Vídeo Ultra-HD de Próxima Generación",
      description: "HEVC (H.265) ofrece compresión avanzada diseñada para grabaciones 4K y 8K, cámaras de acción (GoPro), drones (DJI) y smartphones modernos. Extraer la pista de audio elimina la pesada carga de decodificación de vídeo.",
      typicalAudio: "AAC de alto bitrate, AC3 o PCM lineal sin comprimir",
      primaryUse: "Cámaras de acción 4K, tomas aéreas con drones, vídeo cinemático móvil y producciones UHD"
    },
    fr: {
      fullName: "High Efficiency Video Coding (HEVC / H.265)",
      category: "Conteneur Vidéo Ultra-HD Nouvelle Génération",
      description: "La norme HEVC (H.265) assure une compression poussée conçue pour les captures 4K et 8K, caméras d’action (GoPro), drones (DJI) et smartphones récents. Extraire la piste audio supprime la lourde charge de décodage graphique.",
      typicalAudio: "AAC à haut débit, AC3 ou PCM linéaire non compressé",
      primaryUse: "Caméras sportives 4K, prises de vue par drone, vidéos mobiles cinématiques et flux UHD"
    }
  },
  mkv: {
    en: {
      fullName: "Matroska Multimedia Container (MKV)",
      category: "Flexible Open-Source Media Container",
      description: "Matroska (MKV) is a versatile, open-standard container designed to hold an unlimited number of video, audio, picture, or subtitle tracks inside a single file. Frequently utilized where multi-channel surround sound or lossless audio stems are packaged together.",
      typicalAudio: "Multi-channel 5.1/7.1 AC3, DTS, FLAC, or Vorbis streams",
      primaryUse: "High-definition film archiving, multi-audio language broadcasts, and gameplay capture"
    },
    es: {
      fullName: "Contenedor Multimedia Matroska (MKV)",
      category: "Contenedor Multimedia Flexible y de Código Abierto",
      description: "Matroska (MKV) es un estándar abierto pensado para albergar pistas ilimitadas de vídeo, audio y subtítulos en un único archivo. Muy utilizado en películas y grabaciones con sonido envolvente multicanal o pistas de audio sin compresión.",
      typicalAudio: "Pistas multicanal 5.1/7.1 AC3, DTS, FLAC o Vorbis",
      primaryUse: "Archivo de películas en alta definición, emisiones multilingües y capturas de juegos"
    },
    fr: {
      fullName: "Conteneur Multimédia Matroska (MKV)",
      category: "Conteneur Média Polyvalent Open Source",
      description: "Matroska (MKV) est un conteneur ouvert conçu pour regrouper un nombre illimité de flux vidéo, audio, sous-titres et métadonnées. Très populaire pour stocker du son surround multicanal ou des pistes musicales pures sans perte.",
      typicalAudio: "Flux multicanaux 5.1/7.1 AC3, DTS, FLAC ou Vorbis",
      primaryUse: "Archivage de films HD, diffusions multilingues et enregistrements de gameplay"
    }
  },
  mov: {
    en: {
      fullName: "Apple QuickTime Movie (MOV)",
      category: "Professional Apple Video Architecture",
      description: "The MOV container is Apple's proprietary multimedia architecture, serving as the native recording format for iPhones, iPads, Final Cut Pro, and professional ProRes cinema workflows. MOV files often embed pristine uncompressed audio.",
      typicalAudio: "Uncompressed 16-bit / 24-bit Linear PCM or studio AAC audio",
      primaryUse: "iPhone 4K HDR videos, Final Cut Pro editing projects, and DSLR camera production reels"
    },
    es: {
      fullName: "Película Apple QuickTime (MOV)",
      category: "Arquitectura Profesional de Vídeo de Apple",
      description: "El formato MOV es la arquitectura multimedia nativa de iPhones, iPads, Final Cut Pro y flujos ProRes. Los archivos MOV frecuentemente integran audio lineal de alta resolución sin comprimir.",
      typicalAudio: "PCM lineal sin compresión de 16 o 24 bits, o audio de estudio AAC",
      primaryUse: "Vídeos 4K HDR de iPhone, proyectos en Final Cut Pro y tomas de cámaras réflex digitales"
    },
    fr: {
      fullName: "Apple QuickTime Movie (MOV)",
      category: "Architecture Vidéo Professionnelle Apple",
      description: "Le format MOV est l’architecture multimédia d’Apple utilisée nativement par les iPhone, iPad, Final Cut Pro et les workflows ProRes cinéma. Les fichiers MOV intègrent souvent un son brut de qualité studio.",
      typicalAudio: "PCM linéaire non compressé 16/24 bits ou audio studio AAC",
      primaryUse: "Vidéos 4K HDR iPhone, montages Final Cut Pro et rushes caméras professionnelles"
    }
  },
  webm: {
    en: {
      fullName: "WebM Media Container (VP8 / VP9 / AV1)",
      category: "Open Royalty-Free HTML5 Web Media",
      description: "WebM is an open-source, royalty-free media container sponsored by Google, developed specifically for efficient HTML5 web video streaming with low-latency, high-fidelity audio streams.",
      typicalAudio: "Native Opus or Vorbis audio encoded at 48 kHz",
      primaryUse: "HTML5 browser video captures, YouTube streams, Discord screen shares, and web applications"
    },
    es: {
      fullName: "Contenedor Multimedia WebM (VP8 / VP9 / AV1)",
      category: "Vídeo Web HTML5 Abierto y Libre de Regalías",
      description: "WebM es un contenedor de código abierto respaldado por Google y optimizado para streaming web HTML5 con audio de baja latencia y alta fidelidad sonora.",
      typicalAudio: "Audio nativo Opus o Vorbis codificado a 48 kHz",
      primaryUse: "Capturas de navegador HTML5, transmisiones de YouTube, grabaciones en Discord y apps web"
    },
    fr: {
      fullName: "Conteneur Média WebM (VP8 / VP9 / AV1)",
      category: "Média Web HTML5 Libre de Droits",
      description: "WebM est un conteneur open source soutenu par Google, conçu pour la diffusion vidéo fluide en HTML5 avec un son haute fidélité à faible latence.",
      typicalAudio: "Audio natif Opus ou Vorbis échantillonné à 48 kHz",
      primaryUse: "Captures de navigateur web HTML5, flux YouTube, partages d’écran Discord et applications web"
    }
  },
  avi: {
    en: {
      fullName: "Audio Video Interleave (AVI)",
      category: "Classic Microsoft Multimedia Container",
      description: "Audio Video Interleave (AVI) is Microsoft's legacy multimedia container architecture. Widely used across digital camcorders, vehicle dashcams, and vintage video collections.",
      typicalAudio: "Uncompressed PCM, MP3, or AC3 audio tracks",
      primaryUse: "Legacy PC camcorder footage, automotive dashcam clips, and legacy media digitization"
    },
    es: {
      fullName: "Audio Video Interleave (AVI)",
      category: "Contenedor Multimedia Clásico de Microsoft",
      description: "Audio Video Interleave (AVI) es el contenedor histórico de Microsoft ampliamente utilizado en videocámaras digitales, cámaras de salpicadero de vehículos y colecciones multimedia clásicas.",
      typicalAudio: "Pistas de audio PCM sin comprimir, MP3 o AC3",
      primaryUse: "Grabaciones de videocámaras de PC, clips de dashcams de coches y digitalización de cintas"
    },
    fr: {
      fullName: "Audio Video Interleave (AVI)",
      category: "Conteneur Multimédia Historique Microsoft",
      description: "Audio Video Interleave (AVI) est le conteneur classique créé par Microsoft, largement répandu dans les caméscopes numériques, caméras embarquées de véhicules et archives vidéo.",
      typicalAudio: "Pistes audio PCM non compressées, MP3 ou AC3",
      primaryUse: "Rushes de caméscopes PC, caméras embarquées pour véhicules et numérisation d’archives"
    }
  },
  flv: {
    en: {
      fullName: "Adobe Flash Video (FLV)",
      category: "Archival Web & Streaming Video Container",
      description: "Adobe Flash Video (FLV) is a historic streaming media format that once powered the majority of online video sharing. Massive archives of interviews and gameplay footage remain stored in FLV containers.",
      typicalAudio: "MP3, AAC, or Nellymoser speech audio",
      primaryUse: "Archived live-stream broadcasts, legacy game capture, and web tutorial recordings"
    },
    es: {
      fullName: "Vídeo Adobe Flash (FLV)",
      category: "Contenedor Histórico de Streaming Web",
      description: "Adobe Flash Video (FLV) es el formato histórico de streaming web que impulsó los inicios de los vídeos en línea. Gran cantidad de grabaciones y tutoriales se conservan en archivos FLV.",
      typicalAudio: "Pistas de voz en MP3, AAC o Nellymoser",
      primaryUse: "Emisiones archivadas en directo, partidas clásicas de videojuegos y tutoriales web antiguos"
    },
    fr: {
      fullName: "Adobe Flash Video (FLV)",
      category: "Conteneur Vidéo Web & Streaming Historique",
      description: "Adobe Flash Video (FLV) est le format qui a dominé les débuts de la vidéo sur Internet. De nombreuses archives de conférences, gameplay et tutoriels restent conservées en FLV.",
      typicalAudio: "Pistes vocales MP3, AAC ou Nellymoser",
      primaryUse: "Diffusions de streams archivés, anciens gameplays et tutoriels web vintage"
    }
  },
  wmv: {
    en: {
      fullName: "Windows Media Video (WMV)",
      category: "Microsoft Windows Media Architecture",
      description: "Windows Media Video (WMV) is Microsoft's proprietary streaming container, standard across Windows Media Player and legacy PC enterprise software.",
      typicalAudio: "Windows Media Audio (WMA 9/10 Professional)",
      primaryUse: "Corporate video archives, Windows screen recordings, and legacy multimedia presentations"
    },
    es: {
      fullName: "Vídeo Windows Media (WMV)",
      category: "Arquitectura Windows Media de Microsoft",
      description: "Windows Media Video (WMV) es el contenedor propietario de Microsoft para Windows Media Player y software corporativo en ordenadores PC.",
      typicalAudio: "Windows Media Audio (WMA 9/10 Professional)",
      primaryUse: "Archivos corporativos de vídeo, grabaciones de pantalla en Windows y presentaciones"
    },
    fr: {
      fullName: "Windows Media Video (WMV)",
      category: "Architecture Windows Media de Microsoft",
      description: "Windows Media Video (WMV) est le conteneur propriétaire développé par Microsoft, standard historique du lecteur Windows Media et des environnements bureautiques PC.",
      typicalAudio: "Windows Media Audio (WMA 9/10 Professionnel)",
      primaryUse: "Archives vidéo d’entreprises, enregistrements d’écran sous Windows et diaporamas"
    }
  },
  m4v: {
    en: {
      fullName: "Apple iTunes Video Format (M4V)",
      category: "Apple Video Container with Metadata Support",
      description: "M4V is a specialized MPEG-4 video format developed by Apple, incorporating rich metadata tagging and clean stereo sound that can be cleanly extracted for portable listening.",
      typicalAudio: "Stereo AAC or Dolby Digital AC3 5.1 surround sound",
      primaryUse: "iMovie projects, Apple ecosystem video exports, and digital audio-visual tutorials"
    },
    es: {
      fullName: "Formato de Vídeo Apple iTunes (M4V)",
      category: "Contenedor de Vídeo Apple con Metadatos",
      description: "M4V es un formato de vídeo MPEG-4 desarrollado por Apple con soporte exhaustivo de metadatos y sonido estéreo limpio ideal para extraer pistas de audio portátiles.",
      typicalAudio: "AAC estéreo o sonido envolvente Dolby Digital AC3 5.1",
      primaryUse: "Proyectos en iMovie, exportaciones del ecosistema Apple y tutoriales audiovisuales"
    },
    fr: {
      fullName: "Format Vidéo Apple iTunes (M4V)",
      category: "Conteneur Vidéo Apple avec Métadonnées",
      description: "Le format M4V est une variante MPEG-4 conçue par Apple intégrant des métadonnées complètes et un son stéréo limpide idéal à extraire pour l’écoute nomade.",
      typicalAudio: "AAC stéréo ou surround Dolby Digital AC3 5.1",
      primaryUse: "Projets iMovie, exports de l’écosystème Apple et tutoriels audiovisuels"
    }
  }
};

const OUTPUT_FORMAT_DETAILS_I18N: Record<string, FormatLocalizationBundle> = {
  mp3: {
    en: {
      fullName: "MPEG-1 Audio Layer III (MP3)",
      category: "Universal Lossy Compressed Audio",
      description: "MP3 is the universal standard for digital audio, delivering unmatched playback compatibility with 100% of modern smartphones, automotive systems, and desktop operating systems.",
      typicalAudio: "Constant Bitrate (CBR) up to 320 kbps at 44.1 kHz / 48 kHz",
      primaryUse: "Portable music listening, podcast distribution, voice note archiving, and speech transcripts"
    },
    es: {
      fullName: "MPEG-1 Audio Layer III (MP3)",
      category: "Audio Comprimido Universal",
      description: "El formato MP3 es el estándar indiscutible del audio digital, ofreciendo compatibilidad total con el 100% de teléfonos móviles, sistemas de coche y ordenadores.",
      typicalAudio: "Bitrate constante (CBR) de hasta 320 kbps a 44.1 kHz / 48 kHz",
      primaryUse: "Reproducción de música portátil, podcasts, archivo de notas de voz y transcripciones"
    },
    fr: {
      fullName: "MPEG-1 Audio Layer III (MP3)",
      category: "Audio Numérique Compressé Universel",
      description: "Le MP3 est la norme absolue de l’audio grand public, garantissant une compatibilité native à 100% avec les smartphones, autoradios et ordinateurs.",
      typicalAudio: "Débit constant (CBR) jusqu’à 320 kbps à 44.1 kHz / 48 kHz",
      primaryUse: "Écoute nomade de musique, diffusion de podcasts, mémos vocaux et transcriptions"
    }
  },
  wav: {
    en: {
      fullName: "Waveform Audio File Format (WAV / PCM)",
      category: "Lossless Studio-Grade Linear PCM Audio",
      description: "WAV is the uncompressed studio standard for broadcast, music production, and professional DAWs, retaining mathematically perfect fidelity with zero compression artifacts.",
      typicalAudio: "Uncompressed 16-bit / 24-bit Linear PCM at up to 96 kHz",
      primaryUse: "DAW audio editing, studio mastering, broadcast production, and speech analysis"
    },
    es: {
      fullName: "Waveform Audio File Format (WAV / PCM)",
      category: "Audio PCM Lineal Sin Pérdidas de Calidad de Estudio",
      description: "WAV es el estándar de estudio sin compresión utilizado en producción musical y estaciones DAW, manteniendo una fidelidad matemática perfecta.",
      typicalAudio: "PCM lineal sin compresión de 16 o 24 bits hasta 96 kHz",
      primaryUse: "Edición en DAW, masterización en estudio, producción audiovisual y análisis acústico"
    },
    fr: {
      fullName: "Waveform Audio File Format (WAV / PCM)",
      category: "Audio Linéaire PCM Sans Perte Qualité Studio",
      description: "Le format WAV est la référence sans compression des studios et stations DAW professionnelles, garantissant une reproduction acoustique mathématiquement parfaite.",
      typicalAudio: "PCM linéaire non compressé 16/24 bits jusqu’à 96 kHz",
      primaryUse: "Montage audio DAW, mastering en studio, diffusion broadcast et analyse acoustique"
    }
  },
  aac: {
    en: {
      fullName: "Advanced Audio Coding (AAC)",
      category: "High-Efficiency Modern Compressed Audio",
      description: "AAC delivers superior acoustic fidelity compared to legacy MP3 at equivalent bitrates, serving as the default codec across Apple platforms, YouTube, and digital streaming.",
      typicalAudio: "AAC-LC at 128 kbps to 320 kbps",
      primaryUse: "Streaming distribution, mobile phone ringtones, and Apple Music playback"
    },
    es: {
      fullName: "Codificación de Audio Avanzada (AAC)",
      category: "Audio Comprimido Moderno de Alta Eficiencia",
      description: "AAC ofrece una fidelidad sonora superior al MP3 tradicional a igual bitrate, siendo el códec predeterminado en Apple, YouTube y plataformas de streaming.",
      typicalAudio: "AAC-LC de 128 kbps a 320 kbps",
      primaryUse: "Distribución en streaming, tonos de llamada y reproducción en el ecosistema Apple"
    },
    fr: {
      fullName: "Advanced Audio Coding (AAC)",
      category: "Audio Compressé Haute Efficacité",
      description: "L’AAC offre une clarté sonore supérieure au MP3 à débit équivalent. Il constitue le format standard d’Apple, de YouTube et des plateformes de streaming.",
      typicalAudio: "AAC-LC de 128 kbps à 320 kbps",
      primaryUse: "Streaming musical, sonneries mobiles et écoute dans l’écosystème Apple"
    }
  },
  flac: {
    en: {
      fullName: "Free Lossless Audio Codec (FLAC)",
      category: "Open-Source Lossless Compressed Audio",
      description: "FLAC achieves bit-perfect compression without discarding a single acoustic sample, reducing file sizes by ~50% while guaranteeing true master quality.",
      typicalAudio: "Lossless variable bitrate (VBR) up to 24-bit / 192 kHz",
      primaryUse: "Audiophile music collections, high-fidelity archiving, and studio sound effects"
    },
    es: {
      fullName: "Free Lossless Audio Codec (FLAC)",
      category: "Audio Sin Pérdidas de Código Abierto",
      description: "FLAC comprime el audio sin descartar ni una sola muestra acústica, reduciendo el tamaño a la mitad con calidad idéntica al máster de estudio.",
      typicalAudio: "Bitrate variable sin pérdidas (VBR) hasta 24 bits / 192 kHz",
      primaryUse: "Bibliotecas de música para audiófilos, archivado de alta fidelidad y efectos de sonido"
    },
    fr: {
      fullName: "Free Lossless Audio Codec (FLAC)",
      category: "Audio Sans Perte Open Source",
      description: "Le format FLAC compresse l’audio sans supprimer le moindre échantillon acoustique, réduisant la taille de moitié tout en garantissant la qualité master studio.",
      typicalAudio: "Débit variable sans perte (VBR) jusqu’à 24 bits / 192 kHz",
      primaryUse: "Discothèques audiophiles, archivage patrimonial et banques d’effets sonores"
    }
  },
  ogg: {
    en: {
      fullName: "Ogg Vorbis Audio (OGG)",
      category: "Open Royalty-Free Compressed Audio",
      description: "OGG Vorbis provides excellent acoustic fidelity and efficient streaming, popular in game development, Spotify audio delivery, and open-source applications.",
      typicalAudio: "Vorbis VBR encoding at up to 320 kbps",
      primaryUse: "Video game sound assets, podcasting, and open-source media players"
    },
    es: {
      fullName: "Audio Ogg Vorbis (OGG)",
      category: "Audio Comprimido Abierto y Libre de Patentes",
      description: "OGG Vorbis destaca por su excelente compresión y fidelidad sonora, siendo ampliamente empleado en desarrollo de videojuegos y streaming en Spotify.",
      typicalAudio: "Codificación Vorbis VBR de hasta 320 kbps",
      primaryUse: "Efectos para videojuegos, podcasts y reproductores de código abierto"
    },
    fr: {
      fullName: "Audio Ogg Vorbis (OGG)",
      category: "Audio Numérique Libre de Droits",
      description: "Le format OGG Vorbis offre une excellente fidélité acoustique, particulièrement réputé dans le développement de jeux vidéo et la diffusion Spotify.",
      typicalAudio: "Encodage Vorbis VBR jusqu’à 320 kbps",
      primaryUse: "Sons de jeux vidéo, podcasts et lecteurs multimédias open source"
    }
  },
  m4a: {
    en: {
      fullName: "MPEG-4 Audio (M4A)",
      category: "Apple Standard Audio Container",
      description: "M4A packages high-fidelity AAC or Apple Lossless (ALAC) audio with comprehensive metadata tags for cover art, artist names, and chapter markers.",
      typicalAudio: "AAC or ALAC encoded audio at up to 320 kbps",
      primaryUse: "Voice memos, audiobook playback, iTunes audio, and portable Apple devices"
    },
    es: {
      fullName: "Audio MPEG-4 (M4A)",
      category: "Contenedor de Audio Estándar de Apple",
      description: "M4A almacena audio AAC de alta calidad o ALAC sin pérdidas con soporte completo de carátulas, artistas y marcadores de capítulos.",
      typicalAudio: "Audio codificado en AAC o ALAC de hasta 320 kbps",
      primaryUse: "Notas de voz, audiolibros, descargas de iTunes y dispositivos Apple"
    },
    fr: {
      fullName: "Audio MPEG-4 (M4A)",
      category: "Conteneur Audio Standard Apple",
      description: "Le format M4A encapsule de l’audio AAC haute fidélité ou ALAC sans perte avec une prise en charge complète des jaquettes, artistes et chapitres.",
      typicalAudio: "Audio encodé en AAC ou ALAC jusqu’à 320 kbps",
      primaryUse: "Mémos vocaux, livres audio, bibliothèque iTunes et appareils Apple"
    }
  },
  wma: {
    en: {
      fullName: "Windows Media Audio (WMA)",
      category: "Microsoft Windows Proprietary Audio",
      description: "WMA is Microsoft's audio compression standard designed for seamless integration with Windows Media Player and legacy enterprise audio workflows.",
      typicalAudio: "WMA 9/10 Professional encoding",
      primaryUse: "Legacy Windows audio playback, office dictations, and PC media archives"
    },
    es: {
      fullName: "Windows Media Audio (WMA)",
      category: "Audio Propietario de Microsoft Windows",
      description: "WMA es el formato de compresión de Microsoft concebido para integrarse a la perfección con Windows Media Player y sistemas corporativos de PC.",
      typicalAudio: "Codificación WMA 9/10 Professional",
      primaryUse: "Reproducción en Windows, dictados profesionales y archivos informáticos antiguos"
    },
    fr: {
      fullName: "Windows Media Audio (WMA)",
      category: "Audio Propriétaire Microsoft Windows",
      description: "Le format WMA est la solution de compression audio de Microsoft, optimisée pour le lecteur Windows Media et les environnements d’entreprise sur PC.",
      typicalAudio: "Encodage WMA 9/10 Professionnel",
      primaryUse: "Lecture sur Windows, dictées vocales professionnelles et archives PC"
    }
  },
  opus: {
    en: {
      fullName: "Opus Interactive Audio Codec (OPUS)",
      category: "Next-Generation Low-Latency Audio Codec",
      description: "Opus is a modern IETF open standard delivering class-leading audio fidelity from ultra-low bitrates up to transparent studio audio with sub-10ms latency.",
      typicalAudio: "Opus VBR from 32 kbps to 510 kbps at 48 kHz",
      primaryUse: "VoIP communications, Discord voice chats, web calls, and mobile messaging audio"
    },
    es: {
      fullName: "Códec de Audio Interactivo Opus (OPUS)",
      category: "Códec de Audio de Baja Latencia de Próxima Generación",
      description: "Opus es el estándar abierto del IETF que logra la mejor calidad acústica tanto en bitrates ultra bajos como en audio transparente de estudio con latencia mínima.",
      typicalAudio: "Opus VBR de 32 kbps a 510 kbps a 48 kHz",
      primaryUse: "Llamadas VoIP, chat de voz en Discord, videollamadas web y notas de audio en mensajería"
    },
    fr: {
      fullName: "Codec Audio Interactif Opus (OPUS)",
      category: "Codec Audio Basse Latence Nouvelle Génération",
      description: "Opus est le standard ouvert de l’IETF offrant la meilleure qualité sonore du marché, des débits ultra faibles jusqu’à la fidélité transparente studio avec une latence quasi nulle.",
      typicalAudio: "Opus VBR de 32 kbps à 510 kbps à 48 kHz",
      primaryUse: "Communications VoIP, serveurs vocaux Discord, visioconférences et messageries mobiles"
    }
  },
  aiff: {
    en: {
      fullName: "Audio Interchange File Format (AIFF)",
      category: "Uncompressed Apple Studio PCM Audio",
      description: "AIFF is Apple's uncompressed audio standard, matching WAV in pristine PCM quality while including robust support for metadata tagging across macOS audio tools.",
      typicalAudio: "Uncompressed 16-bit / 24-bit Linear PCM up to 192 kHz",
      primaryUse: "Logic Pro X music production, macOS audio mastering, and broadcast sound design"
    },
    es: {
      fullName: "Audio Interchange File Format (AIFF)",
      category: "Audio PCM Sin Compresión de Estudio Apple",
      description: "AIFF es el estándar sin compresión de Apple, equiparable a WAV en pureza PCM pero con compatibilidad nativa de metadatos en software musical de macOS.",
      typicalAudio: "PCM lineal sin compresión de 16 o 24 bits hasta 192 kHz",
      primaryUse: "Producción musical en Logic Pro X, masterización en macOS y diseño sonoro"
    },
    fr: {
      fullName: "Audio Interchange File Format (AIFF)",
      category: "Audio Studio PCM Non Compressé Apple",
      description: "L’AIFF est le format sans compression développé par Apple, équivalent au WAV en pureté acoustique tout en intégrant des métadonnées complètes sous macOS.",
      typicalAudio: "PCM linéaire non compressé 16/24 bits jusqu’à 192 kHz",
      primaryUse: "Production musicale sous Logic Pro X, mastering sur macOS et sound design"
    }
  }
};

/**
 * Returns localized format technical article (~200 words)
 */
export function generateFormatArticle(inExt: string, outExt: string, lang: SupportedLanguage = 'en'): string {
  const normIn = inExt.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normOut = outExt.toLowerCase().replace(/[^a-z0-9]/g, '');

  const inBundle = INPUT_FORMAT_DETAILS_I18N[normIn] || {
    en: { fullName: `${normIn.toUpperCase()} Video`, category: "Digital Video Container", description: `The ${normIn.toUpperCase()} video format packages visual frames with audio.`, typicalAudio: "Standard audio", primaryUse: "General video playback" },
    es: { fullName: `Vídeo ${normIn.toUpperCase()}`, category: "Contenedor de Vídeo Digital", description: `El formato ${normIn.toUpperCase()} integra fotogramas visuales con audio.`, typicalAudio: "Audio estándar", primaryUse: "Reproducción de vídeo general" },
    fr: { fullName: `Vidéo ${normIn.toUpperCase()}`, category: "Conteneur Vidéo Numérique", description: `Le format ${normIn.toUpperCase()} regroupe des images et de l'audio.`, typicalAudio: "Audio standard", primaryUse: "Lecture vidéo générale" }
  };

  const outBundle = OUTPUT_FORMAT_DETAILS_I18N[normOut] || {
    en: { fullName: `${normOut.toUpperCase()} Audio`, category: "Digital Audio Format", description: `The ${normOut.toUpperCase()} format is optimized for audio playback.`, typicalAudio: "Digital audio", primaryUse: "Music listening" },
    es: { fullName: `Audio ${normOut.toUpperCase()}`, category: "Formato de Audio Digital", description: `El formato ${normOut.toUpperCase()} está optimizado para reproducción sonora.`, typicalAudio: "Audio digital", primaryUse: "Escucha musical" },
    fr: { fullName: `Audio ${normOut.toUpperCase()}`, category: "Format Audio Numérique", description: `Le format ${normOut.toUpperCase()} est optimisé pour l'écoute sonore.`, typicalAudio: "Audio numérique", primaryUse: "Écoute musicale" }
  };

  const inDetails = inBundle[lang] || inBundle.en;
  const outDetails = outBundle[lang] || outBundle.en;

  const inUpper = normIn.toUpperCase();
  const outUpper = normOut.toUpperCase();
  const isLossless = ['wav', 'flac', 'aiff'].includes(normOut);

  if (lang === 'es') {
    const audioFidelityNote = isLossless
      ? `Dado que ${outUpper} es un estándar sin compresión, cada detalle acústico, reverberación armónica y frecuencia vocal de tu vídeo ${inUpper} se conserva con cero pérdidas de compresión.`
      : `Al exportar a ${outUpper} con hasta 320 kbps, logras un sonido de nivel de estudio con agudos cristalinos y graves profundos reduciendo el tamaño hasta un 90% comparado con el vídeo original.`;

    return `
      <div class="bg-dark-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden text-left">
        <div class="flex flex-wrap items-center gap-2 mb-4">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-950 text-brand-400 border border-brand-800/60">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            Especificación Técnica y Guía
          </span>
          <span class="text-xs text-slate-500 font-mono">Conversión de Audio de ${inUpper} a ${outUpper}</span>
        </div>

        <h2 class="text-xl sm:text-2xl font-bold text-white mb-4 tracking-tight">
          Cómo Extraer Audio ${outUpper} de Archivos de Vídeo ${inUpper} Sin Conexión
        </h2>

        <p class="text-slate-300 leading-relaxed text-sm sm:text-base mb-4">
          Convertir vídeo <strong class="text-white font-medium">${inDetails.fullName}</strong> en <strong class="text-white font-medium">${outDetails.fullName}</strong> es el método más eficiente para extraer pistas musicales, diálogos y voces sin cargar con gigabytes innecesarios de vídeo. ${inDetails.description} Al aislar el flujo de audio, obtienes un archivo sonoro ligero perfectamente adaptado para ${outDetails.primaryUse.toLowerCase()}.
        </p>

        <p class="text-slate-300 leading-relaxed text-sm sm:text-base mb-4">
          Elegir <strong class="text-brand-400 font-medium">${outUpper}</strong> como tu formato de destino ofrece claras ventajas. ${outDetails.description} ${audioFidelityNote} Ya sea para edición de podcast, escucha en el coche o transcripción de voz, ${outUpper} ofrece el balance ideal entre fidelidad y compatibilidad universal.
        </p>

        <p class="text-slate-300 leading-relaxed text-sm sm:text-base mb-6">
          A diferencia de los convertidores en la nube que te obligan a subir archivos privados de vídeo <strong class="text-slate-200 font-medium">${inUpper}</strong> a servidores remotos, VidToAudio funciona 100% de manera local en el procesador de tu dispositivo mediante FFmpeg WebAssembly. Tus archivos jamás abandonan tu navegador: cero consumo de datos móviles, cero tiempos de espera y privacidad garantizada.
        </p>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-slate-800/80 text-xs">
          <div class="bg-dark-800/60 p-3 rounded-xl border border-slate-800">
            <span class="text-slate-500 block text-[11px] uppercase tracking-wider mb-0.5">Contenedor Entrada</span>
            <span class="text-white font-semibold font-mono">${inUpper}</span>
            <span class="text-slate-400 block text-[11px] truncate mt-0.5">${inDetails.category}</span>
          </div>
          <div class="bg-dark-800/60 p-3 rounded-xl border border-slate-800">
            <span class="text-slate-500 block text-[11px] uppercase tracking-wider mb-0.5">Audio Destino</span>
            <span class="text-brand-400 font-semibold font-mono">${outUpper}</span>
            <span class="text-slate-400 block text-[11px] truncate mt-0.5">${isLossless ? 'PCM Sin Pérdida' : 'Hasta 320 kbps'}</span>
          </div>
          <div class="bg-dark-800/60 p-3 rounded-xl border border-slate-800">
            <span class="text-slate-500 block text-[11px] uppercase tracking-wider mb-0.5">Motor de Cómputo</span>
            <span class="text-white font-semibold font-mono">WebAssembly</span>
            <span class="text-slate-400 block text-[11px] truncate mt-0.5">100% en Navegador</span>
          </div>
          <div class="bg-dark-800/60 p-3 rounded-xl border border-slate-800">
            <span class="text-slate-500 block text-[11px] uppercase tracking-wider mb-0.5">Privacidad</span>
            <span class="text-emerald-400 font-semibold font-mono">Sin Subidas</span>
            <span class="text-slate-400 block text-[11px] truncate mt-0.5">CPU Local Únicamente</span>
          </div>
        </div>
      </div>
    `;
  }

  if (lang === 'fr') {
    const audioFidelityNote = isLossless
      ? `Puisque ${outUpper} est un format sans compression, chaque nuance acoustique, réverbération harmonique et dynamique vocale de votre vidéo ${inUpper} est restituée avec zéro perte de compression.`
      : `En exportant vers ${outUpper} jusqu'à 320 kbps, vous profitez d'une fidélité studio avec des aigus cristallins et des graves profonds tout en diminuant le poids du fichier jusqu'à 90% par rapport à la vidéo source.`;

    return `
      <div class="bg-dark-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden text-left">
        <div class="flex flex-wrap items-center gap-2 mb-4">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-950 text-brand-400 border border-brand-800/60">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            Spécification Technique et Guide
          </span>
          <span class="text-xs text-slate-500 font-mono">Conversion Audio de ${inUpper} vers ${outUpper}</span>
        </div>

        <h2 class="text-xl sm:text-2xl font-bold text-white mb-4 tracking-tight">
          Comment Extraire l’Audio ${outUpper} à Partir de Fichiers Vidéo ${inUpper} Hors Ligne
        </h2>

        <p class="text-slate-300 leading-relaxed text-sm sm:text-base mb-4">
          Convertir une vidéo <strong class="text-white font-medium">${inDetails.fullName}</strong> en <strong class="text-white font-medium">${outDetails.fullName}</strong> est la solution la plus performante pour isoler des musiques, dialogues ou voix-off sans conserver des gigaoctets vidéo encombrants. ${inDetails.description} L’extraction audio isole le contenu sonore dans un fichier léger idéalement calibré pour ${outDetails.primaryUse.toLowerCase()}.
        </p>

        <p class="text-slate-300 leading-relaxed text-sm sm:text-base mb-4">
          Sélectionner <strong class="text-brand-400 font-medium">${outUpper}</strong> comme format cible offre des atouts majeurs. ${outDetails.description} ${audioFidelityNote} Que vous prépariez un podcast, une écoute en voiture ou une transcription texte, ${outUpper} allie harmonieusement pureté acoustique et compatibilité d’écoute universelle.
        </p>

        <p class="text-slate-300 leading-relaxed text-sm sm:text-base mb-6">
          Contrairement aux services cloud qui vous forcent à transférer vos vidéos privées <strong class="text-slate-200 font-medium">${inUpper}</strong> vers des serveurs distants, VidToAudio opère à 100% sur le processeur de votre appareil via FFmpeg WebAssembly. Vos données ne quittent jamais votre navigateur : zéro consommation de données mobiles, réactivité immédiate et confidentialité absolue.
        </p>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-slate-800/80 text-xs">
          <div class="bg-dark-800/60 p-3 rounded-xl border border-slate-800">
            <span class="text-slate-500 block text-[11px] uppercase tracking-wider mb-0.5">Conteneur Vidéo</span>
            <span class="text-white font-semibold font-mono">${inUpper}</span>
            <span class="text-slate-400 block text-[11px] truncate mt-0.5">${inDetails.category}</span>
          </div>
          <div class="bg-dark-800/60 p-3 rounded-xl border border-slate-800">
            <span class="text-slate-500 block text-[11px] uppercase tracking-wider mb-0.5">Audio Cible</span>
            <span class="text-brand-400 font-semibold font-mono">${outUpper}</span>
            <span class="text-slate-400 block text-[11px] truncate mt-0.5">${isLossless ? 'PCM Sans Perte' : 'Jusqu’à 320 kbps'}</span>
          </div>
          <div class="bg-dark-800/60 p-3 rounded-xl border border-slate-800">
            <span class="text-slate-500 block text-[11px] uppercase tracking-wider mb-0.5">Moteur de Traitement</span>
            <span class="text-white font-semibold font-mono">WebAssembly</span>
            <span class="text-slate-400 block text-[11px] truncate mt-0.5">100% Côté Navigateur</span>
          </div>
          <div class="bg-dark-800/60 p-3 rounded-xl border border-slate-800">
            <span class="text-slate-500 block text-[11px] uppercase tracking-wider mb-0.5">Confidentialité</span>
            <span class="text-emerald-400 font-semibold font-mono">Zéro Upload</span>
            <span class="text-slate-400 block text-[11px] truncate mt-0.5">Calcul Local Uniquement</span>
          </div>
        </div>
      </div>
    `;
  }

  // English fallback default
  const audioFidelityNote = isLossless
    ? `Because ${outUpper} is an uncompressed lossless format, every subtle acoustic detail, room reverberation, and frequency harmonic from your ${inUpper} video is preserved with zero compression loss.`
    : `By exporting to ${outUpper} at up to 320 kbps, you achieve studio-quality sound with crisp highs and deep bass while reducing file size by up to 90% compared to the source video.`;

  return `
    <div class="bg-dark-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden text-left">
      <div class="flex flex-wrap items-center gap-2 mb-4">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-950 text-brand-400 border border-brand-800/60">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          Technical Specification & Guide
        </span>
        <span class="text-xs text-slate-500 font-mono">${inUpper} to ${outUpper} Audio Conversion</span>
      </div>

      <h2 class="text-xl sm:text-2xl font-bold text-white mb-4 tracking-tight">
        How to Extract ${outUpper} Audio from ${inUpper} Video Files Offline
      </h2>

      <p class="text-slate-300 leading-relaxed text-sm sm:text-base mb-4">
        Converting <strong class="text-white font-medium">${inDetails.fullName}</strong> video into <strong class="text-white font-medium">${outDetails.fullName}</strong> is the most efficient method to extract sound tracks, speech dialogues, musical performances, or voiceovers without carrying gigabytes of video weight. ${inDetails.description} By extracting the audio stream, you isolate the acoustic content into a nimble audio file perfectly formatted for ${outDetails.primaryUse.toLowerCase()}.
      </p>

      <p class="text-slate-300 leading-relaxed text-sm sm:text-base mb-4">
        Choosing <strong class="text-brand-400 font-medium">${outUpper}</strong> as your export format provides distinct advantages. ${outDetails.description} ${audioFidelityNote} Whether you are preparing audio for podcast editing, car stereo listening, speech-to-text transcription, or DAW mastering, ${outUpper} delivers the perfect blend of fidelity and playback compatibility.
      </p>

      <p class="text-slate-300 leading-relaxed text-sm sm:text-base mb-6">
        Unlike cloud converter websites that force you to upload private <strong class="text-slate-200 font-medium">${inUpper}</strong> video files to remote servers, VidToAudio operates 100% locally on your device hardware using FFmpeg WebAssembly. Your media never leaves your browser sandbox. Conversions execute with zero network latency, zero mobile data consumption, and absolute privacy for your personal or commercial recordings.
      </p>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-slate-800/80 text-xs">
        <div class="bg-dark-800/60 p-3 rounded-xl border border-slate-800">
          <span class="text-slate-500 block text-[11px] uppercase tracking-wider mb-0.5">Input Container</span>
          <span class="text-white font-semibold font-mono">${inUpper}</span>
          <span class="text-slate-400 block text-[11px] truncate mt-0.5">${inDetails.category}</span>
        </div>
        <div class="bg-dark-800/60 p-3 rounded-xl border border-slate-800">
          <span class="text-slate-500 block text-[11px] uppercase tracking-wider mb-0.5">Target Audio</span>
          <span class="text-brand-400 font-semibold font-mono">${outUpper}</span>
          <span class="text-slate-400 block text-[11px] truncate mt-0.5">${isLossless ? 'Lossless PCM' : 'Up to 320 kbps'}</span>
        </div>
        <div class="bg-dark-800/60 p-3 rounded-xl border border-slate-800">
          <span class="text-slate-500 block text-[11px] uppercase tracking-wider mb-0.5">Processing Engine</span>
          <span class="text-white font-semibold font-mono">WebAssembly</span>
          <span class="text-slate-400 block text-[11px] truncate mt-0.5">100% Client-Side</span>
        </div>
        <div class="bg-dark-800/60 p-3 rounded-xl border border-slate-800">
          <span class="text-slate-500 block text-[11px] uppercase tracking-wider mb-0.5">Data Privacy</span>
          <span class="text-emerald-400 font-semibold font-mono">Zero Uploads</span>
          <span class="text-slate-400 block text-[11px] truncate mt-0.5">Device CPU Only</span>
        </div>
      </div>
    </div>
  `;
}

export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Generates dynamic, format-specific localized FAQs
 */
export function generateFormatFAQs(inExt: string, outExt: string, lang: SupportedLanguage = 'en'): FAQItem[] {
  const normIn = inExt.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normOut = outExt.toLowerCase().replace(/[^a-z0-9]/g, '');

  const inUpper = normIn.toUpperCase();
  const outUpper = normOut.toUpperCase();
  const isLossless = ['wav', 'flac', 'aiff'].includes(normOut);

  const inBundle = INPUT_FORMAT_DETAILS_I18N[normIn];
  const outBundle = OUTPUT_FORMAT_DETAILS_I18N[normOut];

  const inDetails = inBundle ? inBundle[lang] : { fullName: `${inUpper} Video`, primaryUse: "media playback" };
  const outDetails = outBundle ? outBundle[lang] : { fullName: `${outUpper} Audio`, primaryUse: "audio listening" };

  if (lang === 'es') {
    return [
      {
        question: `¿Extraer audio ${outUpper} de un archivo ${inUpper} reduce la calidad sonora?`,
        answer: isLossless
          ? `${outUpper} es un formato de audio sin compresión ni pérdidas. Al convertir ${inUpper} (${inDetails.fullName}) a ${outUpper}, nuestro motor en el navegador extrae el flujo de audio directamente a muestras de audio sin aplicar compresión con pérdida. Cada matiz armónico y detalle vocal original se preserva al 100%.`
          : `No se pierde calidad perceptible. Nuestro motor FFmpeg WebAssembly transcodifica el audio de tu archivo ${inUpper} a ${outUpper} (${outDetails.fullName}) con bitrates de alta fidelidad de hasta 320 kbps. Esto conserva agudos limpios y voces nítidas mientras reduce el tamaño del archivo hasta un 90% respecto al vídeo original.`
      },
      {
        question: `¿Cuánto espacio de almacenamiento ahorro al convertir vídeo ${inUpper} a audio ${outUpper}?`,
        answer: `Debido a que los vídeos ${inUpper} contienen fotogramas en alta definición o 4K, la imagen visual representa entre el 85% y el 95% del peso total. Al descartar la pista visual y conservar únicamente el audio ${outUpper}, un archivo de 500 MB se reduce habitualmente a entre 12 MB y 45 MB, liberando gran cantidad de espacio en tu dispositivo.`
      },
      {
        question: `¿Se sube mi vídeo ${inUpper} a algún servidor remoto durante la extracción?`,
        answer: `Jamás. A diferencia de las webs convencionales que transfieren tus vídeos privados a la nube, VidToAudio opera de forma 100% local en tu hardware con WebAssembly. Tus archivos ${inUpper} jamás salen de tu navegador, garantizando confidencialidad absoluta e incluso funcionamiento en Modo Avión.`
      },
      {
        question: `¿Puedo convertir varios archivos ${inUpper} a ${outUpper} en lote simultáneamente?`,
        answer: `Sí, VidToAudio incluye soporte nativo para conversiones en lote. Puedes arrastrar o elegir múltiples archivos ${inUpper} a la vez. Cada uno se procesa secuencialmente aprovechando la CPU de tu dispositivo, y puedes descargar todas las pistas ${outUpper} por separado o empaquetadas en un único archivo ZIP con un solo clic.`
      },
      {
        question: `¿En qué reproductores o dispositivos puedo escuchar el audio ${outUpper} resultante?`,
        answer: `${outUpper} está optimizado para ${outDetails.primaryUse.toLowerCase()}. Puedes reproducirlo inmediatamente en teléfonos Android, iPhone, ordenadores Windows o Mac, sistemas multimedia para automóviles, o importarlo en programas de edición de audio y vídeo sin necesidad de códecs adicionales.`
      }
    ];
  }

  if (lang === 'fr') {
    return [
      {
        question: `L'extraction de l'audio ${outUpper} depuis un fichier ${inUpper} dégrade-t-elle la qualité sonore ?`,
        answer: isLossless
          ? `${outUpper} est un standard audio sans aucune perte de compression. Lors de la conversion de ${inUpper} (${inDetails.fullName}) vers ${outUpper}, notre moteur local WebAssembly extrait directement le flux audio sous forme d'échantillons linéaires parfaits sans compression destructrice. Chaque détail acoustique et harmonique vocal d'origine est préservé à 100%.`
          : `Aucune perte acoustique perceptible n'a lieu. Notre moteur FFmpeg WebAssembly intégré au navigateur transcode l'audio de votre fichier ${inUpper} vers ${outUpper} (${outDetails.fullName}) à des débits haute fidélité allant jusqu'à 320 kbps. Vous conservez des aigus précis et des voix cristallines tout en réduisant le poids global du fichier jusqu'à 90%.`
      },
      {
        question: `Combien d'espace de stockage puis-je économiser en convertissant une vidéo ${inUpper} en audio ${outUpper} ?`,
        answer: `Comme les vidéos ${inUpper} embarquent des images haute définition ou 4K, les flux visuels représentent entre 85% et 95% du poids total. En éliminant le flux vidéo pour ne garder que la piste audio ${outUpper}, un fichier type de 500 Mo est réduit à environ 12 à 45 Mo en ${outUpper}, libérant une mémoire considérable sur votre smartphone ou ordinateur.`
      },
      {
        question: `Ma vidéo ${inUpper} est-elle transférée sur un serveur distant pendant l'extraction ?`,
        answer: `Absolument jamais. Contrairement aux convertisseurs en ligne ordinaires qui envoient vos vidéos privées sur des serveurs tiers, VidToAudio fonctionne à 100% en local grâce à WebAssembly. Vos médias ${inUpper} ne quittent jamais votre navigateur, vous assurant une confidentialité totale et la possibilité de convertir hors ligne ou en mode avion.`
      },
      {
        question: `Puis-je convertir plusieurs fichiers ${inUpper} vers ${outUpper} par lot en une seule fois ?`,
        answer: `Oui, VidToAudio gère nativement la conversion multiple par lots. Vous pouvez sélectionner ou glisser-déposer plusieurs fichiers ${inUpper} simultanément. Chaque fichier est traité séquentiellement avec le processeur de votre appareil, et vous pouvez télécharger tous les morceaux ${outUpper} un par un ou groupés dans un fichier ZIP en un clic.`
      },
      {
        question: `Quels appareils et logiciels peuvent lire le fichier audio ${outUpper} extrait ?`,
        answer: `${outUpper} est optimisé pour ${outDetails.primaryUse.toLowerCase()}. Vous pouvez le lire immédiatement sur iOS, Android, macOS, Windows, l'écouter sur votre autoradio ou l'importer dans vos logiciels de montage audio et vidéo sans nécessiter de codec particulier.`
      }
    ];
  }

  // English default
  return [
    {
      question: `Does extracting ${outUpper} from ${inUpper} reduce the audio quality?`,
      answer: isLossless
        ? `${outUpper} is an uncompressed lossless audio standard. When converting ${inUpper} (${inDetails.fullName}) to ${outUpper}, our on-device WebAssembly engine extracts the audio stream directly into bit-perfect Linear PCM or FLAC samples without applying lossy compression. Every acoustic nuance, vocal dynamic, and high frequency from your original recording is 100% mathematically preserved.`
        : `No discernible acoustic quality is lost. Our browser-based FFmpeg WebAssembly engine transcodes the audio from your ${inUpper} file into ${outUpper} (${outDetails.fullName}) at high-fidelity bitrates up to 320 kbps. This retains crisp highs, clear speech frequencies, and punchy dynamics while cutting overall file weight by up to 90% compared to the original video container.`
    },
    {
      question: `How much file size do I save converting ${inUpper} video to ${outUpper} audio?`,
      answer: `Because ${inUpper} videos pack high-definition or 4K visual frames, visual data constitutes 85% to 95% of the total file weight. By stripping the video stream and keeping only the ${outUpper} audio track, a typical 500 MB ${inUpper} file shrinks down to approximately 12 MB to 45 MB in ${outUpper}, freeing up immense phone and computer storage.`
    },
    {
      question: `Is my ${inUpper} video uploaded to any server during conversion?`,
      answer: `Never. Unlike conventional online converter websites that transmit your private videos to third-party cloud servers, VidToAudio operates 100% locally on your device hardware using WebAssembly. Your ${inUpper} media never leaves your browser sandbox, giving you complete data confidentiality and the ability to convert offline or in Airplane Mode.`
    },
    {
      question: `Can I batch convert multiple ${inUpper} files to ${outUpper} simultaneously?`,
      answer: `Yes, VidToAudio natively supports bulk and batch conversion. You can select or drag and drop multiple ${inUpper} files at once. Each file is queued and processed sequentially using your device's multi-core CPU, and you can download all extracted ${outUpper} tracks individually or bundled into a single ZIP file with one click.`
    },
    {
      question: `What devices and software can play the extracted ${outUpper} audio?`,
      answer: `${outUpper} is optimized for ${outDetails.primaryUse.toLowerCase()}. You can immediately play it in standard iOS, Android, macOS, and Windows media players, transfer it to car stereos, or import it into digital audio workstations (DAWs) and video editing suites without needing specialized codecs.`
    }
  ];
}

/**
 * Generates interactive, accessible accordion HTML for format-specific FAQs
 */
export function generateFormatFAQAccordionHTML(inExt: string, outExt: string, lang: SupportedLanguage = 'en'): string {
  const faqs = generateFormatFAQs(inExt, outExt, lang);

  return faqs.map((faq, index) => `
    <details class="group bg-dark-900 border border-slate-800 rounded-xl overflow-hidden transition-all duration-200 hover:border-slate-700 shadow-sm" ${index === 0 ? 'open' : ''}>
      <summary class="flex justify-between items-center p-5 sm:p-6 cursor-pointer select-none font-semibold text-white list-none">
        <span class="text-base sm:text-lg flex items-start sm:items-center gap-3 pr-2">
          <span class="w-6 h-6 rounded-full bg-brand-950 text-brand-400 border border-brand-800/80 flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 mt-0.5 sm:mt-0">
            ${index + 1}
          </span>
          <span class="text-slate-100 group-hover:text-brand-400 transition-colors">${faq.question}</span>
        </span>
        <span class="w-6 h-6 rounded-lg bg-dark-800 border border-slate-700 flex items-center justify-center flex-shrink-0 text-slate-400 group-open:rotate-180 group-open:text-brand-400 group-open:border-brand-800 transition-transform duration-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </span>
      </summary>
      <div class="px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-slate-300 leading-relaxed border-t border-slate-800/60 pt-4 bg-dark-950/40">
        ${faq.answer}
      </div>
    </details>
  `).join('');
}

/**
 * Generates Schema.org FAQPage structured data object for rich search snippets
 */
export function generateFormatFAQSchema(inExt: string, outExt: string, lang: SupportedLanguage = 'en'): object {
  const faqs = generateFormatFAQs(inExt, outExt, lang);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}
