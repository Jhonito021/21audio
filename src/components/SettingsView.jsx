import React from 'react';
import {
  HardDrive,
  RefreshCw,
  Trash2,
  Moon,
  Sun,
  Disc3,
  ShieldCheck,
  Radio,
  FileAudio,
  FolderSearch,
} from 'lucide-react';

export const SettingsView = ({
  tracks,
  isDarkMode,
  onToggleTheme,
  onScanFolder,
  onReloadSamples,
  onClearLocalTracks,
}) => {
  const localTracks = tracks.filter((t) => t.source === 'local');
  const sampleTracks = tracks.filter((t) => t.source === 'sample');

  let totalSizeMB = 0;
  localTracks.forEach((t) => {
    if (t.fileSize) {
      totalSizeMB += t.fileSize / (1024 * 1024);
    }
  });

  return (
    <div className="space-y-4 pb-36">
      {/* Settings Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
        <h2 className="text-base font-extrabold text-white">Paramètres & Stockage</h2>
        <p className="text-xs text-neutral-400">
          Gérez vos données locales, votre bibliothèque et l'apparence de 21audio
        </p>
      </div>

      {/* Storage & Data Section */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
          <HardDrive className="w-5 h-5 text-[#c6ff34]" />
          <h3 className="text-sm font-bold text-white">Stockage Local (IndexedDB)</h3>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800">
            <span className="block text-neutral-400 font-medium">Pistes Scannées</span>
            <span className="text-lg font-black text-white font-mono mt-1 block">
              {localTracks.length}
            </span>
          </div>

          <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800">
            <span className="block text-neutral-400 font-medium">Taille Estimée</span>
            <span className="text-lg font-black text-[#c6ff34] font-mono mt-1 block">
              {totalSizeMB.toFixed(1)} MB
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={onScanFolder}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <FolderSearch className="w-4 h-4 text-[#c6ff34]" /> Lancer un Scan de Dossier
            </span>
            <span className="text-[11px] text-neutral-400">Audio Local</span>
          </button>

          <button
            onClick={onReloadSamples}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#c6ff34]" /> Recharger Pistes Démo HD
            </span>
            <span className="text-[11px] text-neutral-400">{sampleTracks.length} démos</span>
          </button>

          <button
            onClick={onClearLocalTracks}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-red-950/40 hover:bg-red-950/70 border border-red-900/50 text-xs font-bold text-red-400 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Vider la Musique Scannée Locale
            </span>
            <span className="text-[11px] text-red-500 font-mono">Effacer</span>
          </button>
        </div>
      </div>

      {/* App Appearance */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white border-b border-neutral-800 pb-2">
          Apparence & Thème
        </h3>

        <div className="flex items-center justify-between p-3 bg-neutral-950/60 rounded-xl border border-neutral-800">
          <div className="flex items-center gap-3">
            {isDarkMode ? (
              <Moon className="w-5 h-5 text-indigo-400" />
            ) : (
              <Sun className="w-5 h-5 text-amber-300" />
            )}
            <div>
              <h4 className="text-xs font-bold text-white">Mode Sombre #171717</h4>
              <p className="text-[11px] text-neutral-400">
                Optimisé pour les écrans OLED avec accent vibrant #c6ff34
              </p>
            </div>
          </div>

          <button
            onClick={onToggleTheme}
            className="px-3 py-1.5 rounded-lg bg-[#c6ff34] text-[#171717] font-extrabold text-xs hover:bg-[#b5f020] cursor-pointer"
          >
            {isDarkMode ? 'Passer en Clair' : 'Passer en Sombre'}
          </button>
        </div>
      </div>

      {/* Information & Architecture */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 text-[#c6ff34]">
          <Disc3 className="w-5 h-5 animate-spin-slow" />
          <h3 className="text-sm font-extrabold text-white">À propos de 21audio</h3>
        </div>

        <div className="space-y-2 text-xs text-neutral-300 leading-relaxed">
          <p>
            <strong className="text-white">21audio</strong> est un lecteur audio mobile & web de haute précision spécialement conçu pour la lecture fluide de fichiers audio locaux (<strong>MP3, FLAC 24-bit Lossless, AAC, WAV</strong>) et la diffusion de flux radio en ligne.
          </p>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-center gap-2">
              <FileAudio className="w-4 h-4 text-[#c6ff34]" />
              <span>
                <strong>Decodeur FLAC & MP3</strong> intégré
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#c6ff34]" />
              <span>
                <strong>Contrôle Arrière-plan</strong> via MediaSession API
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#c6ff34]" />
              <span>
                <strong>Sauvegarde IndexedDB</strong> automatique
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#c6ff34]" />
              <span>
                <strong>Flux Streaming Web</strong> AAC / MP3 Direct
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
