import React from 'react';
import { Star, GitFork, ExternalLink, Code2, Tag } from 'lucide-react';
import { Language, NewsArticle } from '../types';
import { translations } from '../services/translations';
import { getPersistentTranslation } from '../services/translator';

interface GitHubTrendingFeedProps {
  articles: NewsArticle[];
  currentLang: Language;
}

export const GitHubTrendingFeed: React.FC<GitHubTrendingFeedProps> = ({ articles, currentLang }) => {
  const t = translations[currentLang];
  const ghItems = articles.filter((a) => a.sourceType === 'github' || a.category === 'opensource');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Code2 className="w-5 h-5 text-sky-400" />
            <span>{t.githubTrending}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.githubBannerSubtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ghItems.map((item) => {
          const trans = getPersistentTranslation(item, currentLang);
          const displayTitle = (currentLang === 'ar') ? trans.title : item.title;
          const displayDesc = (currentLang === 'ar') ? trans.description : item.description;

          return (
            <div
              key={item.id}
              className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-mono text-slate-300 font-medium truncate max-w-[200px]">
                    {item.author || 'OpenSource'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(item.publishedAt).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : currentLang === 'fr' ? 'fr-FR' : 'en-US')}
                  </span>
                </div>

                <h4 
                  dir={currentLang === 'ar' ? 'rtl' : 'ltr'} 
                  className="text-sm font-semibold text-slate-100 hover:text-sky-300 transition-colors mb-2 line-clamp-2"
                >
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {displayTitle}
                  </a>
                </h4>

                <p 
                  dir={currentLang === 'ar' ? 'rtl' : 'ltr'} 
                  className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-3"
                >
                  {displayDesc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-slate-300 font-mono">
                  {item.upvotes !== undefined && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                      <span>{item.upvotes.toLocaleString()}</span>
                    </span>
                  )}
                  {item.commentsCount !== undefined && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <GitFork className="w-3.5 h-3.5" />
                      <span>{item.commentsCount}</span>
                    </span>
                  )}
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 flex items-center gap-1 text-xs font-medium"
                >
                  <span>{t.repository}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
