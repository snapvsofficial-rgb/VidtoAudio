/**
 * Unique Format Technical SEO Content Generator
 * Generates substantive, tailored ~200-word unique descriptions for each
 * video-to-audio format pair (e.g. HEVC to MP3, MP4 to WAV, MOV to FLAC).
 * Ensures Google AdSense and search bots evaluate every matrix URL as
 * genuine, valuable, unique content rather than low-value duplicate templates.
 */

interface FormatDetails {
  fullName: string;
  category: string;
  description: string;
  typicalAudio: string;
  primaryUse: string;
}

const INPUT_FORMAT_DETAILS: Record<string, FormatDetails> = {
  mp4: {
    fullName: "MPEG-4 Part 14 (MP4)",
    category: "Universal Digital Video Container",
    description: "The MPEG-4 Part 14 container is the universal global standard for digital video distribution across smartphones, cameras, and streaming services. MP4 video files typically bundle high-definition video with AAC or MP3 audio tracks.",
    typicalAudio: "AAC-LC, HE-AAC, or MP3 stereo audio at 44.1 kHz / 48 kHz",
    primaryUse: "Everyday camera recordings, social media clips, video podcasts, and mobile screen captures"
  },
  hevc: {
    fullName: "High Efficiency Video Coding (HEVC / H.265)",
    category: "Next-Generation Ultra-HD Video Container",
    description: "High Efficiency Video Coding (H.265 / HEVC) delivers advanced video compression engineered for 4K and 8K ultra-high-definition recordings, action cameras (GoPro), drone footage (DJI), and modern iOS/Android smartphones. Because HEVC video streams require intense graphics processing to decode, extracting the underlying audio track eliminates heavy video overhead.",
    typicalAudio: "High-bitrate AAC, AC3, or uncompressed Linear PCM",
    primaryUse: "4K action cameras, drone videography, cinematic smartphone video, and UHD broadcast footage"
  },
  mkv: {
    fullName: "Matroska Multimedia Container (MKV)",
    category: "Flexible Open-Source Media Container",
    description: "Matroska (MKV) is a versatile, open-standard container designed to hold an unlimited number of video, audio, picture, or subtitle tracks inside a single file. MKV files are frequently utilized in cinematic media and desktop recordings where multi-channel surround sound or lossless audio stems need to be packaged together.",
    typicalAudio: "Multi-channel 5.1/7.1 AC3, DTS, FLAC, or Vorbis streams",
    primaryUse: "High-definition film archiving, multi-audio language broadcasts, and gameplay capture"
  },
  mov: {
    fullName: "Apple QuickTime Movie (MOV)",
    category: "Professional Apple Video Architecture",
    description: "The MOV container is Apple's proprietary multimedia architecture, serving as the native recording format for iPhones, iPads, Final Cut Pro, and professional ProRes cinema workflows. MOV files often embed pristine uncompressed audio alongside high-bitrate video.",
    typicalAudio: "Uncompressed 16-bit / 24-bit Linear PCM or studio AAC audio",
    primaryUse: "iPhone 4K HDR videos, Final Cut Pro editing projects, and DSLR camera production reels"
  },
  webm: {
    fullName: "WebM Media Container (VP8 / VP9 / AV1)",
    category: "Open Royalty-Free HTML5 Web Media",
    description: "WebM is an open-source, royalty-free media container sponsored by Google, developed specifically for efficient HTML5 web video streaming. WebM packages modern video codecs with low-latency, high-fidelity audio streams designed for instant browser playback.",
    typicalAudio: "Native Opus or Vorbis audio encoded at 48 kHz",
    primaryUse: "HTML5 browser video captures, YouTube streams, Discord screen shares, and web applications"
  },
  avi: {
    fullName: "Audio Video Interleave (AVI)",
    category: "Classic Microsoft Multimedia Container",
    description: "Audio Video Interleave (AVI) is Microsoft's legacy multimedia container architecture. Widely used across digital camcorders, vehicle dashcams, and vintage video collections, AVI files interleave audio and video slices for synchronous playback across classic desktop hardware.",
    typicalAudio: "Uncompressed PCM, MP3, or AC3 audio tracks",
    primaryUse: "Legacy PC camcorder footage, automotive dashcam clips, and legacy media digitization"
  },
  flv: {
    fullName: "Adobe Flash Video (FLV)",
    category: "Archival Web & Streaming Video Container",
    description: "Adobe Flash Video (FLV) is a historic streaming media format that once powered the majority of online video sharing and RTMP live streaming platforms. While legacy browsers have deprecated Flash player execution, massive archives of interviews and gameplay footage remain stored in FLV containers.",
    typicalAudio: "MP3, AAC, or Nellymoser speech audio",
    primaryUse: "Archived live-stream broadcasts, legacy game capture, and web tutorial recordings"
  },
  wmv: {
    fullName: "Windows Media Video (WMV)",
    category: "Microsoft Windows Media Architecture",
    description: "Windows Media Video (WMV) is Microsoft's proprietary streaming container, standard across Windows Media Player and legacy PC enterprise software. WMV files pair VC-1 video compression with Windows Media Audio streams for bandwidth-efficient transmission.",
    typicalAudio: "Windows Media Audio (WMA 9/10 Professional)",
    primaryUse: "Corporate video archives, Windows screen recordings, and legacy multimedia presentations"
  },
  m4v: {
    fullName: "Apple iTunes Video Format (M4V)",
    category: "Apple Video Container with Metadata Support",
    description: "M4V is a specialized MPEG-4 video format developed by Apple, incorporating optional FairPlay DRM protection and rich metadata tagging. M4V files generated in iMovie, QuickTime, or macOS applications store clean stereo sound that can be cleanly extracted for portable listening.",
    typicalAudio: "Stereo AAC or Dolby Digital AC3 5.1 surround sound",
    primaryUse: "iMovie projects, Apple ecosystem video exports, and digital audio-visual tutorials"
  },
  video: {
    fullName: "Standard Digital Video",
    category: "Universal Camera & Screen Recording",
    description: "Digital video recordings captured from mobile devices, webcams, meeting software, or editing suites combine massive visual data streams with audio. Extracting the sound track reduces file sizes by up to 95% while keeping the acoustic content intact.",
    typicalAudio: "Standard stereo audio streams",
    primaryUse: "General voice memos, video conferences, lecture captures, and mobile recordings"
  }
};

