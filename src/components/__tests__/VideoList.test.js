// src/components/__tests__/VideoList.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoList from '../VideoList';
import axios from 'axios';

// Mock dependencies
jest.mock('axios');
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

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
    // Reset mocks
    global.fetch = jest.fn();
    axios.post.mockReset();
    localStorage.clear();
    console.error = jest.fn(); // Mock console.error
    console.log = jest.fn(); // Mock console.log
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

  // it('handles like functionality', async () => {
  //   // Mock localStorage
  //   localStorage.setItem('token', 'fake-token');
  //   localStorage.setItem('userId', 'user123');
    
  //   // Mock initial fetch
  //   global.fetch.mockResolvedValueOnce({
  //     ok: true,
  //     json: async () => mockVideos
  //   });

  //   // Mock axios post response
  //   axios.post.mockResolvedValueOnce({
  //     data: { success: true }
  //   });

  //   // Mock like API call
  //   global.fetch.mockImplementationOnce(() => {
  //     return Promise.resolve({
  //       ok: true,
  //       json: async () => ({
  //         ...mockVideos[0],
  //         likes: 101
  //       })
  //     });
  //   });

  //   render(<VideoList />);
    
  //   await waitFor(() => {
  //     expect(screen.getByText('Test Video 1')).toBeInTheDocument();
  //   });
    
  //   // Click like button on first video
  //   fireEvent.click(screen.getAllByText('Like')[0]);
    
  //   // Just verify axios was called with any arguments
  //   await waitFor(() => {
  //     expect(axios.post).toHaveBeenCalled();
  //   }, { timeout: 2000 });
  // });

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
    
    render(<VideoList />);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching videos:',
        expect.any(Error)
      );
    });
  });

  // New tests to increase code coverage

  it('shows loading state while fetching videos', async () => {
    // Don't resolve the fetch immediately to keep loading state active
    global.fetch.mockImplementationOnce(() => new Promise(resolve => {
      setTimeout(() => {
        resolve({
          ok: true,
          json: async () => mockVideos
        });
      }, 100);
    }));

    render(<VideoList />);
    
    // Check for loading indicator
    expect(screen.getByText('Loading videos...')).toBeInTheDocument();
    
    // Wait for videos to load
    await waitFor(() => {
      expect(screen.getByText('Test Video 1')).toBeInTheDocument();
    });
  });

  it('shows empty state when no videos are returned', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    render(<VideoList />);
    
    await waitFor(() => {
      expect(screen.getByText('No videos found')).toBeInTheDocument();
    });
  });

  it('handles like functionality when user is not logged in', async () => {
    // Don't set localStorage token to simulate not logged in
    
    // Mock initial fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockVideos
    });

    render(<VideoList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Video 1')).toBeInTheDocument();
    });
    
    // Click like button on first video
    fireEvent.click(screen.getAllByText('Like')[0]);
    
    // Should show error and not make API call
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Error liking video:',
        expect.any(Error)
      );
    });
  });

  // it('handles already liked video scenario', async () => {
  //   // Mock localStorage
  //   localStorage.setItem('token', 'fake-token');
  //   localStorage.setItem('userId', 'user123');
    
  //   // Mock initial fetch
  //   global.fetch.mockResolvedValueOnce({
  //     ok: true,
  //     json: async () => mockVideos
  //   });

  //   // Mock axios post response for already liked
  //   axios.post.mockResolvedValueOnce({
  //     data: { success: false, message: 'Already liked' }
  //   });

  //   render(<VideoList />);
    
  //   await waitFor(() => {
  //     expect(screen.getByText('Test Video 1')).toBeInTheDocument();
  //   });
    
  //   // Click like button on first video
  //   fireEvent.click(screen.getAllByText('Like')[0]);
    
  //   // Just verify axios was called and fetch was only called once (for initial load)
  //   await waitFor(() => {
  //     expect(axios.post).toHaveBeenCalled();
  //     expect(global.fetch).toHaveBeenCalledTimes(1);
  //   }, { timeout: 2000 });
  // });

  it('handles refresh analysis error', async () => {
    // Mock initial fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockVideos
    });

    // Mock refresh analysis API call with error
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    render(<VideoList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Video 1')).toBeInTheDocument();
    });
    
    // Click refresh analysis button on first video
    fireEvent.click(screen.getAllByText('Refresh Analysis')[0]);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Error refreshing analysis:',
        expect.any(Error)
      );
    });
  });

  it('automatically analyzes unanalyzed videos', async () => {
    // Mock initial fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockVideos
    });

    // Mock analysis API call
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockVideos[0],
        analyzed: true
      })
    });

    render(<VideoList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Video 1')).toBeInTheDocument();
    });
    
    // Should automatically call analysis for unanalyzed video
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/videos/video123/submit-analysis',
        { method: 'POST' }
      );
    });
  });
});