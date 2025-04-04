// src/pages/__tests__/Usage.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Usage from '../Usage';

// Mock the recharts library
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="recharts-container">{children}</div>,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar"></div>,
  XAxis: () => <div data-testid="x-axis"></div>,
  YAxis: () => <div data-testid="y-axis"></div>,
  Tooltip: () => <div data-testid="tooltip"></div>
}));

// Mock the Lucide icons
jest.mock('lucide-react', () => ({
  Heart: () => <div data-testid="heart-icon">Heart</div>,
  MessageSquare: () => <div data-testid="message-icon">MessageSquare</div>,
  Video: () => <div data-testid="video-icon">Video</div>,
  Users: () => <div data-testid="users-icon">Users</div>
}));

// Mock the UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }) => <div data-testid="card" className={className}>{children}</div>,
  CardContent: ({ children, className }) => <div data-testid="card-content" className={className}>{children}</div>
}));

// Mock the AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

// Mock the utils
jest.mock('@/lib/utils', () => ({
  cn: (...args) => args.filter(Boolean).join(' ')
}));

describe('Usage Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('renders sign-in prompt when user is not logged in', () => {
    // Mock the useAuth hook to return null userData
    const { useAuth } = require('../../context/AuthContext');
    useAuth.mockReturnValue({ userData: null });

    render(<Usage />);

    // Check for sign-in prompt elements
    expect(screen.getByText('Track and Optimize your Usage')).toBeInTheDocument();
    expect(screen.getByText('Sign in to get your usage.')).toBeInTheDocument();
    
    // Check for sign-in and create account links
    const signInLink = screen.getByText('Sign In');
    const createAccountLink = screen.getByText('Create Account');
    
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute('href', '/login');
    
    expect(createAccountLink).toBeInTheDocument();
    expect(createAccountLink).toHaveAttribute('href', '/signup');
  });

  it('renders user stats when user is logged in', () => {
    // Mock the useAuth hook to return user data
    const { useAuth } = require('../../context/AuthContext');
    useAuth.mockReturnValue({
      userData: {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        likedArticles: ['article1', 'article2', 'article3'],
        likedVideos: ['video1', 'video2'],
        comments: ['comment1', 'comment2', 'comment3', 'comment4']
      }
    });

    render(<Usage />);

    // Check for the header
    expect(screen.getByText('Your Usage')).toBeInTheDocument();
    
    // Check for stat cards
    expect(screen.getByText('Articles Liked')).toBeInTheDocument();
    expect(screen.getByText('Videos Liked')).toBeInTheDocument();
    expect(screen.getByText('Comments')).toBeInTheDocument();
    
    // Check for stat values
    expect(screen.getByText('3')).toBeInTheDocument(); // 3 liked articles
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 liked videos
    expect(screen.getByText('4')).toBeInTheDocument(); // 4 comments
    
    // Check for chart title
    expect(screen.getByText('Activity Overview')).toBeInTheDocument();
    
    // Check for chart components
    expect(screen.getByTestId('recharts-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('renders zero stats when user has no activity', () => {
    // Mock the useAuth hook to return user data with empty arrays
    const { useAuth } = require('../../context/AuthContext');
    useAuth.mockReturnValue({
      userData: {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        likedArticles: [],
        likedVideos: [],
        comments: []
      }
    });

    render(<Usage />);

    // Check for stat values - all should be 0
    const statValues = screen.getAllByText('0');
    expect(statValues.length).toBe(3); // 3 stats with value 0
  });

  it('renders with hover effects on cards', () => {
    // Mock the useAuth hook to return user data
    const { useAuth } = require('../../context/AuthContext');
    useAuth.mockReturnValue({
      userData: {
        _id: 'user123',
        likedArticles: ['article1'],
        likedVideos: ['video1'],
        comments: ['comment1']
      }
    });

    render(<Usage />);

    // Check for hover classes on cards
    const cards = screen.getAllByTestId('card');
    cards.forEach(card => {
      expect(card).toHaveClass('hover:shadow-xl');
      expect(card).toHaveClass('hover:scale-105');
      expect(card).toHaveClass('transition-all');
      expect(card).toHaveClass('duration-300');
    });
  });
});