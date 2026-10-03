import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  Radio, 
  FileText, 
  Volume2, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Headphones,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { CountryCode, Language, NewsArticle } from '../types';
import { COUNTRIES } from '../services/countries';
import { 
  generatePodcastEpisode, 
  PodcastLanguage, 
  PodcastEpisode 
} from '../services/podcastScript';
import { findBestVoiceForLanguage, hasInstalledVoiceForLanguage, speakTextAsync, stopSpeaking } from '../services/speechService';

interface DailyAudioBriefingProps {
  articles: NewsArticle[];
  currentLang: Language;
  selectedCountry: CountryCode;
}

export const DailyAudioBriefing: React.FC<DailyAudioBriefingProps> = ({
  articles,
  currentLang,
  selectedCountry,
}) => {
  // Podcast Language Edition: 'fr' (French) or 'ar' (Arabic)
  const [podcastLang, setPodcastLang] = useState<PodcastLanguage>(() => {
    try {
      const saved = localStorage.getItem('flutternews_podcast_edition');
      if (saved === 'ar' || saved === 'fr') return saved;
      return currentLang === 'ar' ? 'ar' : 'fr';
    } catch {
      return 'fr';
    }
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 = intro, 1..N = items, N+1 = outro
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Synchronize when voices load asynchronously
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const updateVoices = () => {
        if (synthRef.current) {
          const available = synthRef.current.getVoices();
          setVoices(available);
        }
      };

      updateVoices();

      // Chrome/Safari fire onvoiceschanged asynchronously
      window.speechSynthesis.onvoiceschanged = updateVoices;
    } else {
      setIsSupported(false);
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Synchronize default podcast language when user switches app language
  useEffect(() => {
    if (currentLang === 'ar') {
      setPodcastLang('ar');
    }
  }, [currentLang]);

  // Build the current bilingual episode (100% French or 100% Arabic)
  const episode: PodcastEpisode = useMemo(() => {
    return generatePodcastEpisode(articles, podcastLang, selectedCountry);
  }, [articles, podcastLang, selectedCountry]);

  const countryInfo = COUNTRIES.find((c) => c.code === selectedCountry) || COUNTRIES[0];

  // Discover specific voices
  const availableFrenchVoices = useMemo(() => {
    return voices.filter(
      (v) => v.lang.toLowerCase().startsWith('fr') || v.name.toLowerCase().includes('french')
    );
  }, [voices]);

  const availableArabicVoices = useMemo(() => {
    return voices.filter(
      (v) => v.lang.toLowerCase().startsWith('ar') || v.name.toLowerCase().includes('arabic')
    );
  }, [voices]);

  // Select optimal voice for current podcast language
  const currentVoice = useMemo(() => {
    if (podcastLang === 'ar') {
      return availableArabicVoices[0] || null;
    }
    return availableFrenchVoices[0] || null;
  }, [podcastLang, availableArabicVoices, availableFrenchVoices]);

  // When language edition or country changes, stop current speech
  const handleEditionChange = (lang: PodcastLanguage) => {
    stopSpeaking();
    setIsPlaying(false);
    setIsBuffering(false);
    setCurrentStep(0);
    setPodcastLang(lang);
    try {
      localStorage.setItem('flutternews_podcast_edition', lang);
    } catch {}
  };

  const handleStop = () => {
    stopSpeaking();
    setIsPlaying(false);
    setIsBuffering(false);
    setCurrentStep(0);
  };

  const speakStep = async (step: number) => {
    if (!episode) {
      setIsPlaying(false);
      setIsBuffering(false);
      return;
    }

    stopSpeaking();
    setCurrentStep(step);
    setIsBuffering(true);
    setIsPlaying(true);

    let textToSpeak = '';
    const totalItems = episode.items.length;

    if (step === 0) {
      // Intro
      textToSpeak = episode.intro;
    } else if (step >= 1 && step <= totalItems) {
      // News items
      const item = episode.items[step - 1];
      const prefix = podcastLang === 'ar' 
        ? `الخبر ${step === 1 ? 'الأول' : step === 2 ? 'الثاني' : step === 3 ? 'الثالث' : step === 4 ? 'الرابع' : 'الخامس'}: `
        : `Actualité numéro ${step} : `;
      textToSpeak = `${prefix} ${item.title}. ${item.body}`;
    } else if (step > totalItems) {
      // Outro
      textToSpeak = episode.outro;
    }

    const success = await speakTextAsync(
      textToSpeak,
      podcastLang,
      playbackSpeed,
      () => {
        setIsBuffering(false);
        if (step < totalItems + 1) {
          speakStep(step + 1);
        } else {
          setIsPlaying(false);
          setCurrentStep(0);
        }
      },
      (err) => {
        console.warn('Audio playback error:', err);
        setIsBuffering(false);
        setIsPlaying(false);
      }
    );

    setIsBuffering(false);
    if (!success) {
      setIsPlaying(false);
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying || isBuffering) {
      handleStop();
    } else {
      speakStep(currentStep);
    }
  };

  const handleNext = () => {
    const totalItems = episode.items.length;
    if (currentStep < totalItems + 1) {
      speakStep(currentStep + 1);
    } else {
      handleStop();
    }
  };

  if (!isSupported || episode.items.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-sky-500/40 rounded-2xl p-4 shadow-xl shadow-sky-950/20 mb-3 text-xs space-y-3">
      {/* 1. Header Bar with Dual Language Edition Switcher (FR / AR) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-2 rounded-xl border transition-all shrink-0 ${
            isPlaying 
              ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md shadow-sky-500/30' 
              : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
          }`}>
            <Headphones className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 font-bold text-white tracking-tight truncate">
              <span>Générateur de Podcast Tech</span>
              <span>·</span>
              <span className="text-sky-300 font-semibold">{countryInfo.flag} {countryInfo.name}</span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {podcastLang === 'ar' ? 'البودكاست الصوتي باللغة العربية' : 'Édition audio quotidienne en français'}
            </p>
          </div>
        </div>

        {/* Dual Language Switcher Segmented Control */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => handleEditionChange('fr')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              podcastLang === 'fr'
                ? 'bg-sky-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🇫🇷</span>
            <span>Podcast Français</span>
          </button>

          <button
            onClick={() => handleEditionChange('ar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              podcastLang === 'ar'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🇩🇿/🇦🇪</span>
            <span dir="rtl">بودكاست عربي</span>
          </button>
        </div>
      </div>

      {/* Voice Status Alert if Arabic voice is missing in host OS */}
      {podcastLang === 'ar' && availableArabicVoices.length === 0 && voices.length > 0 && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-2 text-[11px]">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <div>
            <span className="font-semibold">Pack vocal arabe non détecté sur votre système : </span>
            <span>La lecture vocale utilise la voix de synthèse disponible. Vous pouvez lire le script complet rédigé en arabe ci-dessous.</span>
          </div>
        </div>
      )}

      {/* 2. Audio Player Status & Animated Waveform */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Animated sound bars when playing */}
          {isPlaying && (
            <div className="flex items-end gap-1 h-5 shrink-0 px-1">
              <span className="w-1 bg-sky-400 rounded-full animate-bounce h-3" />
              <span className="w-1 bg-sky-300 rounded-full animate-bounce h-5 [animation-delay:150ms]" />
              <span className="w-1 bg-sky-500 rounded-full animate-bounce h-4 [animation-delay:300ms]" />
              <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2 [animation-delay:450ms]" />
            </div>
          )}

          <div className="min-w-0 text-slate-300">
            <div className="font-semibold text-white truncate text-xs">
              {isPlaying ? (
                currentStep === 0 
                  ? (podcastLang === 'ar' ? 'مقدمة النشرة' : 'Introduction du Flash Info')
                  : currentStep <= episode.items.length
                  ? (podcastLang === 'ar' 
                      ? `الخبر ${currentStep} / ${episode.items.length}: ${episode.items[currentStep - 1]?.title}`
                      : `Actu ${currentStep} / ${episode.items.length} : ${episode.items[currentStep - 1]?.title}`)
                  : (podcastLang === 'ar' ? 'خاتمة النشرة' : 'Conclusion du Podcast')
              ) : (
                podcastLang === 'ar' 
                  ? `جاهز للبث (${episode.items.length} أخبار رئيسية بالعربية)` 
                  : `Prêt à diffuser (${episode.items.length} actus en français)`
              )}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>{podcastLang === 'ar' ? 'صوت باللغة العربية الفصحى' : 'Synthèse vocale en français (fr-FR)'}</span>
              {currentVoice && (
                <span className="text-[10px] text-sky-400/80 font-mono">({currentVoice.name})</span>
              )}
            </div>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isPlaying && (
            <>
              <button
                onClick={handleNext}
                title="Actualité suivante"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleStop}
                title="Arrêter"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            </>
          )}

          <button
            onClick={handleTogglePlay}
            disabled={isBuffering && !isPlaying}
            className={`min-h-[38px] px-3.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                : isBuffering
                ? 'bg-slate-800 text-sky-300 border border-sky-500/40 animate-pulse'
                : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20'
            }`}
          >
            {isBuffering ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                <span>{podcastLang === 'ar' ? 'جاري التحميل...' : 'Chargement...'}</span>
              </>
            ) : isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>{podcastLang === 'ar' ? 'إيقاف مؤقت' : 'Pause'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{podcastLang === 'ar' ? 'استمع الآن' : 'Écouter'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Action Bar: Show Transcript & Speed Control */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-medium transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>
            {showTranscript 
              ? (podcastLang === 'ar' ? 'إخفاء النص المكتوب' : 'Masquer le script complet')
              : (podcastLang === 'ar' ? 'عرض نص البودكاست المكتوب' : 'Lire le script complet')}
          </span>
          {showTranscript ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {/* Speed toggle: 1x, 1.2x */}
        <div className="flex items-center gap-1">
          <span className="text-slate-500">Vitesse :</span>
          {[1.0, 1.2, 1.4].map((speed) => (
            <button
              key={speed}
              onClick={() => {
                setPlaybackSpeed(speed);
                if (isPlaying) {
                  speakStep(currentStep);
                }
              }}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                playbackSpeed === speed
                  ? 'bg-slate-800 text-sky-300 font-bold border border-slate-700'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* 4. Full Script / Transcript Accordion */}
      {showTranscript && (
        <div 
          dir={podcastLang === 'ar' ? 'rtl' : 'ltr'}
          className={`p-3.5 bg-slate-950 rounded-xl border border-slate-800/90 space-y-3 max-h-72 overflow-y-auto font-sans leading-relaxed text-xs animate-fade-in ${
            podcastLang === 'ar' ? 'text-right' : 'text-left'
          }`}
        >
          <div className="font-bold text-sky-300 flex items-center gap-1.5 pb-1 border-b border-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{episode.title}</span>
          </div>

          <p className="text-slate-300 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
            {episode.intro}
          </p>

          <div className="space-y-2">
            {episode.items.map((item, idx) => {
              const isCurrent = isPlaying && currentStep === idx + 1;
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border transition-all ${
                    isCurrent
                      ? 'bg-sky-500/15 border-sky-500/50 shadow-sm text-white font-medium'
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="font-bold text-white flex items-center gap-2 mb-1">
                    <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] font-mono flex items-center justify-center text-sky-400">
                      {idx + 1}
                    </span>
                    <span>{item.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-normal">
                    {item.body}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="text-slate-400 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60 text-[11px]">
            {episode.outro}
          </p>
        </div>
      )}
    </div>
  );
};
