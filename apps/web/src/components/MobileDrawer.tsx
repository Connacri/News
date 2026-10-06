import React from 'react';
import { 
  X, 
  Newspaper, 
  ShieldAlert, 
  Code2, 
  FolderGit2, 
  Bookmark, 
  Bell, 
  Globe2, 
  Radio, 
  Check, 
  ChevronRight, 
  Flame, 
  ExternalLink, 
  Database,
  LogIn,
  LogOut,
  User,
  CloudCheck,
  Scroll,
  ShieldCheck
} from 'lucide-react';
import { CountryCode, Language } from '../types';
import { COUNTRIES } from '../services/countries';
import { translations } from '../services/translations';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  selectedCountry: CountryCode;
  onCountryChange: (country: CountryCode) => void;
  activeNavTab: 'news' | 'osint' | 'github' | 'code' | 'bookmarks' | 'apis';
  onSelectNavTab: (tab: 'news' | 'osint' | 'github' | 'code' | 'bookmarks' | 'apis') => void;
  onOpenFcmSimulator: () => void;
  bookmarksCount: number;
  currentUser?: { email?: string | null; displayName?: string | null; photoURL?: string | null } | null;
  onLogin?: () => void;
  onLogout?: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentLang,
  onLanguageChange,
  selectedCountry,
  onCountryChange,
  activeNavTab,
  onSelectNavTab,
  onOpenFcmSimulator,
  bookmarksCount,
  currentUser,
  onLogin,
  onLogout,
}) => {
  const t = translations[currentLang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in">
      {/* Dimmed backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Drawer Body - Flutter Material 3 style */}
      <div className="relative w-4/5 max-w-[320px] bg-slate-950 border-r border-slate-800 h-full flex flex-col shadow-2xl z-10 animate-slide-right overflow-hidden">
        {/* Drawer Header with Flutter Banner */}
        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border-b border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <button
              onClick={onClose}
              aria-label={t.close}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-lg font-bold text-white tracking-tight">
            DZ News
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Flutter 3.24 · Firebase Auth/Firestore · Google Patents
          </p>
          <div className="flex items-center gap-2 mt-2.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              {t.fcmConnected}
            </span>
          </div>

          {/* Firebase Authentication Box */}
          <div className="mt-3 pt-3 border-t border-slate-800/80">
            {currentUser ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="User avatar" 
                      className="w-7 h-7 rounded-full border border-sky-400"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-xs font-bold">
                      {currentUser.email ? currentUser.email[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="truncate text-left">
                    <div className="text-xs font-semibold text-white truncate">
                      {currentUser.displayName || currentUser.email?.split('@')[0]}
                    </div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                      <span>✓ {t.cloudSyncActive}</span>
                    </div>
                  </div>
                </div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    title={t.signOut}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              onLogin && (
                <button
                  onClick={onLogin}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-all active:scale-98 shadow-sm"
                >
                  <LogIn className="w-4 h-4 text-sky-400" />
                  <span>{t.signInWithGoogle}</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Drawer Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5">
            {t.mainNavigation}
          </div>

          {[
            { id: 'news' as const, label: t.dailyTechNews, icon: Newspaper },
            { id: 'osint' as const, label: t.osintRadar, icon: ShieldAlert },
            { id: 'github' as const, label: t.githubTrending, icon: Code2 },
            { id: 'apis' as const, label: t.navApis, icon: Database },
            { id: 'code' as const, label: t.flutterCodeExport, icon: FolderGit2 },
            { id: 'bookmarks' as const, label: `${t.myBookmarks} (${bookmarksCount})`, icon: Bookmark },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeNavTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectNavTab(item.id);
                  onClose();
                }}
                className={`w-full h-12 px-3.5 rounded-xl flex items-center justify-between text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-sky-500/15 text-sky-300 font-semibold border border-sky-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            );
          })}

          <div className="pt-4 pb-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5">
              {t.toolsAndServices}
            </div>
          </div>

          {/* FCM Push Tester Action */}
          <button
            onClick={() => {
              onOpenFcmSimulator();
              onClose();
            }}
            className="w-full h-12 px-3.5 rounded-xl flex items-center justify-between text-xs font-medium text-amber-300 hover:bg-amber-500/10 border border-amber-500/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>{t.fcmSimulatorNav}</span>
            </div>
            <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full font-mono">
              Test
            </span>
          </button>

          {/* Country Selection Section */}
          <div className="pt-4 pb-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5">
              {t.selectedCountryLabel}
            </div>
            <div className="space-y-1 mt-1">
              {COUNTRIES.map((c) => {
                const isSelected = selectedCountry === c.code;
                return (
                  <button
                    key={c.code}
                    onClick={() => {
                      onCountryChange(c.code);
                      onClose();
                    }}
                    className={`w-full px-3 py-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                      isSelected
                        ? 'bg-slate-900 text-sky-300 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{c.flag}</span>
                      <span>{c.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

{/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Version 1.0.0+1 (APK/AAB/Web)</span>
          <div className="flex items-center gap-3">
            <a
              href="/security-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-slate-400 hover:text-sky-400 transition-colors"
              title="Politique de confidentialité / Privacy policy"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="font-mono">Confidentialité</span>
            </a>
            <a href="/contact" target="_blank" rel="noopener noreferrer" className="font-mono text-slate-400 hover:text-sky-400 transition-colors">Contact</a>
            <a href="/about" target="_blank" rel="noopener noreferrer" className="font-mono text-slate-400 hover:text-sky-400 transition-colors">À propos</a>
          </div>
        </div>
      </div>
    </div>
  );
};
