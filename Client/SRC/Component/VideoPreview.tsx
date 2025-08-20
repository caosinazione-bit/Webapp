import { YouTubeVideoData } from "@shared/schema";
import { Video } from "lucide-react";

interface VideoPreviewProps {
  videoData: YouTubeVideoData | null;
}

export function VideoPreview({ videoData }: VideoPreviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Anteprima Video</h3>
      
      {/* Video Thumbnail */}
      {videoData ? (
        <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center mb-4 overflow-hidden">
          <img
            src={videoData.thumbnails.high?.url || videoData.thumbnails.medium?.url || videoData.thumbnails.default?.url}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center mb-4">
          <div className="text-center">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Inserisci URL per vedere l'anteprima</p>
          </div>
        </div>
      )}

      {/* Video Info */}
      {videoData ? (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800 line-clamp-2">{videoData.title}</h4>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{videoData.viewCount} visualizzazioni</span>
            <span>{videoData.duration}</span>
            <span>{new Date(videoData.publishedAt).toLocaleDateString('it-IT')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                {videoData.channelTitle.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700">{videoData.channelTitle}</span>
            {videoData.subscriberCount && (
              <span className="text-sm text-gray-500">{videoData.subscriberCount} iscritti</span>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex space-x-4">
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
}
