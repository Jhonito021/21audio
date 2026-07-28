import React from 'react';
import { Disc3, FolderSearch, Moon, Sun, Cpu } from 'lucide-react';

export const Header = ({
  isDarkMode,
  onToggleTheme,
  onOpenScan,
  totalTracksCount,
}) => {
  const isElectronEnv = typeof window !== 'undefined' && Boolean(window.electronAPI?.isElectron);

  return (
    <header className="sticky top-0 z-30 px-4 py-3 border-b border-neutral-800 bg-[#171717]/95 backdrop-blur-md transition-colors select-none">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
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
                {isElectronEnv ? 'Desktop Electron' : 'Auto Responsive'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-medium">
              {totalTracksCount} pistes au total
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
            <span className="hidden sm:inline">Scanner Dossier</span>
          </button>

          {/* Electron or Auto Status Indicator */}
          <div
            title="Responsive design automatique actif"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700/80 text-xs font-mono"
          >
            <Cpu className="w-3.5 h-3.5 text-[#c6ff34]" />
            <span>{isElectronEnv ? 'Electron v1.0' : 'Auto-Fluid'}</span>
          </div>

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

