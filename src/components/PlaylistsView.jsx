import React, { useState } from 'react';
import {
  ListMusic,
  Plus,
  Play,
  Trash2,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  X,
  Music2,
  Disc,
} from 'lucide-react';
import { TrackItem } from './TrackItem';

export const PlaylistsView = ({
  playlists,
  tracks,
  currentTrack,
  isPlaying,
  onCreatePlaylist,
  onDeletePlaylist,
  onRemoveTrackFromPlaylist,
  onReorderPlaylistTrack,
  onPlayPlaylist,
  onPlayTrack,
  onToggleFavorite,
  onAddToPlaylist,
}) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    onCreatePlaylist(newPlaylistName.trim(), newPlaylistDesc.trim());
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setShowCreateModal(false);
  };

  // If viewing a single playlist detail
  if (selectedPlaylist) {
    const playlistTrackList = selectedPlaylist.trackIds
      .map((id) => tracks.find((t) => t.id === id))
      .filter((t) => t !== undefined);

    return (
      <div className="space-y-4 pb-36">
        {/* Header Back button & Playlist Title */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedPlaylist(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-neutral-300 hover:text-white cursor-pointer"
          >
            ← Retour aux playlists
          </button>

          <button
            onClick={() => {
              onDeletePlaylist(selectedPlaylist.id);
              setSelectedPlaylist(null);
            }}
            className="p-2 text-neutral-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
            title="Supprimer la playlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Playlist Hero Info Card */}
        <div className="bg-gradient-to-br from-neutral-900 via-[#171717] to-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center gap-4">
          <div className="w-24 h-24 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[#c6ff34] shrink-0 shadow-lg">
            <ListMusic className="w-10 h-10" />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#c6ff34]">
              PLAYLIST PERSONNALISÉE
            </span>
            <h2 className="text-xl font-black text-white mt-0.5">
              {selectedPlaylist.name}
            </h2>
            {selectedPlaylist.description && (
              <p className="text-xs text-neutral-400 mt-1">
                {selectedPlaylist.description}
              </p>
            )}
            <p className="text-xs font-mono text-neutral-500 mt-2">
              {playlistTrackList.length} pistes audio au total
            </p>

            <button
              onClick={() => onPlayPlaylist(selectedPlaylist)}
              disabled={playlistTrackList.length === 0}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c6ff34] text-[#171717] font-bold text-xs hover:bg-[#b5f020] transition-transform active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg shadow-[#c6ff34]/20"
            >
              <Play className="w-4 h-4 fill-current" /> Lire la playlist
            </button>
          </div>
        </div>

        {/* Tracks List inside playlist */}
        <div className="space-y-2">
          {playlistTrackList.length > 0 ? (
            playlistTrackList.map((track, idx) => (
              <div key={track.id} className="flex items-center gap-2">
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    disabled={idx === 0}
                    onClick={() =>
                      onReorderPlaylistTrack(selectedPlaylist.id, idx, idx - 1)
                    }
                    className="p-1 text-neutral-500 hover:text-[#c6ff34] disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={idx === playlistTrackList.length - 1}
                    onClick={() =>
                      onReorderPlaylistTrack(selectedPlaylist.id, idx, idx + 1)
                    }
                    className="p-1 text-neutral-500 hover:text-[#c6ff34] disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1">
                  <TrackItem
                    track={track}
                    isCurrent={currentTrack?.id === track.id}
                    isPlaying={isPlaying}
                    onPlayTrack={onPlayTrack}
                    onToggleFavorite={onToggleFavorite}
                    onAddToPlaylist={onAddToPlaylist}
                  />
                </div>

                {/* Remove track button */}
                <button
                  onClick={() =>
                    onRemoveTrackFromPlaylist(selectedPlaylist.id, track.id)
                  }
                  title="Retirer de la playlist"
                  className="p-2 text-neutral-500 hover:text-red-400 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="py-12 text-center bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
              <Music2 className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
              <p className="text-xs text-neutral-400">
                Cette playlist est vide. Ajoutez des pistes depuis votre bibliothèque.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Playlist Catalog view
  return (
    <div className="space-y-4 pb-36">
      {/* Top Banner & Create Playlist Button */}
      <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
        <div>
          <h2 className="text-base font-extrabold text-white">Vos Playlists</h2>
          <p className="text-xs text-neutral-400">
            Créez vos sélections musicales personnalisées
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#c6ff34] text-[#171717] font-bold text-xs hover:bg-[#b5f020] transition-transform active:scale-95 cursor-pointer shadow-md shadow-[#c6ff34]/15"
        >
          <Plus className="w-4 h-4" /> Créer
        </button>
      </div>

      {/* Playlists Grid */}
      {playlists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {playlists.map((playlist) => {
            const trackCount = playlist.trackIds.length;
            return (
              <div
                key={playlist.id}
                onClick={() => setSelectedPlaylist(playlist)}
                className="group flex items-center justify-between p-4 bg-neutral-900/80 border border-neutral-800 hover:border-[#c6ff34]/50 rounded-2xl cursor-pointer transition-all hover:bg-neutral-800/80 shadow-md"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[#c6ff34] shrink-0 group-hover:scale-105 transition-transform">
                    <ListMusic className="w-6 h-6" />
                  </div>

                  <div className="overflow-hidden">
                    <h3 className="text-sm font-bold text-white group-hover:text-[#c6ff34] truncate transition-colors">
                      {playlist.name}
                    </h3>
                    <p className="text-xs text-neutral-400 truncate">
                      {trackCount} pistes • {playlist.description || '21audio selection'}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-[#c6ff34] transition-colors" />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
          <Disc className="w-12 h-12 text-neutral-600 mx-auto mb-3 animate-spin-slow" />
          <h3 className="text-sm font-bold text-white">Aucune playlist pour le moment</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
            Cliquez sur "Créer" pour composer votre première playlist musicale.
          </p>
        </div>
      )}

      {/* Modal Dialog: Create Playlist */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-[#c6ff34]" /> Nouvelle Playlist
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Nom de la playlist
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex. Musique de Nuit, Workout FLAC..."
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c6ff34]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Description (optionnel)
                </label>
                <textarea
                  placeholder="Brève description..."
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c6ff34] h-20 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-neutral-400 hover:text-white cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#c6ff34] text-[#171717] font-bold text-xs hover:bg-[#b5f020] cursor-pointer shadow-md shadow-[#c6ff34]/20"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