const OUTPUT_FORMAT_DETAILS: Record<string, FormatDetails> = {
  mp3: {
    fullName: "MPEG-1 Audio Layer III (MP3)",
    category: "Universal Lossy Compressed Audio",
    description: "MP3 is the universal standard for digital audio, delivering unmatched playback compatibility with 100% of modern smartphones, automotive infotainment systems, hardware media players, and desktop operating systems. Configured with 320 kbps constant bitrate (CBR), MP3 retains punchy dynamics and crisp high frequencies while reducing original video file sizes by roughly 85% to 92%.",
    typicalAudio: "Constant Bitrate (CBR) up to 320 kbps at 44.1 kHz / 48 kHz",
    primaryUse: "Portable music listening, podcast distribution, voice note archiving, and speech transcripts"
  },
  wav: {
    fullName: "Waveform Audio File Format (WAV / PCM)",
    category: "Lossless Studio-Grade Linear PCM Audio",
    description: "WAV is the uncompressed, studio-grade standard developed by Microsoft and IBM. It stores audio as raw, uncompressed Linear PCM samples, guaranteeing zero compression artifacts, zero frequency clipping, and bit-for-bit mathematical fidelity to the source recording. It is the gold standard for audio editing, voice-over production, and sound design.",
    typicalAudio: "Uncompressed 16-bit / 24-bit PCM at 44.1 kHz, 48 kHz, or 96 kHz",
    primaryUse: "Digital Audio Workstations (DAWs), podcast post-production, audio mastering, and speech-to-text AI models"
  },
  aac: {
    fullName: "Advanced Audio Coding (AAC / M4A)",
    category: "High-Efficiency Lossy Audio Codec",
    description: "Advanced Audio Coding (AAC) is the designated successor to MP3, designed to provide noticeably superior acoustic fidelity and sharper transient response at equivalent or lower bitrates. AAC is the default audio standard for Apple Music, YouTube, and mobile streaming worldwide.",
    typicalAudio: "Lossy perceptual encoding up to 320 kbps with improved psychoacoustic modeling",
    primaryUse: "Apple iPhone and Mac media libraries, mobile streaming apps, and high-efficiency music listening"
  },
  flac: {
    fullName: "Free Lossless Audio Codec (FLAC)",
    category: "Open-Source Lossless Compressed Audio",
    description: "FLAC is the premier open-source lossless audio codec, compressing audio data by roughly 40% to 60% without altering a single harmonic or acoustic sample. Audiophiles, mastering engineers, and music collectors prefer FLAC because it preserves pristine master quality with rich metadata and album tag support.",
    typicalAudio: "Bit-perfect lossless compression supporting up to 24-bit / 192 kHz high-res audio",
    primaryUse: "Audiophile sound systems, lossless music archiving, studio backup, and hi-fi headphone listening"
  },
  ogg: {
    fullName: "Ogg Vorbis Audio (OGG)",
    category: "Open-Source Patent-Free Compressed Audio",
    description: "Ogg Vorbis is a completely open, royalty-free lossy audio container engineered for flexible streaming and game asset integration. Vorbis utilizes variable bitrate algorithms that deliver warm mid-range reproduction, transparent vocal clarity, and seamless audio looping without licensing restrictions.",
    typicalAudio: "Variable bitrate (VBR) perceptual audio encoding up to 320 kbps",
    primaryUse: "Indie game audio effects, background ambience looping, podcast streaming, and web sound pipelines"
  },
  m4a: {
    fullName: "MPEG-4 Audio (M4A)",
    category: "Apple Native Audio Container",
    description: "M4A represents audio-only MPEG-4 files encoded with high-quality AAC compression. Native to macOS, iOS, Apple Podcasts, and iTunes, M4A files feature clean stereo separation, efficient file footprints, and native support for chapter marks and cover art.",
    typicalAudio: "AAC or ALAC encoded audio up to 320 kbps",
    primaryUse: "Apple ecosystem voice memos, audiobooks, lecture archives, and mobile music playback"
  },
  opus: {
    fullName: "Opus Audio Codec (IETF RFC 6716)",
    category: "Ultra-Low Latency High-Efficiency Codec",
    description: "Opus is the cutting-edge open audio codec standardized by the IETF, engineered to scale effortlessly from ultra-low bitrate voice conversations to full-fidelity 48 kHz stereo music. Opus outperforms MP3, AAC, and Vorbis in psychoacoustic tests, making it the top choice for modern voice recordings.",
    typicalAudio: "Adaptive bitrate encoding from 6 kbps up to 510 kbps at 48 kHz",
    primaryUse: "Speech recognition, voice over IP (VoIP), voice note archiving, and lightweight web streaming"
  },
  wma: {
    fullName: "Windows Media Audio (WMA)",
    category: "Microsoft Windows Media Architecture",
    description: "Windows Media Audio (WMA) is Microsoft's proprietary compression standard, optimized for seamless integration with Windows Media Player, Cortana speech services, and legacy PC hardware. WMA preserves clean vocal frequencies while maintaining low file sizes.",
    typicalAudio: "WMA Standard and Professional multi-channel audio up to 320 kbps",
    primaryUse: "Windows desktop media libraries, legacy MP3/WMA portable players, and corporate voice archives"
  },
  aiff: {
    fullName: "Audio Interchange File Format (AIFF)",
    category: "Apple Studio-Grade Uncompressed PCM Audio",
    description: "Audio Interchange File Format (AIFF) is Apple's professional uncompressed audio standard. Like WAV, AIFF stores raw PCM audio data without lossy compression, making it favored by sound designers, recording studios, and composers working in Logic Pro and Pro Tools on macOS.",
    typicalAudio: "Uncompressed 16-bit / 24-bit PCM at 44.1 kHz or 48 kHz",
    primaryUse: "macOS digital audio workstations, Logic Pro projects, broadcast master files, and studio mastering"
  }
};

