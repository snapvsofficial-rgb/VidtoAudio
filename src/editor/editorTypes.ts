export interface MediaClip {
  id: string;
  name: string;
  type: 'video' | 'audio';
  file?: File;
  blob?: Blob;
  url: string;
  duration: number; // in seconds
  startTrim: number; // offset into source media in seconds
  endTrim: number; // end offset in source media in seconds
  timelineStart: number; // placement on timeline in seconds
  speed: number; // 0.25x - 4x
  volume: number; // 0 - 2 (100% is 1.0)
  fadeIn: number; // fade in duration in seconds
  fadeOut: number; // fade out duration in seconds
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface TextOverlay {
  id: string;
  text: string;
  timelineStart: number; // in seconds
  duration: number; // in seconds
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  fontSize: number; // px
  fontFamily: string;
  color: string;
  bgColor?: string;
  opacity: number;
  fontWeight: string;
  textAlign: 'left' | 'center' | 'right';
  style: 'plain' | 'caption' | 'bubble' | 'glow' | 'cinema';
}

export interface VideoFilters {
  brightness: number; // 50 - 150 (100 is default)
  contrast: number; // 50 - 150 (100 is default)
  saturation: number; // 0 - 200 (100 is default)
  filterPreset: 'normal' | 'cinematic' | 'vintage' | 'warm' | 'cool' | 'grayscale' | 'cyberpunk';
  blur: number; // 0 - 10px
  sepia: number; // 0 - 100%
}

export type EditorTab = 'edit' | 'media' | 'audio' | 'text' | 'filters' | 'export';

export interface EditorProject {
  title: string;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  duration: number; // total duration
  currentTime: number; // playback head
  isPlaying: boolean;
  videoClips: MediaClip[];
  audioClips: MediaClip[];
  textOverlays: TextOverlay[];
  filters: VideoFilters;
}
