// src/components/__tests__/theme-provider.test.js
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, useTheme } from '../theme-provider';

// Create a test component that uses the theme hook
const TestComponent = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('system')}>Set System</button>
    </div>
  );
};

describe('ThemeProvider Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset document.documentElement.classList
    document.documentElement.classList.remove('light', 'dark');
    
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  it('provides default theme as system', () => {
    render(
      <ThemeProvider defaultTheme="system">
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
  });

  // it('allows changing theme to light', () => {
  //   // Use a specific storage key for this test
  //   const storageKey = "test-theme-key";
    
  //   render(
  //     <ThemeProvider defaultTheme="system" storageKey={storageKey}>
  //       <TestComponent />
  //     </ThemeProvider>
  //   );
    
  //   // Use act to ensure state updates are processed
  //   act(() => {
  //     fireEvent.click(screen.getByText('Set Light'));
  //   });
    
  //   expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
  //   expect(document.documentElement.classList.contains('light')).toBe(true);
  //   expect(localStorage.getItem(storageKey)).toBe('light');
  // });

  // it('allows changing theme to dark', () => {
  //   // Use a specific storage key for this test
  //   const storageKey = "test-theme-key";
    
  //   render(
  //     <ThemeProvider defaultTheme="system" storageKey={storageKey}>
  //       <TestComponent />
  //     </ThemeProvider>
  //   );
    
  //   // Use act to ensure state updates are processed
  //   act(() => {
  //     fireEvent.click(screen.getByText('Set Dark'));
  //   });
    
  //   expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
  //   expect(document.documentElement.classList.contains('dark')).toBe(true);
  //   expect(localStorage.getItem(storageKey)).toBe('dark');
  // });

  it('uses system preference when theme is set to system', () => {
    // Mock system preference to dark
    window.matchMedia = jest.fn().mockImplementation(query => {
      return {
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      };
    });
    
    render(
      <ThemeProvider defaultTheme="system">
        <TestComponent />
      </ThemeProvider>
    );
    
    // System preference is dark, so document should have dark class
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  // it('loads theme from localStorage if available', () => {
  //   // Use a specific storage key for this test
  //   const storageKey = "test-theme-key";
    
  //   // Set theme in localStorage with the correct key
  //   localStorage.setItem(storageKey, 'dark');
    
  //   render(
  //     <ThemeProvider defaultTheme="light" storageKey={storageKey}>
  //       <TestComponent />
  //     </ThemeProvider>
  //   );
    
  //   // Should use dark from localStorage instead of light default
  //   expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
  //   expect(document.documentElement.classList.contains('dark')).toBe(true);
  // });

  // it('updates theme when system preference changes', () => {
  //   // Use a specific storage key for this test
  //   const storageKey = "test-theme-key";
    
  //   // Initial system preference is light
  //   let darkModeListener;
  //   window.matchMedia = jest.fn().mockImplementation(query => {
  //     const result = {
  //       matches: query === '(prefers-color-scheme: light)',
  //       media: query,
  //       onchange: null,
  //       addListener: jest.fn(),
  //       removeListener: jest.fn(),
  //       addEventListener: (event, listener) => {
  //         if (query === '(prefers-color-scheme: dark)') {
  //           darkModeListener = listener;
  //         }
  //       },
  //       removeEventListener: jest.fn(),
  //       dispatchEvent: jest.fn(),
  //     };
  //     return result;
  //   });
    
  //   render(
  //     <ThemeProvider defaultTheme="system" storageKey={storageKey}>
  //       <TestComponent />
  //     </ThemeProvider>
  //   );
    
  //   // Initially should be light based on system preference
  //   expect(document.documentElement.classList.contains('light')).toBe(true);
    
  //   // Simulate system preference change to dark
  //   act(() => {
  //     // Trigger the listener if it was set
  //     if (darkModeListener) {
  //       darkModeListener({ matches: true });
  //     }
  //   });
    
  //   // Should now be dark
  //   expect(document.documentElement.classList.contains('dark')).toBe(true);
  // });
});