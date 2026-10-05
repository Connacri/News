/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MobileTopBar } from './components/MobileTopBar';
import { MobileDrawer } from './components/MobileDrawer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileBottomSheet } from './components/MobileBottomSheet';
import { DailyAudioBriefing } from './components/DailyAudioBriefing';
import { TrendingTopicsChart } from './components/TrendingTopicsChart';
import { NewsCard } from './components/NewsCard';
import { OsintRadar } from './components/OsintRadar';
import { GitHubTrendingFeed } from './components/GitHubTrendingFeed';
import { FlutterExportHub } from './components/FlutterExportHub';
import { FreeApisHub } from './components/FreeApisHub';
import { FcmSimulatorModal } from './components/FcmSimulatorModal';
import { ArticleDetailModal } from './components/ArticleDetailModal';
import { CountryCode, FcmPayload, FlutterPlatform, Language, NewsArticle, NewsCategory } from './types';
import { getAggregatedNews } from './services/newsApi';
import { translations } from './services/translations';
import { COUNTRIES } from './services/countries';
import { NEWS_CATEGORIES } from './services/newsCategories';
import { getSavedLanguage, setSavedLanguage } from './services/translator';
import { 
  auth, 
  loginWithGoogle, 
  logoutUser, 
  saveBookmarkToFirestore, 
  removeBookmarkFromFirestore 
} from './services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Bell, RefreshCw, X, Check, Radio, Sparkles } from 'lucide-react';

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>(() => getSavedLanguage());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [previewPlatform, setPreviewPlatform] = useState<FlutterPlatform>('android');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(() => {
    try {
      const saved = localStorage.getItem('flutternews_country');
      if (saved && COUNTRIES.some(c => c.code === saved)) {
        return saved as CountryCode;
      }
    } catch {}
    return 'all';
  });
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState<'news' | 'osint' | 'github' | 'code' | 'bookmarks' | 'apis'>('news');

  const handleLanguageChange = (lang: Language) => {
    setCurrentLang(lang);
    setSavedLanguage(lang);
  };

  const handleCountryChange = (country: CountryCode) => {
    setSelectedCountry(country);
    try {
      localStorage.setItem('flutternews_country', country);
    } catch {}
  };

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<NewsArticle[]>(() => {
    try {
      const saved = localStorage.getItem('flutternews_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal / Sheet States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCountrySheetOpen, setIsCountrySheetOpen] = useState(false);
  const [isLanguageSheetOpen, setIsLanguageSheetOpen] = useState(false);
  const [isFcmModalOpen, setIsFcmModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  // Push notifications
  const [pushHistory, setPushHistory] = useState<FcmPayload[]>([]);
  const [activePushToast, setActivePushToast] = useState<FcmPayload | null>(null);

  // Audio dual-tone notification chime
  const playPushNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.2); // D6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    } catch (e) {
      console.warn('Audio chime note:', e);
    }
  };

  const handleTriggerPush = (payload: FcmPayload) => {
    playPushNotificationSound();
    setActivePushToast(payload);
    setPushHistory((prev) => [payload, ...prev]);

    setTimeout(() => {
      setActivePushToast((curr) => (curr?.timestamp === payload.timestamp ? null : curr));
    }, 6000);
  };

  // Fetch news
  const loadNews = async () => {
    setIsLoading(true);
    try {
      const data = await getAggregatedNews(selectedCountry, selectedCategory);
      setArticles(data);
    } catch (e) {
      console.error('Error fetching news:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, [selectedCountry, selectedCategory]);

  const handleToggleBookmark = (article: NewsArticle) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === article.id);
      const updated = exists ? prev.filter((b) => b.id !== article.id) : [article, ...prev];
      try {
        localStorage.setItem('flutternews_bookmarks', JSON.stringify(updated));
      } catch (_) {}

      // Realtime Firebase Firestore synchronization
      if (currentUser?.uid) {
        if (exists) {
          removeBookmarkFromFirestore(currentUser.uid, article.id).catch(() => {});
        } else {
          saveBookmarkToFirestore(currentUser.uid, article).catch(() => {});
        }
      }

      return updated;
    });
  };

  const t = translations[currentLang];
  const activeCountry = COUNTRIES.find((c) => c.code === selectedCountry) || COUNTRIES[0];

  // Filtered articles
  const displayedArticles = (activeNavTab === 'bookmarks' ? bookmarks : articles).filter((art) => {
    if (selectedCountry !== 'all' && art.country !== selectedCountry && art.country !== 'all') {
      return false;
    }
    if (selectedCategory !== 'all' && art.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = art.title.toLowerCase().includes(q);
      const matchDesc = art.description.toLowerCase().includes(q);
      const matchSource = art.source.toLowerCase().includes(q);
      const matchTags = art.tags.some((tg) => tg.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchSource && !matchTags) return false;
    }
    return true;
  });

  return (
    <div 
      dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-950 text-slate-100 flex justify-center antialiased selection:bg-sky-500/30 selection:text-sky-200"
    >
      {/* Centered Mobile Container Frame - Ensures Mobile & Desktop Cross-Platform Integrity */}
      <div className={`w-full ${previewPlatform === 'desktop' ? 'max-w-4xl' : previewPlatform === 'ios' ? 'max-w-[420px]' : 'max-w-lg'} min-h-screen bg-slate-950 border-x border-slate-800/80 shadow-2xl flex flex-col relative pb-20 transition-all duration-300`}>
        
        {/* Flutter Cross-Platform Runtime Switcher Bar */}
        <div className="bg-slate-900 border-b border-slate-800/80 px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-300 shrink-0">
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-semibold">Flutter 3.24 Multiplateforme</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setPreviewPlatform('android')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors flex items-center gap-1 ${
                previewPlatform === 'android'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🤖</span>
              <span>Android M3</span>
            </button>
            <button
              onClick={() => setPreviewPlatform('ios')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors flex items-center gap-1 ${
                previewPlatform === 'ios'
                  ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🍎</span>
              <span>iOS</span>
            </button>
            <button
              onClick={() => setPreviewPlatform('desktop')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors flex items-center gap-1 ${
                previewPlatform === 'desktop'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🌐</span>
              <span>Web / Desktop</span>
            </button>
          </div>
        </div>

        {/* Dynamic Island for iOS preview */}
        {previewPlatform === 'ios' && (
          <div className="pt-2 px-6 pb-1 bg-slate-950 text-[10px] text-slate-300 font-medium flex items-center justify-between z-30 select-none border-b border-slate-900">
            <span className="font-semibold">09:41</span>
            <div className="w-24 h-3.5 bg-black rounded-full flex items-center justify-center border border-slate-800 shadow-inner">
              <div className="w-2 h-2 rounded-full bg-slate-900 mr-2" />
              <div className="w-1.5 h-1.5 rounded-full bg-sky-950" />
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* Web / Desktop WasmGC & CanvasKit Banner */}
        {previewPlatform === 'desktop' && (
          <div className="bg-sky-950/40 border-b border-sky-500/20 px-3 py-1 flex items-center justify-between text-[11px] text-sky-300">
            <div className="flex items-center gap-1.5">
              <span>⚡ WebAssembly (WasmGC) & CanvasKit Activé</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">Navigation Rail & Affichage Large</span>
            </div>
            <span className="text-[10px] bg-sky-500/20 px-1.5 py-0.2 rounded font-mono text-sky-200">
              Multi-Pane Mode
            </span>
          </div>
        )}

        {/* 1. Mobile Top App Bar (Always Respected) */}
        <MobileTopBar
          currentLang={currentLang}
          onOpenLanguageSheet={() => setIsLanguageSheetOpen(true)}
          selectedCountry={selectedCountry}
          onOpenCountrySheet={() => setIsCountrySheetOpen(true)}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onOpenFcmSimulator={() => setIsFcmModalOpen(true)}
          unreadPushCount={pushHistory.length}
          isSearchOpen={isSearchOpen}
          onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeNavTab={activeNavTab}
        />

        {/* 2. Mobile Horizontal Category Chip Bar (When on News Tab) */}
        {activeNavTab === 'news' && (
          <div className="sticky top-14 z-30 bg-slate-950/95 backdrop-blur border-b border-slate-800/80 py-2.5 px-3 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
            {NEWS_CATEGORIES.map((cat) => {
              const label = currentLang === 'en' ? cat.en : cat.fr;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as NewsCategory)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                    isSelected
                      ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat.icon} {label}
                </button>
              );
            })}
          </div>
        )}

        {/* FCM Push Toast Banner */}
        {activePushToast && (
          <div className="fixed top-16 left-4 right-4 z-50 max-w-sm mx-auto bg-slate-900 border border-sky-500/60 shadow-2xl rounded-2xl p-3.5 text-xs animate-slide-in">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs leading-tight">
                    {activePushToast.title}
                  </div>
                  <div className="text-slate-300 text-[11px] mt-1 line-clamp-2">
                    {activePushToast.body}
                  </div>
                  <div className="text-[10px] text-sky-400 font-mono mt-1">
                    FCM Topic: {activePushToast.topic}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActivePushToast(null)}
                className="text-slate-500 hover:text-slate-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 3. Mobile Body Content Views */}
        <main className="flex-1 p-3.5 space-y-3">
          {/* TAB 1: News Feed */}
          {activeNavTab === 'news' && (
            <>
              {/* Header Info Pill */}
              <div className="flex items-center justify-between text-xs px-1 text-slate-400">
                <div className="flex items-center gap-1.5 font-medium">
                  <span>{activeCountry.flag}</span>
                  <span className="text-slate-200">{activeCountry.name}</span>
                  <span>·</span>
                  <span>{displayedArticles.length} {t.newsCountSuffix}</span>
                </div>
                <button
                  onClick={loadNews}
                  disabled={isLoading}
                  className="flex items-center gap-1 text-sky-400 hover:text-sky-300 active:scale-95 transition-all text-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{t.refresh}</span>
                </button>
              </div>

              {/* Daily Audio Briefing Player */}
              <DailyAudioBriefing
                articles={displayedArticles}
                currentLang={currentLang}
                selectedCountry={selectedCountry}
              />

              {/* 7-Day Trending Topics Recharts Line Visualization */}
              <TrendingTopicsChart
                articles={articles}
                currentLang={currentLang}
              />

              {/* Feed List */}
              {displayedArticles.length === 0 ? (
                <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 text-slate-400 space-y-2">
                  <Radio className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
                  <p className="text-xs">{t.noArticlesFound}</p>
                </div>
              ) : (
                <div className={previewPlatform === 'desktop' ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'space-y-3'}>
                  {displayedArticles.map((article) => (
                    <NewsCard
                      key={article.id}
                      article={article}
                      currentLang={currentLang}
                      isBookmarked={bookmarks.some((b) => b.id === article.id)}
                      onToggleBookmark={handleToggleBookmark}
                      onSelectArticle={setSelectedArticle}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* TAB 2: OSINT Radar */}
          {activeNavTab === 'osint' && (
            <div className="space-y-4">
              <OsintRadar currentLang={currentLang} />
            </div>
          )}

          {/* TAB 3: GitHub Trending */}
          {activeNavTab === 'github' && (
            <div className="space-y-4">
              <GitHubTrendingFeed articles={articles} currentLang={currentLang} />
            </div>
          )}

          {/* TAB 4: Flutter Export & CI/CD */}
          {activeNavTab === 'code' && (
            <div className="space-y-4">
              <FlutterExportHub currentLang={currentLang} />
            </div>
          )}

          {/* TAB: Free APIs & Resources Directory */}
          {activeNavTab === 'apis' && (
            <div className="space-y-4">
              <FreeApisHub currentLang={currentLang} />
            </div>
          )}

          {/* TAB 5: Favoris */}
          {activeNavTab === 'bookmarks' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs px-1 text-slate-400">
                <span className="font-semibold text-slate-200">
                  {t.myBookmarks} ({bookmarks.length})
                </span>
              </div>
              {bookmarks.length === 0 ? (
                <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 text-slate-400 text-xs px-4">
                  {t.noBookmarksYet}
                </div>
              ) : (
                <div className={previewPlatform === 'desktop' ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'space-y-3'}>
                  {bookmarks.map((article) => (
                    <NewsCard
                      key={article.id}
                      article={article}
                      currentLang={currentLang}
                      isBookmarked={true}
                      onToggleBookmark={handleToggleBookmark}
                      onSelectArticle={setSelectedArticle}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* 4. Mobile Bottom Navigation Bar (Persistent Thumb Anchor) */}
        <MobileBottomNav
          activeTab={activeNavTab}
          onSelectTab={setActiveNavTab}
          bookmarksCount={bookmarks.length}
          currentLang={currentLang}
        />

        {/* iOS Home Indicator Bar */}
        {previewPlatform === 'ios' && (
          <div className="fixed bottom-1 left-0 right-0 flex justify-center pointer-events-none z-50">
            <div className="w-28 h-1 bg-slate-500/80 rounded-full" />
          </div>
        )}

        {/* 5. Mobile Drawer Menu (Flutter Material 3 Drawer) */}
        <MobileDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          currentLang={currentLang}
          onLanguageChange={handleLanguageChange}
          selectedCountry={selectedCountry}
          onCountryChange={handleCountryChange}
          activeNavTab={activeNavTab}
          onSelectNavTab={setActiveNavTab}
          onOpenFcmSimulator={() => setIsFcmModalOpen(true)}
          bookmarksCount={bookmarks.length}
          currentUser={currentUser}
          onLogin={loginWithGoogle}
          onLogout={logoutUser}
        />

        {/* 6. Mobile Bottom Sheet for Country Filter */}
        <MobileBottomSheet
          isOpen={isCountrySheetOpen}
          onClose={() => setIsCountrySheetOpen(false)}
          title={t.filterByCountry}
        >
          <div className="space-y-1">
            {COUNTRIES.map((c) => {
              const isSelected = selectedCountry === c.code;
              return (
                <button
                  key={c.code}
                  onClick={() => {
                    handleCountryChange(c.code);
                    setIsCountrySheetOpen(false);
                  }}
                  className={`w-full min-h-[50px] px-4 rounded-xl flex items-center justify-between text-sm transition-colors ${
                    isSelected
                      ? 'bg-sky-500/15 text-sky-300 font-bold border border-sky-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{c.flag}</span>
                    <div className="text-left">
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {c.techHubs.slice(0, 2).join(' · ')}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                </button>
              );
            })}
          </div>
        </MobileBottomSheet>

        {/* 7. Mobile Bottom Sheet for Language Selection */}
        <MobileBottomSheet
          isOpen={isLanguageSheetOpen}
          onClose={() => setIsLanguageSheetOpen(false)}
          title={t.selectLanguageTitle}
        >
          <div className="space-y-1">
            {[
              { code: 'fr' as const, label: 'Français', flag: '🇫🇷' },
              { code: 'en' as const, label: 'English', flag: '🇺🇸' },
              { code: 'es' as const, label: 'Español', flag: '🇪🇸' },
              { code: 'de' as const, label: 'Deutsch', flag: '🇩🇪' },
              { code: 'ar' as const, label: 'العربية', flag: '🇦🇪' },
              { code: 'ja' as const, label: '日本語', flag: '🇯🇵' },
            ].map((lang) => {
              const isSelected = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    handleLanguageChange(lang.code);
                    setIsLanguageSheetOpen(false);
                  }}
                  className={`w-full min-h-[48px] px-4 rounded-xl flex items-center justify-between text-sm transition-colors ${
                    isSelected
                      ? 'bg-sky-500/15 text-sky-300 font-bold border border-sky-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                </button>
              );
            })}
          </div>
        </MobileBottomSheet>

        {/* 8. Article Detail Modal */}
        <ArticleDetailModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          currentLang={currentLang}
          isBookmarked={bookmarks.some((b) => b.id === selectedArticle?.id)}
          onToggleBookmark={handleToggleBookmark}
        />

        {/* 9. FCM Simulator Modal */}
        <FcmSimulatorModal
          isOpen={isFcmModalOpen}
          onClose={() => setIsFcmModalOpen(false)}
          currentLang={currentLang}
          onTriggerPushNotification={handleTriggerPush}
          pushHistory={pushHistory}
        />
      </div>
    </div>
  );
}
