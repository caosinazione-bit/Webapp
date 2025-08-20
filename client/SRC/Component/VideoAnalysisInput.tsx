import { useState } from "react";
import { Button } from "@/Component/Ui/button";
import { Input } from "@/Component/Ui/input";
import { Label } from "@/Component/Ui/label";
import { Checkbox } from "@/Component/Ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { VideoAnalysis, AnalysisRequest } from "@shared/schema";
import { Search, Link } from "lucide-react";

interface VideoAnalysisInputProps {
  onAnalysisStart: () => void;
  onAnalysisComplete: (analysis: VideoAnalysis) => void;
  isAnalyzing: boolean;
  analysisProgress: number;
}

export function VideoAnalysisInput({
  onAnalysisStart,
  onAnalysisComplete,
  isAnalyzing,
  analysisProgress,
}: VideoAnalysisInputProps) {
  const [videoUrl, setVideoUrl] = useState("");
  const [includeCompetitorAnalysis, setIncludeCompetitorAnalysis] = useState(true);
  const [includeTrendingKeywords, setIncludeTrendingKeywords] = useState(true);
  const [includeThumbnailAnalysis, setIncludeThumbnailAnalysis] = useState(true);
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async (data: AnalysisRequest) => {
      const res = await apiRequest("POST", "/api/analyze-video", data);
      return res.json();
    },
    onSuccess: (data: VideoAnalysis) => {
      onAnalysisComplete(data);
      toast({
        title: "Analisi Completata",
        description: "Il tuo contenuto SEO è stato generato con successo!",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Errore nell'Analisi",
        description: error.message || "Si è verificato un errore durante l'analisi del video.",
      });
    },
  });

  const validateYouTubeUrl = (url: string): boolean => {
    const patterns = [
      /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]+/,
      /^https?:\/\/youtu\.be\/[\w-]+/,
      /^https?:\/\/(?:www\.)?youtube\.com\/embed\/[\w-]+/,
    ];
    return patterns.some(pattern => pattern.test(url));
  };

  const handleAnalyze = () => {
    if (!videoUrl.trim()) {
      toast({
        variant: "destructive",
        title: "URL Richiesto",
        description: "Inserisci l'URL del video YouTube da analizzare.",
      });
      return;
    }

    if (!validateYouTubeUrl(videoUrl)) {
      toast({
        variant: "destructive",
        title: "URL Non Valido",
        description: "Inserisci un URL valido di YouTube (youtube.com o youtu.be).",
      });
      return;
    }

    onAnalysisStart();
    analyzeMutation.mutate({
      videoUrl,
      includeCompetitorAnalysis,
      includeTrendingKeywords,
      includeThumbnailAnalysis,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Analizza Video YouTube</h2>
        <p className="text-gray-600">Inserisci l'URL del video YouTube per generare SEO ottimizzata automaticamente</p>
      </div>

      {/* URL Input */}
      <div className="mb-6">
        <Label htmlFor="youtube-url" className="block text-sm font-medium text-gray-700 mb-2">
          URL Video YouTube
        </Label>
        <div className="relative">
          <Input
            type="url"
            id="youtube-url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-youtube-red focus:border-transparent transition-colors"
            disabled={isAnalyzing}
          />
          <Link className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
        <p className="text-sm text-gray-500 mt-2">Supporta link da youtube.com e youtu.be</p>
      </div>

      {/* Analysis Options */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Opzioni di Analisi</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="competitor-analysis"
              checked={includeCompetitorAnalysis}
              onCheckedChange={(checked) => setIncludeCompetitorAnalysis(!!checked)}
              disabled={isAnalyzing}
            />
            <Label htmlFor="competitor-analysis" className="text-sm text-gray-700">
              Analisi competitori nella stessa nicchia
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="trending-keywords"
              checked={includeTrendingKeywords}
              onCheckedChange={(checked) => setIncludeTrendingKeywords(!!checked)}
              disabled={isAnalyzing}
            />
            <Label htmlFor="trending-keywords" className="text-sm text-gray-700">
              Suggerimenti per trending keywords
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="thumbnail-analysis"
              checked={includeThumbnailAnalysis}
              onCheckedChange={(checked) => setIncludeThumbnailAnalysis(!!checked)}
              disabled={isAnalyzing}
            />
            <Label htmlFor="thumbnail-analysis" className="text-sm text-gray-700">
              Analisi thumbnail competitors
            </Label>
          </div>
        </div>
      </div>

      {/* Analyze Button */}
      <Button
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        className="w-full bg-youtube-red hover:bg-youtube-dark text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        <Search className="w-4 h-4" />
        <span>{isAnalyzing ? "Analizzando..." : "Analizza Video"}</span>
      </Button>

      {/* Progress Indicator */}
      {isAnalyzing && (
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-youtube-red h-2 rounded-full transition-all duration-500" 
              style={{ width: `${analysisProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">Analizzando video con Google AI Studio...</p>
        </div>
      )}
    </div>
  );
}
