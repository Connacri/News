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

const PORT = Number(process.env.PORT) || 3000;
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

let ai: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!ai) ai = new GoogleGenAI();
  return ai;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', env: IS_PROD ? 'production' : 'development' });
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
        contents: text.slice(0, 1500),
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
      const message = error instanceof Error ? error.message : 'Failed to generate audio via Gemini TTS';
      console.error('[api/tts]', message);
      return res.status(500).json({ error: message });
    }
  });

  app.post('/api/translate', async (req, res) => {
    try {
      const { title, description, content, targetLang } = req.body ?? {};
      if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: 'Title is required' });
      }

      const langName = LANG_NAMES[targetLang as string] ?? LANG_NAMES.ar;

      const prompt = [
        `Translate this tech news article into ${langName}.`,
        'Maintain all technical terms (Flutter, CVE, Linux, API, LLM, etc.) and write natural, fluent journalistic prose.',
        '',
        'Input:',
        `Title: ${title}`,
        `Description: ${description || ''}`,
        `Content: ${content ? String(content).slice(0, 1800) : ''}`,
        '',
        'Respond with a JSON object strictly adhering to this schema:',
        '{ "title": "translated title", "description": "translated description", "content": "translated content" }',
      ].join('\n');

      let responseText: string | null = null;
      for (const modelName of TRANSLATION_MODELS) {
        try {
          const response = await getClient().models.generateContent({
            model: modelName,
            contents: prompt,
            config: { responseMimeType: 'application/json' },
          });
          if (response.text) {
            responseText = response.text;
            break;
          }
        } catch (modelErr) {
          const msg = modelErr instanceof Error ? modelErr.message : String(modelErr);
          console.warn(`[api/translate] model ${modelName} unavailable, trying next: ${msg}`);
        }
      }

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
      server: { middlewareMode: true },
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