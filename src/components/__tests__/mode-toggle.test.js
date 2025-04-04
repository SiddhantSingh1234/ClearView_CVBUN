// src/components/__tests__/mode-toggle.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModeToggle } from '../mode-toggle';

// Create a mock function for setTheme
const mockSetTheme = jest.fn();

// Mock the theme provider
jest.mock('@/components/theme-provider', () => ({
  useTheme: () => ({
    setTheme: mockSetTheme,
  }),
}));

// Mock the dropdown menu components
jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick }) => (
    <button data-testid="dropdown-item" onClick={onClick}>
      {children}
    </button>
  ),
}));

describe('ModeToggle Component', () => {
  // Reset the mock before each test
  beforeEach(() => {
    mockSetTheme.mockClear();
  });

  it('renders the theme toggle button', () => {
    render(<ModeToggle />);
    
    expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
    expect(screen.getByText('Toggle theme')).toBeInTheDocument();
  });

  it('renders sun and moon icons', () => {
    render(<ModeToggle />);
    
    // Check for the presence of icons by their class names
    const sunIcon = document.querySelector('.scale-100');
    const moonIcon = document.querySelector('.scale-0');
    
    expect(sunIcon).toBeInTheDocument();
    expect(moonIcon).toBeInTheDocument();
  });

  it('renders dropdown menu items', () => {
    render(<ModeToggle />);
    
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('calls setTheme with "light" when Light option is clicked', () => {
    render(<ModeToggle />);
    
    fireEvent.click(screen.getByText('Light'));
    
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('calls setTheme with "dark" when Dark option is clicked', () => {
    render(<ModeToggle />);
    
    fireEvent.click(screen.getByText('Dark'));
    
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('calls setTheme with "system" when System option is clicked', () => {
    render(<ModeToggle />);
    
    fireEvent.click(screen.getByText('System'));
    
    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });
});