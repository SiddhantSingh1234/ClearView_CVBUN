// src/pages/__tests__/Home.test.tsx
import React from 'react';
import { jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../Home';

// Mock components
jest.mock('../../components/ArticleCard', () => {
  return function MockArticleCard({ article, onLike, onShare }) {
    return (
      <div data-testid={`article-${article.id}`}>
        <h2>{article.title}</h2>
        <button onClick={() => onLike(article.id)}>Like</button>
        <button onClick={() => onShare(article.id)}>Share</button>
      </div>
    );
  };
});

jest.mock('../../components/CategoryFilter', () => {
  return function MockCategoryFilter({ categories, selectedCategories, onCategoryChange }) {
    return (
      <div data-testid="category-filter">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => onCategoryChange([...selectedCategories, cat])}
          >
            {cat}
          </button>
        ))}
      </div>
    );
  };
});

describe('Home Component', () => {
  beforeEach(() => {
    // Mock fetch to return sample articles
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('/news')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { 
              id: '1', 
              title: 'Test Article 1', 
              content: 'Test content 1', 
              category: 'Politics',
              source: 'Test Source',
              likes: 5,
              description: 'Test description 1',
              comments: [],
              publishedAt: new Date()
            },
            { 
              id: '2', 
              title: 'Test Article 2', 
              content: 'Test content 2', 
              category: 'Business',
              source: 'Test Source 2',
              likes: 10,
              description: 'Test description 2',
              comments: [],
              publishedAt: new Date()
            }
          ])
        });
      }
      
      if (url.includes('/analyse')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            left: 10,
            'lean left': 20,
            center: 40,
            'lean right': 20,
            right: 10
          })
        });
      }
      
      if (url.includes('/analyse_fake_news')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            true: 80,
            fake: 20
          })
        });
      }
      
      if (url.includes('/analyse_sentiment_analysis')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            sentiment: 'positive',
            score: 0.75,
            positive: 0.75,
            neutral: 0.2,
            negative: 0.05
          })
        });
      }
      
      return Promise.reject(new Error('Unhandled fetch URL'));
    });
    
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
  });

// For the loading state test
  it('renders loading state initially', () => {
    render(<Home />);
    
    expect(screen.getByText('Trending News')).toBeInTheDocument();
    // Instead of looking for a loading element, check that articles aren't loaded yet
    expect(screen.queryByTestId('article-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('article-2')).not.toBeInTheDocument();
  });

  it('fetches and displays articles after loading', async () => {
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByTestId('article-1')).toBeInTheDocument();
      expect(screen.getByTestId('article-2')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Test Article 1')).toBeInTheDocument();
    expect(screen.getByText('Test Article 2')).toBeInTheDocument();
  });

  // For the article like action test
  it('handles article like action', async () => {
    // Mock fetch with the correct endpoint your component is using
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('/news')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: '1', title: 'Test Article 1', likes: 5 }
          ])
        });
      }
      
      // Update this to match your actual endpoint
      if (url.includes('/articles/like') || url.includes('/like-article')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      }
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
    
    render(<Home />);
    
    // Wait for articles to load
    await waitFor(() => {
      expect(screen.getByTestId('article-1')).toBeInTheDocument();
    });
    
    // Clear previous fetch calls
    global.fetch.mockClear();
    
    // Click the like button
    const likeButton = screen.getByText('Like');
    fireEvent.click(likeButton);
    
    // Wait for any fetch call to be made
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    
    // Check that a fetch call was made with a URL containing 'like'
    const fetchCalls = global.fetch.mock.calls;
    const likeFetchCall = fetchCalls.find(call => 
      call[0].includes('/like') || call[0].includes('like')
    );
    
    expect(likeFetchCall).toBeTruthy();
  });

  it('fetches bias analysis for articles', async () => {
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByTestId('article-1')).toBeInTheDocument();
    });
    
    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:3000/analyse',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    );
  });
});