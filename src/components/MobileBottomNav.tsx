import React from 'react';
import { Newspaper, ShieldAlert, Code2, FolderGit2, Bookmark } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../services/translations';

interface MobileBottomNavProps {
  activeTab: 'news' | 'osint' | 'github' | 'code' | 'bookmarks' | 'apis';
  onSelectTab: (tab: 'news' | 'osint' | 'github' | 'code' | 'bookmarks' | 'apis') => void;
  bookmarksCount: number;
  currentLang: Language;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  bookmarksCount,
  currentLang,
}) => {
  const tabs = [
    { id: 'news' as const, label: 'News', icon: Newspaper },
    { id: 'osint' as const, label: 'OSINT', icon: ShieldAlert },
    { id: 'github' as const, label: 'GitHub', icon: Code2 },
    { id: 'code' as const, label: 'Export', icon: FolderGit2 },
    { id: 'bookmarks' as const, label: 'Favoris', icon: Bookmark, badge: bookmarksCount > 0 ? bookmarksCount : undefined },
  ];

  return (
    <nav 
      aria-label="Navigation mobile principale"
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 pb-safe"
    >
      <div className="max-w-lg mx-auto grid grid-cols-5 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`min-h-[48px] flex flex-col items-center justify-center relative transition-colors ${
                isActive
                  ? 'text-sky-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-sky-400' : ''}`} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 bg-sky-500 text-slate-950 text-[9px] font-bold rounded-full min-w-[16px] text-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 ${isActive ? 'text-sky-400 font-semibold' : 'text-slate-400'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-sky-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
