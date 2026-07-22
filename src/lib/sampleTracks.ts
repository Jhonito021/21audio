import { AudioTrack, EqualizerPreset } from '../types';

export const SAMPLE_TRACKS: AudioTrack[] = [
  {
    id: 'sample-1',
    title: 'Midnight Cyber City',
    artist: '21audio Studio',
    album: 'Neon Horizon (FLAC HD)',
    duration: 184,
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    src: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=synthwave-80s-110045.mp3',
    source: 'sample',
    format: 'FLAC',
    bitrate: '24-bit / 96kHz High-Res',
    addedAt: Date.now() - 100000,
    genre: 'Synthwave / Electronic',
    year: '2026',
    lyrics: `[00:00.00] Des lumières néon traversent la nuit
[00:15.00] Le son de 21audio résonne dans la ville
[00:30.00] Basses profondes et synthétiseurs futuristes
[00:45.00] Écoute la musique en haute résolution`,
    isFavorite: true
  },
  {
    id: 'sample-2',
    title: 'Acoustic Sunset Drive',
    artist: 'Luna & The Waves',
    album: 'Golden Hour Sessions',
    duration: 142,
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
    src: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a7351a.mp3?filename=acoustic-guitar-loop-10493.mp3',
    source: 'sample',
    format: 'MP3',
    bitrate: '320 kbps HQ',
    addedAt: Date.now() - 80000,
    genre: 'Acoustic / Folk',
    year: '2025',
    lyrics: `[00:00.00] Douce brise d été au coucher du soleil
[00:20.00] Les cordes de guitare réchauffent l esprit
[00:40.00] Une mélodie apaisante pour voyager`,
    isFavorite: false
  },
  {
    id: 'sample-3',
    title: 'Deep House Flow',
    artist: 'Pulse 21',
    album: 'Club Anthems Vol. 1',
    duration: 210,
    coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=80',
    src: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939ee3270.mp3?filename=deep-house-124479.mp3',
    source: 'sample',
    format: 'FLAC',
    bitrate: '24-bit Lossless',
    addedAt: Date.now() - 60000,
    genre: 'Deep House / Dance',
    year: '2026',
    lyrics: `[00:00.00] Sentez le rythme monter
[00:30.00] 21audio - Expérience sonore immersive`,
    isFavorite: true
  },
  {
    id: 'sample-4',
    title: 'Lo-Fi Chill Rain',
    artist: 'Cozy Beats Collective',
    album: 'Coffee & Headphones',
    duration: 165,
    coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=80',
    src: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=chill-lofi-song-8444.mp3',
    source: 'sample',
    format: 'MP3',
    bitrate: '320 kbps',
    addedAt: Date.now() - 40000,
    genre: 'Lo-Fi Chill',
    year: '2025',
    lyrics: `[00:00.00] Gouttes de pluie sur le carreau
[00:15.00] Un café chaud et 21audio en fond sonore`,
    isFavorite: false
  }
];

export const EQUALIZER_PRESETS: EqualizerPreset[] = [
  { name: 'Plat / Neutre', gains: [0, 0, 0, 0, 0] },
  { name: 'Basses Rehaussées (Bass Boost)', gains: [8, 5, 1, 0, -1] },
  { name: 'Acoustique / Vocaux', gains: [-1, 2, 6, 4, 1] },
  { name: 'Rock / Dynamic', gains: [5, 3, -1, 3, 6] },
  { name: 'Électronique / Club', gains: [6, 4, 0, 2, 5] },
  { name: 'Lo-Fi / Vintage Warm', gains: [4, 2, 0, -2, -4] }
];
