import React, { useState } from 'react';
import {
  Radio,
  Globe,
  Plus,
  Play,
  Pause,
  Signal,
  X,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { RadioStation, AudioTrack } from '../types';

interface StreamsViewProps {
  radioStations: RadioStation[];
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  onPlayStream: (station: RadioStation) => void;
  onAddCustomStream: (station: RadioStation) => void;
}

export const StreamsView: React.FC<StreamsViewProps> = ({
  radioStations,
  currentTrack,
  isPlaying,
  onPlayStream,
  onAddCustomStream,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customGenre, setCustomGenre] = useState('');

  const handleAddStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customUrl.trim()) return;

    const newStation: RadioStation = {
      id: `custom-stream-${Date.now()}`,
      name: customName.trim(),
      genre: customGenre.trim() || 'Web Stream',
      country: 'Mon Flux',
      streamUrl: customUrl.trim(),
      logoUrl:
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
      bitrate: 'Direct AAC/MP3',
      description: 'Flux web personnalisé ajouté par l utilisateur.',
    };

    onAddCustomStream(newStation);
    setCustomName('');
    setCustomUrl('');
    setCustomGenre('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4 pb-36">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-[#171717] to-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
            <h2 className="text-base font-extrabold text-white">
              Radios Web & Streaming Audio
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Écoutez des flux audio en direct, radios internationales et podcasts web.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#c6ff34] text-[#171717] font-bold text-xs hover:bg-[#b5f020] transition-transform active:scale-95 cursor-pointer shadow-md shadow-[#c6ff34]/15"
        >
          <Plus className="w-4 h-4" /> Ajouter un Flux URL
        </button>
      </div>

      {/* Radio Stations Catalog */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {radioStations.map((station) => {
          const isCurrentStream = currentTrack?.src === station.streamUrl;

          return (
            <div
              key={station.id}
              onClick={() => onPlayStream(station)}
              className={`group relative flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isCurrentStream
                  ? 'bg-neutral-900 border-[#c6ff34] shadow-md shadow-[#c6ff34]/10'
                  : 'bg-neutral-900/80 border-neutral-800/80 hover:bg-neutral-800/80 hover:border-neutral-700'
              }`}
            >
              {/* Logo / Cover */}
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-800 shrink-0 border border-neutral-700">
                <img
                  src={station.logoUrl}
                  alt={station.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />

                {isCurrentStream && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[#c6ff34]">
                    {isPlaying ? (
                      <Signal className="w-6 h-6 animate-pulse" />
                    ) : (
                      <Play className="w-6 h-6 fill-current" />
                    )}
                  </div>
                )}
              </div>

              {/* Station Info */}
              <div className="overflow-hidden flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-[#c6ff34] bg-[#c6ff34]/10 px-1.5 py-0.5 rounded">
                    {station.genre}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {station.country}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white truncate mt-1 group-hover:text-[#c6ff34] transition-colors">
                  {station.name}
                </h3>

                <p className="text-xs text-neutral-400 truncate mt-0.5">
                  {station.description}
                </p>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-800/60">
                  <span className="text-[10px] font-mono text-neutral-500">
                    {station.bitrate}
                  </span>
                  <span className="text-[10px] font-bold text-red-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />{' '}
                    DIRECT
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Custom Audio Stream URL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#c6ff34]" /> Ajouter un Flux URL Custom
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStream} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Nom du flux / de la radio
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex. Ma Radio Techno, Podcast Hifi..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c6ff34]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Lien du flux Web Audio (URL .mp3, .aac, Icecast, Shoutcast)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://mon-flux.com/live.mp3"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#c6ff34]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Genre (optionnel)
                </label>
                <input
                  type="text"
                  placeholder="ex. Electronic, Jazz, News..."
                  value={customGenre}
                  onChange={(e) => setCustomGenre(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c6ff34]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-neutral-400 hover:text-white cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#c6ff34] text-[#171717] font-bold text-xs hover:bg-[#b5f020] cursor-pointer shadow-md shadow-[#c6ff34]/20"
                >
                  Lancer le flux
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
