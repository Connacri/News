import React from 'react';
import { Menu, Bell, Search, Globe2, Radio, ChevronDown } from 'lucide-react';
import { CountryCode, Language, NewsCategory } from '../types';
import { COUNTRIES } from '../services/countries';
import { translations } from '../services/translations';

interface MobileTopBarProps {
  currentLang: Language;
  onOpenLanguageSheet: () => void;
  selectedCountry: CountryCode;
  onOpenCountrySheet: () => void;
  onOpenDrawer: () => void;
  onOpenFcmSimulator: () => void;
  unreadPushCount: number;
  isSearchOpen: boolean;
  onToggleSearch: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeNavTab: string;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  currentLang,
  onOpenLanguageSheet,
  selectedCountry,
  onOpenCountrySheet,
  onOpenDrawer,
  onOpenFcmSimulator,
  unreadPushCount,
  isSearchOpen,
  onToggleSearch,
  searchQuery,
  onSearchChange,
  activeNavTab,
}) => {
  const t = translations[currentLang];
  const activeCountry = COUNTRIES.find((c) => c.code === selectedCountry) || COUNTRIES[0];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Primary Mobile App Bar (h-14 / 56px) */}
      <div className="h-14 px-3 sm:px-4 flex items-center justify-between gap-2 max-w-lg mx-auto">
        {/* Left: Mobile Drawer Hamburger with min 44x44 hitbox */}
        <button
          onClick={onOpenDrawer}
          aria-label="Ouvrir le menu de navigation"
          className="min-w-[44px] min-h-[44px] -ml-2 rounded-full flex items-center justify-center text-slate-300 hover:text-white active:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Center: Flutter App Title + Country Quick Switcher Pill */}
        <button
          onClick={onOpenCountrySheet}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-white tracking-tight active:scale-95 transition-all max-w-[200px]"
        >
          <span className="text-sm shrink-0">{activeCountry.flag}</span>
          <span className="truncate">{activeCountry.name}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </button>

        {/* Right: Search, Language & FCM Notifications */}
        <div className="flex items-center gap-0.5">
          {/* Search Toggle */}
          <button
            onClick={onToggleSearch}
            aria-label="Rechercher"
            className={`min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center transition-colors ${
              isSearchOpen ? 'text-sky-400 bg-sky-500/10' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Language Selector Trigger */}
          <button
            onClick={onOpenLanguageSheet}
            aria-label="Changer de langue"
            className="min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center text-slate-300 hover:text-white active:bg-slate-800 transition-colors text-xs font-mono font-bold uppercase"
          >
            {currentLang}
          </button>

          {/* FCM Push Bell Button */}
          <button
            onClick={onOpenFcmSimulator}
            aria-label="Notifications push FCM"
            className="min-w-[40px] min-h-[40px] -mr-1 rounded-full flex items-center justify-center text-slate-300 hover:text-white active:bg-slate-800 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadPushCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-sky-500 text-slate-950 text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-slate-950">
                {unreadPushCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Mobile Search Bar */}
      {isSearchOpen && (
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-900/95 animate-slide-in max-w-lg mx-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>
      )}
    </header>
  );
};