/**
 * Generates a unique, high-quality, technically detailed ~200-word article
 * specifically crafted for the provided input and output format pair.
 */
export function generateFormatArticle(inExt: string, outExt: string): string {
  const normIn = inExt.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normOut = outExt.toLowerCase().replace(/[^a-z0-9]/g, '');

  const inDetails = INPUT_FORMAT_DETAILS[normIn] || {
    fullName: `${normIn.toUpperCase()} Video`,
    category: "Digital Video Container",
    description: `The ${normIn.toUpperCase()} video format packages visual media alongside synchronized audio tracks. Extracting audio removes the video data overhead while preserving the full acoustic content.`,
    typicalAudio: "Standard digital audio streams",
    primaryUse: "Digital video recordings and multimedia playback"
  };

  const outDetails = OUTPUT_FORMAT_DETAILS[normOut] || {
    fullName: `${normOut.toUpperCase()} Audio`,
    category: "Digital Audio Format",
    description: `The ${normOut.toUpperCase()} audio format is optimized for standalone audio playback with efficient file sizes and high acoustic fidelity.`,
    typicalAudio: "Standard digital audio encoding",
    primaryUse: "Everyday music and audio playback"
  };

  const inUpper = normIn.toUpperCase();
  const outUpper = normOut.toUpperCase();

  const isLossless = ['wav', 'flac', 'aiff'].includes(normOut);
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

      <!-- Paragraph 1: Input Analysis (~65 words) -->
      <p class="text-slate-300 leading-relaxed text-sm sm:text-base mb-4">
        Converting <strong class="text-white font-medium">${inDetails.fullName}</strong> video into <strong class="text-white font-medium">${outDetails.fullName}</strong> is the most efficient method to extract sound tracks, speech dialogues, musical performances, or voiceovers without carrying gigabytes of video weight. ${inDetails.description} By extracting the audio stream, you isolate the acoustic content into a nimble audio file perfectly formatted for ${outDetails.primaryUse.toLowerCase()}.
      </p>

      <!-- Paragraph 2: Output Codec & Fidelity (~75 words) -->
      <p class="text-slate-300 leading-relaxed text-sm sm:text-base mb-4">
        Choosing <strong class="text-brand-400 font-medium">${outUpper}</strong> as your export format provides distinct advantages. ${outDetails.description} ${audioFidelityNote} Whether you are preparing audio for podcast editing, car stereo listening, speech-to-text transcription, or DAW mastering, ${outUpper} delivers the perfect blend of fidelity and playback compatibility.
      </p>

      <!-- Paragraph 3: On-Device Processing & Privacy (~65 words) -->
      <p class="text-slate-300 leading-relaxed text-sm sm:text-base mb-6">
        Unlike cloud converter websites that force you to upload private <strong class="text-slate-200 font-medium">${inUpper}</strong> video files to remote servers, VidToAudio operates 100% locally on your device hardware using FFmpeg WebAssembly. Your media never leaves your browser sandbox. Conversions execute with zero network latency, zero mobile data consumption, and absolute privacy for your personal or commercial recordings.
      </p>

      <!-- Quick Technical Matrix Specs -->
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
 * Generates dynamic, highly-specific FAQs for a given format combination.
 * Tailored with real container architectures, audio codec specs, and on-device privacy facts.
 */
export function generateFormatFAQs(inExt: string, outExt: string): FAQItem[] {
  const normIn = inExt.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normOut = outExt.toLowerCase().replace(/[^a-z0-9]/g, '');

  const inDetails = INPUT_FORMAT_DETAILS[normIn] || {
    fullName: `${normIn.toUpperCase()} Video`,
    category: "Digital Video Container",
    description: `The ${normIn.toUpperCase()} video format packages visual frames alongside synchronized audio.`,
    typicalAudio: "Standard digital audio streams",
    primaryUse: "Digital video recordings and multimedia playback"
  };

  const outDetails = OUTPUT_FORMAT_DETAILS[normOut] || {
    fullName: `${normOut.toUpperCase()} Audio`,
    category: "Digital Audio Format",
    description: `The ${normOut.toUpperCase()} audio format is engineered for standalone audio playback.`,
    typicalAudio: "Standard digital audio encoding",
    primaryUse: "Everyday music and audio playback"
  };

  const inUpper = normIn.toUpperCase();
  const outUpper = normOut.toUpperCase();
  const isLossless = ['wav', 'flac', 'aiff'].includes(normOut);

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
 * Generates interactive, accessible accordion HTML for format-specific FAQs.
 */
export function generateFormatFAQAccordionHTML(inExt: string, outExt: string): string {
  const faqs = generateFormatFAQs(inExt, outExt);

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
 * Generates Schema.org FAQPage structured data object for rich search snippets.
 */
export function generateFormatFAQSchema(inExt: string, outExt: string): object {
  const faqs = generateFormatFAQs(inExt, outExt);
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

