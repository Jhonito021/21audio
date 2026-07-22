import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  PictureInPicture,
  RotateCcw,
  Upload,
  Film,
  Plus,
  Trash2,
  Settings2,
  Sparkles,
  Layers,
  Check
} from 'lucide-react';

export interface VideoItem {
  id: string;
  title: string;
  description?: string;
  src: string;
  duration?: number;
  thumbnail?: string;
  isCustom?: boolean;
}

const SAMPLE_VIDEOS: VideoItem[] = [
  {
    id: 'v1',
    title: 'Big Buck Bunny (Trailer)',
    description: 'Animation open-source par la Blender Foundation',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
    duration: 596
  },
  {
    id: 'v2',
    title: 'Elephants Dream (4K)',
    description: 'Premier court-métrage libre d-animation 3D',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    duration: 653
  },
  {
    id: 'v3',
    title: 'For Bigger Blazes',
    description: 'Vidéo démonstration de dynamique haute définition',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    duration: 15
  },
  {
    id: 'v4',
    title: 'Visualiseur Océanique',
    description: 'Boucle vidéo relaxante pour écoute de musique',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&auto=format&fit=crop&q=80',
    duration: 734
  }
];

interface VideoViewProps {
  onVideoPlayStateChange?: (isPlaying: boolean) => void;
}

