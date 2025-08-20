import { useState } from "react";
import { VideoAnalysisInput } from "@/components/VideoAnalysisInput";
import { VideoPreview } from "@/components/VideoPreview";
import { SEOResults } from "@/components/SEOResults";
import { YouTubeVideoData, SEOResults as SEOResultsType, VideoAnalysis } from "@shared/schema";

export default function Home() {
  const [videoData, setVideoData] = useState<YouTubeVideoData | null>(null);
  const [seoResults, setSeoResults] = useState<SEOResultsType | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const handleAnalysisComplete = (analysis: VideoAnalysis) => {
    setVideoData(analysis.videoData as YouTubeVideoData);
    setSeoResults(analysis.seoResults as SEOResultsType);
    setIsAnalyzing(false);
    setAnalysisProgress(100);
  };

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    // Simulate progress
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleNewAnalysis = () => {
    setVideoData(null);
    setSeoResults(null);
    setIsAnalyzing(false);
    setAnalysisProgress(0);
  };

  return (
    <div className="bg-gray-50 min-h-screen font-inter">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="text-youtube-red text-2xl">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-800">YouTube SEO Optimizer</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Powered by Google AI Studio</span>
              <div className="w-8 h-8 bg-youtube-red rounded-full flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <VideoAnalysisInput
            onAnalysisStart={handleAnalysisStart}
            onAnalysisComplete={handleAnalysisComplete}
            isAnalyzing={isAnalyzing}
            analysisProgress={analysisProgress}
          />
          <VideoPreview videoData={videoData} />
        </div>

        {seoResults && (
          <SEOResults 
            seoResults={seoResults} 
            onNewAnalysis={handleNewAnalysis}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="text-youtube-red">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <span className="text-gray-600">YouTube SEO Optimizer</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <a href="#" className="hover:text-youtube-red transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-youtube-red transition-colors">Termini di Servizio</a>
              <a href="#" className="hover:text-youtube-red transition-colors">Supporto</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
