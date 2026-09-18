import { MediaClip, TextOverlay, VideoFilters } from './editorTypes';

export interface ExportProgressCallback {
  (percentage: number, status: string): void;
}

/**
 * Renders the composition into an MP4/WebM video client-side.
 * Uses HTML5 Canvas + MediaRecorder and/or FFmpeg WASM if available.
 */
export async function exportCompositionClientSide(options: {
  videoClips: MediaClip[];
  audioClips: MediaClip[];
  textOverlays: TextOverlay[];
  filters: VideoFilters;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  totalDuration: number;
  outputFormat: 'mp4' | 'webm';
  resolution: '720p' | '1080p';
  onProgress?: ExportProgressCallback;
}): Promise<{ blob: Blob; filename: string }> {
  const {
    videoClips,
    audioClips,
    textOverlays,
    filters,
    aspectRatio,
    totalDuration,
    outputFormat,
    resolution,
    onProgress
  } = options;

  if (totalDuration <= 0) {
    throw new Error('Timeline is empty. Please add media clips before exporting.');
  }

  onProgress?.(5, 'Preparing render canvas & audio mixer...');

  // 1. Calculate pixel dimensions based on aspect ratio & resolution
  let width = 1280;
  let height = 720;
  if (resolution === '1080p') {
    width = 1920;
    height = 1080;
  }

  if (aspectRatio === '9:16') {
    const temp = width;
    width = height;
    height = temp;
  } else if (aspectRatio === '1:1') {
    height = width;
  } else if (aspectRatio === '4:5') {
    height = Math.round((width * 5) / 4);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not supported');

  // 2. Setup AudioContext mixer for all video audio + background music
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioContextClass({ sampleRate: 44100 });
  const audioDestination = audioCtx.createMediaStreamDestination();

  // Pre-load all video and audio elements
  const videoElements: Map<string, HTMLVideoElement> = new Map();
  for (const clip of videoClips) {
    const video = document.createElement('video');
    video.src = clip.url;
    video.crossOrigin = 'anonymous';
    video.muted = false; // We connect to audioCtx
    video.playsInline = true;
    await new Promise<void>((res) => {
      video.onloadedmetadata = () => res();
      video.onerror = () => res(); // fallback gracefully
    });
    
    // Connect audio node
    try {
      const source = audioCtx.createMediaElementSource(video);
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = clip.volume ?? 1;
      source.connect(gainNode);
      gainNode.connect(audioDestination);
    } catch (e) {
      console.warn('Audio source attach skipped for clip', clip.id, e);
    }

    videoElements.set(clip.id, video);
  }

  // Pre-load audio elements
  const audioElementMap: Map<string, HTMLAudioElement> = new Map();
  for (const clip of audioClips) {
    const audio = new Audio();
    audio.src = clip.url;
    audio.crossOrigin = 'anonymous';
    try {
      const source = audioCtx.createMediaElementSource(audio);
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = clip.volume ?? 1;
      source.connect(gainNode);
      gainNode.connect(audioDestination);
    } catch (e) {
      console.warn('Audio element node skipped', clip.id, e);
    }
    audioElementMap.set(clip.id, audio);
  }

  // 3. Setup Stream and MediaRecorder
  const fps = 30;
  const canvasStream = canvas.captureStream(fps);
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...audioDestination.stream.getAudioTracks()
  ]);

  let preferredMime = outputFormat === 'mp4' ? 'video/mp4;codecs=avc1,mp4a.40.2' : 'video/webm;codecs=vp9,opus';
  if (!MediaRecorder.isTypeSupported(preferredMime)) {
    preferredMime = 'video/webm;codecs=vp8,opus';
  }
  if (!MediaRecorder.isTypeSupported(preferredMime)) {
    preferredMime = 'video/webm';
  }

  const recordedChunks: Blob[] = [];
  const recorder = new MediaRecorder(combinedStream, {
    mimeType: preferredMime,
    videoBitsPerSecond: resolution === '1080p' ? 8000000 : 4000000
  });

  const recordPromise = new Promise<Blob>((resolve, reject) => {
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recordedChunks.push(e.data);
    };
    recorder.onstop = () => {
      resolve(new Blob(recordedChunks, { type: preferredMime }));
    };
    recorder.onerror = reject;
  });

  recorder.start(100);
  onProgress?.(15, 'Rendering video timeline & layers frame-by-frame...');

  // 4. Render loop
  const stepTime = 1 / fps;
  let currentRenderTime = 0;
  const totalFrames = Math.ceil(totalDuration * fps);
  let frameCount = 0;

  while (currentRenderTime <= totalDuration) {
    // A. Clear background
    ctx.save();
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, 0, width, height);

    // Apply Filter Preset & Sliders to canvas context
    let filterString = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%)`;
    if (filters.blur > 0) filterString += ` blur(${filters.blur}px)`;
    if (filters.sepia > 0) filterString += ` sepia(${filters.sepia}%)`;

    if (filters.filterPreset === 'grayscale') filterString += ' grayscale(100%)';
    else if (filters.filterPreset === 'vintage') filterString += ' sepia(60%) contrast(110%)';
    else if (filters.filterPreset === 'cinematic') filterString += ' contrast(125%) saturate(110%)';
    else if (filters.filterPreset === 'warm') filterString += ' sepia(30%) saturate(130%)';
    else if (filters.filterPreset === 'cool') filterString += ' hue-rotate(180deg) saturate(90%)';
    else if (filters.filterPreset === 'cyberpunk') filterString += ' hue-rotate(90deg) contrast(140%) saturate(160%)';

    ctx.filter = filterString;

    // B. Draw active video clip(s)
    for (const clip of videoClips) {
      const clipStart = clip.timelineStart;
      const clipEnd = clipStart + ((clip.endTrim - clip.startTrim) / (clip.speed || 1));

      if (currentRenderTime >= clipStart && currentRenderTime < clipEnd) {
        const vid = videoElements.get(clip.id);
        if (vid) {
          const mediaTime = clip.startTrim + (currentRenderTime - clipStart) * (clip.speed || 1);
          vid.currentTime = Math.max(0, Math.min(vid.duration || mediaTime, mediaTime));

          // Wait for seek to sync
          await new Promise<void>((r) => {
            if (vid.readyState >= 2) return r();
            const onSeek = () => {
              vid.removeEventListener('seeked', onSeek);
              r();
            };
            vid.addEventListener('seeked', onSeek);
            setTimeout(r, 20); // safety fallback
          });

          // Draw video with aspect ratio fit/cover
          const vW = vid.videoWidth || width;
          const vH = vid.videoHeight || height;

          let cropX = 0, cropY = 0, cropW = vW, cropH = vH;
          if (clip.crop) {
            cropX = (clip.crop.x / 100) * vW;
            cropY = (clip.crop.y / 100) * vH;
            cropW = (clip.crop.width / 100) * vW;
            cropH = (clip.crop.height / 100) * vH;
          }

          // Scale to fit canvas
          const scale = Math.min(width / cropW, height / cropH);
          const drawW = cropW * scale;
          const drawH = cropH * scale;
          const drawX = (width - drawW) / 2;
          const drawY = (height - drawH) / 2;

          ctx.drawImage(vid, cropX, cropY, cropW, cropH, drawX, drawY, drawW, drawH);
        }
      }
    }

    ctx.restore(); // Restore filter

    // C. Draw Text Overlays
    for (const text of textOverlays) {
      const textEnd = text.timelineStart + text.duration;
      if (currentRenderTime >= text.timelineStart && currentRenderTime <= textEnd) {
        ctx.save();
        const posX = (text.x / 100) * width;
        const posY = (text.y / 100) * height;
        
        // Scale font size proportionally to export resolution
        const scaledFontSize = Math.round(text.fontSize * (height / 720));
        ctx.font = `${text.fontWeight} ${scaledFontSize}px ${text.fontFamily || 'system-ui'}`;
        ctx.textAlign = text.textAlign || 'center';
        ctx.textBaseline = 'middle';

        // Styles
        if (text.style === 'cinema') {
          ctx.letterSpacing = '4px';
          ctx.shadowColor = 'rgba(0,0,0,0.9)';
          ctx.shadowBlur = 12;
        } else if (text.style === 'glow') {
          ctx.shadowColor = text.color || '#2dd4bf';
          ctx.shadowBlur = 18;
        } else if (text.style === 'bubble' || text.style === 'caption') {
          const metrics = ctx.measureText(text.text);
          const boxPadding = 14;
          const boxW = metrics.width + boxPadding * 2;
          const boxH = scaledFontSize + boxPadding * 1.5;
          ctx.fillStyle = text.bgColor || 'rgba(15, 23, 42, 0.85)';
          const bX = text.textAlign === 'center' ? posX - boxW / 2 : posX - boxPadding;
          const bY = posY - boxH / 2;
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(bX, bY, boxW, boxH, 8) : ctx.rect(bX, bY, boxW, boxH);
          ctx.fill();
        }

        ctx.fillStyle = text.color || '#ffffff';
        ctx.globalAlpha = text.opacity ?? 1;
        ctx.fillText(text.text, posX, posY);
        ctx.restore();
      }
    }

    // Update progress
    frameCount++;
    const progressPercent = Math.min(95, Math.round(15 + (frameCount / totalFrames) * 75));
    onProgress?.(progressPercent, `Rendering frame ${frameCount} of ${totalFrames} (${progressPercent}%)...`);

    currentRenderTime += stepTime;
    // Allow UI thread to breathe
    if (frameCount % 6 === 0) {
      await new Promise(r => setTimeout(r, 4));
    }
  }

  onProgress?.(94, 'Finalizing video stream & container...');
  recorder.stop();
  const rawBlob = await recordPromise;

  // Cleanup media elements and audio context
  audioCtx.close().catch(() => {});

  // 5. Format conversion via FFmpeg WASM if user requested native MP4 and browser produced WebM
  let finalBlob = rawBlob;
  const targetExt = outputFormat;
  const isWebM = rawBlob.type.includes('webm');

  if (targetExt === 'mp4' && isWebM) {
    try {
      onProgress?.(96, 'Remuxing to universal MP4 format via WebAssembly...');
      const win = window as any;
      if (win.FFmpegWASM && win.FFmpegWASM.FFmpeg) {
        const { FFmpeg } = win.FFmpegWASM;
        const ffmpeg = new FFmpeg();
        await ffmpeg.load({
          coreURL: '/ffmpeg/ffmpeg-core.js',
          wasmURL: '/ffmpeg/ffmpeg-core.wasm'
        });

        const inName = `input_${Date.now()}.webm`;
        const outName = `output_${Date.now()}.mp4`;
        const buf = new Uint8Array(await rawBlob.arrayBuffer());
        await ffmpeg.writeFile(inName, buf);

        // Fast remux or transcode
        await ffmpeg.exec(['-y', '-i', inName, '-c:v', 'copy', '-c:a', 'aac', outName]);
        const data = await ffmpeg.readFile(outName);
        finalBlob = new Blob([data.buffer], { type: 'video/mp4' });
        try {
          await ffmpeg.deleteFile(inName);
          await ffmpeg.deleteFile(outName);
        } catch (e) {}
      }
    } catch (ffmpegErr) {
      console.warn('FFmpeg remux fallback failed, serving webm/mp4 container directly:', ffmpegErr);
    }
  }

  onProgress?.(100, 'Export complete! Ready to download.');
  const ext = finalBlob.type.includes('mp4') ? 'mp4' : 'webm';
  const filename = `VidToAudio_Edited_${Date.now()}.${ext}`;

  return { blob: finalBlob, filename };
}
