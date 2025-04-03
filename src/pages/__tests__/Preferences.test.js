// src/pages/__tests__/Preferences.test.tsx
import React from 'react';
import { jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Preferences from '../Preferences';
import axios from 'axios';

// Mock the react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn()
}));

// Mock axios
jest.mock('axios');

describe('Preferences Component', () => {
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'fake-token'),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });
    
    // Mock axios.put
    axios.put = jest.fn().mockResolvedValue({
      data: {
        preferences: {
          categories: ['Politics', 'Tech'],
          sources: ['BBC'],
          topics: [],
          favorites: []
        }
      }
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
    expect(screen.getByLabelText('BBC')).toBeInTheDocument();
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
    
    const bbcCheckbox = screen.getByLabelText('BBC');
    expect(bbcCheckbox).not.toBeChecked();
    
    // Select a source
    fireEvent.click(bbcCheckbox);
    expect(bbcCheckbox).toBeChecked();
    
    // Deselect the source
    fireEvent.click(bbcCheckbox);
    expect(bbcCheckbox).not.toBeChecked();
  });

  it('submits preferences and navigates on success', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
    
    render(<Preferences />);
    
    // Select some preferences
    fireEvent.click(screen.getByLabelText('Politics'));
    fireEvent.click(screen.getByLabelText('Tech'));
    fireEvent.click(screen.getByLabelText('BBC'));
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Save Preferences' }));
    
    // Verify axios was called with correct data
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:8000/api/user/preferences',
        expect.objectContaining({
          preferences: expect.objectContaining({
            categories: ['Politics', 'Tech'],
            sources: ['BBC']
          })
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer fake-token'
          })
        })
      );
      
      // Verify navigation occurred
      expect(mockNavigate).toHaveBeenCalledWith('/for-you');
    });
  });

  it('handles API errors correctly', async () => {
    // Mock axios to reject
    axios.put.mockRejectedValueOnce({
      response: {
        data: {
          error: 'Update failed'
        }
      }
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
    // Mock axios to reject with invalid token error
    axios.put.mockRejectedValueOnce({
      response: {
        data: {
          error: 'Invalid token'
        }
      }
    });
    
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
    
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
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
    
    render(<Preferences />);
    
    // Click skip button
    fireEvent.click(screen.getByRole('button', { name: 'Skip for now' }));
    
    // Verify navigation
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});