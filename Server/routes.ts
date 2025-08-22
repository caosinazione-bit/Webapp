import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { extractVideoId, getVideoData } from "./services/youtube";
import { generateSEOContent } from "./services/gemini";
import GoogleAnalyticsService from "./services/analytics";
import { z } from "zod";

const analyzeVideoSchema = z.object({
  videoUrl: z.string().url(),
  includeCompetitorAnalysis: z.boolean().optional(),
  includeTrendingKeywords: z.boolean().optional(),
  includeThumbnailAnalysis: z.boolean().optional(),
});

const analyticsConfigSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  redirectUri: z.string().url(),
  refreshToken: z.string().optional(),
});

const analyticsDataSchema = z.object({
  propertyId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
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

  // Google Analytics OAuth2 authorization URL
  app.post("/api/analytics/auth-url", async (req, res) => {
    try {
      const config = analyticsConfigSchema.parse(req.body);
      const analyticsService = new GoogleAnalyticsService(config);
      const authUrl = analyticsService.getAuthUrl();
      res.json({ authUrl });
    } catch (error: any) {
      console.error("Analytics auth URL error:", error);
      res.status(500).json({ message: error.message || "Failed to generate auth URL" });
    }
  });

  // Exchange authorization code for tokens
  app.post("/api/analytics/tokens", async (req, res) => {
    try {
      const { code, ...config } = req.body;
      if (!code) {
        return res.status(400).json({ message: "Authorization code is required" });
      }

      const analyticsService = new GoogleAnalyticsService(config);
      const tokens = await analyticsService.getTokensFromCode(code);
      res.json(tokens);
    } catch (error: any) {
      console.error("Analytics tokens error:", error);
      res.status(500).json({ message: error.message || "Failed to exchange tokens" });
    }
  });

  // Get analytics data
  app.post("/api/analytics/data", async (req, res) => {
    try {
      const { propertyId, startDate, endDate, ...config } = analyticsDataSchema.parse(req.body);
      const analyticsService = new GoogleAnalyticsService(config);
      const data = await analyticsService.getAnalyticsData(propertyId, startDate, endDate);
      res.json(data);
    } catch (error: any) {
      console.error("Analytics data error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch analytics data" });
    }
  });

  // Get real-time analytics data
  app.post("/api/analytics/realtime", async (req, res) => {
    try {
      const { propertyId, ...config } = req.body;
      if (!propertyId) {
        return res.status(400).json({ message: "Property ID is required" });
      }

      const analyticsService = new GoogleAnalyticsService(config);
      const data = await analyticsService.getRealTimeData(propertyId);
      res.json(data);
    } catch (error: any) {
      console.error("Real-time analytics error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch real-time data" });
    }
  });

  // Get top pages
  app.post("/api/analytics/top-pages", async (req, res) => {
    try {
      const { propertyId, startDate, endDate, limit = 10, ...config } = req.body;
      if (!propertyId || !startDate || !endDate) {
        return res.status(400).json({ message: "Property ID, start date, and end date are required" });
      }

      const analyticsService = new GoogleAnalyticsService(config);
      const data = await analyticsService.getTopPages(propertyId, startDate, endDate, limit);
      res.json(data);
    } catch (error: any) {
      console.error("Top pages error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch top pages" });
    }
  });

  // Get user demographics
  app.post("/api/analytics/demographics", async (req, res) => {
    try {
      const { propertyId, startDate, endDate, ...config } = analyticsDataSchema.parse(req.body);
      const analyticsService = new GoogleAnalyticsService(config);
      const data = await analyticsService.getUserDemographics(propertyId, startDate, endDate);
      res.json(data);
    } catch (error: any) {
      console.error("Demographics error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch demographics" });
    }
  });

  // Get traffic sources
  app.post("/api/analytics/traffic-sources", async (req, res) => {
    try {
      const { propertyId, startDate, endDate, ...config } = analyticsDataSchema.parse(req.body);
      const analyticsService = new GoogleAnalyticsService(config);
      const data = await analyticsService.getTrafficSources(propertyId, startDate, endDate);
      res.json(data);
    } catch (error: any) {
      console.error("Traffic sources error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch traffic sources" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
