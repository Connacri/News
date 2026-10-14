import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const API_ROOT = path.resolve(HERE, '..');
const REPO_ROOT = path.resolve(API_ROOT, '..', '..');
const WEB_ROOT = path.join(REPO_ROOT, 'apps', 'web');
const WEB_DIST = path.join(WEB_ROOT, 'dist');

dotenv.config({ path: path.join(REPO_ROOT, '.env') });

const PORT = 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

const LANG_NAMES: Record<string, string> = {
  ar: 'Arabic',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
  ja: 'Japanese',
  en: 'English',
};

const TRANSLATION_MODELS = [
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
];

const TTS_MODEL = 'gemini-3.8-flash-lite-tts';
const TTS_VOICES: Record<string, string> = { ar: 'Zephyr' };
const TTS_MAX_CHARS = 4000;

// Public RSS/Atom sources used as a discovery layer. Article content is not copied;
// News stores title, metadata and the canonical source URL.
const RSS_SOURCES = [
  { id: 'aps', name: 'APS', query: 'site:aps.dz Algérie' },
  { id: 'tsa', name: 'TSA Algérie', query: 'site:tsa-algerie.com Algérie' },
  { id: 'algerie360', name: 'Algérie360', query: 'site:algerie360.com Algérie' },
  { id: 'lexpression', name: "L'Expression", query: 'site:lexpression.dz Algérie' },
  { id: 'elwatan', name: 'El Watan', query: 'site:elwatan.dz Algérie' },
  { id: 'international', name: 'International', query: 'Algérie international' },
];

const RSS_TOPICS: Record<string, string> = {
  world: 'monde international',
  politics: 'politique gouvernement élections',
  business: 'entreprises business',
  economy: 'économie emploi inflation marchés',
  society: 'société social',
  local: 'local wilaya commune',
  sports: 'sport football',
  culture: 'culture arts patrimoine',
  entertainment: 'cinéma musique télévision divertissement',
  science: 'science recherche',
  health: 'santé médecine',
  environment: 'environnement climat',
  education: 'éducation université école',
  technology: 'technologie numérique innovation',
  ai: 'intelligence artificielle IA',
  cyber: 'cybersécurité cyberattaque',
  travel: 'voyage tourisme',
  lifestyle: 'lifestyle mode cuisine',
};

function detectArticleCategory(title: string, desc: string, defaultCat: string): string {
  const text = `${title} ${desc}`.toLowerCase();
  if (/cyber|pirat|hacker|faille|vulnérabilit|malware|rançongiciel|cve|cert|sécurité/.test(text)) return 'cyber';
  if (/intelligence artificielle|\bia\b|\bllm\b|chatgpt|mistral|gemini|deepseek|deep learning/.test(text)) return 'ai';
  if (/brevet|patent|inapi|ompi|wipo|uspto/.test(text)) return 'patents';
  if (/football|sport|match|ligue|can\b|olymp|joueur|stade/.test(text)) return 'sports';
  if (/santé|hôpital|médecin|vaccin|épidémie|maladie|médicament/.test(text)) return 'health';
  if (/climat|environnement|sécheresse|écologie|biodiversité|solaire|renouvelable/.test(text)) return 'environment';
  if (/économie|inflation|bourse|dinar|dollar|banque|finances|croissance|pétrole|gaz|export/.test(text)) return 'economy';
  if (/politique|gouvernement|ministre|président|parlement|élection|diplomatie|visite d'état/.test(text)) return 'politics';
  if (/culture|cinéma|film|théâtre|musique|patrimoine|livre|art\b|musée/.test(text)) return 'culture';
  if (/université|école|étudiant|baccalauréat|enseignement|recherche|scientifique/.test(text)) return 'science';
  if (/smartphone|android|ios|flutter|apple|samsung|mobile/.test(text)) return 'mobile';
  if (/cloud|datacenter|serveur|kubernetes|aws|azure/.test(text)) return 'cloud';
  if (/technologie|numérique|digital|startup|informatique|logiciel/.test(text)) return 'technology';
  return defaultCat || 'world';
}

interface CacheEntry {
  timestamp: number;
  data: any[];
}
const serverNewsCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/<[^>]+>/g, '').trim();
}

