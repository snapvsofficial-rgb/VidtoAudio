import { 
  MediaClip, 
  TextOverlay, 
  VideoFilters, 
  EditorTab, 
  EditorProject 
} from './editorTypes';
import { generateDemoVideo, generateSyntheticAudio } from './demoGenerator';
import { exportCompositionClientSide } from './exportEngine';

export function renderVideoEditor(container: HTMLElement): void {
  // Clear container
  container.innerHTML = '';

  // Initial State
  const project: EditorProject = {
    title: 'Untitled Video Project',
    aspectRatio: '16:9',
    duration: 6, // default demo length
    currentTime: 0,
    isPlaying: false,
    videoClips: [],
    audioClips: [],
    textOverlays: [],
    filters: {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      filterPreset: 'normal',
      blur: 0,
      sepia: 0
    }
  };

  let activeTab: EditorTab = 'media';
  let selectedClipId: string | null = null;
  let selectedTextId: string | null = null;
  let animFrameId: number | null = null;
  let isDraggingPlayhead = false;

  // Render Skeleton UI
  container.innerHTML = `
    <div id="editor-root" class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden pb-16 md:pb-0">
      
      <!-- TOP NAVIGATION BAR -->
      <header class="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-4 flex items-center justify-between z-30 flex-shrink-0">
        <div class="flex items-center gap-3">
          <button id="editor-back-home" class="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold" title="Back to VidToAudio Home">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            <span class="hidden sm:inline">Back</span>
          </button>
          <div class="flex items-center gap-2 border-l border-slate-800 pl-3">
            <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white shadow">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
            </div>
            <div>
              <input id="project-title-input" type="text" value="${project.title}" class="bg-transparent border border-transparent hover:border-slate-700 focus:border-brand-500 rounded px-1.5 py-0.5 text-sm font-semibold text-white focus:outline-none transition-colors" />
              <div class="text-[10px] text-teal-400 font-mono flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                <span>100% Client-Side Engine (Offline)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Center Controls: Aspect Ratio & Zoom -->
        <div class="hidden md:flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-xl p-1 text-xs font-medium">
          <button data-aspect="16:9" class="aspect-btn px-2.5 py-1 rounded-lg bg-brand-600 text-white font-semibold transition-all">16:9 Landscape</button>
          <button data-aspect="9:16" class="aspect-btn px-2.5 py-1 rounded-lg text-slate-300 hover:text-white transition-all">9:16 Story</button>
          <button data-aspect="1:1" class="aspect-btn px-2.5 py-1 rounded-lg text-slate-300 hover:text-white transition-all">1:1 Square</button>
          <button data-aspect="4:5" class="aspect-btn px-2.5 py-1 rounded-lg text-slate-300 hover:text-white transition-all">4:5 Social</button>
        </div>

        <!-- Right: Actions & Export -->
        <div class="flex items-center gap-2">
          <button id="editor-demo-modal-open" class="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 rounded-lg text-xs font-semibold transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path></svg>
            Demo Project
          </button>
          <button id="editor-export-btn" class="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-brand-600 hover:from-teal-400 hover:to-brand-500 text-white font-semibold rounded-lg text-xs sm:text-sm shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            <span>Export Video</span>
          </button>
        </div>
      </header>

      <!-- MAIN WORKSPACE LAYOUT (Preview + Tool Panels + Multi-Track Timeline) -->
      <div class="flex-grow flex flex-col overflow-hidden">

        <!-- UPPER HALF: PREVIEW STAGE + TOOL INSPECTOR DRAWER -->
        <div class="flex-grow flex flex-col lg:flex-row overflow-hidden relative">

          <!-- TOOLBAR TABS SIDEBAR (Desktop) -->
          <aside class="hidden lg:flex w-20 flex-col items-center py-4 bg-slate-900 border-r border-slate-800 gap-4 flex-shrink-0 z-10">
            <button data-tab="edit" class="tab-trigger flex flex-col items-center gap-1 text-slate-400 hover:text-white text-[11px] font-medium p-2 rounded-xl transition-all">
              <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.242-4.242 3 3 0 004.242 4.242z"></path></svg>
              </div>
              <span>Edit/Trim</span>
            </button>
            <button data-tab="media" class="tab-trigger flex flex-col items-center gap-1 text-teal-400 font-medium text-[11px] p-2 rounded-xl transition-all">
              <div class="w-10 h-10 rounded-xl bg-brand-950 border border-teal-500/40 text-teal-400 flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <span>Media</span>
            </button>
            <button data-tab="audio" class="tab-trigger flex flex-col items-center gap-1 text-slate-400 hover:text-white text-[11px] font-medium p-2 rounded-xl transition-all">
              <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
              </div>
              <span>Audio</span>
            </button>
            <button data-tab="text" class="tab-trigger flex flex-col items-center gap-1 text-slate-400 hover:text-white text-[11px] font-medium p-2 rounded-xl transition-all">
              <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M12 8v11m-4 0h8"></path></svg>
              </div>
              <span>Text</span>
            </button>
            <button data-tab="filters" class="tab-trigger flex flex-col items-center gap-1 text-slate-400 hover:text-white text-[11px] font-medium p-2 rounded-xl transition-all">
              <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
              </div>
              <span>Filters</span>
            </button>
          </aside>

          <!-- TOOL DRAWER / PANEL (Desktop & Mobile) -->
          <aside id="tool-drawer" class="w-full lg:w-80 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 p-4 flex flex-col overflow-y-auto max-h-56 lg:max-h-none flex-shrink-0 z-10">
            <!-- Dynamic Tab Content Rendered Here -->
            <div id="tab-content-container"></div>
          </aside>

          <!-- CENTRAL PREVIEW STAGE -->
          <main class="flex-grow bg-slate-950 flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden">
            <div id="preview-aspect-container" class="relative bg-black rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex items-center justify-center transition-all duration-300 aspect-video max-h-[55vh] w-full max-w-4xl">
              
              <!-- Video Player Elements Layer -->
              <div id="video-playback-layer" class="absolute inset-0 w-full h-full flex items-center justify-center">
                <video id="master-video" class="w-full h-full object-contain pointer-events-none" playsinline></video>
                <div id="empty-state-banner" class="flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <div class="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-teal-400 mb-3 shadow-inner">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  </div>
                  <h4 class="text-white text-base font-bold mb-1">No Video Media Loaded</h4>
                  <p class="text-xs text-slate-400 max-w-xs mb-4">Add your video files locally or try the instant demo composition.</p>
                  <div class="flex gap-2">
                    <button id="empty-add-demo-btn" class="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path></svg>
                      Try Demo Video
                    </button>
                    <button id="empty-add-media-btn" class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                      + Add Media
                    </button>
                  </div>
                </div>
              </div>

              <!-- Canvas Rendering / Filter Layer -->
              <canvas id="preview-filter-canvas" class="hidden absolute inset-0 w-full h-full pointer-events-none"></canvas>

              <!-- Text Overlays Stage -->
              <div id="text-overlays-stage" class="absolute inset-0 pointer-events-none"></div>

              <!-- Floating Quick HUD on Hover -->
              <div class="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-full px-4 py-1.5 flex items-center gap-3 text-xs shadow-lg">
                <span id="preview-current-time" class="font-mono text-teal-400 font-semibold">00:00.0</span>
                <span class="text-slate-600">/</span>
                <span id="preview-total-time" class="font-mono text-slate-400">00:06.0</span>
              </div>
            </div>

            <!-- PLAYER TRANSPORT CONTROLS -->
            <div class="mt-3 flex items-center gap-4 text-xs font-medium">
              <button id="skip-back-btn" class="p-2 text-slate-400 hover:text-white transition-colors" title="Rewind 1 sec">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"></path></svg>
              </button>
              
              <button id="play-pause-btn" class="w-10 h-10 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-teal-500/30 transition-transform active:scale-95" title="Play / Pause">
                <svg id="play-icon" class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                <svg id="pause-icon" class="w-5 h-5 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              </button>

              <button id="skip-fwd-btn" class="p-2 text-slate-400 hover:text-white transition-colors" title="Fast-forward 1 sec">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"></path></svg>
              </button>

              <button id="quick-split-btn" class="p-2 text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-1 ml-2 bg-slate-900 px-2.5 rounded-lg border border-slate-800" title="Split Clip at Playhead">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.242-4.242 3 3 0 004.242 4.242z"></path></svg>
                <span class="text-[11px] font-semibold">Split</span>
              </button>
            </div>
          </main>
        </div>

        <!-- LOWER HALF: MULTI-TRACK CAPCUT-STYLE TIMELINE -->
        <section class="h-64 sm:h-72 bg-slate-900/95 border-t border-slate-800 flex flex-col flex-shrink-0 relative">
          
          <!-- Timeline Header Bar: Time Ruler & Zoom Slider -->
          <div class="h-9 border-b border-slate-800 bg-slate-900 px-4 flex items-center justify-between text-xs text-slate-400">
            <div class="flex items-center gap-3">
              <span class="font-mono text-teal-400 font-semibold" id="timeline-timecode">00:00:00</span>
              <div class="h-3 w-px bg-slate-700"></div>
              <span class="text-[11px] text-slate-400">Multi-Track Timeline</span>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-[10px] uppercase font-semibold text-slate-500">Zoom</span>
              <input id="timeline-zoom-slider" type="range" min="1" max="4" step="0.2" value="1" class="w-24 accent-teal-400 h-1 bg-slate-700 rounded-lg cursor-pointer" />
            </div>
          </div>

          <!-- Timeline Body: Track Headers + Scrolling Track Lanes -->
          <div class="flex-grow flex overflow-hidden relative">
            
            <!-- Fixed Track Headers Column -->
            <div class="w-24 sm:w-32 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 z-10 text-[11px] font-medium text-slate-400">
              <!-- Video Track Header -->
              <div class="h-16 border-b border-slate-800/80 px-2 flex items-center gap-1.5 bg-slate-900/80">
                <div class="w-5 h-5 rounded bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center flex-shrink-0">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </div>
                <span class="truncate">Video Track</span>
              </div>
              <!-- Audio Track Header -->
              <div class="h-16 border-b border-slate-800/80 px-2 flex items-center gap-1.5 bg-slate-900/80">
                <div class="w-5 h-5 rounded bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center flex-shrink-0">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
                </div>
                <span class="truncate">Audio Track</span>
              </div>
              <!-- Text Track Header -->
              <div class="h-16 border-b border-slate-800/80 px-2 flex items-center gap-1.5 bg-slate-900/80">
                <div class="w-5 h-5 rounded bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M12 8v11m-4 0h8"></path></svg>
                </div>
                <span class="truncate">Text Track</span>
              </div>
            </div>

            <!-- Scrollable Timeline Lanes + Playhead -->
            <div id="timeline-scroll-container" class="flex-grow overflow-x-auto overflow-y-hidden relative bg-slate-950/90 select-none">
              
              <!-- Time Ruler Numbers -->
              <div id="timeline-ruler" class="h-6 border-b border-slate-800/60 flex items-end text-[9px] font-mono text-slate-500 relative min-w-[800px]">
                <!-- Rulers ticks generated in JS -->
              </div>

              <!-- TRACK LANES CONTAINER -->
              <div id="timeline-tracks-area" class="relative min-w-[800px] h-[192px]">
                
                <!-- VIDEO TRACK LANE -->
                <div id="video-track-lane" class="h-16 border-b border-slate-800/60 relative p-1 flex items-center">
                  <!-- Video Clips Rendered Here -->
                </div>

                <!-- AUDIO TRACK LANE -->
                <div id="audio-track-lane" class="h-16 border-b border-slate-800/60 relative p-1 flex items-center">
                  <!-- Audio Clips Rendered Here -->
                </div>

                <!-- TEXT TRACK LANE -->
                <div id="text-track-lane" class="h-16 border-b border-slate-800/60 relative p-1 flex items-center">
                  <!-- Text Overlays Rendered Here -->
                </div>

                <!-- RED SCRUBBING PLAYHEAD -->
                <div id="timeline-playhead" class="absolute top-0 bottom-0 left-0 w-0.5 bg-red-500 z-20 pointer-events-auto cursor-ew-resize">
                  <div class="w-3 h-3 bg-red-500 -ml-[5px] -mt-1 rounded-sm rotate-45 shadow"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- MOBILE BOTTOM NAVIGATION BAR -->
      <nav class="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-around px-2 z-40">
        <button data-tab="edit" class="tab-trigger flex flex-col items-center gap-0.5 text-slate-400 hover:text-white text-[10px] font-medium py-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.242-4.242 3 3 0 004.242 4.242z"></path></svg>
          <span>Edit</span>
        </button>
        <button data-tab="media" class="tab-trigger flex flex-col items-center gap-0.5 text-teal-400 text-[10px] font-medium py-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <span>Media</span>
        </button>
        <button data-tab="audio" class="tab-trigger flex flex-col items-center gap-0.5 text-slate-400 hover:text-white text-[10px] font-medium py-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
          <span>Audio</span>
        </button>
        <button data-tab="text" class="tab-trigger flex flex-col items-center gap-0.5 text-slate-400 hover:text-white text-[10px] font-medium py-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M12 8v11m-4 0h8"></path></svg>
          <span>Text</span>
        </button>
        <button data-tab="filters" class="tab-trigger flex flex-col items-center gap-0.5 text-slate-400 hover:text-white text-[10px] font-medium py-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
          <span>Filters</span>
        </button>
      </nav>

      <!-- START / DEMO MODAL (Center Popup as requested in CapCut style) -->
      <div id="start-demo-modal" class="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-center">
          <button id="close-start-modal" class="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-brand-600 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-teal-500/20">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
          </div>

          <h3 class="text-xl font-bold text-white mb-2">Welcome to VidToAudio Video Editor</h3>
          <p class="text-slate-400 text-sm mb-6 leading-relaxed">
            Professional multi-track timeline, speed control, audio mixing, stylish typography & video filters. 
            <span class="text-teal-400 font-semibold">100% in-browser offline processing</span> with zero uploads!
          </p>

          <div class="flex flex-col gap-3">
            <button id="modal-try-demo-btn" class="w-full py-3.5 px-4 bg-gradient-to-r from-teal-500 to-brand-600 hover:from-teal-400 hover:to-brand-500 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path></svg>
              <span>Try a Demo Video</span>
            </button>

            <label for="modal-file-input" class="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 text-slate-200 font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2">
              <svg class="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              <span>+ Add Media</span>
              <input id="modal-file-input" type="file" accept="video/*,audio/*" multiple class="hidden" />
            </label>
          </div>

          <div class="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-500">
            <svg class="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            <span>Privacy Guaranteed &bull; Zero Server Storage</span>
          </div>
        </div>
      </div>

      <!-- EXPORT PROGRESS MODAL -->
      <div id="export-progress-modal" class="hidden fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl">
          <div class="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          </div>

          <h3 id="export-modal-title" class="text-lg font-bold text-white mb-1">Rendering Video Composition</h3>
          <p id="export-modal-status" class="text-xs text-slate-400 mb-6">Combining video layers, audio tracks & filters locally...</p>

          <!-- Progress Bar -->
          <div class="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-2">
            <div id="export-progress-bar" class="h-full bg-gradient-to-r from-teal-500 to-brand-500 w-0 transition-all duration-200"></div>
          </div>
          <div class="flex justify-between text-xs font-mono text-slate-500 mb-6">
            <span id="export-progress-text">0%</span>
            <span>Client-Side WebAssembly</span>
          </div>

          <!-- Download Action Ready Button -->
          <div id="export-download-area" class="hidden flex flex-col gap-2">
            <a id="export-download-link" href="#" download="VidToAudio_Project.mp4" class="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              <span>Download Final Video</span>
            </a>
            <button id="close-export-modal" class="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">Done</button>
          </div>
        </div>
      </div>

    </div>
  `;

  // Grab DOM references
  const masterVideo = container.querySelector('#master-video') as HTMLVideoElement;
  const emptyStateBanner = container.querySelector('#empty-state-banner') as HTMLElement;
  const playPauseBtn = container.querySelector('#play-pause-btn') as HTMLElement;
  const playIcon = container.querySelector('#play-icon') as HTMLElement;
  const pauseIcon = container.querySelector('#pause-icon') as HTMLElement;
  const previewCurrentTime = container.querySelector('#preview-current-time') as HTMLElement;
  const previewTotalTime = container.querySelector('#preview-total-time') as HTMLElement;
  const timelineTimecode = container.querySelector('#timeline-timecode') as HTMLElement;
  const timelinePlayhead = container.querySelector('#timeline-playhead') as HTMLElement;
  const timelineScrollContainer = container.querySelector('#timeline-scroll-container') as HTMLElement;
  const timelineRuler = container.querySelector('#timeline-ruler') as HTMLElement;
  const videoTrackLane = container.querySelector('#video-track-lane') as HTMLElement;
  const audioTrackLane = container.querySelector('#audio-track-lane') as HTMLElement;
  const textTrackLane = container.querySelector('#text-track-lane') as HTMLElement;
  const textOverlaysStage = container.querySelector('#text-overlays-stage') as HTMLElement;
  const tabContentContainer = container.querySelector('#tab-content-container') as HTMLElement;
  const startDemoModal = container.querySelector('#start-demo-modal') as HTMLElement;

  let pixelsPerSecond = 50; // Timeline scale

  // Helper formatting mm:ss.f
  function formatTimelineTime(sec: number): string {
    const s = Math.max(0, sec);
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    const tenths = Math.floor((s % 1) * 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
  }

  // Update Total Composition Duration
  function calculateTotalDuration(): number {
    let maxDur = 6;
    project.videoClips.forEach(c => {
      const end = c.timelineStart + ((c.endTrim - c.startTrim) / (c.speed || 1));
      if (end > maxDur) maxDur = end;
    });
    project.audioClips.forEach(c => {
      const end = c.timelineStart + ((c.endTrim - c.startTrim) / (c.speed || 1));
      if (end > maxDur) maxDur = end;
    });
    project.textOverlays.forEach(t => {
      const end = t.timelineStart + t.duration;
      if (end > maxDur) maxDur = end;
    });
    project.duration = Math.ceil(maxDur);
    previewTotalTime.textContent = formatTimelineTime(project.duration);
    renderTimelineRuler();
    return project.duration;
  }

  // Render Time Ruler ticks
  function renderTimelineRuler() {
    const totalSecs = Math.max(10, Math.ceil(project.duration + 5));
    const totalWidth = totalSecs * pixelsPerSecond;
    timelineRuler.style.width = `${totalWidth}px`;
    (container.querySelector('#timeline-tracks-area') as HTMLElement).style.width = `${totalWidth}px`;

    let html = '';
    for (let i = 0; i <= totalSecs; i++) {
      const left = i * pixelsPerSecond;
      html += `
        <div class="absolute top-0 bottom-0 border-l border-slate-800" style="left: ${left}px">
          <span class="pl-1 pt-0.5 inline-block select-none">${i}s</span>
        </div>
      `;
    }
    timelineRuler.innerHTML = html;
  }

  // Render Clips on Timeline
  function renderTimelineClips() {
    calculateTotalDuration();

    // 1. Video Clips
    videoTrackLane.innerHTML = project.videoClips.map(clip => {
      const width = Math.max(30, ((clip.endTrim - clip.startTrim) / (clip.speed || 1)) * pixelsPerSecond);
      const left = clip.timelineStart * pixelsPerSecond;
      const isSelected = clip.id === selectedClipId;
      return `
        <div data-clip-id="${clip.id}" data-clip-type="video" class="timeline-clip absolute h-12 rounded-lg bg-blue-900/80 border ${isSelected ? 'border-teal-400 ring-2 ring-teal-400/40' : 'border-blue-700/70'} p-2 flex items-center justify-between text-xs text-white cursor-pointer select-none overflow-hidden transition-shadow" style="left: ${left}px; width: ${width}px">
          <div class="flex items-center gap-1.5 truncate">
            <svg class="w-3.5 h-3.5 text-blue-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            <span class="font-medium truncate text-[11px]">${clip.name} (${clip.speed}x)</span>
          </div>
          <span class="text-[9px] font-mono text-blue-200 ml-1 flex-shrink-0">${((clip.endTrim - clip.startTrim) / clip.speed).toFixed(1)}s</span>
        </div>
      `;
    }).join('');

    // 2. Audio Clips
    audioTrackLane.innerHTML = project.audioClips.map(clip => {
      const width = Math.max(30, ((clip.endTrim - clip.startTrim) / (clip.speed || 1)) * pixelsPerSecond);
      const left = clip.timelineStart * pixelsPerSecond;
      const isSelected = clip.id === selectedClipId;
      return `
        <div data-clip-id="${clip.id}" data-clip-type="audio" class="timeline-clip absolute h-12 rounded-lg bg-purple-900/80 border ${isSelected ? 'border-teal-400 ring-2 ring-teal-400/40' : 'border-purple-700/70'} p-2 flex items-center justify-between text-xs text-white cursor-pointer select-none overflow-hidden transition-shadow" style="left: ${left}px; width: ${width}px">
          <div class="flex items-center gap-1.5 truncate">
            <svg class="w-3.5 h-3.5 text-purple-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
            <span class="font-medium truncate text-[11px]">${clip.name} (Vol ${Math.round(clip.volume * 100)}%)</span>
          </div>
          <span class="text-[9px] font-mono text-purple-200 ml-1 flex-shrink-0">${((clip.endTrim - clip.startTrim) / clip.speed).toFixed(1)}s</span>
        </div>
      `;
    }).join('');

    // 3. Text Overlays
    textTrackLane.innerHTML = project.textOverlays.map(text => {
      const width = Math.max(30, text.duration * pixelsPerSecond);
      const left = text.timelineStart * pixelsPerSecond;
      const isSelected = text.id === selectedTextId;
      return `
        <div data-text-id="${text.id}" class="timeline-text-clip absolute h-12 rounded-lg bg-amber-900/80 border ${isSelected ? 'border-teal-400 ring-2 ring-teal-400/40' : 'border-amber-700/70'} p-2 flex items-center justify-between text-xs text-white cursor-pointer select-none overflow-hidden transition-shadow" style="left: ${left}px; width: ${width}px">
          <div class="flex items-center gap-1.5 truncate">
            <span class="text-[10px] font-bold text-amber-300">"</span>
            <span class="font-medium truncate text-[11px]">${text.text}</span>
          </div>
          <span class="text-[9px] font-mono text-amber-200 ml-1 flex-shrink-0">${text.duration.toFixed(1)}s</span>
        </div>
      `;
    }).join('');

    // Wire Clip Clicks
    container.querySelectorAll('.timeline-clip').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const clipId = el.getAttribute('data-clip-id');
        const clipType = el.getAttribute('data-clip-type');
        selectedClipId = clipId;
        selectedTextId = null;
        renderTimelineClips();
        activeTab = clipType === 'audio' ? 'audio' : 'edit';
        renderActiveTab();
      });
    });

    container.querySelectorAll('.timeline-text-clip').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedTextId = el.getAttribute('data-text-id');
        selectedClipId = null;
        renderTimelineClips();
        activeTab = 'text';
        renderActiveTab();
      });
    });
  }

  // Update Visual Text Overlays on Canvas/Preview
  function updateTextOverlayStage() {
    textOverlaysStage.innerHTML = '';
    project.textOverlays.forEach(item => {
      const isVisible = project.currentTime >= item.timelineStart && project.currentTime <= (item.timelineStart + item.duration);
      if (isVisible) {
        const div = document.createElement('div');
        div.className = 'absolute select-none pointer-events-none transition-transform';
        div.style.left = `${item.x}%`;
        div.style.top = `${item.y}%`;
        div.style.transform = item.textAlign === 'center' ? 'translate(-50%, -50%)' : 'translate(0, -50%)';
        div.style.color = item.color || '#ffffff';
        div.style.fontSize = `${item.fontSize}px`;
        div.style.fontFamily = item.fontFamily || 'sans-serif';
        div.style.fontWeight = item.fontWeight || 'bold';
        div.style.opacity = `${item.opacity ?? 1}`;
        div.style.textAlign = item.textAlign || 'center';

        if (item.style === 'bubble' || item.style === 'caption') {
          div.style.backgroundColor = item.bgColor || 'rgba(15, 23, 42, 0.85)';
          div.style.padding = '6px 14px';
          div.style.borderRadius = '8px';
          div.style.backdropFilter = 'blur(4px)';
        } else if (item.style === 'glow') {
          div.style.textShadow = `0 0 16px ${item.color || '#2dd4bf'}`;
        } else if (item.style === 'cinema') {
          div.style.letterSpacing = '3px';
          div.style.textShadow = '0 2px 10px rgba(0,0,0,0.9)';
        }

        div.textContent = item.text;
        textOverlaysStage.appendChild(div);
      }
    });
  }

  // Apply Real-Time CSS Filters to Video Preview
  function updateVideoFilterStyles() {
    const f = project.filters;
    let filterStr = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%)`;
    if (f.blur > 0) filterStr += ` blur(${f.blur}px)`;
    if (f.sepia > 0) filterStr += ` sepia(${f.sepia}%)`;

    if (f.filterPreset === 'grayscale') filterStr += ' grayscale(100%)';
    else if (f.filterPreset === 'vintage') filterStr += ' sepia(60%) contrast(110%)';
    else if (f.filterPreset === 'cinematic') filterStr += ' contrast(125%) saturate(110%)';
    else if (f.filterPreset === 'warm') filterStr += ' sepia(30%) saturate(130%)';
    else if (f.filterPreset === 'cool') filterStr += ' hue-rotate(180deg) saturate(90%)';
    else if (f.filterPreset === 'cyberpunk') filterStr += ' hue-rotate(90deg) contrast(140%) saturate(160%)';

    masterVideo.style.filter = filterStr;
  }

  // Seek Composition to Time
  function seekTo(timeSec: number) {
    const clamped = Math.max(0, Math.min(project.duration, timeSec));
    project.currentTime = clamped;

    // Update UI elements
    previewCurrentTime.textContent = formatTimelineTime(clamped);
    timelineTimecode.textContent = formatTimelineTime(clamped);
    const leftPx = clamped * pixelsPerSecond;
    timelinePlayhead.style.left = `${leftPx}px`;

    // Seek Video Layer
    const activeVideo = project.videoClips.find(c => {
      const clipEnd = c.timelineStart + ((c.endTrim - c.startTrim) / (c.speed || 1));
      return clamped >= c.timelineStart && clamped < clipEnd;
    });

    if (activeVideo) {
      emptyStateBanner.classList.add('hidden');
      masterVideo.classList.remove('hidden');
      if (masterVideo.src !== activeVideo.url) {
        masterVideo.src = activeVideo.url;
      }
      const mediaOffset = activeVideo.startTrim + (clamped - activeVideo.timelineStart) * (activeVideo.speed || 1);
      masterVideo.playbackRate = activeVideo.speed || 1;
      masterVideo.volume = activeVideo.volume ?? 1;
      if (Math.abs(masterVideo.currentTime - mediaOffset) > 0.1) {
        masterVideo.currentTime = mediaOffset;
      }
    } else {
      if (project.videoClips.length === 0) {
        emptyStateBanner.classList.remove('hidden');
        masterVideo.classList.add('hidden');
      }
    }

    updateTextOverlayStage();
  }

  // Playback Loop
  let lastTimestamp = 0;
  function playbackTick(timestamp: number) {
    if (!project.isPlaying) return;
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    const nextTime = project.currentTime + delta;
    if (nextTime >= project.duration) {
      pausePlayback();
      seekTo(0);
      return;
    }

    seekTo(nextTime);
    animFrameId = requestAnimationFrame(playbackTick);
  }

  function startPlayback() {
    project.isPlaying = true;
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
    lastTimestamp = 0;
    masterVideo.play().catch(() => {});
    animFrameId = requestAnimationFrame(playbackTick);
  }

  function pausePlayback() {
    project.isPlaying = false;
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    if (animFrameId) cancelAnimationFrame(animFrameId);
    masterVideo.pause();
  }

  playPauseBtn.addEventListener('click', () => {
    if (project.isPlaying) pausePlayback();
    else startPlayback();
  });

  // Timeline Scrubbing Handler
  function handleTimelineScrub(e: MouseEvent) {
    const rect = (container.querySelector('#timeline-tracks-area') as HTMLElement).getBoundingClientRect();
    const scrollLeft = timelineScrollContainer.scrollLeft;
    const clickX = e.clientX - rect.left + scrollLeft;
    const time = clickX / pixelsPerSecond;
    seekTo(time);
  }

  timelineScrollContainer.addEventListener('mousedown', (e) => {
    isDraggingPlayhead = true;
    handleTimelineScrub(e);
  });

  window.addEventListener('mousemove', (e) => {
    if (isDraggingPlayhead) {
      handleTimelineScrub(e);
    }
  });

  window.addEventListener('mouseup', () => {
    isDraggingPlayhead = false;
  });

  // Transport Skip buttons
  container.querySelector('#skip-back-btn')?.addEventListener('click', () => {
    seekTo(project.currentTime - 1);
  });
  container.querySelector('#skip-fwd-btn')?.addEventListener('click', () => {
    seekTo(project.currentTime + 1);
  });

  // Aspect ratio switchers
  container.querySelectorAll('.aspect-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.aspect-btn').forEach(b => {
        b.classList.remove('bg-brand-600', 'text-white', 'font-semibold');
        b.classList.add('text-slate-300');
      });
      btn.classList.add('bg-brand-600', 'text-white', 'font-semibold');
      btn.classList.remove('text-slate-300');

      const aspect = btn.getAttribute('data-aspect') as any;
      project.aspectRatio = aspect;
      const previewContainer = container.querySelector('#preview-aspect-container') as HTMLElement;
      previewContainer.className = `relative bg-black rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex items-center justify-center transition-all duration-300 max-h-[55vh] w-full max-w-4xl ${
        aspect === '9:16' ? 'aspect-[9/16] max-w-xs' : 
        aspect === '1:1' ? 'aspect-square max-w-md' : 
        aspect === '4:5' ? 'aspect-[4/5] max-w-sm' : 
        'aspect-video'
      }`;
    });
  });

  // Zoom slider
  const zoomSlider = container.querySelector('#timeline-zoom-slider') as HTMLInputElement;
  zoomSlider.addEventListener('input', () => {
    pixelsPerSecond = 50 * Number(zoomSlider.value);
    renderTimelineClips();
    seekTo(project.currentTime);
  });

  // Split Functionality
  function splitSelectedClip() {
    const clip = project.videoClips.find(c => c.id === selectedClipId);
    if (!clip) return;

    const clipEnd = clip.timelineStart + ((clip.endTrim - clip.startTrim) / (clip.speed || 1));
    if (project.currentTime <= clip.timelineStart || project.currentTime >= clipEnd) {
      alert('Playhead must be inside the selected clip to split.');
      return;
    }

    const splitOffsetMedia = clip.startTrim + (project.currentTime - clip.timelineStart) * (clip.speed || 1);
    
    // Create second clip
    const secondClip: MediaClip = {
      ...clip,
      id: 'clip_' + Date.now(),
      name: `${clip.name} (Part 2)`,
      startTrim: splitOffsetMedia,
      timelineStart: project.currentTime
    };

    // Trim first clip
    clip.endTrim = splitOffsetMedia;

    project.videoClips.push(secondClip);
    renderTimelineClips();
    renderActiveTab();
  }

  container.querySelector('#quick-split-btn')?.addEventListener('click', splitSelectedClip);

  // --------------------------------------------------------------------------
  // TAB CONTROLS & INSPECTOR PANELS (Edit, Media, Audio, Text, Filters, Export)
  // --------------------------------------------------------------------------
  function renderActiveTab() {
    // Update active state in desktop and mobile tabs
    container.querySelectorAll('.tab-trigger').forEach(btn => {
      const tab = btn.getAttribute('data-tab');
      if (tab === activeTab) {
        btn.classList.add('text-teal-400');
        btn.classList.remove('text-slate-400');
        const iconBox = btn.querySelector('div');
        if (iconBox) {
          iconBox.classList.add('bg-brand-950', 'border', 'border-teal-500/40', 'text-teal-400');
          iconBox.classList.remove('bg-slate-800');
        }
      } else {
        btn.classList.remove('text-teal-400');
        btn.classList.add('text-slate-400');
        const iconBox = btn.querySelector('div');
        if (iconBox) {
          iconBox.classList.remove('bg-brand-950', 'border', 'border-teal-500/40', 'text-teal-400');
          iconBox.classList.add('bg-slate-800');
        }
      }
    });

    // RENDER DRAWER CONTENT
    if (activeTab === 'media') {
      tabContentContainer.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-bold text-white flex items-center gap-1.5">
              <svg class="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              Project Media
            </h4>
            <span class="text-[11px] text-slate-500">${project.videoClips.length + project.audioClips.length} Files</span>
          </div>

          <label for="drawer-add-media" class="w-full py-4 border-2 border-dashed border-slate-700 hover:border-teal-400 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 transition-all flex flex-col items-center justify-center cursor-pointer group p-3 text-center">
            <svg class="w-6 h-6 text-slate-400 group-hover:text-teal-400 mb-1 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            <span class="text-xs font-semibold text-slate-200 group-hover:text-white">+ Import Local Video/Audio</span>
            <span class="text-[10px] text-slate-500 mt-0.5">MP4, MKV, WebM, MOV, MP3, WAV</span>
            <input id="drawer-add-media" type="file" accept="video/*,audio/*" multiple class="hidden" />
          </label>

          <button id="drawer-try-demo-btn" class="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-teal-300 border border-teal-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path></svg>
            Load Sample Demo Project
          </button>

          <div class="space-y-2 mt-2">
            <h5 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Clips in Project</h5>
            ${project.videoClips.map(clip => `
              <div class="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs">
                <div class="flex items-center gap-2 truncate">
                  <div class="w-6 h-6 rounded bg-blue-950 text-blue-400 flex items-center justify-center flex-shrink-0">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  </div>
                  <span class="truncate font-medium text-slate-200">${clip.name}</span>
                </div>
                <button data-remove-clip="${clip.id}" class="text-slate-500 hover:text-red-400 p-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      tabContentContainer.querySelector('#drawer-add-media')?.addEventListener('change', (e: any) => {
        handleFileImport(e.target.files);
      });
      tabContentContainer.querySelector('#drawer-try-demo-btn')?.addEventListener('click', loadDemoProject);
      tabContentContainer.querySelectorAll('[data-remove-clip]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-remove-clip');
          project.videoClips = project.videoClips.filter(c => c.id !== id);
          renderTimelineClips();
          renderActiveTab();
          seekTo(0);
        });
      });
    } else if (activeTab === 'edit') {
      const selectedClip = project.videoClips.find(c => c.id === selectedClipId) || project.videoClips[0];
      if (!selectedClip) {
        tabContentContainer.innerHTML = `
          <div class="p-6 text-center text-slate-500 text-xs">
            <p>No video clip selected. Select a clip on the timeline to trim, split, or adjust playback speed.</p>
          </div>
        `;
        return;
      }

      tabContentContainer.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-bold text-white truncate">${selectedClip.name}</h4>
            <span class="text-[11px] text-teal-400 font-mono">${(selectedClip.endTrim - selectedClip.startTrim).toFixed(1)}s</span>
          </div>

          <!-- Speed Control -->
          <div>
            <div class="flex justify-between text-xs text-slate-400 mb-1">
              <span>Playback Speed</span>
              <span class="font-mono text-teal-400 font-bold" id="speed-display">${selectedClip.speed}x</span>
            </div>
            <div class="grid grid-cols-4 gap-1.5">
              ${[0.5, 1, 1.5, 2].map(spd => `
                <button data-set-speed="${spd}" class="speed-btn py-1 text-xs rounded-lg border ${selectedClip.speed === spd ? 'bg-teal-500/20 border-teal-400 text-teal-300 font-bold' : 'bg-slate-800 border-slate-700 text-slate-300'}">${spd}x</button>
              `).join('')}
            </div>
          </div>

          <!-- Trim / Cut In and Out Controls -->
          <div class="space-y-2 pt-2 border-t border-slate-800">
            <span class="text-xs font-semibold text-slate-300">Trim Clip Range</span>
            <div>
              <div class="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Start Trim Offset:</span>
                <span class="font-mono text-white">${selectedClip.startTrim.toFixed(1)}s</span>
              </div>
              <input id="trim-start-range" type="range" min="0" max="${selectedClip.endTrim - 0.5}" step="0.1" value="${selectedClip.startTrim}" class="w-full accent-teal-400 bg-slate-700 h-1.5 rounded-lg cursor-pointer" />
            </div>

            <div>
              <div class="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>End Trim Offset:</span>
                <span class="font-mono text-white">${selectedClip.endTrim.toFixed(1)}s</span>
              </div>
              <input id="trim-end-range" type="range" min="${selectedClip.startTrim + 0.5}" max="${selectedClip.duration}" step="0.1" value="${selectedClip.endTrim}" class="w-full accent-teal-400 bg-slate-700 h-1.5 rounded-lg cursor-pointer" />
            </div>
          </div>

          <!-- Split & Delete Actions -->
          <div class="pt-3 border-t border-slate-800 flex gap-2">
            <button id="drawer-split-btn" class="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1">
              <svg class="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.242-4.242 3 3 0 004.242 4.242z"></path></svg>
              <span>Split at Playhead</span>
            </button>
            <button id="drawer-delete-clip-btn" class="px-3 py-2 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800 rounded-lg text-xs font-semibold">
              Delete
            </button>
          </div>
        </div>
      `;

      // Wire speed buttons
      tabContentContainer.querySelectorAll('[data-set-speed]').forEach(btn => {
        btn.addEventListener('click', () => {
          const spd = Number(btn.getAttribute('data-set-speed'));
          selectedClip.speed = spd;
          renderTimelineClips();
          renderActiveTab();
          seekTo(project.currentTime);
        });
      });

      // Wire Trim Sliders
      const startRange = tabContentContainer.querySelector('#trim-start-range') as HTMLInputElement;
      const endRange = tabContentContainer.querySelector('#trim-end-range') as HTMLInputElement;
      startRange?.addEventListener('input', () => {
        selectedClip.startTrim = Number(startRange.value);
        renderTimelineClips();
        seekTo(selectedClip.timelineStart);
      });
      endRange?.addEventListener('input', () => {
        selectedClip.endTrim = Number(endRange.value);
        renderTimelineClips();
      });

      tabContentContainer.querySelector('#drawer-split-btn')?.addEventListener('click', splitSelectedClip);
      tabContentContainer.querySelector('#drawer-delete-clip-btn')?.addEventListener('click', () => {
        project.videoClips = project.videoClips.filter(c => c.id !== selectedClip.id);
        selectedClipId = null;
        renderTimelineClips();
        renderActiveTab();
        seekTo(0);
      });
    } else if (activeTab === 'audio') {
      tabContentContainer.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-bold text-white flex items-center gap-1.5">
              <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
              Background Music & Audio
            </h4>
          </div>

          <button id="add-synth-bgm-btn" class="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            + Add Chill Royalty-Free Beat (Offline)
          </button>

          <label for="import-custom-audio" class="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
            <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            Import MP3 / WAV from Device
            <input id="import-custom-audio" type="file" accept="audio/*" class="hidden" />
          </label>

          <!-- Audio Controls for selected clip -->
          <div class="pt-3 border-t border-slate-800 space-y-3">
            <span class="text-xs font-semibold text-slate-300">Volume & Fade Control</span>
            <div>
              <div class="flex justify-between text-xs text-slate-400 mb-1">
                <span>Master Volume</span>
                <span class="font-mono text-teal-400" id="audio-vol-label">100%</span>
              </div>
              <input id="audio-vol-slider" type="range" min="0" max="2" step="0.05" value="1" class="w-full accent-purple-400 bg-slate-700 h-1.5 rounded-lg cursor-pointer" />
            </div>

            <div>
              <div class="flex justify-between text-xs text-slate-400 mb-1">
                <span>Audio Fade In</span>
                <span class="font-mono text-slate-300">0.5s</span>
              </div>
              <input type="range" min="0" max="3" step="0.5" value="0.5" class="w-full accent-purple-400 bg-slate-700 h-1.5 rounded-lg cursor-pointer" />
            </div>
          </div>
        </div>
      `;

      tabContentContainer.querySelector('#add-synth-bgm-btn')?.addEventListener('click', async () => {
        const audioBlob = await generateSyntheticAudio(8);
        const url = URL.createObjectURL(audioBlob);
        project.audioClips.push({
          id: 'audio_' + Date.now(),
          name: 'Lo-Fi Chill Beat.wav',
          type: 'audio',
          url,
          duration: 8,
          startTrim: 0,
          endTrim: 8,
          timelineStart: 0,
          speed: 1,
          volume: 0.8,
          fadeIn: 0.5,
          fadeOut: 0.5
        });
        renderTimelineClips();
      });

      tabContentContainer.querySelector('#import-custom-audio')?.addEventListener('change', (e: any) => {
        handleFileImport(e.target.files);
      });

      const volSlider = tabContentContainer.querySelector('#audio-vol-slider') as HTMLInputElement;
      volSlider?.addEventListener('input', () => {
        const val = Number(volSlider.value);
        (tabContentContainer.querySelector('#audio-vol-label') as HTMLElement).textContent = `${Math.round(val * 100)}%`;
        project.audioClips.forEach(c => c.volume = val);
        renderTimelineClips();
      });
    } else if (activeTab === 'text') {
      const selectedText = project.textOverlays.find(t => t.id === selectedTextId);

      tabContentContainer.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-bold text-white flex items-center gap-1.5">
              <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M12 8v11m-4 0h8"></path></svg>
              Titles & Subtitles
            </h4>
          </div>

          <button id="add-text-overlay-btn" class="w-full py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            + Add New Title
          </button>

          ${selectedText ? `
            <div class="p-3 bg-slate-800/80 border border-slate-700 rounded-xl space-y-3">
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Text Caption</label>
                <input id="edit-text-input" type="text" value="${selectedText.text}" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-amber-400 focus:outline-none" />
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[11px] text-slate-400 mb-1">Style Preset</label>
                  <select id="edit-text-style" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white">
                    <option value="plain" ${selectedText.style === 'plain' ? 'selected' : ''}>Plain</option>
                    <option value="bubble" ${selectedText.style === 'bubble' ? 'selected' : ''}>Bubble Box</option>
                    <option value="glow" ${selectedText.style === 'glow' ? 'selected' : ''}>Neon Glow</option>
                    <option value="cinema" ${selectedText.style === 'cinema' ? 'selected' : ''}>Cinematic Title</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[11px] text-slate-400 mb-1">Text Color</label>
                  <input id="edit-text-color" type="color" value="${selectedText.color || '#ffffff'}" class="w-full h-8 bg-transparent rounded cursor-pointer" />
                </div>
              </div>

              <div>
                <div class="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Font Size</span>
                  <span class="font-mono text-white">${selectedText.fontSize}px</span>
                </div>
                <input id="edit-text-size" type="range" min="14" max="72" value="${selectedText.fontSize}" class="w-full accent-amber-400 bg-slate-700 h-1.5 rounded cursor-pointer" />
              </div>

              <button id="delete-text-btn" class="w-full py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800 rounded-lg text-xs font-semibold">
                Delete Text Overlay
              </button>
            </div>
          ` : `
            <div class="text-center p-4 text-xs text-slate-500">
              Click on an existing text overlay on the timeline to customize font, color, and positioning.
            </div>
          `}
        </div>
      `;

      tabContentContainer.querySelector('#add-text-overlay-btn')?.addEventListener('click', () => {
        const newText: TextOverlay = {
          id: 'text_' + Date.now(),
          text: 'New Stylish Caption',
          timelineStart: project.currentTime,
          duration: 3,
          x: 50,
          y: 80,
          fontSize: 32,
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          color: '#ffffff',
          bgColor: 'rgba(15, 23, 42, 0.85)',
          opacity: 1,
          fontWeight: 'bold',
          textAlign: 'center',
          style: 'bubble'
        };
        project.textOverlays.push(newText);
        selectedTextId = newText.id;
        renderTimelineClips();
        renderActiveTab();
        updateTextOverlayStage();
      });

      if (selectedText) {
        const textInput = tabContentContainer.querySelector('#edit-text-input') as HTMLInputElement;
        const styleSelect = tabContentContainer.querySelector('#edit-text-style') as HTMLSelectElement;
        const colorInput = tabContentContainer.querySelector('#edit-text-color') as HTMLInputElement;
        const sizeInput = tabContentContainer.querySelector('#edit-text-size') as HTMLInputElement;

        textInput?.addEventListener('input', () => {
          selectedText.text = textInput.value;
          renderTimelineClips();
          updateTextOverlayStage();
        });
        styleSelect?.addEventListener('change', () => {
          selectedText.style = styleSelect.value as any;
          updateTextOverlayStage();
        });
        colorInput?.addEventListener('input', () => {
          selectedText.color = colorInput.value;
          updateTextOverlayStage();
        });
        sizeInput?.addEventListener('input', () => {
          selectedText.fontSize = Number(sizeInput.value);
          updateTextOverlayStage();
        });
        tabContentContainer.querySelector('#delete-text-btn')?.addEventListener('click', () => {
          project.textOverlays = project.textOverlays.filter(t => t.id !== selectedText.id);
          selectedTextId = null;
          renderTimelineClips();
          renderActiveTab();
          updateTextOverlayStage();
        });
      }
    } else if (activeTab === 'filters') {
      const f = project.filters;
      tabContentContainer.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-bold text-white flex items-center gap-1.5">
              <svg class="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
              Color Filters & Adjust
            </h4>
          </div>

          <!-- Color Presets -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-2">Cinematic Presets</label>
            <div class="grid grid-cols-3 gap-1.5">
              ${['normal', 'cinematic', 'vintage', 'warm', 'cool', 'grayscale', 'cyberpunk'].map(preset => `
                <button data-preset="${preset}" class="preset-btn py-1.5 px-2 rounded-lg text-xs capitalize border ${f.filterPreset === preset ? 'bg-teal-500/20 border-teal-400 text-teal-300 font-bold' : 'bg-slate-800 border-slate-700 text-slate-300'}">${preset}</button>
              `).join('')}
            </div>
          </div>

          <!-- Sliders: Brightness, Contrast, Saturation -->
          <div class="space-y-3 pt-3 border-t border-slate-800">
            <div>
              <div class="flex justify-between text-xs text-slate-400 mb-1">
                <span>Brightness</span>
                <span class="font-mono text-teal-400" id="filter-bright-label">${f.brightness}%</span>
              </div>
              <input id="filter-bright-slider" type="range" min="50" max="150" value="${f.brightness}" class="w-full accent-teal-400 bg-slate-700 h-1.5 rounded cursor-pointer" />
            </div>

            <div>
              <div class="flex justify-between text-xs text-slate-400 mb-1">
                <span>Contrast</span>
                <span class="font-mono text-teal-400" id="filter-contrast-label">${f.contrast}%</span>
              </div>
              <input id="filter-contrast-slider" type="range" min="50" max="150" value="${f.contrast}" class="w-full accent-teal-400 bg-slate-700 h-1.5 rounded cursor-pointer" />
            </div>

            <div>
              <div class="flex justify-between text-xs text-slate-400 mb-1">
                <span>Saturation</span>
                <span class="font-mono text-teal-400" id="filter-sat-label">${f.saturation}%</span>
              </div>
              <input id="filter-sat-slider" type="range" min="0" max="200" value="${f.saturation}" class="w-full accent-teal-400 bg-slate-700 h-1.5 rounded cursor-pointer" />
            </div>
          </div>
        </div>
      `;

      tabContentContainer.querySelectorAll('[data-preset]').forEach(btn => {
        btn.addEventListener('click', () => {
          f.filterPreset = btn.getAttribute('data-preset') as any;
          renderActiveTab();
          updateVideoFilterStyles();
        });
      });

      const bSlider = tabContentContainer.querySelector('#filter-bright-slider') as HTMLInputElement;
      const cSlider = tabContentContainer.querySelector('#filter-contrast-slider') as HTMLInputElement;
      const sSlider = tabContentContainer.querySelector('#filter-sat-slider') as HTMLInputElement;

      bSlider?.addEventListener('input', () => {
        f.brightness = Number(bSlider.value);
        (tabContentContainer.querySelector('#filter-bright-label') as HTMLElement).textContent = `${f.brightness}%`;
        updateVideoFilterStyles();
      });
      cSlider?.addEventListener('input', () => {
        f.contrast = Number(cSlider.value);
        (tabContentContainer.querySelector('#filter-contrast-label') as HTMLElement).textContent = `${f.contrast}%`;
        updateVideoFilterStyles();
      });
      sSlider?.addEventListener('input', () => {
        f.saturation = Number(sSlider.value);
        (tabContentContainer.querySelector('#filter-sat-label') as HTMLElement).textContent = `${f.saturation}%`;
        updateVideoFilterStyles();
      });
    }
  }

  // Handle Tab Triggers
  container.querySelectorAll('.tab-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.getAttribute('data-tab') as EditorTab;
      renderActiveTab();
    });
  });

  // Handle File Import
  function handleFileImport(files: FileList | null) {
    if (!files || files.length === 0) return;
    startDemoModal.classList.add('hidden');

    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const isAudio = file.type.startsWith('audio/');
      const name = file.name;

      if (isAudio) {
        project.audioClips.push({
          id: 'clip_' + Date.now() + Math.random().toString(36).substring(2, 5),
          name,
          type: 'audio',
          file,
          url,
          duration: 10,
          startTrim: 0,
          endTrim: 10,
          timelineStart: 0,
          speed: 1,
          volume: 1,
          fadeIn: 0,
          fadeOut: 0
        });
      } else {
        // Load metadata to get accurate duration
        const tempVideo = document.createElement('video');
        tempVideo.src = url;
        tempVideo.onloadedmetadata = () => {
          const duration = tempVideo.duration || 6;
          project.videoClips.push({
            id: 'clip_' + Date.now() + Math.random().toString(36).substring(2, 5),
            name,
            type: 'video',
            file,
            url,
            duration,
            startTrim: 0,
            endTrim: duration,
            timelineStart: project.videoClips.reduce((acc, c) => acc + ((c.endTrim - c.startTrim) / (c.speed || 1)), 0),
            speed: 1,
            volume: 1,
            fadeIn: 0,
            fadeOut: 0
          });
          renderTimelineClips();
          renderActiveTab();
          seekTo(0);
        };
      }
    });

    renderTimelineClips();
    renderActiveTab();
  }

  // Load Demo Project (Client-side Canvas Synthetic Video & Melody)
  async function loadDemoProject() {
    startDemoModal.classList.add('hidden');
    const { videoBlob, audioBlob } = await generateDemoVideo();

    const videoUrl = URL.createObjectURL(videoBlob);
    const audioUrl = URL.createObjectURL(audioBlob);

    project.videoClips = [
      {
        id: 'demo_video_1',
        name: 'Neon Intro Showcase.webm',
        type: 'video',
        blob: videoBlob,
        url: videoUrl,
        duration: 6,
        startTrim: 0,
        endTrim: 6,
        timelineStart: 0,
        speed: 1,
        volume: 1,
        fadeIn: 0,
        fadeOut: 0
      }
    ];

    project.audioClips = [
      {
        id: 'demo_audio_1',
        name: 'Vibrant Synthesizer Track.wav',
        type: 'audio',
        blob: audioBlob,
        url: audioUrl,
        duration: 5,
        startTrim: 0,
        endTrim: 5,
        timelineStart: 0,
        speed: 1,
        volume: 0.8,
        fadeIn: 0.5,
        fadeOut: 0.5
      }
    ];

    project.textOverlays = [
      {
        id: 'demo_text_1',
        text: 'VidToAudio CapCut Editor',
        timelineStart: 0.5,
        duration: 3,
        x: 50,
        y: 35,
        fontSize: 34,
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        color: '#2dd4bf',
        bgColor: 'rgba(15, 23, 42, 0.85)',
        opacity: 1,
        fontWeight: 'bold',
        textAlign: 'center',
        style: 'bubble'
      },
      {
        id: 'demo_text_2',
        text: '100% Client-Side WebAssembly',
        timelineStart: 2.5,
        duration: 3.5,
        x: 50,
        y: 80,
        fontSize: 24,
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        color: '#ffffff',
        opacity: 1,
        fontWeight: 'bold',
        textAlign: 'center',
        style: 'glow'
      }
    ];

    selectedClipId = 'demo_video_1';
    renderTimelineClips();
    renderActiveTab();
    seekTo(0);
  }

  // Modal event wiring
  container.querySelector('#modal-try-demo-btn')?.addEventListener('click', loadDemoProject);
  container.querySelector('#empty-add-demo-btn')?.addEventListener('click', loadDemoProject);
  container.querySelector('#editor-demo-modal-open')?.addEventListener('click', () => {
    startDemoModal.classList.remove('hidden');
  });
  container.querySelector('#close-start-modal')?.addEventListener('click', () => {
    startDemoModal.classList.add('hidden');
  });
  container.querySelector('#empty-add-media-btn')?.addEventListener('click', () => {
    (container.querySelector('#modal-file-input') as HTMLInputElement)?.click();
  });
  container.querySelector('#modal-file-input')?.addEventListener('change', (e: any) => {
    handleFileImport(e.target.files);
  });

  // Export flow wiring
  const exportBtn = container.querySelector('#editor-export-btn') as HTMLElement;
  const exportModal = container.querySelector('#export-progress-modal') as HTMLElement;
  const exportProgressBar = container.querySelector('#export-progress-bar') as HTMLElement;
  const exportProgressText = container.querySelector('#export-progress-text') as HTMLElement;
  const exportStatus = container.querySelector('#export-modal-status') as HTMLElement;
  const exportDownloadArea = container.querySelector('#export-download-area') as HTMLElement;
  const exportDownloadLink = container.querySelector('#export-download-link') as HTMLAnchorElement;

  exportBtn?.addEventListener('click', async () => {
    if (project.videoClips.length === 0) {
      alert('Please add at least one video clip or load a demo video before exporting.');
      return;
    }

    pausePlayback();
    exportModal.classList.remove('hidden');
    exportProgressBar.style.width = '0%';
    exportProgressText.textContent = '0%';
    exportDownloadArea.classList.add('hidden');

    try {
      const result = await exportCompositionClientSide({
        videoClips: project.videoClips,
        audioClips: project.audioClips,
        textOverlays: project.textOverlays,
        filters: project.filters,
        aspectRatio: project.aspectRatio,
        totalDuration: project.duration,
        outputFormat: 'mp4',
        resolution: '720p',
        onProgress: (pct, status) => {
          exportProgressBar.style.width = `${pct}%`;
          exportProgressText.textContent = `${pct}%`;
          exportStatus.textContent = status;
        }
      });

      const url = URL.createObjectURL(result.blob);
      exportDownloadLink.href = url;
      exportDownloadLink.download = result.filename;
      exportDownloadArea.classList.remove('hidden');
    } catch (err: any) {
      console.error('Export error:', err);
      alert('Export failed: ' + (err?.message || err));
      exportModal.classList.add('hidden');
    }
  });

  container.querySelector('#close-export-modal')?.addEventListener('click', () => {
    exportModal.classList.add('hidden');
  });

  // Back to Home Button
  container.querySelector('#editor-back-home')?.addEventListener('click', () => {
    if (typeof (window as any).navigateTo === 'function') {
      window.history.pushState({}, '', '/');
      (window as any).navigateTo('/');
    } else {
      window.location.assign('/');
    }
  });

  // Initial render setup
  renderTimelineRuler();
  renderTimelineClips();
  renderActiveTab();
  seekTo(0);
}
