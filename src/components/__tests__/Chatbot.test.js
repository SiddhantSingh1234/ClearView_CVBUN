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
    
    // Submit the question - use type="submit" instead of name
    const sendButton = screen.getByRole('button', { type: 'submit' });
    fireEvent.click(sendButton);
    
    // Wait for response
    await waitFor(() => {
      expect(screen.getByText('Fake news refers to false or misleading information presented as news.')).toBeInTheDocument();
    });
    
    // Check that input was cleared
    expect(input).toHaveValue('');
    
    // Verify API call
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/chatbot',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: 'What is fake news?' })
      })
    );
  });

  it('handles API errors gracefully', async () => {
    // ... existing code ...
    
    // Type and submit a question
    const input = screen.getByPlaceholderText('Type your question here...');
    fireEvent.change(input, { target: { value: 'What is fake news?' } });
    
    const sendButton = screen.getByRole('button', { type: 'submit' });
    fireEvent.click(sendButton);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(i)).toBeInTheDocument();
    });
    
    expect(console.error).toHaveBeenCalled();
  });

  it('prevents submission of empty questions', () => {
    render(<Chatbot onClose={mockOnClose} />);
    
    // Try to submit without typing anything
    const sendButton = screen.getByRole('button', { type: 'submit' });
    fireEvent.click(sendButton);
    
    // Verify no API call was made
    expect(global.fetch).not.toHaveBeenCalled();
  });
});