function parseRss(xml: string, sourceName: string, requestedCategory: string) {
  const items = xml.match(/<(item|entry)[^>]*>[\s\S]*?<\/(item|entry)>/gi) || [];
  return items.map((item, index) => {
    const get = (tag: string) => {
      const match = item.match(new RegExp(`<${tag}(?:[^>]*)>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return match ? decodeXml(match[1]) : '';
    };
    const linkMatch = item.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?\s*>/i);
    const url = linkMatch?.[1] || get('link');
    const title = get('title');
    const description = get('description') || get('summary');
    const date = get('pubDate') || get('published') || get('updated');
    const detectedCat = detectArticleCategory(title, description, requestedCategory);
    return {
      id: `rss-${sourceName}-${url || index}`,
      title,
      description: description ? description.slice(0, 500) : `Dépêche publiée par ${sourceName}. Retrouvez l'article complet et les analyses sur la source originale.`,
      url,
      source: sourceName,
      author: `Rédaction ${sourceName}`,
      sourceType: 'rss',
      publishedAt: date ? new Date(date).toISOString() : new Date().toISOString(),
      country: 'dz',
      category: detectedCat,
      tags: ['RSS', sourceName, detectedCat],
    };
  }).filter((item) => item.title && item.url);
}

async function fetchRssSource(source: typeof RSS_SOURCES[number], topic: string) {
  try {
    const q = encodeURIComponent(`${source.query} ${topic}`);
    const url = `https://news.google.com/rss/search?q=${q}&hl=fr&gl=DZ&ceid=DZ:fr`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, { 
      headers: { 'User-Agent': 'NewsAggregator/1.0' },
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!response.ok) return [];
    return parseRss(await response.text(), source.name, topic || 'world');
  } catch {
    return [];
  }
}



const ALLOWED_ORIGINS = new Set([
  'https://device-streaming-ccab91bb.web.app',
  'https://flutter-news-osint.web.app',
  'https://connacri.github.io',
  'http://localhost:3000',
  'http://localhost:5173'
]);

let ai: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!ai) ai = new GoogleGenAI();
  return ai;
}

/**
 * Caps the text sent to the TTS model without ever cutting a sentence in half
 */
function clampForTts(text: string): string {
  if (text.length <= TTS_MAX_CHARS) return text;

  const head = text.slice(0, TTS_MAX_CHARS);
  const lastBoundary = Math.max(
    head.lastIndexOf('. '),
    head.lastIndexOf('! '),
    head.lastIndexOf('? '),
    head.lastIndexOf('؟'),
    head.lastIndexOf('۔'),
    head.lastIndexOf('。'),
    head.lastIndexOf('\n')
  );

  if (lastBoundary > TTS_MAX_CHARS * 0.6) {
    return head.slice(0, lastBoundary + 1);
  }

  const lastSpace = head.lastIndexOf(' ');
  return lastSpace > 0 ? head.slice(0, lastSpace) : head;
}

/**
 * Iterates over TRANSLATION_MODELS until one returns text
 */
