import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AudioTrack,
  Playlist,
  RadioStation,
  RepeatMode,
  TabType,
  EqualizerPreset,
} from './types';
import { SAMPLE_TRACKS, SAMPLE_RADIO_STATIONS, EQUALIZER_PRESETS } from './lib/sampleTracks';
import { parseAudioFile } from './lib/metadataParser';
import { AudioEngine } from './lib/audioEngine';
import {
  saveTrack,
  saveTracksBatch,
  getAllTracksFromDB,
  deleteTrackFromDB,
  savePlaylistDB,
  getAllPlaylistsDB,
  deletePlaylistDB,
} from './lib/db';

import { Header } from './components/Header';
import { NavigationTabs } from './components/NavigationTabs';
import { MiniPlayer } from './components/MiniPlayer';
import { FullPlayerModal } from './components/FullPlayerModal';
import { LibraryView } from './components/LibraryView';
import { PlaylistsView } from './components/PlaylistsView';
import { StreamsView } from './components/StreamsView';
import { EqualizerView } from './components/EqualizerView';
import { SettingsView } from './components/SettingsView';
import { ScanModal } from './components/ScanModal';

import { Plus, ListPlus, X, Check } from 'lucide-react';

export default function App() {
  // App state
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [radioStations, setRadioStations] = useState<RadioStation[]>(SAMPLE_RADIO_STATIONS);
  
  const [activeTab, setActiveTab] = useState<TabType>('library');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  // Player state
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffle, setIsShuffle] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  
  // Equalizer state
  const [equalizerGains, setEqualizerGains] = useState<number[]>([0, 0, 0, 0, 0]);
  const [activePresetName, setActivePresetName] = useState('Plat / Neutre');

  // Modals
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCount, setScannedCount] = useState(0);

  // Add to playlist modal
  const [trackToAddToPlaylist, setTrackToAddToPlaylist] = useState<AudioTrack | null>(null);

  // Audio Engine Singleton Reference
  const audioEngineRef = useRef<AudioEngine | null>(null);

  // Initialize Audio Engine once
  useEffect(() => {
    const engine = new AudioEngine();
    audioEngineRef.current = engine;

    engine.setListeners({
      onTimeUpdate: (curTime, dur) => {
        setCurrentTime(curTime);
        setDuration(dur);
      },
      onEnded: () => {
        handleTrackEnded();
      },
      onStateChange: (playing, loading) => {
        setIsPlaying(playing);
        setIsLoading(loading);
      },
      onError: (msg) => {
        console.warn('Audio Error:', msg);
      },
    });

    return () => {
      engine.stop();
    };
  }, []);

  // Set MediaSession action handlers for background & OS notifications
  useEffect(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.setMediaSessionActionHandlers({
        onPlay: () => handleTogglePlay(),
        onPause: () => handleTogglePlay(),
        onNext: () => handleNext(),
        onPrev: () => handlePrev(),
        onSeekBackward: () => audioEngineRef.current?.seekBy(-10),
        onSeekForward: () => audioEngineRef.current?.seekBy(10),
      });
    }
  });

  // Load Tracks & Playlists from IndexedDB on startup
  useEffect(() => {
    async function loadInitialData() {
      try {
        const savedTracks = await getAllTracksFromDB();
        const savedPlaylists = await getAllPlaylistsDB();

        if (savedTracks.length > 0) {
          // Re-create object URLs for local blob tracks if stored
          const restoredTracks = savedTracks.map((t) => {
            if (t.blob && t.source === 'local') {
              return { ...t, src: URL.createObjectURL(t.blob) };
            }
            return t;
          });
          setTracks(restoredTracks);
        } else {
          // First launch: load sample tracks and store them
          setTracks(SAMPLE_TRACKS);
          await saveTracksBatch(SAMPLE_TRACKS);
        }

        if (savedPlaylists.length > 0) {
          setPlaylists(savedPlaylists);
        } else {
          // Default initial playlist
          const defaultPlaylist: Playlist = {
            id: 'playlist-default-1',
            name: 'Ma Sélection 21',
            description: 'Vos morceaux préférés rassemblés dans 21audio',
            trackIds: ['sample-1', 'sample-3'],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          setPlaylists([defaultPlaylist]);
          await savePlaylistDB(defaultPlaylist);
        }
      } catch (err) {
        console.warn('IndexedDB initial load issue:', err);
        setTracks(SAMPLE_TRACKS);
      }
    }

    loadInitialData();
  }, []);

  // Handle Play/Pause
  const handleTogglePlay = () => {
    if (!audioEngineRef.current) return;

    if (isPlaying) {
      audioEngineRef.current.pause();
    } else {
      if (currentTrack) {
        audioEngineRef.current.play();
      } else if (tracks.length > 0) {
        handlePlayTrack(tracks[0]);
      }
    }
  };

  const handleStop = () => {
    if (audioEngineRef.current) {
      audioEngineRef.current.stop();
    }
  };

  const handlePlayTrack = (track: AudioTrack) => {
    setCurrentTrack(track);
    if (audioEngineRef.current) {
      audioEngineRef.current.loadAndPlay(track);
    }
  };

  const handleSeek = (secs: number) => {
    if (audioEngineRef.current) {
      audioEngineRef.current.seek(secs);
    }
  };

  const handleSeekBy = (deltaSecs: number) => {
    if (audioEngineRef.current) {
      audioEngineRef.current.seekBy(deltaSecs);
    }
  };

  const handleChangeVolume = (vol: number) => {
    setVolume(vol);
    if (audioEngineRef.current) {
      audioEngineRef.current.setVolume(vol);
    }
  };

  const handleChangePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioEngineRef.current) {
      audioEngineRef.current.setPlaybackRate(rate);
    }
  };

  const handleSelectEQPreset = (preset: EqualizerPreset) => {
    setActivePresetName(preset.name);
    setEqualizerGains(preset.gains);
    if (audioEngineRef.current) {
      audioEngineRef.current.setEqualizer(preset.gains);
    }
  };

  const handleChangeEQGains = (gains: number[]) => {
    setActivePresetName('Personnalisé');
    setEqualizerGains(gains);
    if (audioEngineRef.current) {
      audioEngineRef.current.setEqualizer(gains);
    }
  };

  // Next & Prev track logic
  const handleNext = () => {
    if (tracks.length === 0) return;
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      handlePlayTrack(tracks[randomIndex]);
      return;
    }

    const currentIndex = currentTrack
      ? tracks.findIndex((t) => t.id === currentTrack.id)
      : -1;
    const nextIndex = (currentIndex + 1) % tracks.length;
    handlePlayTrack(tracks[nextIndex]);
  };

  const handlePrev = () => {
    if (tracks.length === 0) return;
    const currentIndex = currentTrack
      ? tracks.findIndex((t) => t.id === currentTrack.id)
      : -1;
    const prevIndex = currentIndex <= 0 ? tracks.length - 1 : currentIndex - 1;
    handlePlayTrack(tracks[prevIndex]);
  };

  const handleTrackEnded = () => {
    if (repeatMode === 'one' && currentTrack) {
      handlePlayTrack(currentTrack);
    } else if (repeatMode === 'all' || isShuffle) {
      handleNext();
    } else {
      // If repeat off, stop or play next if available
      handleNext();
    }
  };

  // Favorites
  const handleToggleFavorite = async (trackId: string) => {
    const updated = tracks.map((t) => {
      if (t.id === trackId) {
        const nextFav = !t.isFavorite;
        const newTrack = { ...t, isFavorite: nextFav };
        saveTrack(newTrack).catch(console.warn);
        return newTrack;
      }
      return t;
    });
    setTracks(updated);

    if (currentTrack?.id === trackId) {
      setCurrentTrack((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  // Local track deletion
  const handleDeleteTrack = async (trackId: string) => {
    const filtered = tracks.filter((t) => t.id !== trackId);
    setTracks(filtered);
    await deleteTrackFromDB(trackId).catch(console.warn);

    if (currentTrack?.id === trackId) {
      audioEngineRef.current?.stop();
      setCurrentTrack(null);
    }
  };

  // Playlists management
  const handleCreatePlaylist = async (name: string, description: string) => {
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name,
      description,
      trackIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [...playlists, newPlaylist];
    setPlaylists(updated);
    await savePlaylistDB(newPlaylist);
  };

  const handleDeletePlaylist = async (id: string) => {
    const updated = playlists.filter((p) => p.id !== id);
    setPlaylists(updated);
    await deletePlaylistDB(id);
  };

  const handleAddTrackToPlaylistById = async (playlistId: string, trackId: string) => {
    const updated = playlists.map((p) => {
      if (p.id === playlistId && !p.trackIds.includes(trackId)) {
        const newP = { ...p, trackIds: [...p.trackIds, trackId], updatedAt: Date.now() };
        savePlaylistDB(newP).catch(console.warn);
        return newP;
      }
      return p;
    });
    setPlaylists(updated);
    setTrackToAddToPlaylist(null);
  };

  const handleRemoveTrackFromPlaylist = async (playlistId: string, trackId: string) => {
    const updated = playlists.map((p) => {
      if (p.id === playlistId) {
        const newP = {
          ...p,
          trackIds: p.trackIds.filter((id) => id !== trackId),
          updatedAt: Date.now(),
        };
        savePlaylistDB(newP).catch(console.warn);
        return newP;
      }
      return p;
    });
    setPlaylists(updated);
  };

  const handleReorderPlaylistTrack = async (
    playlistId: string,
    fromIdx: number,
    toIdx: number
  ) => {
    const updated = playlists.map((p) => {
      if (p.id === playlistId) {
        const ids = [...p.trackIds];
        const [moved] = ids.splice(fromIdx, 1);
        ids.splice(toIdx, 0, moved);
        const newP = { ...p, trackIds: ids, updatedAt: Date.now() };
        savePlaylistDB(newP).catch(console.warn);
        return newP;
      }
      return p;
    });
    setPlaylists(updated);
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    const playlistTracks = playlist.trackIds
      .map((id) => tracks.find((t) => t.id === id))
      .filter((t): t is AudioTrack => t !== undefined);

    if (playlistTracks.length > 0) {
      handlePlayTrack(playlistTracks[0]);
    }
  };

  // Radio Streams
  const handlePlayStream = (station: RadioStation) => {
    const streamTrack: AudioTrack = {
      id: station.id,
      title: station.name,
      artist: `${station.genre} • ${station.country}`,
      album: 'Radio Direct Web',
      duration: 0,
      coverUrl: station.logoUrl,
      src: station.streamUrl,
      source: 'stream',
      format: 'STREAM',
      bitrate: station.bitrate,
      addedAt: Date.now(),
    };

    handlePlayTrack(streamTrack);
  };

  const handleAddCustomStream = (station: RadioStation) => {
    setRadioStations((prev) => [station, ...prev]);
    handlePlayStream(station);
  };

  // Local File Scanner & Importer
  const handleImportFiles = async (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    const audioFiles = filesArray.filter((f) =>
      /\.(mp3|flac|m4a|aac|wav|ogg|webm)$/i.test(f.name)
    );

    if (audioFiles.length === 0) return;

    setIsScanning(true);
    setScannedCount(0);
    const parsedTracks: AudioTrack[] = [];

    for (let i = 0; i < audioFiles.length; i++) {
      const parsed = await parseAudioFile(audioFiles[i]);
      parsedTracks.push(parsed);
      setScannedCount(i + 1);
      // Persist in IndexedDB
      await saveTrack(parsed);
    }

    setTracks((prev) => [...parsedTracks, ...prev]);
    setIsScanning(false);
    setIsScanModalOpen(false);

    // Play first imported track automatically
    if (parsedTracks.length > 0) {
      handlePlayTrack(parsedTracks[0]);
    }
  };

  // Recursive Directory Scanner via File System Access API
  const handleDirectoryScan = async () => {
    if (!('showDirectoryPicker' in window)) {
      alert(
        "L'API File System Directory n'est pas directement supportée sur ce navigateur. Veuillez utiliser le bouton 'Choisir des Fichiers Audio' pour importer votre musique."
      );
      return;
    }

    try {
      const dirHandle = await (window as any).showDirectoryPicker();
      setIsScanning(true);
      setScannedCount(0);

      const files: File[] = [];

      async function scanDir(handle: any) {
        for await (const entry of handle.values()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            if (/\.(mp3|flac|m4a|aac|wav|ogg|webm)$/i.test(file.name)) {
              files.push(file);
            }
          } else if (entry.kind === 'directory') {
            await scanDir(entry);
          }
        }
      }

      await scanDir(dirHandle);

      if (files.length > 0) {
        await handleImportFiles(files);
      } else {
        setIsScanning(false);
        alert('Aucun fichier MP3 ou FLAC trouvé dans le dossier sélectionné.');
      }
    } catch (err: any) {
      setIsScanning(false);
      console.warn('Directory scan canceled or denied:', err);
    }
  };

  const handleReloadSamples = async () => {
    setTracks((prev) => [...SAMPLE_TRACKS, ...prev]);
    await saveTracksBatch(SAMPLE_TRACKS);
  };

  const handleClearLocalTracks = async () => {
    if (window.confirm('Voulez-vous supprimer toutes les pistes scannées locales ?')) {
      const sampleOnly = tracks.filter((t) => t.source === 'sample');
      setTracks(sampleOnly);
      const allDB = await getAllTracksFromDB();
      for (const t of allDB) {
        if (t.source === 'local') {
          await deleteTrackFromDB(t.id);
        }
      }
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 font-sans ${
        isDarkMode ? 'bg-[#171717] text-white' : 'bg-neutral-100 text-neutral-900'
      }`}
    >
      {/* Container with optional Mobile Device Frame Simulation */}
      <div
        className={`mx-auto transition-all duration-300 ${
          isMobileFrame
            ? 'max-w-md my-6 min-h-[820px] rounded-[40px] border-8 border-neutral-800 shadow-2xl overflow-hidden bg-[#171717] relative'
            : 'w-full max-w-4xl'
        }`}
      >
        {/* App Header */}
        <Header
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          onOpenScan={() => setIsScanModalOpen(true)}
          isMobileFrame={isMobileFrame}
          onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
          totalTracksCount={tracks.length}
        />

        {/* Main Body View */}
        <main className="p-4 min-h-[60vh] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {activeTab === 'library' && (
                <LibraryView
                  tracks={tracks}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onPlayTrack={handlePlayTrack}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToPlaylist={(t) => setTrackToAddToPlaylist(t)}
                  onDeleteTrack={handleDeleteTrack}
                  onScanFolder={() => setIsScanModalOpen(true)}
                  onImportFiles={handleImportFiles}
                />
              )}

              {activeTab === 'playlists' && (
                <PlaylistsView
                  playlists={playlists}
                  tracks={tracks}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onCreatePlaylist={handleCreatePlaylist}
                  onDeletePlaylist={handleDeletePlaylist}
                  onRemoveTrackFromPlaylist={handleRemoveTrackFromPlaylist}
                  onReorderPlaylistTrack={handleReorderPlaylistTrack}
                  onPlayPlaylist={handlePlayPlaylist}
                  onPlayTrack={handlePlayTrack}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToPlaylist={(t) => setTrackToAddToPlaylist(t)}
                />
              )}

              {activeTab === 'streams' && (
                <StreamsView
                  radioStations={radioStations}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onPlayStream={handlePlayStream}
                  onAddCustomStream={handleAddCustomStream}
                />
              )}

              {activeTab === 'equalizer' && (
                <EqualizerView
                  equalizerGains={equalizerGains}
                  onChangeGains={handleChangeEQGains}
                  equalizerPresets={EQUALIZER_PRESETS}
                  activePresetName={activePresetName}
                  onSelectPreset={handleSelectEQPreset}
                  getAnalyserData={() => audioEngineRef.current?.getAnalyserData() || null}
                  isPlaying={isPlaying}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  tracks={tracks}
                  isDarkMode={isDarkMode}
                  onToggleTheme={() => setIsDarkMode(!isDarkMode)}
                  onScanFolder={() => setIsScanModalOpen(true)}
                  onReloadSamples={handleReloadSamples}
                  onClearLocalTracks={handleClearLocalTracks}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mini Player Sticky Bar */}
        <MiniPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          isLoading={isLoading}
          currentTime={currentTime}
          duration={duration}
          onTogglePlay={handleTogglePlay}
          onNext={handleNext}
          onOpenFullPlayer={() => setIsFullPlayerOpen(true)}
        />

        {/* Bottom Navigation Tabs */}
        <NavigationTabs
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          playlistsCount={playlists.length}
        />

        {/* Full Player Modal Sheet */}
        <FullPlayerModal
          isOpen={isFullPlayerOpen}
          onClose={() => setIsFullPlayerOpen(false)}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          isLoading={isLoading}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          repeatMode={repeatMode}
          isShuffle={isShuffle}
          playbackRate={playbackRate}
          onTogglePlay={handleTogglePlay}
          onStop={handleStop}
          onSeek={handleSeek}
          onSeekBy={handleSeekBy}
          onNext={handleNext}
          onPrev={handlePrev}
          onToggleShuffle={() => setIsShuffle(!isShuffle)}
          onChangeRepeatMode={() =>
            setRepeatMode((prev) =>
              prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'
            )
          }
          onChangeVolume={handleChangeVolume}
          onChangePlaybackRate={handleChangePlaybackRate}
          onToggleFavorite={handleToggleFavorite}
          onAddToPlaylist={(t) => setTrackToAddToPlaylist(t)}
          getAnalyserData={() => audioEngineRef.current?.getAnalyserData() || null}
          equalizerPresets={EQUALIZER_PRESETS}
          activePresetName={activePresetName}
          onSelectPreset={handleSelectEQPreset}
        />

        {/* Auto Scan Modal */}
        <ScanModal
          isOpen={isScanModalOpen}
          onClose={() => setIsScanModalOpen(false)}
          onStartDirectoryScan={handleDirectoryScan}
          onSelectMultipleFiles={handleImportFiles}
          isScanning={isScanning}
          scannedCount={scannedCount}
        />

        {/* Add Track to Playlist Picker Modal */}
        <AnimatePresence>
          {trackToAddToPlaylist && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setTrackToAddToPlaylist(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />

              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 15 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl z-10"
              >
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ListPlus className="w-4 h-4 text-[#c6ff34]" /> Ajouter à une Playlist
                  </h3>
                  <button
                    onClick={() => setTrackToAddToPlaylist(null)}
                    className="text-neutral-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-xs font-semibold text-neutral-300">
                  Piste: <strong className="text-[#c6ff34]">{trackToAddToPlaylist.title}</strong>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {playlists.map((playlist) => {
                    const alreadyIn = playlist.trackIds.includes(trackToAddToPlaylist.id);
                    return (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        key={playlist.id}
                        onClick={() =>
                          handleAddTrackToPlaylistById(
                            playlist.id,
                            trackToAddToPlaylist.id
                          )
                        }
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white transition-colors cursor-pointer"
                      >
                        <span>{playlist.name}</span>
                        {alreadyIn ? (
                          <span className="text-[10px] text-[#c6ff34] flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Déjà présente
                          </span>
                        ) : (
                          <Plus className="w-4 h-4 text-[#c6ff34]" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
