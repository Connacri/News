import React, { useState } from 'react';
import { Newspaper, ShieldAlert, Code2, Bell, RefreshCw, Bookmark, Sparkles, ArrowUpRight } from 'lucide-react';
import { CountryCode, Language, NewsArticle } from '../types';
import { COUNTRIES } from '../services/countries';
import { translations } from '../services/translations';
import { NewsCard } from './NewsCard';
import { OsintRadar } from './OsintRadar';
import { GitHubTrendingFeed } from './GitHubTrendingFeed';

interface MobileDeviceFrameProps {
  articles: NewsArticle[];
  currentLang: Language;
  selectedCountry: CountryCode;
  onCountryChange: (country: CountryCode) => void;
  bookmarks: NewsArticle[];
  onToggleBookmark: (article: NewsArticle) => void;
  onSelectArticle: (article: NewsArticle) => void;
  onOpenFcmSimulator: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({
  articles,
  currentLang,
  selectedCountry,
  onCountryChange,
  bookmarks,
  onToggleBookmark,
  onSelectArticle,
  onOpenFcmSimulator,
  onRefresh,
  isLoading,
}) => {
  const t = translations[currentLang];
  const [activeTab, setActiveTab] = useState<'news' | 'osint' | 'github' | 'bookmarks'>('news');

  const displayedArticles = activeTab === 'bookmarks' ? bookmarks : articles;

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4">
      {/* Smartphone Chassis Frame */}
      <div className="relative w-full max-w-[390px] h-[780px] bg-slate-950 rounded-[44px] border-[10px] border-slate-800 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
        {/* Dynamic Island / Camera Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-50 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-950/80 mr-3" />
          <div className="w-1.5 h-1.5 rounded-full bg-sky-950/80" />
        </div>

        {/* Flutter Status Bar */}
        <div className="pt-3 px-6 pb-1 bg-slate-900/90 text-[11px] text-slate-300 font-mono flex items-center justify-between z-40 select-none">
          <span>09:41</span>
          <div className="flex items-center gap-1.5">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* Flutter Material 3 AppBar */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between z-40">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-white">DZ News</span>
              <span className="text-[10px] text-sky-400 font-mono">v1.0.0</span>
            </div>
            <div className="text-[10px] text-slate-400">
              {COUNTRIES.find(c => c.code === selectedCountry)?.name || 'Monde'}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenFcmSimulator}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              title="FCM Push"
            >
              <Bell className="w-4 h-4 text-sky-400" />
            </button>
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              title={t.refresh}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Horizontal Country Carousel for Flutter Mobile Feel */}
        {activeTab === 'news' && (
          <div className="bg-slate-900/60 border-b border-slate-800/80 py-2 px-3 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0 z-30">
            {COUNTRIES.map((c) => {
              const isSelected = selectedCountry === c.code;
              return (
                <button
                  key={c.code}
                  onClick={() => onCountryChange(c.code)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                    isSelected
                      ? 'bg-sky-500 text-slate-950 font-bold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{c.flag}</span>
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Mobile Screen Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-950">
          {activeTab === 'news' && (
            <>
              {displayedArticles.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  {t.noArticlesFound}
                </div>
              ) : (
                displayedArticles.map((article) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    currentLang={currentLang}
                    isBookmarked={bookmarks.some((b) => b.id === article.id)}
                    onToggleBookmark={onToggleBookmark}
                    onSelectArticle={onSelectArticle}
                  />
                ))
              )}
            </>
          )}

          {activeTab === 'osint' && (
            <div className="text-xs">
              <OsintRadar currentLang={currentLang} />
            </div>
          )}

          {activeTab === 'github' && (
            <div className="text-xs">
              <GitHubTrendingFeed articles={articles} currentLang={currentLang} />
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <>
              {bookmarks.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Aucun article sauvegardé pour le moment.
                </div>
              ) : (
                bookmarks.map((article) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    currentLang={currentLang}
                    isBookmarked={true}
                    onToggleBookmark={onToggleBookmark}
                    onSelectArticle={onSelectArticle}
                  />
                ))
              )}
            </>
          )}
        </div>

        {/* Flutter Material 3 Bottom Navigation Bar */}
        <div className="bg-slate-900 border-t border-slate-800 px-2 py-2 flex items-center justify-around z-40">
          <button
            onClick={() => setActiveTab('news')}
            className={`flex flex-col items-center gap-0.5 text-[10px] ${
              activeTab === 'news' ? 'text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>News</span>
          </button>

          <button
            onClick={() => setActiveTab('osint')}
            className={`flex flex-col items-center gap-0.5 text-[10px] ${
              activeTab === 'osint' ? 'text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>OSINT</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`flex flex-col items-center gap-0.5 text-[10px] ${
              activeTab === 'github' ? 'text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>GitHub</span>
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex flex-col items-center gap-0.5 text-[10px] ${
              activeTab === 'bookmarks' ? 'text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Favoris ({bookmarks.length})</span>
          </button>
        </div>

        {/* Android / iOS Home Indicator bar */}
        <div className="pb-1.5 pt-0.5 bg-slate-900 flex justify-center">
          <div className="w-32 h-1 bg-slate-700 rounded-full" />
        </div>
      </div>
    </div>
  );
};