async function generateText(prompt: string, responseMimeType?: string): Promise<string | null> {
  for (const modelName of TRANSLATION_MODELS) {
    try {
      const response = await getClient().models.generateContent({
        model: modelName,
        contents: prompt,
        config: responseMimeType ? { responseMimeType } : undefined
      });
      if (response.text) return response.text;
    } catch (modelErr) {
      const msg = modelErr instanceof Error ? modelErr.message : String(modelErr);
      console.warn(`[api/translate] model ${modelName} unavailable, trying next: ${msg}`);
    }
  }
  return null;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // The web app may be hosted separately from this API
  app.use('/api', (req, res, next) => {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    }
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    return next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', env: IS_PROD ? 'production' : 'development' });
  });

  app.get('/api/news/aggregate', async (req, res) => {
    try {
      const country = String(req.query.country || 'all');
      const category = String(req.query.category || 'all');
      const cacheKey = `${country}:${category}`;
      const cached = serverNewsCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS && cached.data.length > 0) {
        return res.json(cached.data);
      }

      // If category is 'all', query top headline topics rather than all 18 topics to avoid rate limits
      const topics = category === 'all'
        ? ['world', 'technology', 'economy', 'politics', 'science', 'sports']
        : [category];

      // Limit concurrent queries by slicing sources to top trusted news outlets
      const activeSources = RSS_SOURCES.slice(0, 4);

      const batches = await Promise.allSettled(
        topics.flatMap((topic) => activeSources.map((source) => fetchRssSource(source, RSS_TOPICS[topic] || topic)))
      );
      const articles = batches.flatMap((batch) => batch.status === 'fulfilled' ? batch.value : []);
      const unique = new Map<string, any>();
      for (const article of articles) {
        if (country !== 'all' && article.country !== country && article.country !== 'all') continue;
        const key = article.url.replace(/#.*$/, '').replace(/\/$/, '');
        if (!unique.has(key)) unique.set(key, article);
      }

      const result = Array.from(unique.values()).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

      if (result.length > 0) {
        serverNewsCache.set(cacheKey, { timestamp: Date.now(), data: result });
      } else if (cached && cached.data.length > 0) {
        // Fallback to previous cache if live fetch yielded 0 temporarily
        return res.json(cached.data);
      }

      res.json(result);
    } catch (error) {
      console.error('[api/news/aggregate]', error);
      const cacheKey = `${req.query.country || 'all'}:${req.query.category || 'all'}`;
      const cached = serverNewsCache.get(cacheKey);
      if (cached && cached.data.length > 0) {
        return res.json(cached.data);
      }
      res.status(502).json({ error: 'News aggregation unavailable' });
    }
  });

  app.post('/api/tts', async (req, res) => {
    try {
      const { text, lang } = req.body ?? {};
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text is required' });
      }

      const voiceName = TTS_VOICES[lang as string] ?? 'Puck';

      const response = await getClient().models.generateContent({
        model: TTS_MODEL,
        contents: clampForTts(text),
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
        },
      });

      const part = response.candidates?.[0]?.content?.parts?.[0];
      const base64Audio = part?.inlineData?.data;
      if (!base64Audio) {
        return res.status(502).json({ error: 'No audio returned from Gemini TTS' });
      }

      return res.json({
        audioBase64: base64Audio,
        mimeType: part?.inlineData?.mimeType || 'audio/wav',
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to generate audio via Gemini TTS';
      console.error('[api/tts]', message);
      return res.status(500).json({ error: message });
    }
  });

  app.post('/api/translate', async (req, res) => {
    try {
      const { title, description, content, text, targetLang } = req.body ?? {};

      // Plain text mode: used by the podcast generator (title/description are optional)
      if (typeof text === 'string' && text.trim()) {
        const langName = LANG_NAMES[targetLang as string] ?? LANG_NAMES.ar;
        const plainPrompt = [
          `Translate the following text into ${langName}.`,
          'Keep technical terms (Flutter, CVE, Linux, API, LLM, CUDA, etc.) untranslated.',
          'Return ONLY the translated text, with no preamble, no quotes and no commentary.',
          '',
          text.slice(0, 4000),
        ].join('\n');

        const translated = await generateText(plainPrompt);
        if (!translated) {
          return res.status(502).json({ error: 'Empty response from translation models' });
        }
        return res.json({ text: translated });
      }

      if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: 'Title or text is required' });
      }

      const langName = LANG_NAMES[targetLang as string] ?? LANG_NAMES.ar;

      const prompt = targetLang === 'ar'
        ? [
            `Translate this news article into natural, eloquent Arabic.`,
            'STRICT MANDATORY RULE: Keep ALL technical and scientific terms, acronyms, specifications, and hardware/software names (e.g. Flutter, Android, iOS, Impeller, Vulkan, Metal, WasmGC, WebAssembly, eBPF, CVE, Linux, API, LLM, CUDA, GPU, CPU, NPU, NIST, CISA, VRAM, RAM, INT4, FP8, Cloud, Kubernetes, Docker, Python, Rust, FTTH, LiDAR, InSAR, GNSS, Nature Geoscience, CRAAG, etc.) STRICTLY UNTRANSLATED in their original Latin alphabet / alphanumeric format.',
            'Translate all other general, editorial, and journalistic text into fluent, modern standard Arabic (الفصحى).',
            '',
            'Input:',
            `Title: ${title}`,
            `Description: ${description || ''}`,
            `Content: ${content ? String(content).slice(0, 1800) : ''}`,
            '',
            'Respond with a JSON object strictly adhering to this schema:',
            '{ "title": "translated title", "description": "translated description", "content": "translated content" }',
          ].join('\n')
        : [
            `Translate this news article into ${langName}.`,
            'Maintain all technical and scientific terms (Flutter, CVE, Linux, API, LLM, etc.) untranslated, and write natural journalistic prose.',
            '',
            'Input:',
            `Title: ${title}`,
            `Description: ${description || ''}`,
            `Content: ${content ? String(content).slice(0, 1800) : ''}`,
            '',
            'Respond with a JSON object strictly adhering to this schema:',
            '{ "title": "translated title", "description": "translated description", "content": "translated content" }',
          ].join('\n');

      const responseText = await generateText(prompt, 'application/json');
      if (!responseText) {
        return res.status(502).json({ error: 'Empty response from translation models' });
      }

      const parsed = JSON.parse(responseText) as Record<string, unknown>;
      return res.json({
        title: parsed.title || title,
        description: parsed.description || description,
        content: parsed.content || content,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to translate';
      console.error('[api/translate]', message);
      return res.status(500).json({ error: message });
    }
  });

  if (IS_PROD) {
    if (!fs.existsSync(WEB_DIST)) {
      console.warn(`[server] ${WEB_DIST} introuvable - lancez "npm run build" avant "npm start".`);
    }
    app.use(express.static(WEB_DIST, { index: false }));
    app.get('*', (_req, res) => res.sendFile(path.join(WEB_DIST, 'index.html')));
  } else {
    const vite = await createViteServer({
      root: WEB_ROOT,
      appType: 'spa',
      server: { middlewareMode: true, allowedHosts: true },
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[server] API + web on http://localhost:${PORT} (${IS_PROD ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[server] startup failed:', err);
  process.exit(1);
});