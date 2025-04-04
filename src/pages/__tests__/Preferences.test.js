// src/pages/__tests__/Preferences.test.tsx
import React from 'react';
import { jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Preferences from '../Preferences';

// Mock the react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

// Mock the AuthContext
const mockUpdateUserPreferences = jest.fn();
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    userData: null,
    updateUserPreferences: mockUpdateUserPreferences
  })
}));

describe('Preferences Component', () => {
  beforeEach(() => {
    // Reset mocks
    mockNavigate.mockReset();
    mockUpdateUserPreferences.mockReset();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'fake-token'),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });
    
    // Mock window.alert
    window.alert = jest.fn();
  });

  it('renders the preferences form correctly', () => {
    render(<Preferences />);
    
    expect(screen.getByText('Personalize Your News')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('News Sources')).toBeInTheDocument();
    
    // Check categories
    expect(screen.getByLabelText('Politics')).toBeInTheDocument();
    expect(screen.getByLabelText('Tech')).toBeInTheDocument();
    
    // Check sources
    expect(screen.getByLabelText('BBC News')).toBeInTheDocument();
    expect(screen.getByLabelText('CNN')).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByRole('button', { name: 'Skip for now' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Preferences' })).toBeInTheDocument();
  });

  it('toggles category selection correctly', () => {
    render(<Preferences />);
    
    const politicsCheckbox = screen.getByLabelText('Politics');
    expect(politicsCheckbox).not.toBeChecked();
    
    // Select a category
    fireEvent.click(politicsCheckbox);
    expect(politicsCheckbox).toBeChecked();
    
    // Deselect the category
    fireEvent.click(politicsCheckbox);
    expect(politicsCheckbox).not.toBeChecked();
  });

  it('toggles source selection correctly', () => {
    render(<Preferences />);
    
    const bbcCheckbox = screen.getByLabelText('BBC News');
    expect(bbcCheckbox).not.toBeChecked();
    
    // Select a source
    fireEvent.click(bbcCheckbox);
    expect(bbcCheckbox).toBeChecked();
    
    // Deselect the source
    fireEvent.click(bbcCheckbox);
    expect(bbcCheckbox).not.toBeChecked();
  });

  it('submits preferences using updateUserPreferences', async () => {
    render(<Preferences />);
    
    // Select some preferences
    fireEvent.click(screen.getByLabelText('Politics'));
    fireEvent.click(screen.getByLabelText('Tech'));
    fireEvent.click(screen.getByLabelText('BBC News'));
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Save Preferences' }));
    
    // Verify updateUserPreferences was called with correct data
    await waitFor(() => {
      expect(mockUpdateUserPreferences).toHaveBeenCalledWith(
        expect.objectContaining({
          categories: ['Politics', 'Tech'],
          sources: ['BBC News']
        })
      );
    });
  });

  it('handles errors from updateUserPreferences correctly', async () => {
    // Mock updateUserPreferences to throw an error
    mockUpdateUserPreferences.mockImplementation(() => {
      throw {
        response: {
          data: {
            error: 'Update failed'
          }
        }
      };
    });
    
    render(<Preferences />);
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Save Preferences' }));
    
    // Verify error handling
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Update failed');
    });
  });

  it('handles token invalidation correctly', async () => {
    // Mock updateUserPreferences to throw a token error
    mockUpdateUserPreferences.mockImplementation(() => {
      throw {
        response: {
          data: {
            error: 'Invalid token'
          }
        }
      };
    });
    
    render(<Preferences />);
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Save Preferences' }));
    
    // Verify token invalidation handling
    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
      expect(window.alert).toHaveBeenCalledWith('Session expired. Please login again.');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('navigates to home when skipping preferences', () => {
    render(<Preferences />);
    
    // Click skip button
    fireEvent.click(screen.getByRole('button', { name: 'Skip for now' }));
    
    // Verify navigation
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});