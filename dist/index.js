// Server/index.ts
import express2 from "express";

// Server/routes.ts
import { createServer } from "http";

// Server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  analyses;
  constructor() {
    this.analyses = /* @__PURE__ */ new Map();
  }
  async createVideoAnalysis(analysis) {
    const id = randomUUID();
    const videoAnalysis = {
      id,
      videoUrl: analysis.videoUrl,
      videoId: analysis.videoId,
      videoTitle: analysis.videoData.title,
      channelName: analysis.videoData.channelTitle,
      videoData: analysis.videoData,
      seoResults: analysis.seoResults,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.analyses.set(id, videoAnalysis);
    return videoAnalysis;
  }
  async getVideoAnalysis(id) {
    return this.analyses.get(id);
  }
  async getVideoAnalysisByUrl(videoUrl) {
    return Array.from(this.analyses.values()).find(
      (analysis) => analysis.videoUrl === videoUrl
    );
  }
  async getAllVideoAnalyses() {
    return Array.from(this.analyses.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
};
var storage = new MemStorage();

// Server/services/youtube.ts
var YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY || "";
function extractVideoId(url) {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}
async function getVideoData(videoId) {
  if (!YOUTUBE_API_KEY) {
    throw new Error("YouTube API key not configured");
  }
  const videoUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet,statistics,contentDetails`;
  const channelUrl = `https://www.googleapis.com/youtube/v3/channels?key=${YOUTUBE_API_KEY}&part=statistics`;
  try {
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error(`YouTube API error: ${videoResponse.status}`);
    }
    const videoData = await videoResponse.json();
    if (!videoData.items || videoData.items.length === 0) {
      throw new Error("Video not found or is private/unavailable");
    }
    const video = videoData.items[0];
    const snippet = video.snippet;
    const statistics = video.statistics;
    let subscriberCount = "Unknown";
    try {
      const channelResponse = await fetch(channelUrl + `&id=${snippet.channelId}`);
      if (channelResponse.ok) {
        const channelData = await channelResponse.json();
        if (channelData.items && channelData.items.length > 0) {
          subscriberCount = formatNumber(channelData.items[0].statistics.subscriberCount);
        }
      }
    } catch (error) {
      console.warn("Could not fetch channel data:", error);
    }
    return {
      id: videoId,
      title: snippet.title,
      description: snippet.description,
      channelTitle: snippet.channelTitle,
      publishedAt: snippet.publishedAt,
      duration: formatDuration(video.contentDetails.duration),
      viewCount: formatNumber(statistics.viewCount),
      subscriberCount,
      thumbnails: snippet.thumbnails
    };
  } catch (error) {
    console.error("YouTube API error:", error);
    throw error;
  }
}
function formatNumber(num) {
  const number = parseInt(num);
  if (number >= 1e6) {
    return (number / 1e6).toFixed(1) + "M";
  }
  if (number >= 1e3) {
    return (number / 1e3).toFixed(1) + "K";
  }
  return number.toString();
}
function formatDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Server/services/gemini.ts
import { GoogleGenAI } from "@google/genai";
var GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
if (!GEMINI_API_KEY) {
  console.warn("Gemini API key not found. Set GEMINI_API_KEY environment variable.");
}
var ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
async function generateSEOContent(videoData, options = {}) {
  const systemPrompt = `Sei un esperto di YouTube SEO professionale. Analizza i dati del video forniti e genera contenuti SEO ottimizzati in italiano. Devi generare:

1. Un titolo SEO ottimizzato (60-100 caratteri) che sia accattivante e includa keywords rilevanti
2. Una descrizione completa (400-500 caratteri) con 3-5 hashtag integrati naturalmente
3. Una lista di tag separati da virgole (esattamente 500 caratteri totali)
4. 4-6 consigli specifici per la miniatura
5. 4 consigli di ottimizzazione video con categorie

Rispondi SOLO con JSON valido nel formato specificato.`;
  const userPrompt = `Video da analizzare:
Titolo: ${videoData.title}
Descrizione: ${videoData.description}
Canale: ${videoData.channelTitle}
Visualizzazioni: ${videoData.viewCount}
Durata: ${videoData.duration}

${options.includeCompetitorAnalysis ? "Includi analisi competitori nella stessa nicchia." : ""}
${options.includeTrendingKeywords ? "Includi keywords trending per il 2024." : ""}
${options.includeThumbnailAnalysis ? "Analizza thumbnails di successo nella nicchia." : ""}

Genera contenuti SEO professionali per massimizzare visibilit\xE0 e engagement.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            titleLength: { type: "number" },
            description: { type: "string" },
            descriptionLength: { type: "number" },
            hashtags: {
              type: "array",
              items: { type: "string" },
              minItems: 3,
              maxItems: 5
            },
            tags: { type: "string" },
            tagsLength: { type: "number" },
            thumbnailTips: {
              type: "array",
              items: { type: "string" },
              minItems: 4,
              maxItems: 6
            },
            optimizationTips: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" }
                },
                required: ["category", "title", "description"]
              },
              minItems: 4,
              maxItems: 4
            }
          },
          required: ["title", "titleLength", "description", "descriptionLength", "hashtags", "tags", "tagsLength", "thumbnailTips", "optimizationTips"]
        }
      },
      contents: userPrompt
    });
    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }
    const seoResults = JSON.parse(rawJson);
    seoResults.titleLength = seoResults.title.length;
    seoResults.descriptionLength = seoResults.description.length;
    seoResults.tagsLength = seoResults.tags.length;
    return seoResults;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`Failed to generate SEO content: ${error}`);
  }
}

// Server/routes.ts
import { z } from "zod";
var analyzeVideoSchema = z.object({
  videoUrl: z.string().url(),
  includeCompetitorAnalysis: z.boolean().optional(),
  includeTrendingKeywords: z.boolean().optional(),
  includeThumbnailAnalysis: z.boolean().optional()
});
async function registerRoutes(app2) {
  app2.post("/api/analyze-video", async (req, res) => {
    try {
      const { videoUrl, includeCompetitorAnalysis, includeTrendingKeywords, includeThumbnailAnalysis } = analyzeVideoSchema.parse(req.body);
      const videoId = extractVideoId(videoUrl);
      if (!videoId) {
        return res.status(400).json({ message: "Invalid YouTube URL" });
      }
      const existingAnalysis = await storage.getVideoAnalysisByUrl(videoUrl);
      if (existingAnalysis) {
        return res.json(existingAnalysis);
      }
      const videoData = await getVideoData(videoId);
      const seoResults = await generateSEOContent(videoData, {
        includeCompetitorAnalysis,
        includeTrendingKeywords,
        includeThumbnailAnalysis
      });
      const analysis = await storage.createVideoAnalysis({
        videoUrl,
        videoId,
        videoData,
        seoResults
      });
      res.json(analysis);
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ message: error.message || "Failed to analyze video" });
    }
  });
  app2.get("/api/video-preview/:videoId", async (req, res) => {
    try {
      const { videoId } = req.params;
      if (!videoId) {
        return res.status(400).json({ message: "Video ID is required" });
      }
      const videoData = await getVideoData(videoId);
      res.json(videoData);
    } catch (error) {
      console.error("Preview error:", error);
      res.status(500).json({ message: error.message || "Failed to get video preview" });
    }
  });
  app2.get("/api/analyses", async (req, res) => {
    try {
      const analyses = await storage.getAllVideoAnalyses();
      res.json(analyses);
    } catch (error) {
      console.error("History error:", error);
      res.status(500).json({ message: error.message || "Failed to get analysis history" });
    }
  });
  app2.get("/api/analysis/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const analysis = await storage.getVideoAnalysis(id);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      res.json(analysis);
    } catch (error) {
      console.error("Get analysis error:", error);
      res.status(500).json({ message: error.message || "Failed to get analysis" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// Server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  // Necessario per il deploy su GitHub Pages: il sito è servito sotto /Webapp/
  base: "/Webapp/",
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "SRC"),
      "@shared": path.resolve(import.meta.dirname, "Shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  // Root del client con capitalizzazione reale della repo
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// Server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/SRC/main.tsx"`,
        `src="/SRC/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// Server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
