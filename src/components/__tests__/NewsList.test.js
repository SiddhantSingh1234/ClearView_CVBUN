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

describe('NewsList Component', () => {
  const mockArticles = [
    {
      id: 'article1',
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
      json: async () => ({ articles: mockArticles })
    });

    renderWithRouter(<NewsList />);
    
    await waitFor(() => {
      expect(screen.getByText('Technology News')).toBeInTheDocument();
      expect(screen.getByText('Politics News')).toBeInTheDocument();
    });
    
    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:5000/news');
  });

  it('filters articles by category', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ articles: mockArticles })
    });

    renderWithRouter(<NewsList />);
    
    await waitFor(() => {
      expect(screen.getByText('Technology News')).toBeInTheDocument();
      expect(screen.getByText('Politics News')).toBeInTheDocument();
    });
    
    // Select only Technology category
    fireEvent.click(screen.getByText('Select Tech'));
    
    // Only Technology article should be visible
    expect(screen.getByText('Technology News')).toBeInTheDocument();
    expect(screen.queryByText('Politics News')).not.toBeInTheDocument();
    
    // Clear filters
    fireEvent.click(screen.getByText('Clear'));
    
    // All articles should be visible again
    expect(screen.getByText('Technology News')).toBeInTheDocument();
    expect(screen.getByText('Politics News')).toBeInTheDocument();
  });

  it('handles like functionality', async () => {
    // Mock initial fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ articles: mockArticles })
    });

    // Mock like API call
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
    fireEvent.click(screen.getAllByText('Like')[0]);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/articles/article1/like',
        { method: 'POST' }
      );
    });
  });

  it('handles share functionality', async () => {
    // Mock initial fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ articles: mockArticles })
    });

    // Mock navigator.share
    const originalShare = navigator.share;
    navigator.share = jest.fn().mockResolvedValue(undefined);

    renderWithRouter(<NewsList />);
    
    await waitFor(() => {
      expect(screen.getByText('Technology News')).toBeInTheDocument();
    });
    
    // Click share button on first article
    fireEvent.click(screen.getAllByText('Share')[0]);
    
    expect(navigator.share).toHaveBeenCalledWith({
      title: 'Technology News',
      text: 'Latest in tech',
      url: 'https://example.com/tech'
    });
    
    // Restore original navigator.share
    navigator.share = originalShare;
  });

  it('handles fetch error gracefully', async () => {
    // Mock fetch error
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    
    console.error = jest.fn(); // Mock console.error
    
    renderWithRouter(<NewsList />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading articles. Please try again later.')).toBeInTheDocument();
    });
    
    expect(console.error).toHaveBeenCalled();
  });

  it('fetches article analysis data', async () => {
    // Mock initial articles fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ articles: mockArticles })
    });
    
    // Mock analysis API calls
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ left: 30, right: 70 })
    });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ real: 80, fake: 20 })
    });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ positive: 60, neutral: 30, negative: 10 })
    });

    renderWithRouter(<NewsList />);
    
    await waitFor(() => {
      expect(screen.getByText('Technology News')).toBeInTheDocument();
    });
    
    // Wait for analysis data to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText(/Political: L30% R70%/)).toBeInTheDocument();
      expect(screen.getByText(/Fake: 20%/)).toBeInTheDocument();
      expect(screen.getByText(/Sentiment: P60%/)).toBeInTheDocument();
    });
    
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/articles/article1/political-bias'
    );
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/articles/article1/fake-news'
    );
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/articles/article1/sentiment'
    );
  });
});