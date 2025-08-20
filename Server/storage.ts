import { type VideoAnalysis, type InsertVideoAnalysis, type YouTubeVideoData, type SEOResults } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createVideoAnalysis(analysis: InsertVideoAnalysis & { videoData: YouTubeVideoData; seoResults: SEOResults }): Promise<VideoAnalysis>;
  getVideoAnalysis(id: string): Promise<VideoAnalysis | undefined>;
  getVideoAnalysisByUrl(videoUrl: string): Promise<VideoAnalysis | undefined>;
  getAllVideoAnalyses(): Promise<VideoAnalysis[]>;
}

export class MemStorage implements IStorage {
  private analyses: Map<string, VideoAnalysis>;

  constructor() {
    this.analyses = new Map();
  }

  async createVideoAnalysis(analysis: InsertVideoAnalysis & { videoData: YouTubeVideoData; seoResults: SEOResults }): Promise<VideoAnalysis> {
    const id = randomUUID();
    const videoAnalysis: VideoAnalysis = {
      id,
      videoUrl: analysis.videoUrl,
      videoId: analysis.videoId,
      videoTitle: analysis.videoData.title,
      channelName: analysis.videoData.channelTitle,
      videoData: analysis.videoData as any,
      seoResults: analysis.seoResults as any,
      createdAt: new Date(),
    };
    this.analyses.set(id, videoAnalysis);
    return videoAnalysis;
  }

  async getVideoAnalysis(id: string): Promise<VideoAnalysis | undefined> {
    return this.analyses.get(id);
  }

  async getVideoAnalysisByUrl(videoUrl: string): Promise<VideoAnalysis | undefined> {
    return Array.from(this.analyses.values()).find(
      (analysis) => analysis.videoUrl === videoUrl
    );
  }

  async getAllVideoAnalyses(): Promise<VideoAnalysis[]> {
    return Array.from(this.analyses.values()).sort(
      (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }
}

export const storage = new MemStorage();