export const VideoView: React.FC<VideoViewProps> = ({ onVideoPlayStateChange }) => {
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem('audioflux_videos');
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...SAMPLE_VIDEOS, ...parsed];
      }
    } catch {
      // fallback
    }
    return SAMPLE_VIDEOS;
  });

  const [currentVideo, setCurrentVideo] = useState<VideoItem>(SAMPLE_VIDEOS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'fit' | 'cover' | 'stretch'>('fit');
  const [playerSize, setPlayerSize] = useState<'normal' | 'large' | 'cinema'>('large');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state with HTML video element
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    const reloadVideos = () => {
      try {
        const saved = localStorage.getItem('audioflux_videos');
        if (saved) {
          const parsed = JSON.parse(saved);
          setVideos([...SAMPLE_VIDEOS, ...parsed]);
        }
      } catch (err) {
        console.warn('Failed to reload custom videos:', err);
      }
    };

    window.addEventListener('audioflux_videos_updated', reloadVideos);
    return () => window.removeEventListener('audioflux_videos_updated', reloadVideos);
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      onVideoPlayStateChange?.(false);
    } else {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          onVideoPlayStateChange?.(true);
        })
        .catch((err) => console.error('Video playback error:', err));
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleTogglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.warn('PiP not supported or failed:', e);
    }
  };

  const handleToggleFullscreen = () => {
    if (!playerContainerRef.current) return;

    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => console.error(err));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(err => console.error(err));
    }
  };

  const handleSelectVideo = (video: VideoItem) => {
    setCurrentVideo(video);
    setIsPlaying(false);
    setCurrentTime(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newVideos: VideoItem[] = [];

    Array.from(files).forEach((file: File) => {
      const url = URL.createObjectURL(file);
      const videoItem: VideoItem = {
        id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: `Fichier local MP4/WebM (${(file.size / (1024 * 1024)).toFixed(1)} Mo)`,
        src: url,
        isCustom: true,
      };
      newVideos.push(videoItem);
    });

    if (newVideos.length > 0) {
      const updatedList = [...videos, ...newVideos];
      setVideos(updatedList);
      handleSelectVideo(newVideos[0]);

      // Save custom ones metadata to local storage
      const customOnly = updatedList.filter((v) => v.isCustom);
      try {
        localStorage.setItem('audioflux_videos', JSON.stringify(customOnly));
      } catch (err) {
        console.warn('LocalStorage limit:', err);
      }
    }
  };

  const handleDeleteCustomVideo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = videos.filter((v) => v.id !== id);
    setVideos(filtered);
    if (currentVideo.id === id && filtered.length > 0) {
      handleSelectVideo(filtered[0]);
    }
    const customOnly = filtered.filter((v) => v.isCustom);
    localStorage.setItem('audioflux_videos', JSON.stringify(customOnly));
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-800/80 p-5 rounded-2xl border border-neutral-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Film className="w-6 h-6 text-[#c6ff34]" />
            <h2 className="text-xl font-bold text-white tracking-tight">Lecteur Vidéo HD</h2>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-[#c6ff34]/20 text-[#c6ff34]">
              GRAND ÉCRAN
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Lisez vos vidéos MP4, WebM et MKV locales ou explorez nos démos haute définition.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Size Selector */}
          <div className="flex items-center gap-1 bg-neutral-800/90 p-1 rounded-xl border border-neutral-700">
            <span className="text-[10px] font-bold text-neutral-400 px-1.5 uppercase">Taille:</span>
            {(['normal', 'large', 'cinema'] as const).map((sz) => (
              <button
                key={sz}
                onClick={() => setPlayerSize(sz)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
                  playerSize === sz
                    ? 'bg-[#c6ff34] text-[#171717] shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-700/50'
                }`}
              >
                {sz === 'normal' ? 'Standard' : sz === 'large' ? 'Grand' : 'Cinéma'}
              </button>
            ))}
          </div>

          <button
            onClick={handleToggleFullscreen}
            title="Basculer en plein écran"
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              isFullscreen
                ? 'bg-[#c6ff34] text-[#171717] border-[#c6ff34]'
                : 'bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700 hover:border-neutral-600'
            }`}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            <span>{isFullscreen ? 'Quitter Plein Écran' : 'Plein Écran'}</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="video/*,audio/*,.mp4,.webm,.mkv,.mov,.avi,.3gp,.mp3,.flac,.m4a,.wav"
            multiple
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-[#c6ff34] text-[#171717] font-bold text-xs rounded-xl hover:bg-[#b0f020] transition-transform active:scale-95 shadow-md cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Importer
          </button>
        </div>
      </div>

      {/* Main Video Screen & Player Container */}
      <div
        ref={playerContainerRef}
        className={`relative bg-black rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl group flex flex-col justify-center transition-all duration-300 ${
          playerSize === 'cinema' ? 'ring-2 ring-[#c6ff34]/30 shadow-[#c6ff34]/10 shadow-2xl' : ''
        }`}
      >
        <div
          className={`relative w-full bg-black flex items-center justify-center overflow-hidden transition-all duration-300 ${
            playerSize === 'normal'
              ? 'aspect-video max-h-[460px]'
              : playerSize === 'large'
              ? 'aspect-video min-h-[480px] md:min-h-[580px] lg:min-h-[660px]'
              : 'h-[75vh] min-h-[520px]'
          }`}
        >
          <video
            ref={videoRef}
            src={currentVideo.src}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => {
              setIsPlaying(false);
              onVideoPlayStateChange?.(false);
            }}
            loop={isLooping}
            onClick={handlePlayPause}
            onDoubleClick={handleToggleFullscreen}
            className={`w-full h-full cursor-pointer ${
              aspectRatio === 'cover' ? 'object-cover' : aspectRatio === 'stretch' ? 'object-fill' : 'object-contain'
            }`}
          />

          {/* Big Play Overlay when paused */}
          {!isPlaying && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={handlePlayPause}
              className="absolute inset-0 m-auto w-16 h-16 flex items-center justify-center rounded-full bg-[#c6ff34]/90 text-[#171717] shadow-2xl hover:scale-110 transition-transform cursor-pointer"
            >
              <Play className="w-8 h-8 ml-1 fill-current" />
            </motion.button>
          )}

          {/* Video Title Overlay (Top Left) */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center justify-between">
            <span className="text-sm font-semibold text-white drop-shadow truncate">{currentVideo.title}</span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-neutral-900/80 text-neutral-300 rounded border border-neutral-700">
              {currentVideo.isCustom ? 'Fichier Local' : 'Démo HD'}
            </span>
          </div>
        </div>

        {/* Video Controls Bar */}
        <div className="bg-neutral-900/90 backdrop-blur-md px-4 py-3 border-t border-neutral-800 flex flex-col gap-2">
          {/* Progress Seek Bar */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-neutral-400 min-w-[42px]">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-neutral-700 accent-[#c6ff34] rounded-lg appearance-none cursor-pointer hover:h-2 transition-all"
            />
            <span className="text-xs font-mono text-neutral-400 min-w-[42px] text-right">{formatTime(duration)}</span>
          </div>

          {/* Controls Buttons */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              {/* Play / Pause */}
              <button
                onClick={handlePlayPause}
                className="p-2 bg-[#c6ff34] text-[#171717] hover:bg-[#b0f020] rounded-xl transition-colors cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 group/vol">
                <button
                  onClick={handleToggleMute}
                  className="p-2 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-16 h-1 bg-neutral-700 accent-[#c6ff34] rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Playback Speed Selector */}
              <div className="flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded-lg border border-neutral-700">
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Vitesse:</span>
                {[0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-colors ${
                      playbackSpeed === speed
                        ? 'bg-[#c6ff34] text-[#171717]'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Aspect ratio toggle */}
              <button
                onClick={() => {
                  const modes: ('fit' | 'cover' | 'stretch')[] = ['fit', 'cover', 'stretch'];
                  const nextIndex = (modes.indexOf(aspectRatio) + 1) % modes.length;
                  setAspectRatio(modes[nextIndex]);
                }}
                title={`Format de cadrage: ${aspectRatio.toUpperCase()}`}
                className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-bold uppercase rounded-lg border border-neutral-700 cursor-pointer"
              >
                {aspectRatio}
              </button>

              {/* Loop toggle */}
              <button
                onClick={() => setIsLooping(!isLooping)}
                title={isLooping ? 'Désactiver la boucle' : 'Activer la boucle'}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isLooping ? 'bg-[#c6ff34]/20 text-[#c6ff34] border border-[#c6ff34]/40' : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* PiP */}
              <button
                onClick={handleTogglePiP}
                title="Mode Image dans l'image (Picture in Picture)"
                className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors cursor-pointer"
              >
                <PictureInPicture className="w-4 h-4" />
              </button>

              {/* Fullscreen */}
              <button
                onClick={handleToggleFullscreen}
                title="Plein Écran"
                className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors cursor-pointer"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Playlist / Videos Selector Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#c6ff34]" />
            Liste de Vidéos Disponibles ({videos.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {videos.map((vid) => {
            const isCurrent = currentVideo.id === vid.id;

            return (
              <div
                key={vid.id}
                onClick={() => handleSelectVideo(vid)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-[#c6ff34]/10 border-[#c6ff34]/50 text-white shadow-lg'
                    : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:bg-neutral-800/60'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="relative w-16 h-10 rounded-lg bg-neutral-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {vid.thumbnail ? (
                      <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover" />
                    ) : (
                      <Film className="w-6 h-6 text-neutral-500" />
                    )}
                    {isCurrent && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Check className="w-5 h-5 text-[#c6ff34]" />
                      </div>
                    )}
                  </div>

                  <div className="overflow-hidden">
                    <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-[#c6ff34]' : 'text-white'}`}>
                      {vid.title}
                    </p>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {vid.description || 'Vidéo HD'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {vid.isCustom && (
                    <button
                      onClick={(e) => handleDeleteCustomVideo(vid.id, e)}
                      title="Supprimer la vidéo"
                      className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
