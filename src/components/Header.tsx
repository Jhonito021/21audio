import React from 'react';
import { Disc3, FolderSearch, Moon, Sun, Smartphone, Monitor } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenScan: () => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  totalTracksCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleTheme,
  onOpenScan,
  isMobileFrame,
  onToggleMobileFrame,
  totalTracksCount,
}) => {
  return (
    <header className="sticky top-0 z-30 px-4 py-3 border-b border-neutral-800 bg-[#171717]/95 backdrop-blur-md transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Logo Branding */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#c6ff34] text-[#171717] font-extrabold shadow-lg shadow-[#c6ff34]/20">
            <Disc3 className="w-6 h-6 animate-spin-slow" />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c6ff34] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#171717]"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white font-mono">
                21<span className="text-[#c6ff34]">audio</span>
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-[#c6ff34]/20 text-[#c6ff34]">
                FLAC / MP3
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-medium">
              {totalTracksCount} pistes détectées
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Scan Folder Button */}
          <button
            onClick={onOpenScan}
            title="Scan rapide dossier audio"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#c6ff34] text-[#171717] hover:bg-[#b5f020] transition-transform active:scale-95 shadow-md shadow-[#c6ff34]/10 cursor-pointer"
          >
            <FolderSearch className="w-4 h-4" />
            <span className="hidden sm:inline">Scanner</span>
          </button>

          {/* Toggle Mobile / Desktop Frame Simulator */}
          <button
            onClick={onToggleMobileFrame}
            title={isMobileFrame ? "Vue Plein Écran" : "Vue Cadre Mobile"}
            className="p-2 text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
          >
            {isMobileFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4 text-[#c6ff34]" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title={isDarkMode ? "Mode Clair" : "Mode Sombre"}
            className="p-2 text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
