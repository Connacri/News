import React from 'react';
import { Radio, Bell, Smartphone, Monitor, Code, Globe2 } from 'lucide-react';
import { CountryCode, Language } from '../types';
import { COUNTRIES } from '../services/countries';
import { translations } from '../services/translations';

interface HeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  selectedCountry: CountryCode;
  onCountryChange: (country: CountryCode) => void;
  viewMode: 'desktop' | 'mobile' | 'code';
  onViewModeChange: (mode: 'desktop' | 'mobile' | 'code') => void;
  onOpenFcmSimulator: () => void;
  unreadPushCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  selectedCountry,
  onCountryChange,
  viewMode,
  onViewModeChange,
  onOpenFcmSimulator,
  unreadPushCount,
}) => {
  const t = translations[currentLang];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-white">
            DZ News
          </span>
        </div>

        {/* Zone 2: Navigation / View Mode Selectors */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800/80 text-xs">
          <button
            onClick={() => onViewModeChange('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              viewMode === 'desktop'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>{t.switchViewWeb}</span>
          </button>

          <button
            onClick={() => onViewModeChange('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              viewMode === 'mobile'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{t.switchViewMobile}</span>
          </button>

          <button
            onClick={() => onViewModeChange('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              viewMode === 'code'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>{t.switchViewCode}</span>
          </button>
        </nav>

        {/* Zone 3: Country Selector, Multilingual Switcher & FCM Bell */}
        <div className="flex items-center gap-2.5">
          {/* Country Selector */}
          <div className="relative">
            <select
              value={selectedCountry}
              onChange={(e) => onCountryChange(e.target.value as CountryCode)}
              aria-label={t.filterByCountry}
              className="bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-slate-900 text-slate-200">
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Multilingual Switcher (Free Instant Translations) */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300">
            <Globe2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={currentLang}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              aria-label="Language"
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="fr" className="bg-slate-900">FR Français</option>
              <option value="en" className="bg-slate-900">EN English</option>
              <option value="es" className="bg-slate-900">ES Español</option>
              <option value="de" className="bg-slate-900">DE Deutsch</option>
              <option value="ar" className="bg-slate-900">AR العربية</option>
              <option value="ja" className="bg-slate-900">JA 日本語</option>
            </select>
          </div>

          {/* FCM Push Notifications Bell Button */}
          <button
            onClick={onOpenFcmSimulator}
            aria-label={t.fcmTitle}
            className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadPushCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-sky-500 text-[10px] font-bold text-slate-950 rounded-full flex items-center justify-center">
                {unreadPushCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
