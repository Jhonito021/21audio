import React from 'react';
import { Music, ListMusic, Radio, SlidersHorizontal, Settings } from 'lucide-react';
import { TabType } from '../types';

interface NavigationTabsProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  playlistsCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onChangeTab,
  playlistsCount,
}) => {
  const tabs = [
    { id: 'library' as TabType, label: 'Bibliothèque', icon: Music },
    { id: 'playlists' as TabType, label: 'Playlists', icon: ListMusic, badge: playlistsCount },
    { id: 'streams' as TabType, label: 'Radios & Flux', icon: Radio },
    { id: 'equalizer' as TabType, label: 'Égaliseur', icon: SlidersHorizontal },
    { id: 'settings' as TabType, label: 'Paramètres', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-neutral-800 bg-[#171717]/95 backdrop-blur-lg px-2 py-2">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#c6ff34] font-bold scale-105'
                  : 'text-neutral-400 hover:text-neutral-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#c6ff34]' : 'text-neutral-400'}`} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-black rounded-full bg-[#c6ff34] text-[#171717]">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#c6ff34]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
