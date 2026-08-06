import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Heart,
  MoreVertical,
  Music2,
  Trash2,
  ListPlus,
} from 'lucide-react';

export const TrackItem = ({
  track,
  isCurrent,
  isPlaying,
  onPlayTrack,
  onToggleFavorite,
  onAddToPlaylist,
  onDeleteTrack,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const formatDuration = (secs) => {
    if (!secs || secs <= 0) return '--:--';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <motion.div
      whileHover={{ y: -1, scale: 1.005 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onPlayTrack(track)}
      className={`group relative flex items-center justify-between p-2.5 rounded-2xl border transition-colors cursor-pointer select-none ${
        isCurrent
          ? 'bg-neutral-900 border-[#c6ff34] shadow-md shadow-[#c6ff34]/15'
          : 'bg-neutral-900/50 border-neutral-800/80 hover:bg-neutral-800/70 hover:border-neutral-700'
      }`}
    >
      {/* Left Cover & Track Info */}
      <div className="flex items-center gap-3 overflow-hidden pr-2 flex-1">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-neutral-800 shrink-0 border border-neutral-700/60 shadow-sm">
          {track.coverUrl ? (
            <img
              src={track.coverUrl}
              alt={track.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#c6ff34]">
              <Music2 className="w-5 h-5" />
            </div>
          )}

          {/* Playing Overlay Indicator */}
          {isCurrent && (
            <div className="absolute inset-0 bg-[#171717]/75 backdrop-blur-xs flex items-center justify-center text-[#c6ff34]">
              {isPlaying ? (
                <div className="flex items-end gap-0.5 h-4">
                  <motion.span
                    animate={{ height: ['20%', '100%', '30%', '90%', '20%'] }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
                    className="w-1 bg-[#c6ff34] rounded-full"
                  />
                  <motion.span
                    animate={{ height: ['60%', '20%', '100%', '40%', '60%'] }}
                    transition={{ repeat: Infinity, duration: 0.7, ease: 'easeInOut' }}
                    className="w-1 bg-[#c6ff34] rounded-full"
                  />
                  <motion.span
                    animate={{ height: ['100%', '40%', '70%', '20%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
                    className="w-1 bg-[#c6ff34] rounded-full"
                  />
                </div>
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </div>
          )}

          {/* FLAC / MP3 Tag */}
          <div className="absolute bottom-0 right-0 px-1 py-0.2 text-[8px] font-black uppercase rounded-tl bg-[#171717] text-[#c6ff34]">
            {track.format}
          </div>
        </div>

        <div className="overflow-hidden flex-1">
          <div className="flex items-center gap-1.5">
            <h4
              className={`text-sm font-bold truncate ${
                isCurrent ? 'text-[#c6ff34]' : 'text-white'
              }`}
            >
              {track.title}
            </h4>
            {track.format === 'FLAC' && (
              <span className="px-1 py-0.2 text-[8px] font-bold rounded bg-[#c6ff34]/20 text-[#c6ff34]">
                HD
              </span>
            )}
            {track.source === 'youtube' && (
              <span className="px-1 py-0.2 text-[8px] font-extrabold rounded bg-red-600/20 text-red-400 border border-red-500/30">
                YouTube Stream
              </span>
            )}
          </div>

          <p className="text-xs text-neutral-400 truncate mt-0.5">
            {track.artist} • <span className="text-neutral-500">{track.album || '21audio'}</span>
          </p>
        </div>
      </div>

      {/* Right Controls & Info */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-mono text-neutral-400">
          {track.source === 'stream' ? 'LIVE' : formatDuration(track.duration)}
        </span>

        {/* Favorite Heart */}
        <motion.button
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(track.id);
          }}
          className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 ${
              track.isFavorite
                ? 'text-red-500 fill-red-500'
                : 'text-neutral-500 group-hover:text-neutral-300'
            }`}
          />
        </motion.button>

        {/* Options Dropdown Menu */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </motion.button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 5 }}
                className="absolute right-0 top-8 w-44 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-1 z-30 space-y-1"
              >
                <button
                  onClick={() => {
                    onAddToPlaylist(track);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-800 hover:text-[#c6ff34] rounded-lg transition-colors cursor-pointer"
                >
                  <ListPlus className="w-4 h-4" /> Ajouter à playlist
                </button>

                {onDeleteTrack && track.source === 'local' && (
                  <button
                    onClick={() => {
                      onDeleteTrack(track.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" /> Supprimer la piste
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
