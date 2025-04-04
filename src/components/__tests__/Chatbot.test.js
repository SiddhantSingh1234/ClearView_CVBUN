// src/components/__tests__/Chatbot.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Chatbot from '../chatbot';

describe('Chatbot Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockReset();
    global.fetch = jest.fn();
  });

  it('renders the chatbot interface', () => {
    render(<Chatbot onClose={mockOnClose} />);
    
    expect(screen.getByText('ClearView Assistant')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your question here...')).toBeInTheDocument();
    //expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });
  

  it('calls onClose when close button is clicked', () => {
    render(<Chatbot onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('updates input value when typing', () => {
    render(<Chatbot onClose={mockOnClose} />);
    
    const input = screen.getByPlaceholderText('Type your question here...');
    fireEvent.change(input, { target: { value: 'What is fake news?' } });
    
    expect(input).toHaveValue('What is fake news?');
  });

  it('submits question and displays response', async () => {
    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ answer: 'Fake news refers to false or misleading information presented as news.' })
    });
  
    render(<Chatbot onClose={mockOnClose} />);
    
    // Type a question
    const input = screen.getByPlaceholderText('Type your question here...');
    fireEvent.change(input, { target: { value: 'What is fake news?' } });
    
    // Submit the form instead of clicking the button
    const form = screen.getByRole('textbox').closest('form');
    fireEvent.submit(form);
    
    // Wait for both question and answer to appear
    await waitFor(() => {
      expect(screen.getByText('Q: What is fake news?')).toBeInTheDocument();
      expect(screen.getByText('A: Fake news refers to false or misleading information presented as news.')).toBeInTheDocument();
    });
    
    // Check that input was cleared
    expect(input).toHaveValue('');
    
    // Verify API call with correct endpoint URL
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:9000/api/chatbot',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: 'What is fake news?' })
      })
    );
  });

  it('handles API errors gracefully', async () => {
    // Mock failed API response
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    
    // Mock console.error
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    render(<Chatbot onClose={mockOnClose} />);
    
    // Type and submit a question
    const input = screen.getByPlaceholderText('Type your question here...');
    fireEvent.change(input, { target: { value: 'What is fake news?' } });
    
    // Submit the form
    const form = screen.getByRole('textbox').closest('form');
    fireEvent.submit(form);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Error: Failed to get a response.')).toBeInTheDocument();
    });
    
    // Verify console.error was called
    expect(console.error).toHaveBeenCalled();
    
    // Restore original console.error
    console.error = originalConsoleError;
  });

  it('prevents submission of empty questions', () => {
    render(<Chatbot onClose={mockOnClose} />);
    
    // Try to submit without typing anything
    const form = screen.getByRole('textbox').closest('form');
    fireEvent.submit(form);
    
    // Verify no API call was made
    expect(global.fetch).not.toHaveBeenCalled();
  });
});