import React, { useState } from 'react';
import { Search, RefreshCw, Bookmark, Sparkles, Filter, ShieldAlert, Globe, Cpu, Radio } from 'lucide-react';
import { CountryCode, Language, NewsArticle, NewsCategory } from '../types';
import { translations } from '../services/translations';
import { COUNTRIES } from '../services/countries';
import { NewsCard } from './NewsCard';

interface NewsFeedProps {
  articles: NewsArticle[];
  currentLang: Language;
  selectedCountry: CountryCode;
  onCountryChange: (country: CountryCode) => void;
  selectedCategory: NewsCategory;
  onCategoryChange: (category: NewsCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  bookmarks: NewsArticle[];
  onToggleBookmark: (article: NewsArticle) => void;
  onSelectArticle: (article: NewsArticle) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({
  articles,
  currentLang,
  selectedCountry,
  onCountryChange,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  bookmarks,
  onToggleBookmark,
  onSelectArticle,
  onRefresh,
  isLoading,
}) => {
  const t = translations[currentLang];
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  const activeCountry = COUNTRIES.find((c) => c.code === selectedCountry) || COUNTRIES[0];

  // Filtering
  const filtered = (showBookmarksOnly ? bookmarks : articles).filter((art) => {
    // Country
    if (selectedCountry !== 'all' && art.country !== selectedCountry && art.country !== 'all') {
      return false;
    }
    // Category
    if (selectedCategory !== 'all' && art.category !== selectedCategory) {
      return false;
    }
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = art.title.toLowerCase().includes(q);
      const matchDesc = art.description.toLowerCase().includes(q);
      const matchSource = art.source.toLowerCase().includes(q);
      const matchTags = art.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchSource && !matchTags) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Editorial Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-[21/8] max-h-64 shadow-2xl">
        <img
          src="/src/assets/images/tech_news_radar_1790977909954.jpg"
          alt="Tech News Radar Global"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-6 sm:p-8 flex flex-col justify-end">
          <div className="flex items-center gap-2 text-xs text-sky-400 font-mono mb-1">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span>FLUX TECH MONDIAL EN TEMPS RÉEL · SOURCES VÉRIFIÉES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight text-balance">
            {t.dailyTechNews} — {activeCountry.name} {activeCountry.flag}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1.5 leading-relaxed">
            Veille technologique quotidienne agrégée via APIs ouvertes (HackerNews, GitHub REST API, Dev.to) et capteurs OSINT.
          </p>
        </div>
      </div>

      {/* Control Bar: Search & Interactive Filter Tabs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Bookmarks & Refresh Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                showBookmarksOnly
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-slate-950 border-slate-700/80 text-slate-300 hover:text-white'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${showBookmarksOnly ? 'fill-sky-400' : ''}`} />
              <span>{t.myBookmarks} ({bookmarks.length})</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={t.refresh}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Category Filter Tabs (Interactive Segmented Buttons) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 text-xs">
          {[
            { id: 'all', label: t.allCategories },
            { id: 'ai', label: '🤖 IA & Modèles' },
            { id: 'cyber', label: '🛡️ Cybersécurité & OSINT' },
            { id: 'opensource', label: '⭐ Open-Source & GitHub' },
            { id: 'mobile', label: '📱 Flutter & Android' },
            { id: 'cloud', label: '☁️ Cloud & DevOps' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id as NewsCategory)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Articles List */}
      <div>
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 text-slate-400 space-y-2">
            <Radio className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
            <p className="text-sm">{t.noArticlesFound}</p>
            <button
              onClick={() => {
                onSearchChange('');
                onCategoryChange('all');
                setShowBookmarksOnly(false);
              }}
              className="text-xs text-sky-400 hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                currentLang={currentLang}
                isBookmarked={bookmarks.some((b) => b.id === article.id)}
                onToggleBookmark={onToggleBookmark}
                onSelectArticle={onSelectArticle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
