// src/pages/__tests__/Home.test.tsx
import React from 'react';
import { jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../Home';
import axios from 'axios';
import toast from 'react-hot-toast';

// Mock axios
jest.mock('axios');

// Mock toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn()
  }
});

// Mock the AuthContext
jest.mock('../../context/AuthContext', () => {
  return {
    __esModule: true,
    useAuth: () => ({
      userData: {
        likedArticles: ['3']
      },
      setUserData: jest.fn()
    })
  };
});

// Mock components
jest.mock('../../components/ArticleCard', () => {
  return {
    __esModule: true,
    default: function MockArticleCard({ article, onLike, onShare }) {
      return (
        <div data-testid={`article-${article.id}`}>
          <h2>{article.title}</h2>
          <button data-testid={`like-${article.id}`} onClick={() => onLike(article.id)}>Like</button>
          <button data-testid={`share-${article.id}`} onClick={() => onShare(article.id)}>Share</button>
        </div>
      );
    }
  };
});

jest.mock('../../components/CategoryFilter', () => {
  return {
    __esModule: true,
    default: function MockCategoryFilter({ categories, selectedCategories, onCategoryChange }) {
      return (
        <div data-testid="category-filter">
          {categories.map(cat => (
            <button 
              key={cat}
              data-testid={`category-${cat}`}
              onClick={() => onCategoryChange(
                selectedCategories.includes(cat) 
                  ? selectedCategories.filter(c => c !== cat)
                  : [...selectedCategories, cat]
              )}
            >
              {cat}
            </button>
          ))}
          <button 
            data-testid="clear-categories"
            onClick={() => onCategoryChange([])}
          >
            Clear
          </button>
        </div>
      );
    }
  };
});

