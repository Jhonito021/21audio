import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  Music2,
  ListPlus,
  Sliders,
  FileText,
  Radio,
  Gauge,
  Sparkles,
} from 'lucide-react';
import { AudioTrack, RepeatMode, EqualizerPreset } from '../types';
import { AudioVisualizer } from './AudioVisualizer';

interface FullPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  playbackRate: number;
  onTogglePlay: () => void;
  onStop: () => void;
  onSeek: (seconds: number) => void;
  onSeekBy: (deltaSeconds: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleShuffle: () => void;
  onChangeRepeatMode: () => void;
  onChangeVolume: (volume: number) => void;
  onChangePlaybackRate: (rate: number) => void;
  onToggleFavorite: (trackId: string) => void;
  onAddToPlaylist: (track: AudioTrack) => void;
  getAnalyserData: () => Uint8Array | null;
  equalizerPresets: EqualizerPreset[];
  activePresetName: string;
  onSelectPreset: (preset: EqualizerPreset) => void;
}

export const FullPlayerModal: React.FC<FullPlayerModalProps> = ({
  isOpen,
  onClose,
  currentTrack,
  isPlaying,
  isLoading,
  currentTime,
  duration,
  volume,
  repeatMode,
  isShuffle,
  playbackRate,
  onTogglePlay,
  onStop,
  onSeek,
  onSeekBy,
  onNext,
  onPrev,
  onToggleShuffle,
  onChangeRepeatMode,
  onChangeVolume,
  onChangePlaybackRate,
  onToggleFavorite,
  onAddToPlaylist,
  getAnalyserData,
  equalizerPresets,
  activePresetName,
  onSelectPreset,
}) => {
  const [showLyrics, setShowLyrics] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isStream = currentTrack?.source === 'stream';

  return (
    <AnimatePresence>
      {isOpen && currentTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop Blur Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-md h-full flex flex-col justify-between p-5 relative overflow-hidden bg-gradient-to-b from-neutral-900 via-[#171717] to-black z-10 text-white shadow-2xl"
          >
            {/* Background glow circle */}
            <motion.div 
              animate={{ 
                scale: isPlaying ? [1, 1.15, 1] : 1,
                opacity: isPlaying ? [0.15, 0.25, 0.15] : 0.1
              }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[#c6ff34] blur-3xl pointer-events-none"
            />

            {/* Header bar */}
            <div className="flex items-center justify-between z-10 shrink-0 mb-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronDown className="w-6 h-6" />
              </motion.button>

              <div className="text-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#c6ff34] bg-[#c6ff34]/10 px-2.5 py-0.5 rounded-full border border-[#c6ff34]/20 shadow-sm">
                  En cours de lecture
                </span>
              </div>

              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onAddToPlaylist(currentTrack)}
                  title="Ajouter à une playlist"
                  className="p-2 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-[#c6ff34] transition-colors cursor-pointer"
                >
                  <ListPlus className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onToggleFavorite(currentTrack.id)}
                  className="p-2 rounded-full bg-neutral-800/80 hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      currentTrack.isFavorite
                        ? 'text-red-500 fill-red-500'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  />
                </motion.button>
              </div>
            </div>

            {/* Center Content: Artwork or Lyrics */}
            <div className="my-auto py-2 z-10 flex flex-col items-center w-full">
              <AnimatePresence mode="wait">
                {showLyrics ? (
                  /* Lyrics View */
                  <motion.div
                    key="lyrics"
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="w-full h-72 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 overflow-y-auto backdrop-blur text-center space-y-3 shadow-xl"
                  >
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                      <span className="text-xs font-bold text-[#c6ff34] flex items-center gap-1">
                        <FileText className="w-4 h-4" /> Paroles de la chanson
                      </span>
                      <button
                        onClick={() => setShowLyrics(false)}
                        className="text-xs text-neutral-400 hover:text-white underline cursor-pointer"
                      >
                        Retour pochette
                      </button>
                    </div>
                    {currentTrack.lyrics ? (
                      <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-line font-medium">
                        {currentTrack.lyrics}
                      </p>
                    ) : (
                      <div className="py-12 text-neutral-500 text-xs italic">
                        Aucune parole intégrée pour cette piste audio.
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* Album Artwork View */
                  <motion.div
                    key="artwork"
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className="relative group my-2"
                  >
                    <motion.div
                      animate={{
                        scale: isPlaying ? 1.02 : 0.98,
                        boxShadow: isPlaying
                          ? '0 20px 40px -15px rgba(198,255,52,0.25)'
                          : '0 10px 25px -10px rgba(0,0,0,0.5)',
                      }}
                      transition={{ duration: 0.4 }}
                      className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden bg-neutral-800 border-2 border-neutral-700/60"
                    >
                      {currentTrack.coverUrl ? (
                        <img
                          src={currentTrack.coverUrl}
                          alt={currentTrack.title}
                          className="w-full h-full object-cover transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-neutral-900 to-neutral-800 text-[#c6ff34]">
                          <Music2 className="w-16 h-16 opacity-80 mb-2" />
                          <span className="text-xs font-mono font-bold tracking-widest text-neutral-400">
                            21AUDIO
                          </span>
                        </div>
                      )}

                      {/* Animated vinyl overlay icon */}
                      {isPlaying && (
                        <div className="absolute top-3 right-3 p-1.5 rounded-full bg-[#171717]/80 text-[#c6ff34] border border-[#c6ff34]/30 backdrop-blur shadow-md">
                          <Sparkles className="w-4 h-4 animate-spin-slow" />
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Track Info */}
              <div className="text-center mt-3 px-4 w-full">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded bg-[#c6ff34] text-[#171717]">
                    {currentTrack.format}
                  </span>
                  {currentTrack.bitrate && (
                    <span className="text-[10px] font-mono text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
                      {currentTrack.bitrate}
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-extrabold text-white truncate tracking-tight">
                  {currentTrack.title}
                </h2>
                <p className="text-sm font-medium text-neutral-400 truncate mt-0.5">
                  {currentTrack.artist} —{' '}
                  <span className="text-neutral-500">{currentTrack.album || 'Single'}</span>
                </p>
              </div>

              {/* Audio Visualizer */}
              <div className="w-full mt-2">
                <AudioVisualizer getAnalyserData={getAnalyserData} isPlaying={isPlaying} />
              </div>
            </div>

            {/* Bottom Controls Area */}
            <div className="z-10 shrink-0 space-y-4 pt-2">
              {/* Progress Bar */}
              <div>
                <div className="relative group cursor-pointer py-1">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    disabled={isStream}
                    onChange={(e) => onSeek(Number(e.target.value))}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#c6ff34]"
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-neutral-400 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  {isStream ? (
                    <span className="flex items-center gap-1 text-red-400 font-bold">
                      <Radio className="w-3 h-3 animate-pulse" /> DIRECT FLUX
                    </span>
                  ) : (
                    <span>{formatTime(duration)}</span>
                  )}
                </div>
              </div>

              {/* Main Playback Controls */}
              <div className="flex items-center justify-between px-2">
                {/* Shuffle Toggle */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onToggleShuffle}
                  className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                    isShuffle
                      ? 'bg-[#c6ff34]/20 text-[#c6ff34]'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Shuffle className="w-5 h-5" />
                </motion.button>

                {/* Jump -10s */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onSeekBy(-10)}
                  disabled={isStream}
                  className="p-2 text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
                >
                  <RotateCcw className="w-5 h-5" />
                </motion.button>

                {/* Previous */}
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={onPrev}
                  className="p-3 text-white hover:text-[#c6ff34] cursor-pointer"
                >
                  <SkipBack className="w-6 h-6 fill-current" />
                </motion.button>

                {/* Play / Pause / Stop Center Button */}
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={onTogglePlay}
                    disabled={isLoading}
                    className="w-16 h-16 rounded-2xl bg-[#c6ff34] text-[#171717] flex items-center justify-center shadow-xl shadow-[#c6ff34]/25 hover:bg-[#b5f020] cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-3 border-[#171717] border-t-transparent rounded-full animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="w-8 h-8 fill-current" />
                    ) : (
                      <Play className="w-8 h-8 fill-current ml-1" />
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onStop}
                    title="Arrêter"
                    className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </motion.button>
                </div>

                {/* Next */}
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={onNext}
                  className="p-3 text-white hover:text-[#c6ff34] cursor-pointer"
                >
                  <SkipForward className="w-6 h-6 fill-current" />
                </motion.button>

                {/* Jump +10s */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onSeekBy(10)}
                  disabled={isStream}
                  className="p-2 text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
                >
                  <RotateCw className="w-5 h-5" />
                </motion.button>

                {/* Repeat Mode Toggle */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onChangeRepeatMode}
                  className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                    repeatMode !== 'off'
                      ? 'bg-[#c6ff34]/20 text-[#c6ff34]'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {repeatMode === 'one' ? (
                    <Repeat1 className="w-5 h-5" />
                  ) : (
                    <Repeat className="w-5 h-5" />
                  )}
                </motion.button>
              </div>

              {/* Secondary Controls Bar: Volume, Speed, EQ Presets & Lyrics */}
              <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between gap-3 text-xs">
                {/* Volume Control */}
                <div className="flex items-center gap-2 flex-1 max-w-[140px]">
                  <button
                    onClick={() => onChangeVolume(volume > 0 ? 0 : 0.8)}
                    className="text-neutral-400 hover:text-white cursor-pointer"
                  >
                    {volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-red-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-[#c6ff34]" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={(e) => onChangeVolume(Number(e.target.value))}
                    className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#c6ff34]"
                  />
                </div>

                {/* Speed menu selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-[11px] cursor-pointer"
                  >
                    <Gauge className="w-3.5 h-3.5 text-[#c6ff34]" /> {playbackRate}x
                  </button>
                  <AnimatePresence>
                    {showSpeedMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-8 right-0 bg-neutral-800 border border-neutral-700 rounded-lg p-1 space-y-1 shadow-xl z-30"
                      >
                        {[0.5, 0.8, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => {
                              onChangePlaybackRate(rate);
                              setShowSpeedMenu(false);
                            }}
                            className={`block w-full px-3 py-1 text-left text-xs font-mono rounded hover:bg-neutral-700 ${
                              playbackRate === rate ? 'text-[#c6ff34] font-bold' : 'text-neutral-300'
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Toggle Lyrics Button */}
                <button
                  onClick={() => setShowLyrics(!showLyrics)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    showLyrics
                      ? 'bg-[#c6ff34] text-[#171717] font-bold'
                      : 'bg-neutral-800 text-neutral-300 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> Paroles
                </button>
              </div>

              {/* EQ Quick Presets Scrollable Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                <span className="text-neutral-500 font-bold shrink-0 flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-[#c6ff34]" /> EQ:
                </span>
                {equalizerPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => onSelectPreset(preset)}
                    className={`px-2 py-1 rounded-md shrink-0 whitespace-nowrap transition-colors cursor-pointer ${
                      activePresetName === preset.name
                        ? 'bg-[#c6ff34] text-[#171717] font-extrabold'
                        : 'bg-neutral-800/80 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

