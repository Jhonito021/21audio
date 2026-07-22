import React from 'react';
import { SlidersHorizontal, RotateCcw, Volume2, Sparkles, Activity } from 'lucide-react';
import { EqualizerPreset } from '../types';
import { AudioVisualizer } from './AudioVisualizer';

interface EqualizerViewProps {
  equalizerGains: number[]; // 5 band gains in dB
  onChangeGains: (gains: number[]) => void;
  equalizerPresets: EqualizerPreset[];
  activePresetName: string;
  onSelectPreset: (preset: EqualizerPreset) => void;
  getAnalyserData: () => Uint8Array | null;
  isPlaying: boolean;
}

export const EqualizerView: React.FC<EqualizerViewProps> = ({
  equalizerGains,
  onChangeGains,
  equalizerPresets,
  activePresetName,
  onSelectPreset,
  getAnalyserData,
  isPlaying,
}) => {
  const frequencies = [
    { freq: '60 Hz', label: 'Sub-Bass' },
    { freq: '230 Hz', label: 'Basses' },
    { freq: '910 Hz', label: 'Médiums' },
    { freq: '4 kHz', label: 'Aigus' },
    { freq: '14 kHz', label: 'Brillance' },
  ];

  const handleSliderChange = (index: number, val: number) => {
    const newGains = [...equalizerGains];
    newGains[index] = val;
    onChangeGains(newGains);
  };

  const handleReset = () => {
    onChangeGains([0, 0, 0, 0, 0]);
  };

  return (
    <div className="space-y-5 pb-36">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-[#171717] to-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-[#c6ff34]" />
            <h2 className="text-base font-extrabold text-white">
              Égaliseur Graphique 5 Bandes
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Personnalisez le rendu sonore et les basses en temps réel.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#c6ff34]" /> Réinitialiser
        </button>
      </div>

      {/* Live Spectrum Visualizer Box */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 shadow-xl flex flex-col items-center">
        <div className="w-full flex items-center justify-between text-xs font-mono font-bold text-neutral-400 mb-2">
          <span className="flex items-center gap-1.5 text-[#c6ff34]">
            <Activity className="w-4 h-4 animate-pulse" /> SPECTRE EN DIRECT
          </span>
          <span>WEB AUDIO API ENGINE</span>
        </div>
        <AudioVisualizer
          getAnalyserData={getAnalyserData}
          isPlaying={isPlaying}
          height={80}
          barCount={40}
        />
      </div>

      {/* Preset Buttons Grid */}
      <div>
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 px-1">
          Préréglages Sonores
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {equalizerPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onSelectPreset(preset)}
              className={`p-3 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                activePresetName === preset.name
                  ? 'bg-[#c6ff34] border-[#c6ff34] text-[#171717] shadow-lg shadow-[#c6ff34]/20 scale-[1.02]'
                  : 'bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{preset.name}</span>
                {activePresetName === preset.name && (
                  <Sparkles className="w-4 h-4 fill-current" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 5-Band Sliders Card */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex justify-between items-center text-xs font-bold text-neutral-400 border-b border-neutral-800 pb-2">
          <span>AMPLITUDE: -12dB À +12dB</span>
          <span className="text-[#c6ff34] font-mono">5 FILTRES BIQUAD</span>
        </div>

        <div className="grid grid-cols-5 gap-3 sm:gap-6 pt-2 pb-2">
          {frequencies.map((f, idx) => {
            const gain = equalizerGains[idx] || 0;

            return (
              <div
                key={f.freq}
                className="flex flex-col items-center gap-3 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80"
              >
                {/* dB Value Badge */}
                <span className="text-[11px] font-mono font-extrabold text-[#c6ff34]">
                  {gain > 0 ? `+${gain}` : gain} dB
                </span>

                {/* Vertical Range Slider */}
                <div className="h-36 flex items-center justify-center my-1">
                  <input
                    type="range"
                    min={-12}
                    max={12}
                    step={1}
                    value={gain}
                    onChange={(e) => handleSliderChange(idx, Number(e.target.value))}
                    className="h-32 w-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#c6ff34] [writing-mode:vertical-lr] [direction:rtl]"
                  />
                </div>

                {/* Frequency Label */}
                <div className="text-center">
                  <span className="block text-xs font-black text-white font-mono">
                    {f.freq}
                  </span>
                  <span className="block text-[10px] text-neutral-400 font-medium truncate">
                    {f.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
