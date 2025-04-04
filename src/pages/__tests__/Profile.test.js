// src/pages/__tests__/Profile.test.js
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserProfilePage from '../Profile';
import axios from 'axios';
import { act } from 'react-dom/test-utils';

// Mock components
jest.mock('../../components/ArticleCard', () => {
  return function MockArticleCard({ article, onLike, onShare }) {
    return (
      <div data-testid={`article-${article.id}`} className="article-card">
        <h2>{article.title}</h2>
        <button 
          onClick={() => onLike(article.id)} 
          data-testid={`like-button-${article.id}`}
        >
          Like
        </button>
        <button 
          onClick={() => onShare(article.id)} 
          data-testid={`share-button-${article.id}`}
        >
          Share
        </button>
      </div>
    );
  };
});

// Mock the AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

// Mock axios
jest.mock('axios');

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  User: () => <div data-testid="user-icon">User</div>,
  Newspaper: () => <div data-testid="newspaper-icon">Newspaper</div>,
  ExternalLink: () => <div data-testid="external-link-icon">ExternalLink</div>,
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  ThumbsUp: () => <div data-testid="thumbs-up-icon">ThumbsUp</div>,
  MessageSquare: () => <div data-testid="message-square-icon">MessageSquare</div>,
  PlusCircle: () => <div data-testid="plus-circle-icon">PlusCircle</div>,
  Search: () => <div data-testid="search-icon">Search</div>,
  Tag: () => <div data-testid="tag-icon">Tag</div>,
  Globe: () => <div data-testid="globe-icon">Globe</div>,
  Loader: () => <div data-testid="loader-icon" className="animate-spin">Loader</div>
}));

