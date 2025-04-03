// src/pages/__tests__/ForYou.test.js
import React from 'react';
import { jest } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { expect } from '@jest/globals';
import '@testing-library/jest-dom';
import ForYou from '../ForYou';

// Mock components
jest.mock('../../components/ArticleCard', () => {
  return {
    __esModule: true,
    default: function MockArticleCard({ article }) {
      return (
        <div data-testid={`article-${article.id}`}>
          <h2>{article.title}</h2>
        </div>
      );
    }
  };
});

// Mock the AuthContext
jest.mock('../../context/AuthContext', () => {
  return {
    __esModule: true,
    useAuth: () => ({
      userData: {
        preferences: {
          categories: ['Politics', 'Tech'],
          sources: ['BBC', 'CNN']
        }
      }
    })
  };
});

describe('ForYou Component', () => {
  beforeEach(() => {
    // Mock fetch to return sample articles
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('/for_you_news')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { 
              id: '1', 
              title: 'Politics Article', 
              content: 'Test content 1', 
              category: 'Politics',
              source: 'BBC',
              likes: 5,
              comments: [],
              publishedAt: new Date()
            },
            { 
              id: '2', 
              title: 'Tech Article', 
              content: 'Test content 2', 
              category: 'Tech',
              source: 'CNN',
              likes: 10,
              comments: [],
              publishedAt: new Date()
            }
          ])
        });
      }
      
      // Mocks for different analysis endpoints
      if (url.includes('/analyse') || url.includes('/analyse_fake_news') || url.includes('/analyse_sentiment_analysis')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({})
        });
      }
      
      return Promise.reject(new Error('Unhandled fetch URL'));
    });
    
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
  });

  it('renders loading state initially', () => {
    render(<ForYou />);
    
    expect(screen.getByText('For You')).toBeInTheDocument();
    
    // Instead of looking for a specific loading element, check if articles aren't loaded yet
    expect(screen.queryByTestId('article-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('article-2')).not.toBeInTheDocument();
  });

  it('fetches and renders personalized articles', async () => {
    render(<ForYou />);
    
    await waitFor(() => {
      expect(screen.getByTestId('article-1')).toBeInTheDocument();
      expect(screen.getByTestId('article-2')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Politics Article')).toBeInTheDocument();
    expect(screen.getByText('Tech Article')).toBeInTheDocument();
  });

  it('sends the correct filter parameters to the API', async () => {
    render(<ForYou />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/for_you_news.*filter=/),
        expect.any(Object)
      );
      
      // Check that the URL contains the expected parameters
      const fetchUrl = global.fetch.mock.calls[0][0];
      expect(fetchUrl).toMatch(/Politics/);
      expect(fetchUrl).toMatch(/Tech/);
      expect(fetchUrl).toMatch(/BBC/);
      expect(fetchUrl).toMatch(/CNN/);
    });
  });
});

// Test for when user is not logged in
describe('ForYou Component - Not Logged In', () => {
  beforeEach(() => {
    // Override auth context mock to return null user
    jest.spyOn(require('../../context/AuthContext'), 'useAuth').mockReturnValue({
      userData: null
    });
  });
  
  it('renders the login/signup prompt when user is not logged in', () => {
    render(<ForYou />);
    
    expect(screen.getByText('Personalize Your News Feed')).toBeInTheDocument();
    expect(screen.getByText('Sign in to get news recommendations tailored to your interests.')).toBeInTheDocument();
    
    // Check login/signup links
    expect(screen.getByRole('link', { name: 'Sign In' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Create Account' })).toHaveAttribute('href', '/signup');
  });
});