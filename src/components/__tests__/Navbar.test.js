// src/components/__tests__/Navbar.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from '../Navbar';

// Create mock functions
const mockLogout = jest.fn();
const mockSetTheme = jest.fn();

// Mock the react-router-dom
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    Link: ({ to, children, className }) => <a href={to} className={className}>{children}</a>,
    useNavigate: () => jest.fn(),
    useLocation: jest.fn().mockReturnValue({ pathname: '/' })
  };
});

// Mock the AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    userData: null,
    logout: mockLogout
  })
}));

// Mock the theme provider
jest.mock('@/components/theme-provider', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: mockSetTheme
  })
}));

// Mock the ModeToggle component
jest.mock('../mode-toggle', () => ({
  ModeToggle: () => <button data-testid="mode-toggle">Toggle Theme</button>
}));

// Mock the Chatbot component
jest.mock('../chatbot', () => {
  return jest.fn().mockImplementation(({ onClose }) => (
    <div data-testid="chatbot">
      <button onClick={onClose}>Close Chatbot</button>
    </div>
  ));
});

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset useLocation mock to default
    require('react-router-dom').useLocation.mockReturnValue({ pathname: '/' });
  });

  it('renders the logo and navigation links', () => {
    render(<Navbar />);
    
    expect(screen.getByText(/ClearView/i)).toBeInTheDocument();
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/For You/i)).toBeInTheDocument();
    expect(screen.getByText(/News/i)).toBeInTheDocument();
    expect(screen.getByText(/Videos/i)).toBeInTheDocument();
  });

  it('includes theme toggle button', () => {
    render(<Navbar />);
    
    expect(screen.getByTestId('mode-toggle')).toBeInTheDocument();
  });

  it('highlights the active link based on current route', () => {
    // Mock location to '/news'
    require('react-router-dom').useLocation.mockReturnValue({ pathname: '/news' });
    
    render(<Navbar />);
    
    // The "News" link should have the active class (border-primary)
    const newsLinks = screen.getAllByText('News');
    const newsLink = newsLinks[0].closest('a');
    expect(newsLink).toHaveClass('border-primary');
    
    // Home link should not have the active class
    const homeLinks = screen.getAllByText('Home');
    const homeLink = homeLinks[0].closest('a');
    expect(homeLink).toHaveClass('border-transparent');
  });

  it('renders search bar', () => {
    render(<Navbar />);
    
    expect(screen.getByPlaceholderText(/search news/i)).toBeInTheDocument();
  });

  // it('toggles mobile menu when menu button is clicked', () => {
  //   render(<Navbar />);
    
  //   // Menu should be closed initially
  //   expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    
  //   // Click the menu button
  //   const menuButton = screen.getByRole('button', { name: /open main menu/i });
  //   fireEvent.click(menuButton);
    
  //   // Menu should be open now
  //   expect(screen.getByText('Login')).toBeInTheDocument();
  // });

  it('opens chatbot when chatbot button is clicked', async () => {
    render(<Navbar />);
    
    // Chatbot should not be visible initially
    expect(screen.queryByTestId('chatbot')).not.toBeInTheDocument();
    
    // Click the chatbot button
    const chatbotButton = screen.getByText('Chatbot').closest('button');
    fireEvent.click(chatbotButton);
    
    // Chatbot should be visible now
    await waitFor(() => {
      expect(screen.getByTestId('chatbot')).toBeInTheDocument();
    });
    
    // Close the chatbot
    const closeButton = screen.getByText('Close Chatbot');
    fireEvent.click(closeButton);
    
    // Chatbot should be closed
    await waitFor(() => {
      expect(screen.queryByTestId('chatbot')).not.toBeInTheDocument();
    });
  });

  it('renders login button when user is not logged in', () => {
    render(<Navbar />);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.queryByText('Sign out')).not.toBeInTheDocument();
  });

  it('renders user menu when user is logged in', () => {
    // Mock logged in user
    jest.spyOn(require('../../context/AuthContext'), 'useAuth').mockReturnValue({
      userData: { username: 'TestUser', email: 'test@example.com' },
      logout: mockLogout
    });
    
    render(<Navbar />);
    
    // User menu button should be visible
    const userButton = screen.getByRole('button', { name: '' });
    fireEvent.click(userButton);
    
    // User menu should be open
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Preferences')).toBeInTheDocument();
    expect(screen.getByText('Usage')).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
    
    // Click sign out
    const signOutButton = screen.getByText('Sign out');
    fireEvent.click(signOutButton);
    
    // Logout should be called
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('handles mobile navigation for logged in users', () => {
    // Mock logged in user
    jest.spyOn(require('../../context/AuthContext'), 'useAuth').mockReturnValue({
      userData: { username: 'TestUser', email: 'test@example.com' },
      logout: mockLogout
    });
    
    render(<Navbar />);
    
    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: /open main menu/i });
    fireEvent.click(menuButton);
    
    // Check user info is displayed
    expect(screen.getByText('TestUser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    
    // Check mobile menu links
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Preferences')).toBeInTheDocument();
    
    // Click logout in mobile menu
    const mobileLogoutButton = screen.getAllByText('Sign out')[0];
    fireEvent.click(mobileLogoutButton);
    
    // Logout should be called
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});