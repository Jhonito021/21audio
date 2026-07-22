import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipForward, Music2, Maximize2 } from 'lucide-react';
import { AudioTrack } from '../types';

interface MiniPlayerProps {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onOpenFullPlayer: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  currentTrack,
  isPlaying,
  isLoading,
  currentTime,
  duration,
  onTogglePlay,
  onNext,
  onOpenFullPlayer,
}) => {
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {currentTrack && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="fixed bottom-[60px] left-0 right-0 z-20 px-3 py-1"
        >
          <div className="max-w-md mx-auto relative group">
            {/* Progress bar line at top edge */}
            <div className="absolute top-0 left-2 right-2 h-1 bg-neutral-800 rounded-t-lg overflow-hidden z-10">
              <motion.div
                className="h-full bg-[#c6ff34] shadow-[0_0_8px_#c6ff34]"
                initial={{ width: '0%' }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ ease: 'easeOut', duration: 0.2 }}
              />
            </div>

            {/* Main Card Container */}
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={onOpenFullPlayer}
              className="flex items-center justify-between p-2.5 bg-neutral-900/95 border border-neutral-800 backdrop-blur-xl rounded-xl shadow-2xl cursor-pointer hover:border-[#c6ff34]/50 transition-colors"
            >
              {/* Left Album Cover & Track Details */}
              <div className="flex items-center gap-3 overflow-hidden pr-2">
                <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-neutral-800 shrink-0 border border-neutral-700 shadow">
                  {currentTrack.coverUrl ? (
                    <img
                      src={currentTrack.coverUrl}
                      alt={currentTrack.title}
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        isPlaying ? 'scale-105' : 'scale-100'
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#c6ff34]">
                      <Music2 className="w-5 h-5" />
                    </div>
                  )}

                  {/* Format indicator overlay */}
                  <div className="absolute bottom-0.5 right-0.5 px-1 py-0.2 text-[8px] font-black uppercase rounded bg-[#171717]/90 text-[#c6ff34]">
                    {currentTrack.format}
                  </div>
                </div>

                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-white truncate">
                      {currentTrack.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate">
                    {currentTrack.artist}
                  </p>
                </div>
              </div>

              {/* Right Controls */}
              <div
                className="flex items-center gap-2 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Play/Pause Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onTogglePlay}
                  disabled={isLoading}
                  className="w-10 h-10 rounded-full bg-[#c6ff34] text-[#171717] flex items-center justify-center shadow-[0_0_15px_rgba(198,255,52,0.3)] hover:bg-[#b5f020] cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-[#171717] border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </motion.button>

                {/* Next Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onNext}
                  className="p-2 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <SkipForward className="w-5 h-5" />
                </motion.button>

                {/* Maximize to full player button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onOpenFullPlayer}
                  className="p-1.5 text-neutral-400 hover:text-[#c6ff34] rounded-lg transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

