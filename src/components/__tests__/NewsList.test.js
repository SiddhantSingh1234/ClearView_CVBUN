// src/components/__tests__/NewsList.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewsList from '../NewsList';
import { BrowserRouter } from 'react-router-dom';

// Mock the ArticleCard component
jest.mock('../ArticleCard', () => {
  return function MockArticleCard({ article, percentage, fakeNewsPercentage, sentimentNewsScore, onLike, onShare }) {
    return (
      <div data-testid={`article-card-${article.id}`}>
        <h3>{article.title}</h3>
        <p>{article.source}</p>
        <div>
          {percentage && <span>Political: L{percentage.left}% R{percentage.right}%</span>}
          {fakeNewsPercentage && <span>Fake: {fakeNewsPercentage.fake}%</span>}
          {sentimentNewsScore && <span>Sentiment: P{sentimentNewsScore.positive}%</span>}
        </div>
        <button onClick={() => onLike(article.id)}>Like</button>
        <button onClick={() => onShare(article.id)}>Share</button>
      </div>
    );
  };
});

// Mock CategoryFilter component
jest.mock('../CategoryFilter', () => {
  return function MockCategoryFilter({ categories, selectedCategories, onCategoryChange }) {
    return (
      <div data-testid="category-filter">
        <span>Categories: {selectedCategories.join(', ')}</span>
        <button onClick={() => onCategoryChange(['Technology'])}>Select Tech</button>
        <button onClick={() => onCategoryChange([])}>Clear</button>
      </div>
    );
  };
});

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn().mockResolvedValue({ data: { success: true } })
}));

// Mock toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

describe('NewsList Component', () => {
  const mockArticles = [
    {
      id: 'article1',
      _id: 'article1',
      title: 'Technology News',
      description: 'Latest in tech',
      content: 'Full tech content',
      source: 'Tech Source',
      author: 'Tech Author',
      url: 'https://example.com/tech',
      urlToImage: 'https://example.com/tech.jpg',
      publishedAt: '2023-01-10T12:00:00Z',
      category: 'Technology',
      likes: 10,
      comments: 5
    },
    {
      id: 'article2',
      _id: 'article2',
      title: 'Politics News',
      description: 'Latest in politics',
      content: 'Full politics content',
      source: 'Politics Source',
      author: 'Politics Author',
      url: 'https://example.com/politics',
      urlToImage: 'https://example.com/politics.jpg',
      publishedAt: '2023-01-11T12:00:00Z',
      category: 'Politics',
      likes: 15,
      comments: 8
    }
  ];

  beforeEach(() => {
    global.fetch = jest.fn();
    localStorage.setItem = jest.fn();
    localStorage.getItem = jest.fn().mockImplementation((key) => {
      if (key === 'token') return 'fake-token';
      if (key === 'userId') return 'user123';
      return null;
    });
    
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve())
      }
    });
  });

  const renderWithRouter = (ui) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  it('renders loading state initially', () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ articles: [] })
    });

    renderWithRouter(<NewsList />);
    
    expect(screen.getByText('Loading articles...')).toBeInTheDocument();
  });

  it('fetches and displays articles', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockArticles
    });

    renderWithRouter(<NewsList />);
    
    await waitFor(() => {
      expect(screen.getByText('Technology News')).toBeInTheDocument();
      expect(screen.getByText('Politics News')).toBeInTheDocument();
    });
    
    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:5000/news');
  });

  // it('filters articles by category', async () => {
  //   // Mock initial articles fetch
  //   global.fetch.mockResolvedValueOnce({
  //     ok: true,
  //     json: async () => mockArticles
  //   });

  //   // Create a simplified version of the test
  //   const { rerender } = renderWithRouter(<NewsList />);
    
  //   // Wait for articles to load
  //   await waitFor(() => {
  //     expect(screen.getByText('Technology News')).toBeInTheDocument();
  //     expect(screen.getByText('Politics News')).toBeInTheDocument();
  //   });
    
  //   // Since the component doesn't have category filtering implemented yet,
  //   // we'll test that the CategoryFilter component is rendered with the correct props
  //   expect(screen.getByTestId('category-filter')).toBeInTheDocument();
    
  //   // Simulate clicking the "Select Tech" button from our mock
  //   const selectTechButton = screen.getByText('Select Tech');
  //   fireEvent.click(selectTechButton);
    
  //   // Verify that the categories text shows Technology is selected
  //   expect(screen.getByText('Categories: Technology')).toBeInTheDocument();
    
  //   // Simulate clicking the "Clear" button
  //   const clearButton = screen.getByText('Clear');
  //   fireEvent.click(clearButton);
    
  //   // Verify that no categories are selected
  //   expect(screen.getByText('Categories: ')).toBeInTheDocument();
  // });

  it('handles like functionality', async () => {
    // Mock initial fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockArticles
    });

    // Mock axios post for like
    const axios = require('axios');
    axios.post.mockResolvedValueOnce({
      data: { success: true }
    });

    // Mock fetch for the second part of like process
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockArticles[0],
        likes: 11
      })
    });

    renderWithRouter(<NewsList />);
    
    await waitFor(() => {
      expect(screen.getByText('Technology News')).toBeInTheDocument();
    });
    
    // Click like button on first article
    const likeButtons = screen.getAllByText('Like');
    fireEvent.click(likeButtons[0]);
    
    // Verify localStorage was accessed
    expect(localStorage.getItem).toHaveBeenCalledWith('token');
    expect(localStorage.getItem).toHaveBeenCalledWith('userId');
    
    // Verify axios was called with correct parameters
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/user/articles/article1/like',
        { userId: 'user123' },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer fake-token'
          }
        }
      );
    });
  });

  it('handles share functionality', async () => {
    // Mock initial fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockArticles
    });

    renderWithRouter(<NewsList />);
    
    await waitFor(() => {
      expect(screen.getByText('Technology News')).toBeInTheDocument();
    });
    
    // Click share button on first article
    const shareButtons = screen.getAllByText('Share');
    fireEvent.click(shareButtons[0]);
    
    // Verify clipboard API was called
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('/article/article1')
    );
    
    // Verify toast was called
    const toast = require('react-hot-toast');
    expect(toast.success).toHaveBeenCalledWith(
      "Article link copied to clipboard!",
      expect.objectContaining({
        id: 'shared-article1',
        duration: 2000,
        position: 'bottom-center'
      })
    );
  });

  it('handles fetch error gracefully', async () => {
    // Mock fetch error
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    
    // Mock console.error
    console.error = jest.fn();
    
    renderWithRouter(<NewsList />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading articles...')).not.toBeInTheDocument();
    });
    
    // Verify console.error was called
    expect(console.error).toHaveBeenCalled();
  });

  it('fetches article analysis data', async () => {
    // Mock initial articles fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockArticles
    });
    
    // Mock analysis API calls for political bias
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        left: 30, 
        "lean left": 10, 
        center: 20, 
        "lean right": 10, 
        right: 30 
      })
    });
    
    // Mock analysis API calls for fake news
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ true: 80, fake: 20 })
    });
    
    // Mock analysis API calls for sentiment
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        sentiment: "positive", 
        score: 0.8, 
        positive: 60, 
        neutral: 30, 
        negative: 10 
      })
    });

    renderWithRouter(<NewsList />);
    
    // Wait for articles to load
    await waitFor(() => {
      expect(screen.getByText('Technology News')).toBeInTheDocument();
    });
    
    // Verify fetch calls for analysis
    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:3000/analyse', expect.any(Object));
    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:4000/analyse_fake_news', expect.any(Object));
    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:7000/analyse_sentiment_analysis', expect.any(Object));
  });
});