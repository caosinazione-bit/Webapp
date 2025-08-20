import { GoogleGenAI } from "@google/genai";
import { SEOResults, YouTubeVideoData } from "@shared/schema";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";

if (!GEMINI_API_KEY) {
  console.warn("Gemini API key not found. Set GEMINI_API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function generateSEOContent(
  videoData: YouTubeVideoData,
  options: {
    includeCompetitorAnalysis?: boolean;
    includeTrendingKeywords?: boolean;
    includeThumbnailAnalysis?: boolean;
  } = {}
): Promise<SEOResults> {
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

Genera contenuti SEO professionali per massimizzare visibilità e engagement.`;

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
        },
      },
      contents: userPrompt,
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }

    const seoResults: SEOResults = JSON.parse(rawJson);
    
    // Validate and adjust character counts
    seoResults.titleLength = seoResults.title.length;
    seoResults.descriptionLength = seoResults.description.length;
    seoResults.tagsLength = seoResults.tags.length;

    return seoResults;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`Failed to generate SEO content: ${error}`);
  }
}
