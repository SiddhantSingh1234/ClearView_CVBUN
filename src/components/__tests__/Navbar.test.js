// src/components/__tests__/Navbar.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from '../Navbar';

// Mock the react-router-dom
jest.mock('react-router-dom', () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' })
}));

// Mock the AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { displayName: 'Test User' },
    logout: jest.fn()
  })
}));

// Mock the ModeToggle component
jest.mock('../mode-toggle', () => ({
  ModeToggle: () => <button data-testid="mode-toggle">Toggle Theme</button>
}));

describe('Navbar Component', () => {
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
    jest.spyOn(require('react-router-dom'), 'useLocation').mockImplementation(() => ({
      pathname: '/news'
    }));
    
    render(<Navbar />);
    
    // The "News" link should have the active class
    const newsLink = screen.getByText('News').closest('a');
    expect(newsLink).toHaveClass('text-primary');
    
    // Other links should not have the active class
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).not.toHaveClass('text-primary');
  });

  it('renders search bar', () => {
    render(<Navbar />);
    
    expect(screen.getByPlaceholderText(/search news/i)).toBeInTheDocument();
  });
});