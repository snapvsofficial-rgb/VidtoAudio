import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import { 
  Upload, 
  Music, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Archive, 
  RefreshCw, 
  Play, 
  Pause, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  HardDriveDownload 
} from 'lucide-react';

// Flexible Head component: Works seamlessly in Next.js (replace with 'next/head') or standard React SPA
function SEOHead() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is this bulk MP4 to MP3 converter really offline?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all processing happens locally in your browser to save data and ensure 100% privacy."
        }
      },
      {
        "@type": "Question",
        "name": "Is there a limit to batch conversion?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No limits! You can convert as many files as your device memory allows, completely free."
        }
      }
    ]
  };

  useEffect(() => {
    // 1. Update Document Title
    document.title = "Bulk MP4 to MP3 Converter (Offline, Batch & 320kbps) - Free";

    // 2. Helper to create or update meta tags
    const setMetaTag = (attr: string, key: string, content: string) => {
      let element = document.querySelector(`meta[${attr}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const description = "Batch convert multiple MP4 to MP3 files offline directly in your browser. Fastest bulk conversion, no server uploads required. Get 320kbps studio quality instantly.";
    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', "Bulk MP4 to MP3 Converter (Offline, Batch & 320kbps) - Free");
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', "Bulk MP4 to MP3 Converter (Offline, Batch & 320kbps) - Free");
    setMetaTag('name', 'twitter:description', description);

    // 3. Inject or update JSON-LD FAQ Schema
    const schemaId = 'faq-jsonld-schema';
    let scriptTag = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = schemaId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(faqSchema);
  }, []);

  return null;
}

export type AudioBitrate = '128k' | '192k' | '320k';

export interface ConvertedTrack {
  id: string;
  name: string;
  blob?: Blob;
  url?: string;
  size?: number;
  success: boolean;
  error?: string;
}

export default function BulkMP4ToMP3Converter() {
  const [files, setFiles] = useState<File[]>([]);
  const [bitrate, setBitrate] = useState<AudioBitrate>('320k');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [initStatusText, setInitStatusText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
  const [currentFileProgress, setCurrentFileProgress] = useState<number>(0);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [results, setResults] = useState<ConvertedTrack[]>([]);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      setFiles(selected);
      setResults([]);
      setIsComplete(false);
      setErrorMessage(null);
    }
  };

  // Helper to load FFmpeg via CDN if not present
  const loadFFmpegInstance = async (onStatus?: (msg: string) => void) => {
    const win = window as any;
    if (!win.FFmpegWASM) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load FFmpeg WebAssembly library. Please check your internet connection.'));
        document.head.appendChild(script);
      });
    }
    if (!win.FFmpegUtil) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load FFmpeg utility library. Please check your internet connection.'));
        document.head.appendChild(script);
      });
    }

    const { FFmpeg } = win.FFmpegWASM;
    const { toBlobURL } = win.FFmpegUtil;
    const ffmpeg = new FFmpeg();

    // Memory Management & Compatibility: Expose .FS interface
    if (!ffmpeg.FS) {
      ffmpeg.FS = async (action: string, ...args: any[]) => {
        if (action === 'unlink') return ffmpeg.deleteFile(args[0]);
        if (action === 'writeFile') return ffmpeg.writeFile(args[0], args[1]);
        if (action === 'readFile') return ffmpeg.readFile(args[0]);
      };
    }

    // Force single-threaded core (@ffmpeg/core) - strictly avoid @ffmpeg/core-mt
    // Prioritize local same-origin assets to guarantee 100% offline & fast loading,
    // followed by reliable public CDNs as fallbacks
    const cdnSources = [
      {
        name: 'local',
        coreURL: '/ffmpeg/ffmpeg-core.js',
        wasmURL: '/ffmpeg/ffmpeg-core.wasm',
      },
      {
        name: 'jsdelivr',
        coreURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
        wasmURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
      },
      {
        name: 'unpkg',
        coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
        wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
      },
    ];

    let loaded = false;
    let lastError: any = null;
    let ffmpegInstance: any = null;

    for (const cdn of cdnSources) {
      let instance: any = null;
      try {
        if (onStatus) onStatus(`Loading audio engine (${cdn.name})...`);

        instance = new FFmpeg();
        if (!instance.FS) {
          instance.FS = async (action: string, ...args: any[]) => {
            if (action === 'unlink') return instance.deleteFile(args[0]);
            if (action === 'writeFile') return instance.writeFile(args[0], args[1]);
            if (action === 'readFile') return instance.readFile(args[0]);
          };
        }

        // Explicit URLs for coreURL and wasmURL converted via toBlobURL
        const coreBlobURL = await toBlobURL(cdn.coreURL, 'text/javascript');
        const wasmBlobURL = await toBlobURL(cdn.wasmURL, 'application/wasm');

        if (onStatus) onStatus('Initializing WebAssembly core...');

        // Robust instance.load() without classWorkerURL to avoid module worker mobile crash
        await instance.load({
          coreURL: coreBlobURL,
          wasmURL: wasmBlobURL,
        });

        ffmpegInstance = instance;
        loaded = true;
        break;
      } catch (loadErr: any) {
        console.warn(`[FFmpeg] Loading failed via ${cdn.name}:`, loadErr);
        lastError = loadErr;
        if (instance) {
          try { instance.terminate(); } catch (e) {}
        }
      }
    }

    if (!loaded) {
      throw new Error(
        `Failed to initialize WebAssembly core components (${lastError?.message || 'Network / browser timeout'}). ` +
        `Please check your internet connection or reload the page.`
      );
    }

    return ffmpegInstance;
  };

  // Sequential Processing Queue
  const startBulkConversion = async () => {
    if (files.length === 0 || isProcessing) return;

    setIsProcessing(true);
    setIsComplete(false);
    setErrorMessage(null);
    setResults([]);
    setCurrentFileIndex(0);
    setCurrentFileProgress(5);
    setCurrentFileName('Preparing WebAssembly audio extractor...');
    setInitStatusText('Loading FFmpeg core components...');

    const convertedList: ConvertedTrack[] = [];

    try {
      const ffmpeg = await loadFFmpegInstance((statusMsg) => {
        setInitStatusText(statusMsg);
      });
      setInitStatusText('');
      const { fetchFile } = (window as any).FFmpegUtil;
      let fileIndex = 1;

      // Sequential Processing: MUST process files one by one using a for...of loop (NO Promise.all)
      for (const file of files) {
        const safeExt = file.name.split('.').pop() || 'mp4';
        const inputFileName = `input_${fileIndex}_${Date.now()}.${safeExt}`;
        const outputFileName = `output_${fileIndex}_${Date.now()}.mp3`;

        // UI Feedback: Update state before file starts
        setCurrentFileIndex(fileIndex);
        setCurrentFileName(file.name);
        setCurrentFileProgress(0);

        const progressListener = ({ progress }: { progress: number }) => {
          if (typeof progress === 'number' && !isNaN(progress)) {
            const pct = Math.max(0, Math.min(99, Math.round(progress * 100)));
            setCurrentFileProgress(pct);
          }
        };

        ffmpeg.on('progress', progressListener);

        try {
          // Lazy Loading to FS: Do not read all files into ffmpeg.FS at the start.
          // Only use fetchFile to write the specific file to memory exactly when its turn comes in the loop.
          const fileBuffer = await fetchFile(file);
          if (typeof ffmpeg.FS === 'function') {
            await ffmpeg.FS('writeFile', inputFileName, fileBuffer);
          } else {
            await ffmpeg.writeFile(inputFileName, fileBuffer);
          }

          // Run FFmpeg: -vn disables video streams to avoid memory saturation on mobile
          await ffmpeg.exec([
            '-i', inputFileName,
            '-vn',
            '-c:a', 'libmp3lame',
            '-b:a', bitrate,
            outputFileName
          ]);

          // Read output MP3 file from memory
          let outputData: any;
          if (typeof ffmpeg.FS === 'function') {
            outputData = await ffmpeg.FS('readFile', outputFileName);
          } else {
            outputData = await ffmpeg.readFile(outputFileName);
          }

          const blob = new Blob([outputData.buffer], { type: 'audio/mpeg' });
          outputData = null; // Release JS array buffer reference
          const url = URL.createObjectURL(blob);
          const outBaseName = file.name.replace(/\.[^/.]+$/, "");

          convertedList.push({
            id: `track-${fileIndex}-${Date.now()}`,
            name: `${outBaseName}.mp3`,
            blob,
            url,
            size: blob.size,
            success: true
          });

          // UI Feedback: Complete progress state after file finishes
          setCurrentFileProgress(100);
        } catch (fileErr: any) {
          console.error(`Error converting ${file.name}:`, fileErr);
          convertedList.push({
            id: `track-${fileIndex}-${Date.now()}`,
            name: file.name,
            success: false,
            error: fileErr?.message || 'Conversion failed'
          });
        } finally {
          // Memory Management (Crucial): Clear memory immediately after each file is converted.
          // Use ffmpeg.FS('unlink', inputFileName) and ffmpeg.FS('unlink', outputFileName) inside the loop.
          try {
            if (typeof ffmpeg.FS === 'function') {
              await ffmpeg.FS('unlink', inputFileName);
            }
          } catch (e) {}
          try {
            if (typeof ffmpeg.deleteFile === 'function') {
              await ffmpeg.deleteFile(inputFileName);
            }
          } catch (e) {}

          try {
            if (typeof ffmpeg.FS === 'function') {
              await ffmpeg.FS('unlink', outputFileName);
            }
          } catch (e) {}
          try {
            if (typeof ffmpeg.deleteFile === 'function') {
              await ffmpeg.deleteFile(outputFileName);
            }
          } catch (e) {}

          try {
            ffmpeg.off('progress', progressListener);
          } catch (e) {}

          // Yield event loop to allow Garbage Collector to reclaim RAM
          await new Promise((r) => setTimeout(r, 60));
        }

        fileIndex++;
      }
    } catch (globalErr: any) {
      console.error('Fatal conversion error:', globalErr);
      setErrorMessage(globalErr?.message || 'Failed to initialize audio converter components.');
      setIsProcessing(false);
      setCurrentFileProgress(0);
      return;
    } finally {
      setIsProcessing(false);
      if (convertedList.length > 0) {
        setIsComplete(true);
        setResults(convertedList);
      }
    }
  };

  // Generate and download all converted tracks as a ZIP archive
  const downloadAllAsZip = async () => {
    const successfulTracks = results.filter(r => r.success && r.blob);
    if (successfulTracks.length === 0 || isZipping) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      successfulTracks.forEach(track => {
        if (track.blob) {
          zip.file(track.name, track.blob);
        }
      });

      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `Batch_MP3_Converted_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(zipUrl), 30000);
    } catch (err) {
      console.error('Failed to create ZIP archive:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handlePlayPreview = (url: string) => {
    if (activePreviewUrl === url && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setActivePreviewUrl(url);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const resetAll = () => {
    setFiles([]);
    setResults([]);
    setIsComplete(false);
    setIsProcessing(false);
    setActivePreviewUrl(null);
    setIsPlaying(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 text-slate-200">
      {/* 1. Automated SEO Head Injection */}
      <SEOHead />

      {/* 2. Semantic H1 Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Fastest Bulk & Batch MP4 to MP3 Converter (Offline)
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
          Convert multiple MP4 videos to studio-grade MP3 audio tracks locally on your device. 
          Zero server uploads, 100% private, sequential memory protection, and instant ZIP download.
        </p>
      </div>

      {/* 3. Main Tool Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-800/80 rounded-xl text-red-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-200 mb-1">Initialization or Conversion Failed</p>
              <p className="text-xs text-red-300/90 leading-relaxed">{errorMessage}</p>
            </div>
            <button 
              onClick={() => setErrorMessage(null)} 
              className="text-xs text-red-400 hover:text-red-200 px-2 py-1 rounded bg-red-900/40 border border-red-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {!isProcessing && !isComplete && (
          <div className="flex flex-col items-center">
            {/* Multi-file input with accessible label */}
            <input 
              ref={fileInputRef}
              type="file" 
              id="bulk-video-input" 
              accept="video/*,.mp4,.mkv,.avi,.webm,.mov,.flv,.wmv,.m4v" 
              multiple 
              onChange={handleFileChange}
              className="hidden"
              aria-label="Select multiple video files for offline batch MP3 conversion"
            />
            <label 
              htmlFor="bulk-video-input" 
              className="cursor-pointer group border-2 border-dashed border-slate-700 hover:border-teal-500 rounded-xl w-full py-12 px-6 flex flex-col items-center justify-center transition-all bg-slate-800/40 hover:bg-slate-800/70 mb-6"
            >
              <Upload className="w-12 h-12 text-slate-500 group-hover:text-teal-400 mb-3 transition-colors" />
              <span className="text-white font-medium text-base sm:text-lg text-center">
                Click or drag & drop video files here
              </span>
              <span className="text-slate-400 text-xs sm:text-sm mt-1">
                {files.length > 0 
                  ? `${files.length} file(s) selected (${(files.reduce((a, b) => a + b.size, 0) / 1024 / 1024).toFixed(1)} MB total)`
                  : 'Select one or dozens of MP4 / video files for bulk processing'
                }
              </span>
            </label>

            {/* Audio Quality (Bitrate) Select Dropdown */}
            <div className="w-full max-w-xs mb-8">
              <label htmlFor="bitrate-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Audio Quality
              </label>
              <select 
                id="bitrate-select"
                value={bitrate}
                onChange={(e) => setBitrate(e.target.value as AudioBitrate)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 block p-3 outline-none transition-all"
              >
                <option value="320k">Studio (320kbps)</option>
                <option value="192k">High (192kbps)</option>
                <option value="128k">Standard (128kbps)</option>
              </select>
            </div>

            {/* Convert Button */}
            <button
              onClick={startBulkConversion}
              disabled={files.length === 0}
              className={`w-full sm:w-auto px-10 py-4 font-semibold rounded-xl text-white text-base shadow-lg transition-all flex items-center justify-center gap-2.5 ${
                files.length === 0 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-teal-600 hover:bg-teal-500 shadow-teal-500/20 cursor-pointer active:scale-98'
              }`}
            >
              <Zap className="w-5 h-5 text-teal-200" />
              <span>
                {files.length > 1 ? `Convert ${files.length} Files to MP3` : 'Convert to MP3'}
              </span>
            </button>
          </div>
        )}

        {/* 4. Sequential Processing UI */}
        {isProcessing && (
          <div className="py-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 border-4 border-slate-800 border-t-teal-500 rounded-full animate-spin mb-6" />
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              {initStatusText || `Processing file ${currentFileIndex} of ${files.length}... ${currentFileProgress}%`}
            </h2>
            <p className="text-sm font-mono text-teal-400 max-w-md truncate mb-4">
              {currentFileName}
            </p>
            <div className="w-full max-w-md bg-slate-800 rounded-full h-2.5 mb-3 overflow-hidden">
              <div 
                className="bg-teal-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${currentFileProgress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-2">
              <Cpu className="w-4 h-4 text-teal-400" />
              <span>Sequential memory-safe client processing &bull; Zero server uploads</span>
            </p>
          </div>
        )}

        {/* 5. Complete / Results UI */}
        {isComplete && (
          <div className="py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Batch Conversion Complete!</h2>
                  <p className="text-xs text-slate-400">
                    {results.filter(r => r.success).length} of {results.length} files converted successfully ({bitrate.replace('k', ' kbps')})
                  </p>
                </div>
              </div>
              <button
                onClick={resetAll}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Convert More Files</span>
              </button>
            </div>

            {/* Download All as ZIP Button */}
            {results.some(r => r.success) && (
              <div className="my-6 flex justify-center">
                <button
                  onClick={downloadAllAsZip}
                  disabled={isZipping}
                  className="w-full sm:w-auto px-8 py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2.5 transition-all text-sm group"
                >
                  <Archive className="w-5 h-5 text-teal-200 group-hover:scale-110 transition-transform" />
                  <span>{isZipping ? 'Creating ZIP Archive...' : 'Download All as ZIP'}</span>
                </button>
              </div>
            )}

            {/* Converted Files List */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl overflow-hidden divide-y divide-slate-800 max-h-80 overflow-y-auto">
              {results.map((track) => (
                <div key={track.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-800/90 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      track.success ? 'bg-teal-950 text-teal-400 border border-teal-800' : 'bg-red-950 text-red-400 border border-red-800'
                    }`}>
                      {track.success ? <Music className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{track.name}</p>
                      <p className="text-xs text-slate-400 font-mono">
                        {track.success && track.size 
                          ? `${(track.size / 1024 / 1024).toFixed(2)} MB • MP3 (${bitrate.replace('k', ' kbps')})`
                          : track.error || 'Failed'
                        }
                      </p>
                    </div>
                  </div>

                  {track.success && track.url && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handlePlayPreview(track.url!)}
                        className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                        title="Preview audio"
                      >
                        {activePreviewUrl === track.url && isPlaying ? (
                          <Pause className="w-4 h-4 text-teal-400" />
                        ) : (
                          <Play className="w-4 h-4 text-slate-300" />
                        )}
                      </button>
                      <a
                        href={track.url}
                        download={track.name}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />
          </div>
        )}
      </div>

      {/* 6. Semantic SEO Article */}
      <article className="mt-12 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-950 text-teal-400 border border-teal-800/60">
            <Zap className="w-3.5 h-3.5" />
            Client-Side Architecture
          </span>
          <span className="text-xs text-slate-500 font-mono">Zero Cloud Latency</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">
          Why Offline Bulk & Batch MP4 to MP3 Conversion Outperforms Cloud Tools
        </h2>
        <p className="text-slate-300 leading-relaxed text-sm sm:text-base mb-6">
          Traditional online media converters force users to upload gigabytes of video footage over slow internet connections to remote cloud servers before conversion begins. In contrast, our offline bulk MP4 to MP3 converter runs 100% locally in your browser using high-performance FFmpeg WebAssembly. By processing files sequentially on your local device, it conserves internet data, prevents tab crashes from memory saturation, safeguards confidential personal videos, and allows you to download all high-bitrate MP3 tracks in a single ZIP archive instantly.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span><strong>100% Secure:</strong> Video never leaves your computer</span>
          </div>
          <div className="flex items-center gap-2">
            <HardDriveDownload className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span><strong>Data Free:</strong> No bandwidth usage or limits</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span><strong>Sequential Safety:</strong> Optimized memory allocation</span>
          </div>
        </div>
      </article>
    </div>
  );
}
