import React, { useState, useEffect, useMemo } from 'react';
import { ExternalLink, Bookmark, Volume2, VolumeX, Languages, ShieldAlert, ArrowUpRight, Clock } from 'lucide-react';
import { Language, NewsArticle } from '../types';
import { translations } from '../services/translations';
import { COUNTRIES } from '../services/countries';
import { getPersistentTranslation, getTranslationPreference, setTranslationPreference } from '../services/translator';
import { speakText, stopSpeaking } from '../services/speechService';

interface NewsCardProps {
  article: NewsArticle;
  currentLang: Language;
  isBookmarked: boolean;
  onToggleBookmark: (article: NewsArticle) => void;
  onSelectArticle: (article: NewsArticle) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  currentLang,
  isBookmarked,
  onToggleBookmark,
  onSelectArticle,
}) => {
  const t = translations[currentLang];
  const [isSpeaking, setIsSpeaking] = useState(false);
  // Persistent translation state from localStorage
  const [showTranslated, setShowTranslated] = useState(() => getTranslationPreference());
  const [, setTransVersion] = useState(0);

  useEffect(() => {
    setShowTranslated(getTranslationPreference());
  }, [currentLang]);

  // Listen for dynamic translation updates from AI service
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.articleId === article.id && detail.lang === currentLang) {
        setTransVersion((v) => v + 1);
      }
    };
    window.addEventListener('translation_updated', handler);
    return () => window.removeEventListener('translation_updated', handler);
  }, [article.id, currentLang]);

  const countryInfo = COUNTRIES.find((c) => c.code === article.country);
  const countryFlag = countryInfo ? countryInfo.flag : '🌐';

  // Calculate estimated reading time based on article content
  const readingTimeText = useMemo(() => {
    const contentToAnalyze = article.fullContent || `${article.title} ${article.description}`;
    const wordCount = contentToAnalyze.trim().split(/\s+/).filter(Boolean).length;
    // Standard reading speed (~180-200 wpm)
    const minutes = Math.max(1, Math.round(wordCount / 180));

    switch (currentLang) {
      case 'fr':
        return `${minutes} min de lecture`;
      case 'ar':
        return `${minutes} د قراءة`;
      case 'es':
        return `${minutes} min de lectura`;
      case 'de':
        return `${minutes} Min. Lesezeit`;
      case 'ja':
        return `読了 ${minutes}分`;
      case 'en':
      default:
        return `${minutes} min read`;
    }
  }, [article.fullContent, article.title, article.description, currentLang]);

  // Get persistent translation
  const persistentTrans = getPersistentTranslation(article, currentLang);
  // Default to translated version if Arabic or if user has translate enabled
  const displayTitle = (currentLang === 'ar' || showTranslated) ? persistentTrans.title : article.title;
  const displayDesc = (currentLang === 'ar' || showTranslated) ? persistentTrans.description : article.description;

  const handleSpeech = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      // Guarantee the spoken text and voice match currentLang
      const textToSpeak = `${persistentTrans.title || displayTitle}. ${persistentTrans.description || displayDesc}`;
      const success = speakText(
        textToSpeak,
        currentLang,
        1.0,
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
      setIsSpeaking(success);
    }
  };

  const handleToggleTranslate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !showTranslated;
    setShowTranslated(nextState);
    setTranslationPreference(nextState); // Persist across the whole app & future visits
  };

  const formattedDate = new Date(article.publishedAt).toLocaleDateString(currentLang === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <article
      onClick={() => onSelectArticle(article)}
      className="group relative bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Anti-Slop: Clean, unboxed text metadata with dot separators */}
        <div className="flex items-center flex-wrap gap-2 text-xs text-slate-400 mb-3">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <span>{countryFlag}</span>
            <span>{article.source}</span>
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{formattedDate}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="flex items-center gap-1 text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{readingTimeText}</span>
          </span>
          {article.upvotes !== undefined && article.upvotes > 0 && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300 font-mono tabular-nums">▲ {article.upvotes}</span>
            </>
          )}
          {article.commentsCount !== undefined && article.commentsCount > 0 && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400 font-mono tabular-nums">{article.commentsCount} coms</span>
            </>
          )}
          {article.cveId && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-rose-400 font-mono font-medium flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 inline text-rose-400" />
                {article.cveId}
              </span>
            </>
          )}
          {article.patentNumber && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-amber-400 font-mono font-semibold flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                <span>📜</span>
                <span>{article.patentNumber}</span>
              </span>
            </>
          )}
          {article.publicationType === 'blueprint' && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-emerald-400 font-mono font-semibold flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                <span>📐</span>
                <span>Blueprint</span>
              </span>
            </>
          )}
          {article.assignee && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300 font-medium truncate max-w-[140px]">
                {article.assignee}
              </span>
            </>
          )}
        </div>

        {/* Primary Title with text balance */}
        <h3 
          dir={currentLang === 'ar' ? 'rtl' : 'ltr'} 
          className={`text-base sm:text-lg font-semibold text-slate-100 group-hover:text-sky-300 transition-colors mb-2 leading-snug line-clamp-2 ${
            currentLang === 'ar' ? 'text-right font-medium' : 'text-left'
          }`}
        >
          {displayTitle}
        </h3>

        {/* Description snippet */}
        <p 
          dir={currentLang === 'ar' ? 'rtl' : 'ltr'} 
          className={`text-sm text-slate-400 line-clamp-2 leading-relaxed mb-4 ${
            currentLang === 'ar' ? 'text-right' : 'text-left'
          }`}
        >
          {displayDesc}
        </p>
      </div>

      {/* Footer controls: clean typography and actionable icons */}
      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2 truncate">
          {article.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="text-slate-400 hover:text-slate-300 text-xs">
              #{tag}
            </span>
          ))}
        </div>

        {/* Action button cluster */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Free instant translation toggle */}
          {article.translatedTitle && (
            <button
              onClick={handleToggleTranslate}
              title={showTranslated ? t.showOriginal : t.translateHeadline}
              className={`min-w-[40px] min-h-[40px] rounded-lg border flex items-center justify-center transition-colors ${
                showTranslated
                  ? 'border-sky-500/40 text-sky-400 bg-sky-500/10'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Languages className="w-4 h-4" />
            </button>
          )}

          {/* Voice text-to-speech aloud */}
          <button
            onClick={handleSpeech}
            title={isSpeaking ? t.stopAloud : t.readAloud}
            className={`min-w-[40px] min-h-[40px] rounded-lg border flex items-center justify-center transition-colors ${
              isSpeaking
                ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Bookmark / Favorite */}
          <button
            onClick={() => onToggleBookmark(article)}
            title={isBookmarked ? t.bookmarked : t.bookmark}
            className={`min-w-[40px] min-h-[40px] rounded-lg border flex items-center justify-center transition-colors ${
              isBookmarked
                ? 'border-sky-500/40 text-sky-400 bg-sky-500/10'
                : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-sky-400' : ''}`} />
          </button>

          {/* External Link / Google Patents */}
          <a
            href={article.googlePatentsUrl || article.url}
            target="_blank"
            rel="noopener noreferrer"
            title={article.googlePatentsUrl ? t.openInGooglePatents : t.openInBrowser}
            className="min-w-[40px] min-h-[40px] rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </article>
  );
};
