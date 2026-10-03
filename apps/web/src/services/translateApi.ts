import { Language } from '../types';

/**
 * Real translation pipeline for spoken content (podcast).
 *
 * Three providers:
 *  - gemini   : POST /api/translate (services/api). Requires a deployed API + GEMINI_API_KEY.
 *  - mymemory : free public MT endpoint, keyless, CORS-enabled. Default.
 *  - off      : no network call, only curated scripts are used.
 */
export type TranslateProvider = 'gemini' | 'mymemory' | 'off';

const PROVIDER = ((import.meta as { env?: Record<string, string> }).env?.VITE_TRANSLATE_PROVIDER ||
  'mymemory') as TranslateProvider;

const CACHE_KEY = 'flutternews_translations_v1';
const MYMEMORY_ENDPOINT = 'https://api.mymemory.translated.net/get';
const MYMEMORY_MAX_CHARS = 480;
const MYMEMORY_PAUSE_MS = 250;

export interface TranslationOutcome {
  text: string;
  failed: boolean;
}

const ARABIC_RE = /[\u0600-\u06FF]/;
const LATIN_ACCENT_RE = /[àâçéèêëîïôûùüÿœæÀÂÇÉÈÊËÎÏÔÛÙÜŸŒÆ]/;
const FRENCH_HINT_RE =
  /\b(le|la|les|des|une|un|dans|pour|avec|nouveau|nouvelle|sur|est|sont|par|plus|qui|que|aux|du)\b/i;

/**
 * Feed metadata prefixes that must never reach a translation engine or the voice.
 * Example source: "[HN Traduction] Synthèse technique de la communauté de développeurs concernant X"
 */
const METADATA_PREFIXES: RegExp[] = [
  /^\s*\[(?:hn\s*traduction|dev\.?to|github|flipboard|rss|reddit)\s*\]?\s*/i,
  /^\s*(?:show|ask|tell)\s+hn\s*[:\-]\s*/i,
  /^\s*(?:synthèse technique de la communauté de développeurs concernant|article publié sur dev\.?to par|dépôt open-source avec|dépôt github)\s*/i,
  /^\s*(?:dernière mise à jour|article complet et analyse technique sur)\s*/i,
  /^\s*(?:cet article est issu de la communauté mondiale des développeurs|discussions et analyses techniques de la communauté hacker news sur)\s*/i
];

function loadCache(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

let cache: Record<string, string> = typeof localStorage !== 'undefined' ? loadCache() : {};

function saveCache() {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Quota exceeded: keep the in-memory cache only
  }
}

/**
 * Removes source-feed boilerplate and collapses whitespace
 */
export function cleanSourceText(text: string): string {
  let out = (text || '').trim();
  for (const prefix of METADATA_PREFIXES) {
    out = out.replace(prefix, '');
  }
  return out.replace(/\s+/g, ' ').trim();
}

function detectSourceLang(text: string): 'en' | 'fr' | 'ar' {
  if (ARABIC_RE.test(text)) return 'ar';
  if (LATIN_ACCENT_RE.test(text) || FRENCH_HINT_RE.test(text)) return 'fr';
  return 'en';
}

/**
 * Splits text on sentence boundaries, never exceeding maxChars
 */
export function chunkText(text: string, maxChars = MYMEMORY_MAX_CHARS): string[] {
  if (text.length <= maxChars) return [text];

  const sentences = text.match(/[^.!?…؟]+[.!?…؟]+|[^.!?…؟]+$/g) || [text];
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const piece = sentence.trim();
    if (!piece) continue;

    if (current && `${current} ${piece}`.length > maxChars) {
      chunks.push(current);
      current = piece;
    } else {
      current = current ? `${current} ${piece}` : piece;
    }

    while (current.length > maxChars) {
      chunks.push(current.slice(0, maxChars));
      current = current.slice(maxChars);
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks.filter((c) => c.length > 0);
}

function tidyTranslated(text: string, source: string): string {
  const out = cleanSourceText(text)
    .replace(/\s+([.,!?؛:،])/g, '$1')
    .replace(/^["'«»\s]+|["'«»\s]+$/g, '');

  // Translation engines sometimes echo the source back: treat it as a failure
  return out && out.toLowerCase() !== source.toLowerCase() ? out : '';
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callMyMemory(text: string, target: 'fr' | 'ar'): Promise<string> {
  const source = detectSourceLang(text);
  if (source === target) return text;

  const parts: string[] = [];
  for (const chunk of chunkText(text)) {
    const url = `${MYMEMORY_ENDPOINT}?q=${encodeURIComponent(chunk)}&langpair=${source}|${target}&mt=1`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`MyMemory HTTP ${res.status}`);

    const data = await res.json();
    if (Number(data?.responseStatus) !== 200) {
      throw new Error(`MyMemory status ${data?.responseStatus}`);
    }

    const translated: string = data?.responseData?.translatedText || '';
    if (!translated) throw new Error('MyMemory empty response');

    parts.push(tidyTranslated(translated, chunk));
    await sleep(MYMEMORY_PAUSE_MS);
  }

  return parts.filter(Boolean).join(' ').trim();
}

async function callGeminiApi(text: string, target: 'fr' | 'ar'): Promise<string> {
  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetLang: target })
  });

  if (!res.ok) throw new Error(`/api/translate HTTP ${res.status}`);

  const data = await res.json();
  if (!data?.text) throw new Error('/api/translate empty response');
  return tidyTranslated(String(data.text), text);
}

const inflight = new Map<string, Promise<TranslationOutcome>>();

/**
 * Translates any text into fr or ar, with cache + de-duplication.
 * Never throws: on failure it returns an empty string so callers can fall back.
 */
export function translateText(rawText: string, target: Language): Promise<TranslationOutcome> {
  const text = cleanSourceText(rawText);
  const lang = target === 'ar' ? 'ar' : 'fr';

  if (!text || PROVIDER === 'off' || detectSourceLang(text) === lang) {
    return Promise.resolve({ text: text || '', failed: false });
  }

  const key = `${PROVIDER}:${lang}:${text}`;
  const cached = cache[key];
  if (cached) return Promise.resolve({ text: cached, failed: false });

  const running = inflight.get(key);
  if (running) return running;

  const task = (async (): Promise<TranslationOutcome> => {
    try {
      const translated =
        PROVIDER === 'gemini' ? await callGeminiApi(text, lang) : await callMyMemory(text, lang);
      if (!translated) return { text: '', failed: true };
      cache[key] = translated;
      saveCache();
      return { text: translated, failed: false };
    } catch (error) {
      console.warn(`[translate] ${PROVIDER} failed for ${lang}:`, error);
      return { text: '', failed: true };
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, task);
  return task;
}

export function getActiveTranslateProvider(): TranslateProvider {
  return PROVIDER;
}