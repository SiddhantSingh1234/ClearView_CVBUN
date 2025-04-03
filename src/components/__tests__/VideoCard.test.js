// src/components/__tests__/VideoCard.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoCard from '../VideoCard';

describe('VideoCard Component', () => {
  const mockVideo = {
    id: 'video123',
    title: 'Test Video Title',
    description: 'This is a test video description. #test',
    videoUrl: 'https://example.com/video.mp4',
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
    duration: '10:30',
    source: 'Test Source',
    publishedAt: new Date().toISOString(),
    views: 1500,
    likes: 120,
    isDeepfake: null,
    deepfakeScore: null,
    analyzed: false
  };

  const mockVideoWithAnalysis = {
    ...mockVideo,
    analyzed: true,
    isDeepfake: true,
    deepfakeScore: 75,
    details: {
      metadata_score: 0.6,
      visual_artifacts_score: 0.8,
      audio_sync_score: 0.7
    }
  };

  const mockOnLike = jest.fn();
  const mockOnRefreshAnalysis = jest.fn();

  beforeEach(() => {
    mockOnLike.mockReset();
    mockOnRefreshAnalysis.mockReset();
  });

  it('renders basic video information correctly', () => {
    render(<VideoCard video={mockVideo} onLike={mockOnLike} />);
    
    expect(screen.getByText('Test Video Title')).toBeInTheDocument();
    expect(screen.getByText('This is a test video description.')).toBeInTheDocument();
    expect(screen.getByText('Test Source')).toBeInTheDocument();
    expect(screen.getByText('1.5K views')).toBeInTheDocument();
    expect(screen.getByText('10:30')).toBeInTheDocument();
  });

  it('formats views correctly', () => {
    const videoWithManyViews = { ...mockVideo, views: 1500000 };
    render(<VideoCard video={videoWithManyViews} onLike={mockOnLike} />);
    
    expect(screen.getByText('1.5M views')).toBeInTheDocument();
  });

  it('formats date correctly for recent videos', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const videoFromYesterday = { ...mockVideo, publishedAt: yesterday.toISOString() };
    render(<VideoCard video={videoFromYesterday} onLike={mockOnLike} />);
    
    expect(screen.getByText('Yesterday')).toBeInTheDocument();
  });

  it('calls onLike when like button is clicked', () => {
    render(<VideoCard video={mockVideo} onLike={mockOnLike} />);
    
    const likeButton = screen.getByRole('button', { name: /like/i });
    fireEvent.click(likeButton);
    
    expect(mockOnLike).toHaveBeenCalledWith('video123');
  });

  it('displays deepfake analysis when available', () => {
    render(<VideoCard video={mockVideoWithAnalysis} onLike={mockOnLike} />);
    
    expect(screen.getByText('Deepfake Analysis')).toBeInTheDocument();
    expect(screen.getByText('Potential Deepfake')).toBeInTheDocument();
    expect(screen.getByText('Manipulation Score')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('calls onRefreshAnalysis when refresh button is clicked', () => {
    render(
      <VideoCard 
        video={mockVideo} 
        onLike={mockOnLike} 
        onRefreshAnalysis={mockOnRefreshAnalysis} 
      />
    );
    
    const analyzeButton = screen.getByRole('button', { name: /analyze/i });
    fireEvent.click(analyzeButton);
    
    expect(mockOnRefreshAnalysis).toHaveBeenCalledWith('video123');
  });
});