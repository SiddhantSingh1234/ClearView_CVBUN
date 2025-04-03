// src/components/__tests__/VideoList.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoList from '../VideoList';

// Mock the VideoCard component
jest.mock('../VideoCard', () => {
  return function MockVideoCard({ video, onLike, onRefreshAnalysis }) {
    return (
      <div data-testid={`video-card-${video.id}`}>
        <h3>{video.title}</h3>
        <button onClick={() => onLike(video.id)}>Like</button>
        {onRefreshAnalysis && (
          <button onClick={() => onRefreshAnalysis(video.id)}>Refresh Analysis</button>
        )}
      </div>
    );
  };
});

describe('VideoList Component', () => {
  const mockVideos = [
    {
      _id: 'mongo123',
      id: 'video123',
      title: 'Test Video 1',
      description: 'Description 1',
      videoUrl: 'https://example.com/video1.mp4',
      thumbnailUrl: 'https://example.com/thumb1.jpg',
      duration: '5:30',
      source: 'Source 1',
      url: 'https://example.com/video1',
      publishedAt: '2023-01-01T12:00:00Z',
      category: 'Technology',
      views: 1000,
      likes: 100,
      isDeepfake: null,
      deepfakeScore: null,
      analyzed: false
    },
    {
      _id: 'mongo456',
      id: 'video456',
      title: 'Test Video 2',
      description: 'Description 2',
      videoUrl: 'https://example.com/video2.mp4',
      thumbnailUrl: 'https://example.com/thumb2.jpg',
      duration: '10:15',
      source: 'Source 2',
      url: 'https://example.com/video2',
      publishedAt: '2023-01-02T12:00:00Z',
      category: 'Entertainment',
      views: 2000,
      likes: 200,
      isDeepfake: true,
      deepfakeScore: 75,
      analyzed: true
    }
  ];

  beforeEach(() => {
    // Reset fetch mock
    global.fetch = jest.fn();
  });

  it('fetches and displays videos', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockVideos
    });

    render(<VideoList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Video 1')).toBeInTheDocument();
      expect(screen.getByText('Test Video 2')).toBeInTheDocument();
    });
    
    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:5000/videos');
  });

  it('handles like functionality', async () => {
    // Mock initial fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockVideos
    });

    // Mock like API call
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockVideos[0],
        likes: 101
      })
    });

    render(<VideoList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Video 1')).toBeInTheDocument();
    });
    
    // Click like button on first video
    fireEvent.click(screen.getAllByText('Like')[0]);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/videos/video123/like',
        { method: 'POST' }
      );
    });
  });

  it('handles refresh analysis functionality', async () => {
    // Mock initial fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockVideos
    });

    // Mock refresh analysis API call
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockVideos[0],
        analyzed: true,
        isDeepfake: false,
        deepfakeScore: 20
      })
    });

    render(<VideoList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Video 1')).toBeInTheDocument();
    });
    
    // Click refresh analysis button on first video
    fireEvent.click(screen.getAllByText('Refresh Analysis')[0]);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/videos/video123/submit-analysis',
        { method: 'POST' }
      );
    });
  });

  it('handles fetch error gracefully', async () => {
    // Mock fetch error
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    
    console.error = jest.fn(); // Mock console.error to prevent test output noise
    
    render(<VideoList />);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching videos:',
        expect.any(Error)
      );
    });
  });
});