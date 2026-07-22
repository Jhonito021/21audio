export type TrackSource = 'local' | 'stream' | 'sample';
export type AudioFormat = 'MP3' | 'FLAC' | 'AAC' | 'WAV' | 'OGG' | 'STREAM';

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl?: string; // base64 or object URL or remote URL
  src: string; // Blob URL, remote URL, or stream link
  source: TrackSource;
  format: AudioFormat;
  bitrate?: string; // e.g. "320 kbps", "FLAC 24-bit"
  fileSize?: number; // bytes
  addedAt: number;
  genre?: string;
  year?: string;
  lyrics?: string;
  isFavorite?: boolean;
  blob?: Blob; // stored in IndexedDB for local tracks
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  trackIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface RadioStation {
  id: string;
  name: string;
  genre: string;
  country: string;
  streamUrl: string;
  logoUrl: string;
  bitrate: string;
  description: string;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface EqualizerPreset {
  name: string;
  gains: number[]; // 5 bands: 60Hz, 230Hz, 910Hz, 4kHz, 14kHz (in dB, e.g. -12 to +12)
}

export type TabType = 'library' | 'playlists' | 'streams' | 'equalizer' | 'settings';