describe('UserProfilePage Component', () => {
  // Mock user data
  const mockUserData = {
    id: 'user123',
    username: 'TestUser',
    name: 'Test User',
    email: 'test@example.com',
    likedArticles: ['article1', 'article2'],
    comments: [
      { 
        articleId: 'article1', 
        text: 'This is a test comment',
      },
      {
        articleId: 'article2',
        text: 'Another test comment',
      }
    ],
    preferences: {
      categories: ['Politics', 'Tech'],
      sources: ['BBC', 'CNN']
    }
  };

  // Mock articles
  const mockArticles = [
    { 
      id: 'article1', 
      title: 'Test Article 1', 
      content: 'Test content 1', 
      category: 'Politics',
      source: 'BBC',
      likes: 5,
      comments: [],
      publishedAt: new Date().toISOString()
    },
    { 
      id: 'article2', 
      title: 'Test Article 2', 
      content: 'Test content 2', 
      category: 'Tech',
      source: 'CNN',
      likes: 10,
      comments: [],
      publishedAt: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default auth context mock
    const { useAuth } = require('../../context/AuthContext');
    useAuth.mockReturnValue({
      userData: mockUserData,
      loading: false
    });

    // Mock fetch to return sample articles
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('/user_liked_articles')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockArticles)
        });
      }
      
      // Mocks for different analysis endpoints
      if (url.includes('/analyse')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            left: 10,
            "lean left": 20,
            center: 40,
            "lean right": 20,
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
            score: 0.8,
            positive: 80,
            neutral: 15,
            negative: 5
          })
        });
      }
      
      if (url.includes('/api/articles/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'article1',
            title: 'Test Article 1',
            likes: 6
          })
        });
      }
      
      return Promise.reject(new Error('Unhandled fetch URL'));
    });
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => {
          if (key === 'token') return 'fake-token';
          if (key === 'userId') return 'user123';
          return null;
        }),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });
    
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Mock axios response
    axios.post.mockResolvedValue({
      data: { success: true }
    });
  });

  it('renders loading state initially', () => {
    // Override auth context to show loading
    const { useAuth } = require('../../context/AuthContext');
    useAuth.mockReturnValue({
      userData: null,
      loading: true
    });
    
    render(<UserProfilePage />);
    
    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
  });

  it('redirects to login if user is not logged in', () => {
    // Override auth context to return null user and not loading
    const { useAuth } = require('../../context/AuthContext');
    useAuth.mockReturnValue({
      userData: null,
      loading: false
    });
    
    render(<UserProfilePage />);
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('renders user profile information correctly', async () => {
    render(<UserProfilePage />);
    
    // Check for user profile elements
    expect(screen.getByText('TestUser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('T')).toBeInTheDocument(); // First letter of username
  });

  it('renders preferences tab by default', async () => {
    render(<UserProfilePage />);
    
    // Check for preferences tab content
    expect(screen.getByText('Your News Preferences')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('News Sources')).toBeInTheDocument();
    
    // Check for user preferences
    expect(screen.getByText('Politics')).toBeInTheDocument();
    expect(screen.getByText('Tech')).toBeInTheDocument();
    expect(screen.getByText('BBC')).toBeInTheDocument();
    expect(screen.getByText('CNN')).toBeInTheDocument();
  });

  it('fetches and displays liked articles when switching to likes tab', async () => {
    render(<UserProfilePage />);
    
    // Switch to likes tab
    const likesTab = screen.getByText('Liked Articles');
    fireEvent.click(likesTab);
    
    // Check that the tab is active
    expect(likesTab.closest('button')).toHaveClass('border-primary');
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/user_liked_articles?articleIds=article1,article2')
      );
    });
    
    // Check for liked articles count
    expect(screen.getByText('2 articles liked')).toBeInTheDocument();
    
    // Wait for articles to be rendered
    await waitFor(() => {
      expect(screen.getByTestId('article-article1')).toBeInTheDocument();
      expect(screen.getByTestId('article-article2')).toBeInTheDocument();
    });
  });

  it('displays empty state when no liked articles', async () => {
    // Override auth context to return user with no liked articles
    const { useAuth } = require('../../context/AuthContext');
    useAuth.mockReturnValue({
      userData: {
        ...mockUserData,
        likedArticles: []
      },
      loading: false
    });
    
    render(<UserProfilePage />);
    
    // Switch to likes tab
    fireEvent.click(screen.getByText('Liked Articles'));
    
    // Check for empty state
    expect(screen.getByText('No liked articles')).toBeInTheDocument();
    expect(screen.getByText('You haven\'t liked any articles yet. Explore our content to find stories that interest you.')).toBeInTheDocument();
    
    // Check for explore button
    const exploreButton = screen.getByText('Explore Articles');
    expect(exploreButton).toBeInTheDocument();
    
    // Test navigation on button click
    fireEvent.click(exploreButton);
    expect(mockNavigate).toHaveBeenCalledWith('/for-you');
  });

  it('displays comments when switching to comments tab', async () => {
    render(<UserProfilePage />);
    
    // Switch to comments tab
    fireEvent.click(screen.getByText('Comments'));
    
    // Check that the tab is active
    expect(screen.getByText('Your Comments')).toBeInTheDocument();
    
    // Check for comments
    expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    expect(screen.getByText('Another test comment')).toBeInTheDocument();
  });

  it('displays empty state when no comments', async () => {
    // Override auth context to return user with no comments
    const { useAuth } = require('../../context/AuthContext');
    useAuth.mockReturnValue({
      userData: {
        ...mockUserData,
        comments: []
      },
      loading: false
    });
    
    render(<UserProfilePage />);
    
    // Switch to comments tab
    fireEvent.click(screen.getByText('Comments'));
    
    // Check for empty state
    expect(screen.getByText('No comments yet')).toBeInTheDocument();
    expect(screen.getByText('Join the conversation by commenting on articles that spark your interest.')).toBeInTheDocument();
    
    // Check for explore button
    const exploreButton = screen.getByText('Explore Articles');
    expect(exploreButton).toBeInTheDocument();
    
    // Test navigation on button click
    fireEvent.click(exploreButton);
    expect(mockNavigate).toHaveBeenCalledWith('/for-you');
  });

  it('navigates to article page when clicking on view article in comments', async () => {
    render(<UserProfilePage />);
    
    // Switch to comments tab
    fireEvent.click(screen.getByText('Comments'));
    
    // Click on view article button
    const viewArticleButtons = screen.getAllByText('View Article');
    fireEvent.click(viewArticleButtons[0]);
    
    expect(mockNavigate).toHaveBeenCalledWith('/article/article1');
  });

  it('fetches analysis data for articles', async () => {
    render(<UserProfilePage />);
    
    // Switch to likes tab
    fireEvent.click(screen.getByText('Liked Articles'));
    
    await waitFor(() => {
      // Check that all analysis endpoints were called
      expect(global.fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/analyse',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
      
      expect(global.fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:4000/analyse_fake_news',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
      
      expect(global.fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:7000/analyse_sentiment_analysis',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });
  });

  it('handles article like functionality successfully', async () => {
    render(<UserProfilePage />);
    
    // Switch to likes tab
    fireEvent.click(screen.getByText('Liked Articles'));
    
    // Wait for articles to load
    await waitFor(() => {
      expect(screen.getByTestId('article-article1')).toBeInTheDocument();
    });
    
    // Mock the axios implementation for this specific test
    axios.post.mockResolvedValueOnce({
      data: { success: true }
    });
    
    // Click the like button on the first article
    await act(async () => {
      fireEvent.click(screen.getByTestId('like-button-article1'));
    });
    
    // Check that the API calls were made
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:8000/api/user/articles/article1/like',
      { userId: 'user123' },
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake-token'
        }
      })
    );
    
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/articles/article1/like',
      expect.objectContaining({ method: 'POST' })
    );
    
    // Check that the toast was shown
    expect(require('react-hot-toast').success).toHaveBeenCalledWith(
      expect.stringContaining('Liked "Test Article 1"'),
      expect.objectContaining({ id: 'liked-article1' })
    );
  });

  it('handles article like failure when already liked', async () => {
    render(<UserProfilePage />);
    
    // Switch to likes tab
    fireEvent.click(screen.getByText('Liked Articles'));
    
    // Wait for articles to load
    await waitFor(() => {
      expect(screen.getByTestId('article-article1')).toBeInTheDocument();
    });
    
    // Mock the axios implementation to return already liked
    axios.post.mockResolvedValueOnce({
      data: { success: false }
    });
    
    // Click the like button on the first article
    await act(async () => {
      fireEvent.click(screen.getByTestId('like-button-article1'));
    });
    
    // Check that the error toast was shown
    expect(require('react-hot-toast').error).toHaveBeenCalledWith(
      "You've already liked this article",
      expect.objectContaining({ id: 'already-liked-article1' })
    );
  });

  it('handles article like failure when not logged in', async () => {
    render(<UserProfilePage />);
    
    // Switch to likes tab
    fireEvent.click(screen.getByText('Liked Articles'));
    
    // Wait for articles to load
    await waitFor(() => {
      expect(screen.getByTestId('article-article1')).toBeInTheDocument();
    });
    
    // Mock localStorage to return null token
    jest.spyOn(window.localStorage, 'getItem').mockImplementation((key) => {
      if (key === 'token') return null;
      if (key === 'userId') return 'user123';
      return null;
    });
    
    // Click the like button on the first article
    await act(async () => {
      fireEvent.click(screen.getByTestId('like-button-article1'));
    });
    
    // Check that the error toast was shown
    expect(require('react-hot-toast').error).toHaveBeenCalledWith(
      "Login to like articles.",
      expect.objectContaining({ id: 'login-first' })
    );
    
    // Check that the error was logged
    expect(console.error).toHaveBeenCalledWith(
      "Error liking article:",
      expect.any(Error)
    );
  });

  it('handles error when fetching liked articles', async () => {
    // Mock fetch to throw an error
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('/user_liked_articles')) {
        return Promise.reject(new Error('Failed to fetch liked articles'));
      }
      return Promise.reject(new Error('Unhandled fetch URL'));
    });
    
    render(<UserProfilePage />);
    
    // Switch to likes tab
    fireEvent.click(screen.getByText('Liked Articles'));
    
    // Check that the error was logged
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching liked articles:",
        expect.any(Error)
      );
    });
  });

  it('handles error when analyzing articles', async () => {
    // Mock fetch to throw an error for analysis
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('/user_liked_articles')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockArticles)
        });
      }
      
      if (url.includes('/analyse')) {
        return Promise.reject(new Error('Failed to analyze article'));
      }
      
      return Promise.reject(new Error('Unhandled fetch URL'));
    });
    
    render(<UserProfilePage />);
    
    // Switch to likes tab
    fireEvent.click(screen.getByText('Liked Articles'));
    
    // Check that the error was logged
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Error analysing article article1:",
        expect.any(Error)
      );
    });
  });
});