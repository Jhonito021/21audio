import React, { useState } from 'react';
import { FolderSearch, Music, CheckCircle, Disc, X, Upload } from 'lucide-react';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDirectoryScan: () => void;
  onSelectMultipleFiles: (files: FileList) => void;
  isScanning: boolean;
  scannedCount: number;
}

export const ScanModal: React.FC<ScanModalProps> = ({
  isOpen,
  onClose,
  onStartDirectoryScan,
  onSelectMultipleFiles,
  isScanning,
  scannedCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-md relative shadow-2xl space-y-5">
        <button
          onClick={onClose}
          disabled={isScanning}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-[#c6ff34]/20 border border-[#c6ff34]/30 text-[#c6ff34] flex items-center justify-center mx-auto shadow-lg shadow-[#c6ff34]/10">
            <FolderSearch className="w-8 h-8 animate-bounce" />
          </div>
          <h2 className="text-lg font-black text-white">
            Scan Automatique des Fichiers Locaux
          </h2>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto">
            21audio explore votre stockage pour détecter vos musiques, extraire les métadonnées (titre, artiste, pochette) et les enregistrer localement.
          </p>
        </div>

        {/* Scan Status Box */}
        {isScanning ? (
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-[#c6ff34] font-bold text-sm">
              <Disc className="w-5 h-5 animate-spin" />
              <span>Analyse des fichiers en cours...</span>
            </div>

            <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div className="bg-[#c6ff34] h-full w-2/3 animate-pulse" />
            </div>

            <p className="text-xs font-mono text-neutral-400">
              Pistes détectées: <strong className="text-white">{scannedCount}</strong>
            </p>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {/* Option A: Select Folder Directory via File System API */}
            <button
              onClick={onStartDirectoryScan}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#c6ff34] text-[#171717] font-extrabold text-xs hover:bg-[#b5f020] transition-transform active:scale-98 cursor-pointer shadow-lg shadow-[#c6ff34]/20"
            >
              <span className="flex items-center gap-2">
                <FolderSearch className="w-5 h-5" /> Sélectionner un Dossier Complet
              </span>
              <span className="text-[10px] bg-[#171717]/20 px-2 py-0.5 rounded font-mono">
                Auto Scan
              </span>
            </button>

            {/* Option B: Standard Multi-file selection fallback */}
            <label className="w-full flex items-center justify-between p-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-colors cursor-pointer">
              <span className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#c6ff34]" /> Choisir des Fichiers Audio (MP3, FLAC)
              </span>
              <input
                type="file"
                multiple
                accept="audio/*,.mp3,.flac,.m4a,.wav,.ogg"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    onSelectMultipleFiles(e.target.files);
                  }
                }}
              />
              <span className="text-[10px] text-neutral-400">Navigateur</span>
            </label>
          </div>
        )}

        <div className="text-[11px] text-neutral-500 text-center font-mono pt-1">
          Formats supportés: MP3, FLAC HD, AAC, WAV, OGG
        </div>
      </div>
    </div>
  );
};
