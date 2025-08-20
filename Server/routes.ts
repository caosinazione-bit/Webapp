import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { extractVideoId, getVideoData } from "./services/youtube";
import { generateSEOContent } from "./services/gemini";
import { z } from "zod";

const analyzeVideoSchema = z.object({
  videoUrl: z.string().url(),
  includeCompetitorAnalysis: z.boolean().optional(),
  includeTrendingKeywords: z.boolean().optional(),
  includeThumbnailAnalysis: z.boolean().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Analyze YouTube video
  app.post("/api/analyze-video", async (req, res) => {
    try {
      const { videoUrl, includeCompetitorAnalysis, includeTrendingKeywords, includeThumbnailAnalysis } = analyzeVideoSchema.parse(req.body);

      // Extract video ID
      const videoId = extractVideoId(videoUrl);
      if (!videoId) {
        return res.status(400).json({ message: "Invalid YouTube URL" });
      }

      // Check if analysis already exists
      const existingAnalysis = await storage.getVideoAnalysisByUrl(videoUrl);
      if (existingAnalysis) {
        return res.json(existingAnalysis);
      }

      // Get video data from YouTube API
      const videoData = await getVideoData(videoId);

      // Generate SEO content with Gemini
      const seoResults = await generateSEOContent(videoData, {
        includeCompetitorAnalysis,
        includeTrendingKeywords,
        includeThumbnailAnalysis,
      });

      // Save analysis
      const analysis = await storage.createVideoAnalysis({
        videoUrl,
        videoId,
        videoData,
        seoResults,
      });

      res.json(analysis);
    } catch (error: any) {
      console.error("Analysis error:", error);
      res.status(500).json({ message: error.message || "Failed to analyze video" });
    }
  });

  // Get video preview data
  app.get("/api/video-preview/:videoId", async (req, res) => {
    try {
      const { videoId } = req.params;
      
      if (!videoId) {
        return res.status(400).json({ message: "Video ID is required" });
      }

      const videoData = await getVideoData(videoId);
      res.json(videoData);
    } catch (error: any) {
      console.error("Preview error:", error);
      res.status(500).json({ message: error.message || "Failed to get video preview" });
    }
  });

  // Get analysis history
  app.get("/api/analyses", async (req, res) => {
    try {
      const analyses = await storage.getAllVideoAnalyses();
      res.json(analyses);
    } catch (error: any) {
      console.error("History error:", error);
      res.status(500).json({ message: error.message || "Failed to get analysis history" });
    }
  });

  // Get specific analysis
  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const analysis = await storage.getVideoAnalysis(id);
      
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }

      res.json(analysis);
    } catch (error: any) {
      console.error("Get analysis error:", error);
      res.status(500).json({ message: error.message || "Failed to get analysis" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
