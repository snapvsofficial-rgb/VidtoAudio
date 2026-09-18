/**
 * Generates an ultra-lightweight, crisp client-side sample video using HTML5 Canvas & Web Audio.
 * 100% in-browser, no network request, runs completely offline on any device.
 */
export async function generateDemoVideo(): Promise<{ videoBlob: Blob; audioBlob: Blob }> {
  const width = 1280;
  const height = 720;
  const fps = 30;
  const durationSec = 6;
  const totalFrames = fps * durationSec;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not supported');

  // Generate synthetic dynamic video stream
  const canvasStream = canvas.captureStream(fps);

  // Synthesize rhythmic upbeat sound with Web Audio
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 44100 });
  const oscDest = audioCtx.createMediaStreamDestination();
  
  // Create chord and beat synthesizer
  const chordNotes = [220, 277.18, 329.63, 440]; // A major / chill vibe
  const oscs = chordNotes.map((freq) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    osc.connect(gain);
    gain.connect(oscDest);
    osc.start();
    return { osc, gain };
  });

  // Combine canvas and audio stream for MediaRecorder
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...oscDest.stream.getAudioTracks()
  ]);

  let mimeType = 'video/webm;codecs=vp9,opus';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/mp4';
  }

  const recordedChunks: Blob[] = [];
  const recorder = new MediaRecorder(combinedStream, { mimeType });

  const recordPromise = new Promise<Blob>((resolve, reject) => {
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recordedChunks.push(e.data);
    };
    recorder.onstop = () => {
      resolve(new Blob(recordedChunks, { type: mimeType }));
    };
    recorder.onerror = reject;
  });

  recorder.start();

  // Render animated frames
  let frame = 0;
  await new Promise<void>((done) => {
    function draw() {
      if (frame >= totalFrames) {
        recorder.stop();
        oscs.forEach(o => {
          try { o.osc.stop(); } catch (e) {}
        });
        audioCtx.close();
        done();
        return;
      }

      const progress = frame / totalFrames;
      const time = frame / fps;

      // Dark futuristic gradient background
      const grad = ctx.createLinearGradient(0, 0, width, height);
      const hue1 = (180 + Math.sin(time) * 40) % 360;
      const hue2 = (220 + Math.cos(time) * 40) % 360;
      grad.addColorStop(0, `hsl(${hue1}, 70%, 12%)`);
      grad.addColorStop(1, `hsl(${hue2}, 80%, 6%)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Glowing animated grid lines
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.15)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      const offsetY = (time * 30) % gridSize;
      for (let y = offsetY; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Rotating neon geometric accent
      ctx.save();
      ctx.translate(width / 2, height / 2 - 20);
      ctx.rotate(time * 0.8);
      const size = 120 + Math.sin(time * 3) * 20;
      ctx.strokeStyle = '#2dd4bf';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#14b8a6';
      ctx.shadowBlur = 24;
      ctx.strokeRect(-size / 2, -size / 2, size, size);
      ctx.restore();

      // Title & typography
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 12;
      ctx.fillText('VidToAudio Video Editor', width / 2, height / 2 + 130);

      // Subtitle
      ctx.fillStyle = '#94a3b8';
      ctx.font = '22px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('100% Client-Side WebAssembly & HTML5 Editor', width / 2, height / 2 + 175);

      // Timecode stamp
      ctx.fillStyle = '#2dd4bf';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`00:0${Math.floor(time)} : ${String(Math.floor((time % 1) * 30)).padStart(2, '0')} FPS: 30`, width / 2, height / 2 + 220);

      frame++;
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  });

  const videoBlob = await recordPromise;

  // Generate a dedicated upbeat audio track blob as well
  const audioBlob = await generateSyntheticAudio(5);

  return { videoBlob, audioBlob };
}

/**
 * Creates a synthetic WAV melody for background music
 */
export async function generateSyntheticAudio(durationSec = 8): Promise<Blob> {
  const sampleRate = 44100;
  const numFrames = sampleRate * durationSec;
  const numChannels = 2;

  const buffer = new ArrayBuffer(44 + numFrames * numChannels * 2);
  const view = new DataView(buffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numFrames * numChannels * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true); // 16-bit
  writeString(36, 'data');
  view.setUint32(40, numFrames * numChannels * 2, true);

  const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63]; // C - E - G - C - G - E
  let offset = 44;

  for (let i = 0; i < numFrames; i++) {
    const t = i / sampleRate;
    const noteIdx = Math.floor(t * 3) % notes.length;
    const freq = notes[noteIdx];
    // Gentle synth envelope
    const noteTime = (t * 3) % 1;
    const env = Math.exp(-noteTime * 2.5);
    const sample = Math.sin(2 * Math.PI * freq * t) * env * 0.4;
    const sampleInt16 = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));

    view.setInt16(offset, sampleInt16, true);
    view.setInt16(offset + 2, sampleInt16, true);
    offset += 4;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}
