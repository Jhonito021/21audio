import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Youtube,
  Play,
  Pause,
  Plus,
  Radio,
  Sparkles,
  Link2,
  Check,
  ListPlus,
  Music,
  Tv,
  Flame,
  Volume2,
  Clock,
  X,
  ExternalLink,
} from 'lucide-react';
import {
  searchYouTubeTracks,
  CURATED_YOUTUBE_STREAMS,
  extractYouTubeId,
  fetchYouTubeVideoDetails,
} from '../lib/youtubeService';

export const YouTubeView = ({
  currentTrack,
  isPlaying,
  onPlayTrack,
  onTogglePlay,
  onSaveTrackToLibrary,
  onAddToPlaylist,
  savedTracks = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [results, setResults] = useState(CURATED_YOUTUBE_STREAMS);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [addedTrackIds, setAddedTrackIds] = useState(new Set());
  const [isImportingUrl, setIsImportingUrl] = useState(false);

  const categories = [
    'Tous',
    'Live 24/7',
    'Lo-Fi',
    'Synthwave',
    'Jazz',
    'Deep House',
    'Afrobeat',
    'Acoustic',
    'Classique',
  ];

  // Keep track of which tracks are already in saved library
  useEffect(() => {
    const savedIds = new Set(savedTracks.map((t) => t.id));
    setAddedTrackIds(savedIds);
  }, [savedTracks]);

  // Handle Search submit
  const handleSearch = async (queryToSearch) => {
    const q = queryToSearch !== undefined ? queryToSearch : searchQuery;
    if (!q || !q.trim()) {
      setResults(CURATED_YOUTUBE_STREAMS);
      return;
    }

    setIsSearching(true);
    try {
      const searchRes = await searchYouTubeTracks(q);
      setResults(searchRes);
    } catch (err) {
      console.warn('YouTube search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Direct YouTube Link Import
  const handleImportUrl = async (e) => {
    e?.preventDefault();
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) return;

    const videoId = extractYouTubeId(cleanUrl);
    if (!videoId) {
      alert("Lien YouTube non valide. Veuillez coller une URL comme https://www.youtube.com/watch?v=... ou https://youtu.be/...");
      return;
    }

    setIsImportingUrl(true);
    try {
      const track = await fetchYouTubeVideoDetails(videoId);
      if (track) {
        // Save & play immediately
        await onSaveTrackToLibrary(track);
        onPlayTrack(track);
        setUrlInput('');
      }
    } catch (err) {
      alert("Impossible de charger la vidéo YouTube. Vérifiez le lien.");
    } finally {
      setIsImportingUrl(false);
    }
  };

  // Filter results by category tag if selected
  const filteredResults = results.filter((track) => {
    if (activeCategory === 'Tous') return true;
    if (activeCategory === 'Live 24/7') return track.isLive || track.bitrate?.includes('Live');
    return (
      track.genre?.toLowerCase().includes(activeCategory.toLowerCase()) ||
      track.title?.toLowerCase().includes(activeCategory.toLowerCase()) ||
      track.artist?.toLowerCase().includes(activeCategory.toLowerCase())
    );
  });

  const formatDuration = (secs) => {
    if (!secs || secs <= 0) return 'EN DIRECT';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Banner / Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950/80 via-neutral-900 to-red-900/40 p-6 border border-red-900/30 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
              <Youtube className="w-4 h-4 fill-red-500 text-red-500" /> YouTube Stream HD
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Streaming Audio YouTube
            </h1>
            <p className="text-xs text-neutral-300 max-w-lg">
              Écoutez tous vos morceaux, mix, podcasts et flux radio en direct directement sur 21Audio sans interruption.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 bg-neutral-900/80 p-2.5 rounded-2xl border border-neutral-800">
            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
            <span>Flux Réseau Illimité HD</span>
          </div>
        </div>
      </div>

      {/* Direct YouTube URL Import Box */}
      <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-300 flex items-center gap-2">
          <Link2 className="w-4 h-4 text-[#c6ff34]" /> Coller un lien ou ID YouTube Direct :
        </label>
        <form onSubmit={handleImportUrl} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Ex: https://www.youtube.com/watch?v=... ou https://youtu.be/..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c6ff34] transition-colors pr-8"
            />
            {urlInput && (
              <button
                type="button"
                onClick={() => setUrlInput('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isImportingUrl || !urlInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-lg"
          >
            {isImportingUrl ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Écouter
              </>
            )}
          </button>
        </form>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Rechercher un artiste, morceau, mix ou live sur YouTube..."
          className="w-full bg-neutral-900/90 border border-neutral-800 rounded-2xl pl-11 pr-24 py-3.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c6ff34] transition-colors"
        />
        {searchQuery ? (
          <button
            onClick={() => {
              setSearchQuery('');
              setResults(CURATED_YOUTUBE_STREAMS);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white text-xs"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={() => handleSearch()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#c6ff34] text-neutral-950 text-xs font-bold hover:bg-[#b8f026] transition-colors"
          >
            Chercher
          </button>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Search Results Grid / List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-500" />
            {searchQuery ? `Résultats pour "${searchQuery}"` : 'Radios en Direct & Tendances'}
          </h2>
          <span className="text-[11px] font-semibold text-neutral-400">
            {filteredResults.length} résultats
          </span>
        </div>

        {isSearching ? (
          <div className="py-12 text-center space-y-3">
            <div className="inline-block w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-neutral-400">Recherche sur les réseaux YouTube en cours...</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="py-12 text-center space-y-2 bg-neutral-900/50 rounded-2xl border border-neutral-800/80 p-6">
            <Tv className="w-10 h-10 text-neutral-600 mx-auto" />
            <p className="text-xs font-medium text-neutral-300">
              {searchQuery ? `Aucun résultat trouvé pour "${searchQuery}".` : 'Recherchez une musique ou collez un lien YouTube ci-dessus.'}
            </p>
            <p className="text-[11px] text-neutral-500">
              Vous pouvez coller l'URL directe de n'importe quelle vidéo ou utiliser la barre de recherche.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredResults.map((track) => {
              const isCurrent = currentTrack?.id === track.id;
              const isCurrentPlaying = isCurrent && isPlaying;
              const isSaved = addedTrackIds.has(track.id);

              return (
                <motion.div
                  key={track.id}
                  whileHover={{ scale: 1.01 }}
                  className={`group relative flex items-center gap-3.5 p-3 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-red-950/40 border-red-800/60 shadow-lg'
                      : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-14 rounded-xl overflow-hidden shrink-0 bg-neutral-950 border border-neutral-800">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Live or Duration overlay */}
                    {track.isLive ? (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-red-600 text-white tracking-wider animate-pulse">
                        LIVE
                      </span>
                    ) : (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/80 text-neutral-200">
                        {formatDuration(track.duration)}
                      </span>
                    )}

                    {/* Play Overlay */}
                    <button
                      onClick={() => {
                        if (isCurrent) {
                          onTogglePlay();
                        } else {
                          onPlayTrack(track);
                        }
                      }}
                      className="absolute inset-0 bg-black/40 group-hover:bg-black/60 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <div className="p-2 rounded-full bg-red-600 text-white shadow-md transform group-hover:scale-110 transition-transform">
                        {isCurrentPlaying ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </div>
                    </button>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                        YouTube HD
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white truncate leading-snug">
                      {track.title}
                    </h3>
                    <p className="text-[11px] text-neutral-400 truncate">
                      {track.artist}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onAddToPlaylist(track)}
                      title="Ajouter à une playlist"
                      className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <ListPlus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={async () => {
                        await onSaveTrackToLibrary(track);
                        setAddedTrackIds((prev) => new Set([...prev, track.id]));
                      }}
                      title={isSaved ? 'Déjà dans la bibliothèque' : 'Ajouter à la bibliothèque'}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        isSaved
                          ? 'bg-[#c6ff34]/20 text-[#c6ff34] border border-[#c6ff34]/30'
                          : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white'
                      }`}
                    >
                      {isSaved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
