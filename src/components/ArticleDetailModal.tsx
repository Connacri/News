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
  Clock,
  Scroll,
  Layers,
  FileText,
  UserCheck
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
  const [hasCopiedBlueprint, setHasCopiedBlueprint] = useState(false);
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

  const displayedTakeaways = (currentLang === 'ar' || showTranslated) && persistentTrans.keyTakeaways
    ? persistentTrans.keyTakeaways
    : (article.keyTakeaways || []);

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

  const copyLinkToClipboard = async (link: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = link;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setHasCopiedShare(true);
      setTimeout(() => setHasCopiedShare(false), 2500);
    } catch (err) {
      console.error('Failed to copy link to clipboard:', err);
    }
  };

  const handleShare = async () => {
    const shareUrl = article.googlePatentsUrl || article.url;
    const shareText = description ? `${title}\n\n${description}` : title;

    // Use Web Share API if supported
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err: unknown) {
        // Fallback to clipboard if share failed for any reason other than user cancelling
        if ((err as Error)?.name !== 'AbortError') {
          await copyLinkToClipboard(shareUrl);
        }
      }
    } else {
      // Fallback if Web Share API is unsupported
      await copyLinkToClipboard(shareUrl);
    }
  };

  const handleCopyCode = () => {
    if (!article.technicalCode) return;
    navigator.clipboard.writeText(article.technicalCode);
    setHasCopiedCode(true);
    setTimeout(() => setHasCopiedCode(false), 2000);
  };

  const handleCopyBlueprint = () => {
    if (!article.blueprintArchitecture) return;
    navigator.clipboard.writeText(article.blueprintArchitecture);
    setHasCopiedBlueprint(true);
    setTimeout(() => setHasCopiedBlueprint(false), 2000);
  };

  const handleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
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

  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg h-full max-h-screen bg-slate-950 flex flex-col shadow-2xl relative overflow-hidden border-x border-slate-800">
        
        {/* Top App Bar (56px) */}
        <div className="h-14 px-3 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between shrink-0 z-20">
          <button
            onClick={() => {
              if (isSpeaking) window.speechSynthesis.cancel();
              onClose();
            }}
            aria-label={t.back}
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
            <button
              onClick={handleToggleTranslate}
              title={showTranslated ? t.showOriginal : t.translateHeadline}
              className={`min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center transition-colors ${
                showTranslated ? 'text-sky-400 bg-sky-500/10' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Languages className="w-4 h-4" />
            </button>

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

            {/* Share via Web Share API or Clipboard */}
            <button
              onClick={handleShare}
              title={hasCopiedShare ? t.linkCopied : t.share}
              aria-label={t.share}
              className={`min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center transition-colors ${
                hasCopiedShare ? 'text-emerald-400 bg-emerald-500/15' : 'text-slate-400 hover:text-white'
              }`}
            >
              {hasCopiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
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

        {/* Floating Copied to Clipboard Notification Toast */}
        {hasCopiedShare && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-slate-900 border border-emerald-500/40 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-2xl z-40 animate-fade-in pointer-events-none">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{t.linkCopied}</span>
          </div>
        )}

        {/* Scrollable Article / Patent Body */}
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
          </div>

          {/* Full Headline */}
          <h1 
            dir={currentLang === 'ar' ? 'rtl' : 'ltr'} 
            className={`text-xl sm:text-2xl font-extrabold text-white leading-snug tracking-tight ${
              currentLang === 'ar' ? 'text-right' : 'text-left'
            }`}
          >
            {title}
          </h1>

          {/* 📜 Dedicated Google Patents Card */}
          {article.patentNumber && (
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/40 text-xs text-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <Scroll className="w-4 h-4 text-amber-400" />
                  <span>{t.patentDetails} — {article.patentNumber}</span>
                </div>
                {article.googlePatentsUrl && (
                  <a
                    href={article.googlePatentsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-semibold transition-colors"
                  >
                    <span>Google Patents</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-amber-500/20">
                {article.assignee && (
                  <div>
                    <span className="text-amber-400/80 font-medium">{t.assigneeLabel} : </span>
                    <span className="text-white font-semibold">{article.assignee}</span>
                  </div>
                )}
                {article.filingDate && (
                  <div>
                    <span className="text-amber-400/80 font-medium">{t.filingDateLabel} : </span>
                    <span className="text-white font-mono">{article.filingDate}</span>
                  </div>
                )}
                {article.inventors && article.inventors.length > 0 && (
                  <div className="sm:col-span-2">
                    <span className="text-amber-400/80 font-medium">{t.inventorsLabel} : </span>
                    <span className="text-slate-300">{article.inventors.join(', ')}</span>
                  </div>
                )}
              </div>

              {article.claimsSummary && article.claimsSummary.length > 0 && (
                <div className="pt-2 border-t border-amber-500/20">
                  <div className="font-semibold text-amber-300 mb-1.5">{t.claimsLabel} :</div>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {article.claimsSummary.map((claim, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold shrink-0">§</span>
                        <span>{claim}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* CVE Banner if present */}
          {article.cveId && (
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs text-rose-300 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-rose-200">{article.cveId} · {t.severity} {article.osintSeverity?.toUpperCase() || t.critical}</div>
                <div className="text-[11px] text-rose-300/80 mt-0.5">{t.cveAlertBadge}</div>
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

          {/* 📐 Blueprint Architecture Visual Schema if present */}
          {article.blueprintArchitecture && (
            <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs text-emerald-400">
                <span className="font-bold flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>{t.blueprintLabel}</span>
                </span>
                <button
                  onClick={handleCopyBlueprint}
                  className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  {hasCopiedBlueprint ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{hasCopiedBlueprint ? t.copiedSuccess : t.copyCode}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] text-emerald-300 overflow-x-auto leading-relaxed select-text">
                <code>{article.blueprintArchitecture}</code>
              </pre>
            </div>
          )}

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
              <span>{t.fullArticleContent}</span>
            </div>

            {paragraphs.map((p, idx) => (
              <p key={idx} className="leading-relaxed whitespace-pre-line text-[14px]">
                {p}
              </p>
            ))}
          </div>

          {/* Key Takeaways Section */}
          {displayedTakeaways && displayedTakeaways.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="text-xs uppercase font-bold tracking-wider text-sky-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                <span>{t.keyTakeaways}</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {displayedTakeaways.map((point, idx) => (
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
                  <span>{t.commandsAndImpl}</span>
                </span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300"
                >
                  {hasCopiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{hasCopiedCode ? t.copiedSuccess : t.copyCode}</span>
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
            aria-label={t.share}
            className={`min-h-[44px] px-4 rounded-xl flex items-center gap-2 text-xs font-medium border transition-all active:scale-95 shadow-sm shrink-0 ${
              hasCopiedShare
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            {hasCopiedShare ? (
              <>
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t.linkCopied}</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{t.share}</span>
              </>
            )}
          </button>

          {article.googlePatentsUrl ? (
            <a
              href={article.googlePatentsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-h-[44px] px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-bold flex items-center justify-center gap-2 text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              <span>{t.openInGooglePatents}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-h-[44px] px-4 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-[0.98] text-slate-950 font-bold flex items-center justify-center gap-2 text-xs shadow-lg shadow-sky-500/20 transition-all"
            >
              <span>{t.openInBrowser}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

      </div>
    </div>
  );
};
