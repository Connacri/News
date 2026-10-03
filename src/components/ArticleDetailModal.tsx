import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, 
  ExternalLink, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  Languages, 
  ShieldAlert, 
  Share2, 
  Check, 
  Copy, 
  Terminal, 
  CheckCircle2, 
  Sparkles,
  BookOpen,
  Clock
} from 'lucide-react';
import { Language, NewsArticle } from '../types';
import { translations } from '../services/translations';
import { COUNTRIES } from '../services/countries';
import { getPersistentTranslation, getTranslationPreference, setTranslationPreference } from '../services/translator';
import { speakText, stopSpeaking } from '../services/speechService';

interface ArticleDetailModalProps {
  article: NewsArticle | null;
  onClose: () => void;
  currentLang: Language;
  isBookmarked: boolean;
  onToggleBookmark: (article: NewsArticle) => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({
  article,
  onClose,
  currentLang,
  isBookmarked,
  onToggleBookmark,
}) => {
  const t = translations[currentLang];
  // Persistent translation state
  const [showTranslated, setShowTranslated] = useState(() => getTranslationPreference());
  const [hasCopiedShare, setHasCopiedShare] = useState(false);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [, setTransVersion] = useState(0);

  // Listen for background AI translation updates
  useEffect(() => {
    if (!article) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.articleId === article.id && detail.lang === currentLang) {
        setTransVersion((v) => v + 1);
      }
    };
    window.addEventListener('translation_updated', handler);
    return () => window.removeEventListener('translation_updated', handler);
  }, [article?.id, currentLang]);

  if (!article) return null;

  const countryInfo = COUNTRIES.find((c) => c.code === article.country);
  const countryFlag = countryInfo ? countryInfo.flag : '🌐';
  const countryName = countryInfo ? countryInfo.name : 'Monde';

  const persistentTrans = getPersistentTranslation(article, currentLang);
  const title = (currentLang === 'ar' || showTranslated) ? persistentTrans.title : article.title;
  const description = (currentLang === 'ar' || showTranslated) ? persistentTrans.description : article.description;
  const content = (currentLang === 'ar' || showTranslated) 
    ? (persistentTrans.content || article.translatedFullContent || article.fullContent || article.description) 
    : (article.fullContent || article.description);

  const readingTimeText = useMemo(() => {
    const contentToAnalyze = content || `${title} ${description}`;
    const wordCount = contentToAnalyze.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(wordCount / 180));
    return `${minutes} ${t.minRead}`;
  }, [content, title, description, t.minRead]);

  const handleToggleTranslate = () => {
    const nextState = !showTranslated;
    setShowTranslated(nextState);
    setTranslationPreference(nextState);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: article.url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(article.url);
      setHasCopiedShare(true);
      setTimeout(() => setHasCopiedShare(false), 2000);
    }
  };

  const handleCopyCode = () => {
    if (!article.technicalCode) return;
    navigator.clipboard.writeText(article.technicalCode);
    setHasCopiedCode(true);
    setTimeout(() => setHasCopiedCode(false), 2000);
  };

  const handleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      // Guarantee the spoken text and voice match currentLang
      const textToRead = `${title}. ${content}`;
      const success = speakText(
        textToRead,
        currentLang,
        1.0,
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
      setIsSpeaking(success);
    }
  };

  // Split content paragraphs
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
      {/* Full-Screen Mobile Reader View on Mobile, max-w-lg container on Desktop */}
      <div className="w-full max-w-lg h-full max-h-screen bg-slate-950 flex flex-col shadow-2xl relative overflow-hidden border-x border-slate-800">
        
        {/* Mobile Top App Bar (56px) with Back Button */}
        <div className="h-14 px-3 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between shrink-0 z-20">
          <button
            onClick={() => {
              if (isSpeaking) window.speechSynthesis.cancel();
              onClose();
            }}
            aria-label="Retour"
            className="min-w-[44px] min-h-[44px] -ml-2 rounded-full flex items-center justify-center text-slate-300 hover:text-white active:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 truncate max-w-[200px]">
            <span>{countryFlag}</span>
            <span className="truncate">{article.source}</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Instant translation toggle */}
            {article.translatedTitle && (
              <button
                onClick={handleToggleTranslate}
                title={showTranslated ? t.showOriginal : t.translateHeadline}
                className={`min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center transition-colors ${
                  showTranslated ? 'text-sky-400 bg-sky-500/10' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Languages className="w-4 h-4" />
              </button>
            )}

            {/* Read aloud */}
            <button
              onClick={handleSpeech}
              title={isSpeaking ? t.stopAloud : t.readAloud}
              className={`min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center transition-colors ${
                isSpeaking ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Bookmark */}
            <button
              onClick={() => onToggleBookmark(article)}
              title={isBookmarked ? t.bookmarked : t.bookmark}
              className="min-w-[40px] min-h-[40px] -mr-1 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-sky-400 text-sky-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Scrollable Article Body */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 text-slate-200 pb-28">
          {/* Metadata Row */}
          <div className="flex items-center flex-wrap gap-2 text-xs text-slate-400">
            <span className="font-semibold text-sky-400">{countryName}</span>
            <span aria-hidden="true">·</span>
            <span>{new Date(article.publishedAt).toLocaleDateString(currentLang === 'fr' ? 'fr-FR' : 'en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>{readingTimeText}</span>
            </span>
            {article.author && (
              <>
                <span aria-hidden="true">·</span>
                <span>{article.author}</span>
              </>
            )}
            {article.upvotes !== undefined && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-slate-300">▲ {article.upvotes}</span>
              </>
            )}
          </div>

          {/* Full Article Headline */}
          <h1 
            dir={currentLang === 'ar' ? 'rtl' : 'ltr'} 
            className={`text-xl sm:text-2xl font-extrabold text-white leading-snug tracking-tight ${
              currentLang === 'ar' ? 'text-right' : 'text-left'
            }`}
          >
            {title}
          </h1>

          {/* CVE Banner if present */}
          {article.cveId && (
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs text-rose-300 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-rose-200">{article.cveId} · Sévérité {article.osintSeverity?.toUpperCase() || 'CRITIQUE'}</div>
                <div className="text-[11px] text-rose-300/80 mt-0.5">Alerte de vulnérabilité répertoriée par les observatoires OSINT et CERT.</div>
              </div>
            </div>
          )}

          {/* Executive Summary Intro */}
          <div 
            dir={currentLang === 'ar' ? 'rtl' : 'ltr'} 
            className={`p-4 rounded-xl bg-slate-900/80 ${
              currentLang === 'ar' ? 'border-r-4 border-l-0 text-right' : 'border-l-4 text-left'
            } border-sky-500 text-sm leading-relaxed text-slate-200`}
          >
            {description}
          </div>

          {/* Full Article Text Body Paragraphs */}
          <div 
            dir={currentLang === 'ar' ? 'rtl' : 'ltr'} 
            className={`space-y-4 text-sm leading-relaxed text-slate-300 ${
              currentLang === 'ar' ? 'text-right' : 'text-left'
            }`}
          >
            <div className={`text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5 pt-2 ${
              currentLang === 'ar' ? 'justify-end' : 'justify-start'
            }`}>
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span>{currentLang === 'ar' ? 'النص الكامل للمقال' : "Contenu Intégral de l'Article"}</span>
            </div>

            {paragraphs.map((p, idx) => (
              <p key={idx} className="leading-relaxed whitespace-pre-line text-[14px]">
                {p}
              </p>
            ))}
          </div>

          {/* Key Takeaways Section */}
          {article.keyTakeaways && article.keyTakeaways.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="text-xs uppercase font-bold tracking-wider text-sky-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Points Clés & Enjeux Techniques</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {article.keyTakeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-sky-400 shrink-0 font-bold">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Technical Code / Command Box if available */}
          {article.technicalCode && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Commandes & Implémentation</span>
                </span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300"
                >
                  {hasCopiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{hasCopiedCode ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>
              <pre className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed select-text">
                <code>{article.technicalCode}</code>
              </pre>
            </div>
          )}

          {/* Tags */}
          <div className="pt-2 flex items-center gap-1.5 flex-wrap">
            {article.tags.map((tag, idx) => (
              <span key={idx} className="text-xs font-mono text-sky-400/80">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Fixed Mobile Bottom Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-16 px-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-between gap-3 z-30">
          <button
            onClick={handleShare}
            className="min-h-[44px] px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-2 text-xs font-medium border border-slate-700 active:scale-95 transition-all"
          >
            {hasCopiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span>{hasCopiedShare ? 'Lien copié' : t.share}</span>
          </button>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-h-[44px] px-4 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-[0.98] text-slate-950 font-bold flex items-center justify-center gap-2 text-xs shadow-lg shadow-sky-500/20 transition-all"
          >
            <span>{t.openInBrowser}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
};
