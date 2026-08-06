import React from 'react';
import { motion } from 'motion/react';
import { Music, Youtube, ListMusic, SlidersHorizontal, Settings } from 'lucide-react';

export const NavigationTabs = ({
  activeTab,
  onChangeTab,
  playlistsCount,
}) => {
  const tabs = [
    { id: 'library', label: 'Musique', icon: Music },
    { id: 'youtube', label: 'YouTube', icon: Youtube, isHighlight: true },
    { id: 'playlists', label: 'Playlists', icon: ListMusic, badge: playlistsCount },
    { id: 'equalizer', label: 'Égaliseur', icon: SlidersHorizontal },
    { id: 'settings', label: 'Réglages', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-neutral-800 bg-[#171717]/95 backdrop-blur-xl px-2 py-2 shadow-2xl">
      <div className="max-w-md md:max-w-xl lg:max-w-3xl mx-auto flex items-center justify-around sm:justify-center sm:gap-12">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className="relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-colors cursor-pointer select-none group"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBackground"
                  className="absolute inset-0 bg-[#c6ff34]/10 rounded-xl border border-[#c6ff34]/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              
              <motion.div 
                whileTap={{ scale: 0.88 }}
                whileHover={{ scale: 1.08 }}
                className="relative z-10 flex flex-col items-center"
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isActive ? 'text-[#c6ff34]' : 'text-neutral-400 group-hover:text-white'
                    }`}
                  />
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-2 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-black rounded-full bg-[#c6ff34] text-[#171717] shadow-sm"
                    >
                      {tab.badge}
                    </motion.span>
                  )}
                </div>
                <span
                  className={`text-[11px] mt-1 tracking-tight transition-colors duration-200 font-medium ${
                    isActive ? 'text-[#c6ff34] font-bold' : 'text-neutral-400 group-hover:text-neutral-200'
                  }`}
                >
                  {tab.label}
                </span>
              </motion.div>

              {isActive && (
                <motion.span
                  layoutId="activeTabDot"
                  className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#c6ff34] shadow-[0_0_8px_#c6ff34]"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
