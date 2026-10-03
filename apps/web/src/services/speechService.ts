import { Language } from '../types';

/**
 * Standard BCP-47 locale tags
 */
export const LOCALE_MAP: Record<Language, string> = {
  fr: 'fr-FR',
  ar: 'ar-SA',
  es: 'es-ES',
  de: 'de-DE',
  ja: 'ja-JP',
  en: 'en-US'
};

// Global audio element reference for server-streamed audio playback
let currentAudioElement: HTMLAudioElement | null = null;
let currentUtteranceReference: SpeechSynthesisUtterance | null = null;

/**
 * Retrieves the complete list of available voices from window.speechSynthesis
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  return window.speechSynthesis.getVoices() || [];
}

/**
 * Finds the highest quality native speech synthesis voice for a given language
 */
export function findBestVoiceForLanguage(lang: Language): SpeechSynthesisVoice | null {
  const voices = getAvailableVoices();
  if (voices.length === 0) return null;

  const targetPrefix = lang.toLowerCase();
  const targetLocale = LOCALE_MAP[lang]?.toLowerCase() || targetPrefix;

  // 1. Exact locale match (e.g. 'fr-FR', 'ar-SA')
  const exactMatch = voices.find(
    (v) => v.lang.toLowerCase() === targetLocale || v.lang.toLowerCase().replace('_', '-') === targetLocale
  );
  if (exactMatch) return exactMatch;

  // 2. Language prefix match (e.g. starts with 'fr', 'ar', 'es')
  const prefixMatch = voices.find(
    (v) => v.lang.toLowerCase().startsWith(targetPrefix)
  );
  if (prefixMatch) return prefixMatch;

  // 3. Name-based match (e.g. contains 'French', 'Arabic', 'العربية')
  const nameKeywords: Record<Language, string[]> = {
    fr: ['french', 'français', 'thomas', 'audrey', 'amelie', 'aurelie', 'julie'],
    ar: ['arabic', 'عربي', 'عربية', 'tarik', 'maged', 'laila', 'salma', 'zayd', 'mariam'],
    es: ['spanish', 'español', 'jorge', 'monica'],
    de: ['german', 'deutsch', 'anna', 'stefan'],
    ja: ['japanese', '日本語', 'kyoko', 'otoya'],
    en: ['english', 'samantha', 'google']
  };

  const keywords = nameKeywords[lang] || [];
  const nameMatch = voices.find((v) => {
    const vName = v.name.toLowerCase();
    return keywords.some((k) => vName.includes(k));
  });

  return nameMatch || null;
}

/**
 * Checks whether the host system has an installed voice for the requested language
 */
export function hasInstalledVoiceForLanguage(lang: Language): boolean {
  return findBestVoiceForLanguage(lang) !== null;
}

/**
 * Attempts to play studio-quality audio from the server-side Gemini TTS endpoint
 */
async function speakViaServerTts(
  text: string,
  lang: Language,
  onEnd?: () => void,
  onError?: (err: any) => void
): Promise<boolean> {
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang })
    });

    if (!res.ok) {
      throw new Error(`Server TTS returned status ${res.status}`);
    }

    const data = await res.json();
    if (!data.audioBase64) {
      throw new Error('No audio base64 in response');
    }

    stopSpeaking();

    const audioSrc = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
    const audio = new Audio(audioSrc);
    currentAudioElement = audio;

    audio.onended = () => {
      currentAudioElement = null;
      if (onEnd) onEnd();
    };

    audio.onerror = (e) => {
      console.warn('Audio playback error:', e);
      currentAudioElement = null;
      if (onError) onError(e);
    };

    await audio.play();
    return true;
  } catch (error) {
    console.info('Server TTS not available or returned error, falling back to Web Speech API:', error);
    return false;
  }
}

/**
 * Browser Web Speech API with Chromium bug fixes:
 * 1. window.speechSynthesis.resume() before speaking
 * 2. Utterance reference retained against garbage collection
 * 3. Asynchronous cancellation to prevent queue deadlock
 */
function speakViaWebSpeech(
  text: string,
  lang: Language,
  rate = 1.0,
  onEnd?: () => void,
  onError?: (err: any) => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onError) onError(new Error('SpeechSynthesis not supported'));
    return false;
  }

  // Cancel any prior speech safely
  try {
    window.speechSynthesis.cancel();
  } catch {}

  const utterance = new SpeechSynthesisUtterance(text);
  const targetLocale = LOCALE_MAP[lang] || 'fr-FR';
  utterance.lang = targetLocale;
  utterance.rate = rate;

  // Resolve best available voice
  const bestVoice = findBestVoiceForLanguage(lang);
  if (bestVoice) {
    utterance.voice = bestVoice;
    utterance.lang = bestVoice.lang;
  }

  // Chrome bug fix: Retain reference to prevent garbage collection mid-speech
  currentUtteranceReference = utterance;
  (window as any).__activeUtterance = utterance;

  utterance.onend = () => {
    currentUtteranceReference = null;
    (window as any).__activeUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn(`Web Speech API utterance error for [${lang}]:`, e);
    currentUtteranceReference = null;
    (window as any).__activeUtterance = null;
    if (onError) onError(e);
  };

  // Chrome bug fix: ensure speech synthesis is not in paused state
  setTimeout(() => {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('speechSynthesis.speak error:', err);
      if (onError) onError(err);
    }
  }, 50);

  return true;
}

/**
 * Universal Speak: Tries server-side Gemini broadcast audio first,
 * then falls back to Web Speech API seamlessly.
 */
export async function speakTextAsync(
  text: string,
  lang: Language,
  rate = 1.0,
  onEnd?: () => void,
  onError?: (err: any) => void
): Promise<boolean> {
  if (!text || text.trim().length === 0) {
    if (onEnd) onEnd();
    return false;
  }

  stopSpeaking();

  // 1. Try Server-Side High-Fidelity Gemini TTS
  const serverSuccess = await speakViaServerTts(text, lang, onEnd, onError);
  if (serverSuccess) {
    return true;
  }

  // 2. Fallback to Browser Web Speech API
  return speakViaWebSpeech(text, lang, rate, onEnd, onError);
}

/**
 * Synchronous speak entry point for instant click handlers
 */
export function speakText(
  text: string,
  lang: Language,
  rate = 1.0,
  onEnd?: () => void,
  onError?: (err: any) => void
): boolean {
  if (!text || text.trim().length === 0) {
    if (onEnd) onEnd();
    return false;
  }

  // Kick off universal speak
  speakTextAsync(text, lang, rate, onEnd, onError);
  return true;
}

/**
 * Stops all audio (both HTML5 audio element and Web Speech API)
 */
export function stopSpeaking(): void {
  // Stop server audio
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
    } catch {}
    currentAudioElement = null;
  }

  // Stop browser speech synthesis
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      currentUtteranceReference = null;
      (window as any).__activeUtterance = null;
    } catch {}
  }
}
