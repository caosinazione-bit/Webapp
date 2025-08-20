import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const videoAnalyses = pgTable("video_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  videoUrl: text("video_url").notNull(),
  videoId: text("video_id").notNull(),
  videoTitle: text("video_title"),
  channelName: text("channel_name"),
  videoData: jsonb("video_data"),
  seoResults: jsonb("seo_results"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVideoAnalysisSchema = createInsertSchema(videoAnalyses).pick({
  videoUrl: true,
  videoId: true,
});

export type InsertVideoAnalysis = z.infer<typeof insertVideoAnalysisSchema>;
export type VideoAnalysis = typeof videoAnalyses.$inferSelect;

export interface YouTubeVideoData {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  subscriberCount?: string;
  thumbnails: {
    default: { url: string };
    medium: { url: string };
    high: { url: string };
  };
}

export interface SEOResults {
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  hashtags: string[];
  tags: string;
  tagsLength: number;
  thumbnailTips: string[];
  optimizationTips: Array<{
    category: string;
    title: string;
    description: string;
  }>;
}

export interface AnalysisRequest {
  videoUrl: string;
  includeCompetitorAnalysis?: boolean;
  includeTrendingKeywords?: boolean;
  includeThumbnailAnalysis?: boolean;
}
