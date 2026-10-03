import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI Client
  let ai: GoogleGenAI | null = null;
  try {
    ai = new GoogleGenAI();
  } catch (err) {
    console.warn('GoogleGenAI initialization notice:', err);
  }

  // TTS Proxy Route: Generates studio-quality broadcast audio in French or Arabic
  app.post('/api/tts', async (req, res) => {
    try {
      const { text, lang } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text is required' });
      }

      if (!ai) {
        ai = new GoogleGenAI();
      }

      // Voice selection: French or Arabic broadcast persona
      const voiceName = lang === 'ar' ? 'Zephyr' : 'Puck';

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: text.slice(0, 1500),
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            }
          }
        }
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      const mimeType = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || 'audio/wav';

      if (!base64Audio) {
        return res.status(502).json({ error: 'No audio returned from Gemini TTS' });
      }

      return res.json({
        audioBase64: base64Audio,
        mimeType
      });
    } catch (error: any) {
      console.error('Server-side TTS error:', error?.message || error);
      return res.status(500).json({ 
        error: error?.message || 'Failed to generate audio via Gemini TTS' 
      });
    }
  });

  // Text Translation API: Translates article headlines and content using Gemini
  app.post('/api/translate', async (req, res) => {
    try {
      const { title, description, content, targetLang } = req.body;
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      if (!ai) {
        ai = new GoogleGenAI();
      }

      const langMap: Record<string, string> = {
        ar: 'Arabic (العربية الفصحى الحديثة)',
        fr: 'French (Français)',
        es: 'Spanish (Español)',
        de: 'German (Deutsch)',
        ja: 'Japanese (日本語)',
        en: 'English'
      };

      const langName = langMap[targetLang] || 'Arabic (العربية الفصحى)';

      const prompt = `Translate this tech news article into ${langName}.
Maintain all technical terms (Flutter, CVE, Linux, API, LLM, etc.) and write natural, fluent journalistic prose.

Input:
Title: ${title}
Description: ${description || ''}
Content: ${content ? content.slice(0, 1800) : ''}

Respond with a JSON object strictly adhering to this schema:
{
  "title": "translated title",
  "description": "translated description",
  "content": "translated content"
}`;

      let responseText: string | null = null;
      const candidateModels = ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: 'application/json'
            }
          });
          if (response.text) {
            responseText = response.text;
            break;
          }
        } catch (modelErr) {
          console.warn(`Model ${modelName} failed or busy, trying next...`);
        }
      }

      if (!responseText) {
        return res.status(502).json({ error: 'Empty response from translation models' });
      }

      const parsed = JSON.parse(responseText);
      return res.json({
        title: parsed.title || title,
        description: parsed.description || description,
        content: parsed.content || content
      });
    } catch (error: any) {
      console.error('Translation API error:', error?.message || error);
      return res.status(500).json({
        error: error?.message || 'Failed to translate'
      });
    }
  });

  // In development, attach Vite middlewares
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
