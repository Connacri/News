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
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest',
];

const TTS_MODEL = 'gemini-3.8-flash-lite-tts';
const TTS_VOICES: Record<string, string> = { ar: 'Zephyr' };
const TTS_MAX_CHARS = 4000;

const RSS_TOPICS: Record<string, string> = {
  world: 'monde international world',
  politics: 'politique gouvernement elections',
  business: 'entreprises business markets',
  economy: 'économie emploi inflation finances',
  society: 'société social society',
  local: 'local wilaya commune regions',
  sports: 'sport football soccer',
  culture: 'culture arts patrimoine heritage',
  entertainment: 'cinéma musique télévision divertissement',
  science: 'science recherche discovery',
  health: 'santé médecine health',
  environment: 'environnement climat ecology',
  education: 'éducation université école school',
  technology: 'technologie numérique innovation tech',
  ai: 'intelligence artificielle IA LLM AI',
  cyber: 'cybersécurité cyberattaque faille CVE security',
  opensource: 'open source GitHub logiciel libre',
  mobile: 'smartphone Android iOS Flutter mobile',
  cloud: 'cloud Kubernetes datacenter AWS Azure',
  patents: 'brevet patent propriété intellectuelle',
  blueprints: 'architecture infrastructure system design',
  travel: 'voyage tourisme travel',
  lifestyle: 'lifestyle mode cuisine wellness',
};

const COUNTRY_SOURCES: Record<string, { id: string; name: string; query: string; hl: string; gl: string; ceid: string }[]> = {
  dz: [
    { id: 'aps', name: 'APS', query: 'site:aps.dz Algérie', hl: 'fr', gl: 'DZ', ceid: 'DZ:fr' },
    { id: 'tsa', name: 'TSA Algérie', query: 'site:tsa-algerie.com Algérie', hl: 'fr', gl: 'DZ', ceid: 'DZ:fr' },
    { id: 'elwatan', name: 'El Watan', query: 'site:elwatan.dz Algérie', hl: 'fr', gl: 'DZ', ceid: 'DZ:fr' },
    { id: 'algerie360', name: 'Algérie360', query: 'site:algerie360.com Algérie', hl: 'fr', gl: 'DZ', ceid: 'DZ:fr' },
  ],
  fr: [
    { id: 'lemonde', name: 'Le Monde', query: 'site:lemonde.fr France actualité', hl: 'fr', gl: 'FR', ceid: 'FR:fr' },
    { id: 'france24', name: 'France 24', query: 'site:france24.com France actualité', hl: 'fr', gl: 'FR', ceid: 'FR:fr' },
    { id: 'lefigaro', name: 'Le Figaro', query: 'site:lefigaro.fr actualité tech', hl: 'fr', gl: 'FR', ceid: 'FR:fr' },
  ],
  us: [
    { id: 'reuters', name: 'Reuters', query: 'Reuters technology business United States', hl: 'en', gl: 'US', ceid: 'US:en' },
    { id: 'ap', name: 'Associated Press', query: 'AP news United States technology', hl: 'en', gl: 'US', ceid: 'US:en' },
    { id: 'wired', name: 'Wired', query: 'site:wired.com technology AI security', hl: 'en', gl: 'US', ceid: 'US:en' },
  ],
  de: [
    { id: 'dw', name: 'Deutsche Welle', query: 'site:dw.com Deutschland Technologie', hl: 'de', gl: 'DE', ceid: 'DE:de' },
    { id: 'spiegel', name: 'Spiegel', query: 'site:spiegel.de Deutschland Wirtschaft Netzwelt', hl: 'de', gl: 'DE', ceid: 'DE:de' },
  ],
  gb: [
    { id: 'bbc', name: 'BBC News', query: 'BBC News UK technology business', hl: 'en', gl: 'GB', ceid: 'GB:en' },
    { id: 'guardian', name: 'The Guardian', query: 'site:theguardian.com UK technology world', hl: 'en', gl: 'GB', ceid: 'GB:en' },
  ],
  maghreb: [
    { id: 'tsa-mag', name: 'TSA Maghreb', query: 'site:tsa-algerie.com Maghreb Algérie Maroc Tunisie', hl: 'fr', gl: 'DZ', ceid: 'DZ:fr' },
    { id: 'jeuneafrique', name: 'Jeune Afrique', query: 'site:jeuneafrique.com Maghreb économie', hl: 'fr', gl: 'DZ', ceid: 'DZ:fr' },
  ],
  all: [
    { id: 'aps', name: 'APS', query: 'site:aps.dz Algérie actualité', hl: 'fr', gl: 'DZ', ceid: 'DZ:fr' },
    { id: 'france24', name: 'France 24', query: 'site:france24.com actualité internationale', hl: 'fr', gl: 'FR', ceid: 'FR:fr' },
    { id: 'reuters', name: 'Reuters', query: 'Reuters world news technology', hl: 'en', gl: 'US', ceid: 'US:en' },
    { id: 'tsa', name: 'TSA', query: 'site:tsa-algerie.com Algérie', hl: 'fr', gl: 'DZ', ceid: 'DZ:fr' },
  ],
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

function parseRss(xml: string, sourceName: string, requestedCategory: string, countryCode: string) {
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
      country: countryCode || 'all',
      category: detectedCat,
      tags: ['RSS', sourceName, detectedCat],
    };
  }).filter((item) => item.title && item.url);
}

