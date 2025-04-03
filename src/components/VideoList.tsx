import { useEffect, useState } from "react";
import VideoCard from "./VideoCard";
import axios from 'axios';
import toast from 'react-hot-toast';

interface Video {
  _id: string;
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  source: string;
  url: string;
  publishedAt: string;
  category: string;
  views: number;
  likes: number;
  isDeepfake: boolean | null;
  deepfakeScore: number | null;
  analyzed: boolean;
  details?: {
    metadata_score: number;
    visual_artifacts_score: number;
    audio_sync_score: number;
  };
}

const VideoList = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:5000/videos');
        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleRefreshAnalysis = async (videoId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/videos/${videoId}/submit-analysis`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh analysis');
      }
      
      const updatedVideo = await response.json();
      
      // Update the video in state
      setVideos(prevVideos => 
        prevVideos.map(video => 
          video.id === videoId ? updatedVideo : video
        )
      );
      
    } catch (error) {
      console.error('Error refreshing analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (videoId: string) => {
    try {
      // 1. Get fresh token (avoid stale token from localStorage)
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (!token) {
        toast.error("Login to like videos.", {
          id: `login-first-video`, // To prevent duplicates
          duration: 2000, // 2 seconds
          position: 'bottom-center',
        });
        throw new Error('No authentication token found');
      }

      // 2. Make request with debug logs
      console.log('Using token:', token.slice(0, 10) + '...'); // Log partial token
      const response = await axios.post(
        `http://localhost:8000/api/user/videos/${videoId}/like`,
        {
          userId: userId, // Replace with the actual user ID
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Replace 'token' with the actual token variable
          }
        }
      );            
      console.log(response)
  
      // if (!response.ok) throw new Error("Failed to like article");
      if (response.data.success === true) {
        const response = await fetch(`http://localhost:5000/api/videos/${videoId}/like`, {
          method: "POST",
        });
    
        if (!response.ok) throw new Error("Failed to like article");
        const updatedVideo = await response.json();
    
        setVideos(prevVideos =>
          prevVideos.map(prevVideo =>
            prevVideo.id === videoId ? { ...prevVideo, likes: updatedVideo.likes } : prevVideo
          )
        );
    
        console.log(`Liked article: ${updatedVideo.title}`);
        toast.success(`Liked "${updatedVideo.title}"`, {
          id: `liked-${videoId}`, // To prevent duplicates
          duration: 2000, // 2 seconds
          position: 'bottom-center',
        });
      }
      else {
        toast.error("You've already liked this video", {
          id: `already-liked-${videoId}`, // To prevent duplicates
          duration: 2000, // 2 seconds
          position: 'bottom-center',
        });
      }
    } catch (error) {
      console.error("Error liking video:", error);
    }
  };

  useEffect(() => {
    const analyzeVideos = async (videos: Video[]) => {
      for (const video of videos) {
        if (!video.analyzed) {
          try {
            const response = await fetch(`http://localhost:5000/api/videos/${video.id}/submit-analysis`, {
              method: 'POST'
            });
            if (!response.ok) {
              console.error(`Failed to analyze video ${video.id}`);
            }
          } catch (error) {
            console.error(`Error analyzing video ${video.id}:`, error);
          }
        }
      }
    };
  
    if (videos.length > 0) {
      analyzeVideos(videos);
    }
  }, [videos]);

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 lg:py-12 max-w-7xl">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          Featured Videos
          <span className="ml-2 text-sm font-normal text-muted-foreground align-middle">
            {videos.length} videos
          </span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Browse news videos with deepfake detection analysis
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-12 h-12 rounded-full border-4 border-muted border-t-primary animate-spin"></div>
          <p className="mt-4 text-muted-foreground font-medium">Loading videos...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="bg-card rounded-lg p-8 text-center border border-border">
          <p className="text-card-foreground text-lg">No videos found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard
              key={video._id}
              video={video}
              onLike={handleLike}
              onRefreshAnalysis={handleRefreshAnalysis}
            />
          ))}
        </div>
      )}

      <div className="mt-8 py-4 border-t border-border text-center text-muted-foreground text-sm">
        <p>Videos updated daily • Deepfake detection powered by AI</p>
      </div>
    </div>
  );
};

export default VideoList;