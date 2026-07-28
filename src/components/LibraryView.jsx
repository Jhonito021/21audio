import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  FolderOpen,
  Upload,
  Heart,
  Disc,
  Sparkles,
  History,
  Play,
  Trash2,
  Music2,
} from 'lucide-react';
import { TrackItem } from './TrackItem';

export const LibraryView = ({
  tracks,
  recentlyPlayed = [],
  currentTrack,
  isPlaying,
  onPlayTrack,
  onToggleFavorite,
  onAddToPlaylist,
  onDeleteTrack,
  onScanFolder,
  onImportFiles,
  onClearRecentlyPlayed,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showRecentSection, setShowRecentSection] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImportFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onImportFiles(e.target.files);
    }
  };

  // Filter & Sort tracks
  const filteredTracks = tracks.filter((t) => {
    // Search query match
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      t.title.toLowerCase().includes(query) ||
      t.artist.toLowerCase().includes(query) ||
      t.album.toLowerCase().includes(query) ||
      (t.genre && t.genre.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    // Filter pill match
    if (activeFilter === 'recent') {
      return recentlyPlayed.some((rp) => rp.id === t.id);
    }
    if (activeFilter === 'favorites') return t.isFavorite;
    if (activeFilter === 'flac') return t.format === 'FLAC';
    if (activeFilter === 'mp3') return t.format === 'MP3';
    if (activeFilter === 'local') return t.source === 'local';
    if (activeFilter === 'sample') return t.source === 'sample';

    return true;
  });

  // Sorting
  const sortedTracks = [...filteredTracks].sort((a, b) => {
    if (activeFilter === 'recent') {
      const idxA = recentlyPlayed.findIndex((rp) => rp.id === a.id);
      const idxB = recentlyPlayed.findIndex((rp) => rp.id === b.id);
      return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
    }
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'artist') return a.artist.localeCompare(b.artist);
    if (sortBy === 'duration') return b.duration - a.duration;
    return b.addedAt - a.addedAt; // date added default
  });

  const flacCount = tracks.filter((t) => t.format === 'FLAC').length;
  const favoritesCount = tracks.filter((t) => t.isFavorite).length;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`space-y-4 pb-36 relative transition-all ${
        isDragOver ? 'ring-2 ring-[#c6ff34] bg-[#c6ff34]/5 rounded-3xl p-2' : ''
      }`}
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.flac,.m4a,.wav,.ogg,.aac"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Drag & Drop banner highlight if dragging */}
      {isDragOver && (
        <div className="p-6 text-center border-2 border-dashed border-[#c6ff34] rounded-2xl bg-[#c6ff34]/10 text-[#c6ff34] font-bold">
          <Upload className="w-8 h-8 mx-auto mb-2 animate-bounce" />
          Déposez vos fichiers Audio ici pour les ajouter à votre lecteur !
        </div>
      )}

      {/* Quick Scan & Import Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-[#171717] to-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c6ff34]" />
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Scan Automatique Audio
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Explorez le stockage de votre appareil pour ajouter automatiquement vos musiques.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Folder Scan */}
            <button
              onClick={onScanFolder}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-[#c6ff34] text-[#171717] hover:bg-[#b5f020] transition-transform active:scale-95 cursor-pointer shadow-md shadow-[#c6ff34]/20"
            >
              <FolderOpen className="w-4 h-4" /> Scanner Dossier
            </button>

            {/* File Pick */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#c6ff34]" /> Importer Fichiers
            </button>
          </div>
        </div>
      </div>

      {/* Recently Played Section */}
      {recentlyPlayed && recentlyPlayed.length > 0 && (showRecentSection || activeFilter === 'recent') && (
        <div className="bg-neutral-900/80 border border-neutral-800/90 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-[#c6ff34]/15 text-[#c6ff34] border border-[#c6ff34]/20">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  Récemment Écoutés
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-[#c6ff34] border border-neutral-700">
                    {recentlyPlayed.length} / 5
                  </span>
                </h3>
                <p className="text-[11px] text-neutral-400">Accès rapide à vos 5 dernières écoutes</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onClearRecentlyPlayed && (
                <button
                  onClick={onClearRecentlyPlayed}
                  className="text-neutral-500 hover:text-neutral-300 text-[11px] font-semibold flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-neutral-800 cursor-pointer"
                  title="Effacer l'historique"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Effacer</span>
                </button>
              )}
              <button
                onClick={() => setShowRecentSection(false)}
                className="text-neutral-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 cursor-pointer"
                title="Masquer le bloc"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-1">
            {recentlyPlayed.slice(0, 5).map((track) => {
              const isCurrent = currentTrack?.id === track.id;
              const isThisPlaying = isCurrent && isPlaying;

              return (
                <motion.div
                  key={`recent-${track.id}`}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onPlayTrack(track)}
                  className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-neutral-800/90 border-[#c6ff34] shadow-lg shadow-[#c6ff34]/10'
                      : 'bg-neutral-950/60 border-neutral-800/80 hover:bg-neutral-800/70 hover:border-neutral-700'
                  }`}
                >
                  {/* Cover image with play overlay */}
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-neutral-900 mb-2 border border-neutral-800 group-hover:border-neutral-700">
                    {track.coverUrl ? (
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-600 bg-neutral-900">
                        <Music2 className="w-6 h-6" />
                      </div>
                    )}

                    {/* Format Badge */}
                    <div className="absolute top-1 left-1 bg-black/70 backdrop-blur-xs px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-neutral-300 border border-white/10">
                      {track.format}
                    </div>

                    {/* Hover / Playing Overlay */}
                    <div
                      className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-200 ${
                        isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {isThisPlaying ? (
                        <div className="p-2 bg-[#c6ff34] text-[#171717] rounded-full shadow-lg">
                          <div className="flex items-end gap-0.5 h-3.5 w-3.5 justify-center">
                            <motion.span
                              animate={{ height: ['20%', '100%', '30%', '90%'] }}
                              transition={{ repeat: Infinity, duration: 0.6 }}
                              className="w-0.5 bg-[#171717] rounded-full"
                            />
                            <motion.span
                              animate={{ height: ['80%', '20%', '100%', '40%'] }}
                              transition={{ repeat: Infinity, duration: 0.5 }}
                              className="w-0.5 bg-[#171717] rounded-full"
                            />
                            <motion.span
                              animate={{ height: ['100%', '40%', '70%', '20%'] }}
                              transition={{ repeat: Infinity, duration: 0.7 }}
                              className="w-0.5 bg-[#171717] rounded-full"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 bg-[#c6ff34] text-[#171717] rounded-full shadow-lg transform transition-transform group-hover:scale-110">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Track metadata */}
                  <div className="space-y-0.5 min-w-0">
                    <h4
                      className={`text-xs font-bold truncate ${
                        isCurrent ? 'text-[#c6ff34]' : 'text-white group-hover:text-[#c6ff34]'
                      } transition-colors`}
                    >
                      {track.title}
                    </h4>
                    <p className="text-[11px] text-neutral-400 truncate">{track.artist}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search Bar & Sort Dropdown */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher titre, artiste, album ou genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c6ff34] transition-colors"
          />
        </div>

        {/* Sort Selector */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white focus:outline-none focus:border-[#c6ff34] cursor-pointer"
          >
            <option value="date">Récent</option>
            <option value="title">Titre (A-Z)</option>
            <option value="artist">Artiste</option>
            <option value="duration">Durée</option>
          </select>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-[#c6ff34] text-[#171717]'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          Tous ({tracks.length})
        </button>

        {recentlyPlayed && recentlyPlayed.length > 0 && (
          <button
            onClick={() => setActiveFilter('recent')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer ${
              activeFilter === 'recent'
                ? 'bg-[#c6ff34] text-[#171717]'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Récents ({recentlyPlayed.length})
          </button>
        )}

        <button
          onClick={() => setActiveFilter('favorites')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer ${
            activeFilter === 'favorites'
              ? 'bg-red-500 text-white'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <Heart className="w-3.5 h-3.5 fill-current text-red-400" /> Favoris ({favoritesCount})
        </button>

        <button
          onClick={() => setActiveFilter('flac')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeFilter === 'flac'
              ? 'bg-[#c6ff34] text-[#171717]'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          FLAC HD ({flacCount})
        </button>

        <button
          onClick={() => setActiveFilter('mp3')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeFilter === 'mp3'
              ? 'bg-[#c6ff34] text-[#171717]'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          MP3 HQ
        </button>

        <button
          onClick={() => setActiveFilter('local')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeFilter === 'local'
              ? 'bg-[#c6ff34] text-[#171717]'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          Scannés Locaux
        </button>
      </div>

      {/* Tracks List Header */}
      <div className="flex items-center justify-between text-xs font-semibold text-neutral-400 px-1 pt-1">
        <span>{sortedTracks.length} PISTES DÉTECTÉES</span>
        <span className="text-[11px] font-mono text-neutral-500">21AUDIO MEDIA ENGINE</span>
      </div>

      {/* Tracks List */}
      {sortedTracks.length > 0 ? (
        <div className="space-y-2">
          {sortedTracks.map((track) => (
            <TrackItem
              key={track.id}
              track={track}
              isCurrent={currentTrack?.id === track.id}
              isPlaying={isPlaying}
              onPlayTrack={onPlayTrack}
              onToggleFavorite={onToggleFavorite}
              onAddToPlaylist={onAddToPlaylist}
              onDeleteTrack={onDeleteTrack}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
          <Disc className="w-12 h-12 text-neutral-600 mx-auto mb-3 animate-spin-slow" />
          <h3 className="text-sm font-bold text-white">Aucune piste audio trouvée</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            Ajustez votre recherche ou utilisez le bouton ci-dessus pour scanner votre dossier de musique ou glisser-déposer des fichiers audio.
          </p>
        </div>
      )}
    </div>
  );
};
