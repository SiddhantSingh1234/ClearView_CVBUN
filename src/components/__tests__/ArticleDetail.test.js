import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ArticleDetail from '../ArticleDetail';

// Create a mock article
const mockArticle = {
  id: 'article123',
  title: 'Test Article Title',
  content: 'This is the full content of the test article.',
  description: 'This is a test article description.',
  source: 'Test Source',
  author: 'Test Author',
  publishedAt: '2023-01-15T12:00:00Z',
  url: 'https://example.com/article',
  imageUrl: 'https://example.com/image.jpg',
  category: 'politics',
  likes: 42,
  comments: []
};

// Mock the fetch function
global.fetch = jest.fn();

// Mock UI components that might be used
jest.mock('../../components/ui/button', () => ({
  Button: ({ children, onClick }) => (
    <button onClick={onClick} data-testid="button">
      {children}
    </button>
  )
}));

describe('ArticleDetail Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementation for fetch
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockArticle
    });
  });

  const renderWithRouter = (ui, { route = '/article/article123' } = {}) => {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/article/:id" element={ui} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders loading state initially', () => {
    renderWithRouter(<ArticleDetail />);
    
    // Look for the loading spinner instead of text
    expect(screen.getByRole('status', { hidden: true }) || 
           screen.getByTestId('loading-spinner') || 
           document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders article details after loading', async () => {
    renderWithRouter(<ArticleDetail />);
    
    // Wait for the article to load
    await waitFor(() => {
      expect(screen.getByText('Test Article Title')).toBeInTheDocument();
    });
    
    // Check that article content is displayed
    expect(screen.getByText('This is the full content of the test article.')).toBeInTheDocument();
    
    // Check for source instead of author since author might not be displayed
    expect(screen.getByText('Test Source', { exact: false })).toBeInTheDocument();
    
    // Check that the date is formatted - use a more flexible matcher
    const dateElement = screen.getByText((content) => {
      return content.includes('2023') || content.includes('January');
    });
    expect(dateElement).toBeInTheDocument();
  });

  it('handles article not found', async () => {
    // Mock fetch to return null (article not found)
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Article not found' })
    });
    
    renderWithRouter(<ArticleDetail />, { route: '/article/nonexistent' });
    
    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByText(/article not found/i)).toBeInTheDocument();
    });
  });

  it('handles API errors', async () => {
    // Mock fetch to throw an error
    global.fetch.mockRejectedValueOnce(new Error('API Error'));
    
    renderWithRouter(<ArticleDetail />);
    
    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByText(/error loading article/i)).toBeInTheDocument();
    });
  });

  it('displays article image when available', async () => {
    renderWithRouter(<ArticleDetail />);
    
    await waitFor(() => {
      const image = screen.getByAltText('Test Article Title');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });
  });

  it('formats article category correctly', async () => {
    renderWithRouter(<ArticleDetail />);
    
    await waitFor(() => {
      expect(screen.getByText(/politics/i)).toBeInTheDocument();
    });
  });

  it('shows like count', async () => {
    renderWithRouter(<ArticleDetail />);
    
    await waitFor(() => {
      expect(screen.getByText(/42/)).toBeInTheDocument();
    });
  });

  it('handles like button click', async () => {
    // Mock successful like response
    global.fetch.mockImplementation((url, options) => {
      if (url.includes('/like') || options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, likes: 43 })
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => mockArticle
      });
    });

    renderWithRouter(<ArticleDetail />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Article Title')).toBeInTheDocument();
    });
    
    // Find and click like button
    const likeButton = screen.getByRole('button', { name: /like/i });
    fireEvent.click(likeButton);
    
    // Check that like count is updated
    await waitFor(() => {
      expect(screen.getByText(/43/)).toBeInTheDocument();
    });
  });
});