// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3e3;
  app.use(express.json({ limit: "10mb" }));
  let ai = null;
  try {
    ai = new GoogleGenAI();
  } catch (err) {
    console.warn("GoogleGenAI initialization notice:", err);
  }
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, lang } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required" });
      }
      if (!ai) {
        ai = new GoogleGenAI();
      }
      const voiceName = lang === "ar" ? "Zephyr" : "Puck";
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash-lite-tts",
        contents: text.slice(0, 1500),
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            }
          }
        }
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      const mimeType = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || "audio/wav";
      if (!base64Audio) {
        return res.status(502).json({ error: "No audio returned from Gemini TTS" });
      }
      return res.json({
        audioBase64: base64Audio,
        mimeType
      });
    } catch (error) {
      console.error("Server-side TTS error:", error?.message || error);
      return res.status(500).json({
        error: error?.message || "Failed to generate audio via Gemini TTS"
      });
    }
  });
  app.post("/api/translate", async (req, res) => {
    try {
      const { title, description, content, targetLang } = req.body;
      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }
      if (!ai) {
        ai = new GoogleGenAI();
      }
      const langMap = {
        ar: "Arabic (\u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0635\u062D\u0649 \u0627\u0644\u062D\u062F\u064A\u062B\u0629)",
        fr: "French (Fran\xE7ais)",
        es: "Spanish (Espa\xF1ol)",
        de: "German (Deutsch)",
        ja: "Japanese (\u65E5\u672C\u8A9E)",
        en: "English"
      };
      const langName = langMap[targetLang] || "Arabic (\u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0635\u062D\u0649)";
      const prompt = `Translate this tech news article into ${langName}.
Maintain all technical terms (Flutter, CVE, Linux, API, LLM, etc.) and write natural, fluent journalistic prose.

Input:
Title: ${title}
Description: ${description || ""}
Content: ${content ? content.slice(0, 1800) : ""}

Respond with a JSON object strictly adhering to this schema:
{
  "title": "translated title",
  "description": "translated description",
  "content": "translated content"
}`;
      let responseText = null;
      const candidateModels = ["gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.8-flash"];
      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: "application/json"
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
        return res.status(502).json({ error: "Empty response from translation models" });
      }
      const parsed = JSON.parse(responseText);
      return res.json({
        title: parsed.title || title,
        description: parsed.description || description,
        content: parsed.content || content
      });
    } catch (error) {
      console.error("Translation API error:", error?.message || error);
      return res.status(500).json({
        error: error?.message || "Failed to translate"
      });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