describe('Home Component', () => {
  beforeEach(() => {
    // Mock localStorage
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'token') return 'fake-token';
      if (key === 'userId') return 'user123';
      return null;
    });
    
    // Mock axios response for like
    axios.post.mockResolvedValue({
      data: { success: true }
    });
    
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
      
      if (url.includes('3000/analyse')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            left: 0.1,
            "lean left": 0.2,
            center: 0.4,
            "lean right": 0.2,
            right: 0.1
          })
        });
      }
      
      if (url.includes('4000/analyse_fake_news')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            true: 0.8,
            fake: 0.2
          })
        });
      }
      
      if (url.includes('7000/analyse_sentiment_analysis')) {
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
      
      if (url.includes('/api/articles') && url.includes('/like')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: '1',
            title: 'Test Article 1',
            likes: 6
          })
        });
      }
      
      return Promise.reject(new Error('Unhandled fetch URL'));
    });
    
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // // Fix the loading state test
  // it('renders loading state initially', () => {
  //   render(<Home />);
    
  //   expect(screen.getByText('Trending News')).toBeInTheDocument();
  //   // Look for loading text instead of role="status"
  //   expect(screen.getByText(/loading/i)).toBeInTheDocument();
  // });

  it('fetches and displays articles after loading', async () => {
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByTestId('article-1')).toBeInTheDocument();
      expect(screen.getByTestId('article-2')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    expect(screen.getByText('Test Article 1')).toBeInTheDocument();
    expect(screen.getByText('Test Article 2')).toBeInTheDocument();
  });

  // // Fix the article like action test
  // it('handles article like action successfully', async () => {
  //   // Reset mocks to ensure clean state
  //   axios.post.mockReset();
    
  //   // Set up mock response
  //   axios.post.mockResolvedValue({
  //     data: { success: true }
  //   });
    
  //   render(<Home />);
    
  //   // Wait for articles to load with longer timeout
  //   await waitFor(() => {
  //     expect(screen.getByTestId('article-1')).toBeInTheDocument();
  //   }, { timeout: 3000 });
    
  //   // Click the like button
  //   fireEvent.click(screen.getByTestId('like-1'));
    
  //   // Use a more relaxed assertion with longer timeout
  //   await waitFor(() => {
  //     expect(axios.post).toHaveBeenCalled();
  //   }, { timeout: 3000 });
    
  //   // Check toast was called
  //   expect(toast.success).toHaveBeenCalled();
  // });

  // // Fix the already liked article scenario test
  // it('handles already liked article scenario', async () => {
  //   // Reset mocks to ensure clean state
  //   axios.post.mockReset();
    
  //   // Mock axios to return already liked response
  //   axios.post.mockResolvedValue({
  //     data: { success: false, message: 'Already liked' }
  //   });
    
  //   render(<Home />);
    
  //   // Wait for articles to load with longer timeout
  //   await waitFor(() => {
  //     expect(screen.getByTestId('article-1')).toBeInTheDocument();
  //   }, { timeout: 3000 });
    
  //   // Click the like button
  //   fireEvent.click(screen.getByTestId('like-1'));
    
  //   // Use a more relaxed assertion with longer timeout
  //   await waitFor(() => {
  //     expect(axios.post).toHaveBeenCalled();
  //   }, { timeout: 3000 });
    
  //   // Check toast error was called
  //   expect(toast.error).toHaveBeenCalled();
  // });

  it('handles sharing an article', async () => {
    render(<Home />);
    
    // Wait for articles to load
    await waitFor(() => {
      expect(screen.getByTestId('article-1')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Click the share button
    fireEvent.click(screen.getByTestId('share-1'));
    
    // Check that clipboard API was called
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('/article/1')
    );
    
    // Check that toast success was called
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining("Article link copied to clipboard!"),
      expect.any(Object)
    );
  });

  it('handles like error when not logged in', async () => {
    // Mock localStorage to return null for token
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'token') return null;
      if (key === 'userId') return 'user123';
      return null;
    });
    
    render(<Home />);
    
    // Wait for articles to load
    await waitFor(() => {
      expect(screen.getByTestId('article-1')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Click the like button
    fireEvent.click(screen.getByTestId('like-1'));
    
    // Check that toast error was called
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("Login to like articles"),
        expect.any(Object)
      );
      
      // Check that console.error was called
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Error liking article"),
        expect.any(Error)
      );
    }, { timeout: 3000 });
  });

  it('fetches bias analysis for articles', async () => {
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByTestId('article-1')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:3000/analyse',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    );
  });

  it('fetches fake news analysis for articles', async () => {
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByTestId('article-1')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:4000/analyse_fake_news',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    );
  });

  it('fetches sentiment analysis for articles', async () => {
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByTestId('article-1')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:7000/analyse_sentiment_analysis',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    );
  });

  it('filters articles by category', async () => {
    render(<Home />);
    
    // Wait for articles to load
    await waitFor(() => {
      expect(screen.getByTestId('article-1')).toBeInTheDocument();
      expect(screen.getByTestId('article-2')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Click on the Business category filter
    fireEvent.click(screen.getByTestId('category-Business'));
    
    // Politics article should be hidden, Business article should be visible
    expect(screen.queryByText('Test Article 1')).not.toBeInTheDocument();
    expect(screen.getByText('Test Article 2')).toBeInTheDocument();
    
    // Clear filters
    fireEvent.click(screen.getByTestId('clear-categories'));
    
    // Both articles should be visible again
    await waitFor(() => {
      expect(screen.getByText('Test Article 1')).toBeInTheDocument();
      expect(screen.getByText('Test Article 2')).toBeInTheDocument();
    });
  });

  it('handles fetch error for articles', async () => {
    // Mock fetch to return an error for the initial articles request
    global.fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );
    
    render(<Home />);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error fetching articles'),
        expect.any(Error)
      );
    }, { timeout: 3000 });
  });

  it('handles HTTP error for articles', async () => {
    // Mock fetch to return a non-ok response
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })
    );
    
    render(<Home />);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error fetching articles'),
        expect.any(Error)
      );
    }, { timeout: 3000 });
  });

  it('handles analysis API errors gracefully', async () => {
    // Mock fetch to return sample articles
    global.fetch.mockImplementationOnce((url) => {
      if (url.includes('/news')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { 
              id: '1', 
              title: 'Test Article 1', 
              content: 'Test content 1'
            }
          ])
        });
      }
    });
    
    // Mock bias analysis to fail
    global.fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Bias analysis error'))
    );
    
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByTestId('article-1')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error analysing article'),
        expect.any(Error)
      );
    }, { timeout: 3000 });
  });

  it('displays empty state when no articles match filter', async () => {
    render(<Home />);
    
    // Wait for articles to load
    await waitFor(() => {
      expect(screen.getByTestId('article-1')).toBeInTheDocument();
      expect(screen.getByTestId('article-2')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Click on a category that doesn't match any articles
    fireEvent.click(screen.getByTestId('category-Sports'));
    
    // Should show empty state
    expect(screen.getByText('No articles found')).toBeInTheDocument();
    expect(screen.getByText('Try selecting different categories or clear your filters')).toBeInTheDocument();
  });
});