async function fetchRssSource(
  source: { id: string; name: string; query: string; hl: string; gl: string; ceid: string },
  topic: string,
  countryCode: string
) {
  try {
    const q = encodeURIComponent(`${source.query} ${topic}`);
    const url = `https://news.google.com/rss/search?q=${q}&hl=${source.hl}&gl=${source.gl}&ceid=${source.ceid}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8'
      },
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!response.ok) return [];
    return parseRss(await response.text(), source.name, topic || 'world', countryCode);
  } catch {
    return [];
  }
}

/**
 * Mandatory rule for Arabic translation:
 * Keep ALL technical, scientific, hardware, software, acronyms, and specs in Latin/alphanumeric characters.
 */
const TECHNICAL_TERMS_PATTERN = /\b(Flutter|Android|iOS|Impeller|Vulkan|Metal|WasmGC|WebAssembly|Wasm|eBPF|CVE[-0-9A-Za-z]*|Linux|API|REST API|LLM|MoE|FlashAttention|SRAM|DRAM|VRAM|INT4|FP8|INT8|FP16|GPU|CPU|NPU|TPU|Docker|Kubernetes|K8s|Python|Rust|C\+\+|Go|Node\.js|TypeScript|Dart|NIST|CISA|CERT-FR|ANSSI|USPTO|EPO|WIPO|INAPI|FTTH|Gbps|Mbps|LiDAR|InSAR|GNSS|CRAAG|Nature Geoscience|WiFi|5G|4G|Bluetooth|TCP|IP|HTTP|HTTPS|DNS|SSL|TLS|mTLS|RAM|ROM|SSD|SQL|NoSQL|PostgreSQL|Firebase|Firestore|FCM|Git|GitHub|GitLab|DeepSeek|Mistral AI|OpenAI|ChatGPT|Gemini|Claude|Llama|Hugging Face|Kaggle|TensorFlow|PyTorch|ONNX|GGUF|CUDA|AMD|NVIDIA|Qualcomm|ARM|Intel|Apple Silicon|Air Algérie|Algérie Télécom|Sidi Abdellah|USTHB|CERIST|SATIM|Edahabia|APS|TSA|El Watan|France 24|Reuters|BBC|Wired|Le Monde)\b/gi;

function translateToArabicWithTechPreserved(text: string): string {
  if (!text) return '';
  const preserved: string[] = [];
  let masked = text.replace(TECHNICAL_TERMS_PATTERN, (match) => {
    preserved.push(match);
    return `__TECH_TERM_${preserved.length - 1}__`;
  });

  const dictionary: [RegExp, string][] = [
    // Boilerplate & Source statements
    [/Dépêche publiée par/gi, 'برقية إخبارية صادرة عن'],
    [/Consultez l'article complet sur la source originale\./gi, 'طالع المقال الأصلي كاملاً عبر المصدر المباشر.'],
    [/Before You Buy an? /gi, 'قبل شراء '],
    [/Read This\b/gi, 'اقرأ هذا'],

    // Exact baselines & common sentences
    [/Modernisation des services publics locaux et déploiement de la fibre dans 58 wilayas/gi, 'تحديث الخدمات العامة المحلية ونشر شبكة Fibre في 58 ولاية'],
    [/Le ministère de l'Intérieur et Algérie Télécom finalisent la numérisation complète/gi, 'وزارة الداخلية و Algérie Télécom تضعان اللمسات الأخيرة على الرقمنة الشاملة'],
    [/Grand Alger : Extension du réseau de métro et inauguration des nouvelles stations intermodales/gi, 'الجزائر الكبرى: توسيع شبكة المترو وتدشين محطات جديدة متعددة الوسائط'],
    [/Conseil des ministres : Nouvelles mesures pour l'appui aux startups et la transformation numérique/gi, 'مجلس الوزراء: تدابير جديدة لدعم الشركات الناشئة والتحول الرقمي'],
    [/Entrepreneuriat : Levée de fonds record pour les fintechs et plateformes de logistique maghrébines/gi, 'ريادة الأعمال: جولة تمويلية قياسية لشركات Fintech والمنصات اللوجستية المغاربية'],
    [/Banque d'Algérie : Hausse des exportations hors hydrocarbures et stabilité des réserves de change/gi, 'بنك الجزائر: ارتفاع الصادرات خارج المحروقات واستقرار احتياطي الصرف'],
    [/Éliminatoires Mondial 2026 : Victoire éclatante de la sélection nationale à Alger/gi, 'تصفيات كأس العالم 2026: فوز مستحق للمنتخب الوطني في الجزائر العاصمة'],
    [/Nouveau compilateur|New compiler/gi, 'مترجم جديد'],
    [/avec support|with support/gi, 'مع دعم'],
    [/sur Linux et Android|on Linux and Android/gi, 'على Linux و Android'],
    [/L'équipe de|The team at/gi, 'فريق'],
    [/déploie une mise à jour majeure|deploys a major update/gi, 'يطلق تحديثاً رئيسياً'],
    [/du moteur graphique sans saccades|of the jank-free graphics engine/gi, 'لمحرك الرسوميات فائق السلاسة دون تقطيع'],
    [/pour les applications mobiles|for mobile applications/gi, 'لتطبيقات Mobile'],

    // Technical phrases
    [/intelligence artificielle|artificial intelligence/gi, 'الذكاء الاصطناعي'],
    [/cybersécurité|cybersecurity/gi, 'الأمن السيبراني'],
    [/open source|logiciel libre/gi, 'مفتوح المصدر'],
    [/machine learning/gi, 'التعلم الآلي'],
    [/deep learning/gi, 'التعلم العميق'],
    [/centres de données|data centers|datacenter/gi, 'مراكز البيانات'],
    [/vulnérabilité critique|critical vulnerability/gi, 'ثغرة أمنية حرجة'],
    [/vulnérabilité|faille|vulnerability/gi, 'ثغرة أمنية'],
    [/advisory|bulletin de sécurité/gi, 'نشرة أمنية تحذيرية'],
    [/mise à jour majeure|major update/gi, 'تحديث رئيسي'],
    [/mise à jour|update/gi, 'تحديث'],
    [/nouvelle version|new version/gi, 'إصدار جديد'],
    [/nouveau modèle|new model/gi, 'نموذج جديد'],
    [/moteur de rendu|rendering engine/gi, 'محرك رسم'],
    [/moteur d'inférence|inference engine/gi, 'محرك استدلال'],
    [/haute performance|high performance/gi, 'أداء عالي'],
    [/temps de réponse|latency/gi, 'زمن الاستجابة'],
    [/bande passante|bandwidth/gi, 'عرض النطاق الترددي'],
    [/connexion haut débit|broadband/gi, 'اتصال عالي السرعة'],
    [/réseau électrique|power grid/gi, 'الشبكة الكهربائية'],
    [/énergie renouvelable|renewable energy/gi, 'طاقة متجددة'],
    [/énergies renouvelables/gi, 'الطاقات المتجددة'],
    [/panneaux solaires|solar panels/gi, 'ألواح شمسية'],
    [/transition énergétique/gi, 'الانتقال الطاقوي'],
    [/télémédecine/gi, 'الطب الاتصالي عن بُعد'],
    [/dossier médical électronique/gi, 'الملف الطبي الإلكتروني'],
    [/recherche spatiale/gi, 'أبحاث الفضاء'],
    [/données satellitaires/gi, 'بيانات الأقمار الصناعية'],
    [/nappes phréatiques/gi, 'المياه الجوفية'],
    [/lutte contre la désertification/gi, 'مكافحة التصحر'],

    // Institutions & States
    [/Président de la République/gi, 'رئيس الجمهورية'],
    [/Premier ministre/gi, 'الوزير الأول'],
    [/Conseil des ministres/gi, 'مجلس الوزراء'],
    [/ministère de l'Intérieur/gi, 'وزارة الداخلية'],
    [/ministère de la Santé/gi, 'وزارة الصحة'],
    [/ministère de l'Économie/gi, 'وزارة الاقتصاد'],
    [/ministère de l'Enseignement supérieur/gi, 'وزارة التعليم العالي'],
    [/ministre/gi, 'وزير'],
    [/ministère/gi, 'وزارة'],
    [/gouvernement/gi, 'الحكومة'],
    [/Banque d'Algérie/gi, 'بنك الجزائر'],
    [/Algérie Télécom/gi, 'Algérie Télécom'],
    [/Air Algérie/gi, 'Air Algérie'],
    [/Grand Alger/gi, 'الجزائر الكبرى'],
    [/Alger/gi, 'الجزائر العاصمة'],
    [/Oran/gi, 'وهران'],
    [/Constantine/gi, 'قسنطينة'],
    [/Annaba/gi, 'عنابة'],

    // Economy & Society
    [/Actualité internationale|International news/gi, 'أخبار دولية'],
    [/Actualités|News/gi, 'أخبار'],
    [/économie|economy/gi, 'اقتصاد'],
    [/finances/gi, 'مالية'],
    [/croissance économique/gi, 'نمو اقتصادي'],
    [/investissements|investments/gi, 'استثمارات'],
    [/levée de fonds|funding round/gi, 'جولة تمويلية'],
    [/partenariat stratégique/gi, 'شراكة استراتيجية'],
    [/politique/gi, 'سياسة'],
    [/société/gi, 'مجتمع'],
    [/santé publique/gi, 'صحة عمومية'],
    [/santé/gi, 'صحة'],
    [/climat/gi, 'مناخ'],
    [/environnement/gi, 'بيئة'],
    [/éducation/gi, 'تعليم'],
    [/université/gi, 'جامعة'],
    [/étudiants/gi, 'طلاب'],
    [/recherche scientifique/gi, 'بحث علمي'],
    [/sport|sports/gi, 'رياضة'],
    [/football/gi, 'كرة القدم'],
    [/culture/gi, 'ثقافة'],
    [/patrimoine/gi, 'تراث'],
    [/tourisme/gi, 'سياحة'],
    [/technologie|technology/gi, 'تكنولوجيا'],
    [/numérique|digital/gi, 'رقمي'],
    [/innovation/gi, 'ابتكار'],
    [/\b(et|and)\b/gi, 'و'],
    [/\b(sur|on)\b/gi, 'على'],
    [/\b(dans|in)\b/gi, 'في'],
    [/\b(avec|with)\b/gi, 'مع'],
    [/\b(pour|for)\b/gi, 'لـ'],
    [/\b(par|by)\b/gi, 'بواسطة'],
    [/\b(vers|towards)\b/gi, 'نحو'],
    [/\b(sans|without)\b/gi, 'بدون'],
    [/\b(entre|between)\b/gi, 'بين'],
    [/\bl['’]équipe de\b|\bl équipe de\b/gi, 'فريق'],
    [/\bles\b|\ble\b|\bla\b|\bl['’]\b/gi, ''],
    [/\bthe\b/gi, ''],
  ];

  for (const [re, rep] of dictionary) {
    masked = masked.replace(re, rep);
  }

  preserved.forEach((term, idx) => {
    masked = masked.replace(new RegExp(`__TECH_TERM_${idx}__`, 'g'), term);
  });

  return masked;
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
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
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
      const lang = String(req.query.lang || 'fr');
      const cacheKey = `${country}:${category}:${lang}`;
      const cached = serverNewsCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS && cached.data.length > 0) {
        return res.json(cached.data);
      }

      // If category is 'all', query top headline topics rather than all 18 topics to avoid rate limits
      const topics = category === 'all'
        ? ['world', 'technology', 'economy', 'politics', 'science', 'sports']
        : [category];

      // Limit concurrent queries by slicing sources to top trusted news outlets
      const sourceList = COUNTRY_SOURCES[country] || COUNTRY_SOURCES.all;
      const activeSources = sourceList.slice(0, 3);

      const batches = await Promise.allSettled(
        topics.flatMap((topic) =>
          activeSources.map((source) =>
            fetchRssSource(source, RSS_TOPICS[topic] || topic, country === 'all' ? 'dz' : country)
          )
        )
      );
      const articles = batches.flatMap((batch) => (batch.status === 'fulfilled' ? batch.value : []));
      const unique = new Map<string, any>();
      for (const article of articles) {
        if (country !== 'all' && article.country !== country && article.country !== 'all') continue;
        const key = article.url.replace(/#.*$/, '').replace(/\/$/, '');
        if (!unique.has(key)) unique.set(key, article);
      }

      let result = Array.from(unique.values()).sort(
        (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
      );

      // If requested language is Arabic, translate titles & descriptions if not already in Arabic
      if (lang === 'ar' && result.length > 0) {
        result = result.map((item) => {
          const isAlreadyArabic = /[\u0600-\u06FF]/.test(item.title);
          const translatedTitle = isAlreadyArabic ? item.title : translateToArabicWithTechPreserved(item.title);
          const translatedDesc = isAlreadyArabic ? item.description : translateToArabicWithTechPreserved(item.description);
          return {
            ...item,
            translatedTitle,
            translatedDescription: translatedDesc,
            title: translatedTitle,
            description: translatedDesc,
          };
        });
      }

      if (result.length > 0) {
        serverNewsCache.set(cacheKey, { timestamp: Date.now(), data: result });
      } else if (cached && cached.data.length > 0) {
        // Fallback to previous cache if live fetch yielded 0 temporarily
        return res.json(cached.data);
      }

      res.json(result);
    } catch (error) {
      console.error('[api/news/aggregate]', error);
      const cacheKey = `${req.query.country || 'all'}:${req.query.category || 'all'}:${req.query.lang || 'fr'}`;
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
        if (translated) {
          return res.json({ text: translated });
        }
        if (targetLang === 'ar') {
          return res.json({ text: translateToArabicWithTechPreserved(text) });
        }
        return res.status(502).json({ error: 'Empty response from translation models' });
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

      let parsed: Record<string, unknown> | null = null;
      try {
        const responseText = await generateText(prompt, 'application/json');
        if (responseText) {
          parsed = JSON.parse(responseText) as Record<string, unknown>;
        }
      } catch (err) {
        console.warn('[api/translate] AI generation fallback:', err);
      }

      if (targetLang === 'ar') {
        const fallbackTitle = translateToArabicWithTechPreserved(title);
        const fallbackDesc = translateToArabicWithTechPreserved(description || '');
        const fallbackContent = content ? translateToArabicWithTechPreserved(String(content)) : undefined;

        return res.json({
          title: (parsed?.title as string) || fallbackTitle,
          description: (parsed?.description as string) || fallbackDesc,
          content: (parsed?.content as string) || fallbackContent || content,
        });
      }

      if (parsed) {
        return res.json({
          title: parsed.title || title,
          description: parsed.description || description,
          content: parsed.content || content,
        });
      }

      return res.json({
        title,
        description,
        content,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to translate';
      console.error('[api/translate]', message);
      return res.json({
        title: req.body?.title ? translateToArabicWithTechPreserved(req.body.title) : '',
        description: req.body?.description ? translateToArabicWithTechPreserved(req.body.description) : '',
      });
    }
  });

  app.post('/api/translate/batch', async (req, res) => {
    try {
      const { items, targetLang } = req.body ?? {};
      if (!Array.isArray(items) || items.length === 0) {
        return res.json({ items: [] });
      }

      if (targetLang === 'ar') {
        const translatedItems = items.map((it: any) => ({
          id: it.id,
          title: translateToArabicWithTechPreserved(it.title || ''),
          description: translateToArabicWithTechPreserved(it.description || ''),
          content: it.content ? translateToArabicWithTechPreserved(it.content) : undefined,
        }));
        return res.json({ items: translatedItems });
      }

      return res.json({ items });
    } catch (e) {
      return res.status(500).json({ error: 'Batch translation failed' });
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