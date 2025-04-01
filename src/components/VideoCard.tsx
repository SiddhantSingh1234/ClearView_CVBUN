import { useState } from "react";

interface DeepfakeDetails {
  metadata_score: number;
  visual_artifacts_score: number;
  audio_sync_score: number;
}

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    duration: string;
    source: string;
    publishedAt: string;
    views: number;
    likes: number;
    isDeepfake: boolean | null;
    deepfakeScore: number | null;
    analyzed: boolean;
    details?: DeepfakeDetails;
  };
  onLike: (id: string) => void;
  onRefreshAnalysis?: (id: string) => void;  // Added this line
}

const VideoCard = ({ video, onLike, onRefreshAnalysis }: VideoCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const formatDescription = (description: string) => {
    const hashIndex = Math.min(description.indexOf('#'), description.indexOf('.'));
    if (hashIndex === -1) return description;
    return description.substring(0, hashIndex).trim()+'.'; 
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  const renderDetailedAnalysis = () => {
    if (!video.details) return null;
    
    return (
      <div className="mt-3 space-y-2 text-xs text-muted-foreground">
        <div>
          <div className="flex justify-between mb-1">
            <span>Metadata Analysis</span>
            <span className={video.details.metadata_score > 0.5 ? 'text-red-500' : 'text-green-500'}>
              {Math.round(video.details.metadata_score * 100)}%
            </span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${video.details.metadata_score > 0.5 ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${video.details.metadata_score * 100}%` }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span>Visual Artifacts</span>
            <span className={video.details.visual_artifacts_score > 0.5 ? 'text-red-500' : 'text-green-500'}>
              {Math.round(video.details.visual_artifacts_score * 100)}%
            </span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${video.details.visual_artifacts_score > 0.5 ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${video.details.visual_artifacts_score * 100}%` }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span>Audio-Video Sync</span>
            <span className={video.details.audio_sync_score > 0.5 ? 'text-red-500' : 'text-green-500'}>
              {Math.round(video.details.audio_sync_score * 100)}%
            </span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${video.details.audio_sync_score > 0.5 ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${video.details.audio_sync_score * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300 group">
      {/* Video Thumbnail/Player Container */}
      <div className="relative aspect-video cursor-pointer" onClick={() => setIsPlaying(true)}>
        {!isPlaying ? (
          <>
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-8 h-8 text-primary translate-x-0.5"
                >
                  <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653Z" />
                </svg>
              </div>
            </div>
            <span className="absolute bottom-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-sm font-medium">
              {video.duration}
            </span>
          </>
        ) : (
          <iframe
            src={`${video.videoUrl}?autoplay=1`}
            title={video.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Source Avatar */}
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold">{video.source.slice(0, 3)}</span>
          </div>
          
          {/* Title and Meta */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base mb-1 line-clamp-2 leading-tight">
              {video.title}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground gap-2">
              <span>{video.source}</span>
              <span>•</span>
              <span>{formatViews(video.views)}</span>
              <span>•</span>
              <span>{formatDate(video.publishedAt)}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
          {formatDescription(video.description)}
        </p>

        {/* Deepfake Analysis Section */}
        {video.analyzed && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Deepfake Analysis
              </span>
              <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                video.isDeepfake 
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              }`}>
                {video.isDeepfake ? 'Potential Deepfake' : 'Likely Authentic'}
              </span>
            </div>
            
            {/* Overall Deepfake Score */}
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Manipulation Score</span>
                <span className={((video.deepfakeScore || 0) > 0.5) ? 'text-red-500' : 'text-green-500'}>
                  {Math.round((video.deepfakeScore || 0) * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    (video.deepfakeScore || 0) > 0.5 ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(video.deepfakeScore || 0) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Detailed Scores */}
            {renderDetailedAnalysis()}
            
            {/* Analysis Action */}
            {onRefreshAnalysis && (
              <button 
                onClick={() => onRefreshAnalysis(video.id)}
                className="mt-3 text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Refresh Analysis
              </button>
            )}
          </div>
        )}
        
        {/* Actions */}
        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={() => onLike(video.id)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
            {video.likes > 0 && <span>{video.likes}</span>}
          </button>
          
          <button
            onClick={() => window.open(video.videoUrl, '_blank')}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span>Watch on YouTube</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;