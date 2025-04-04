// src/pages/__tests__/Chatbotpage.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatbotPage from '../Chatbotpage';

// Mock console.log
const originalConsoleLog = console.log;
const mockConsoleLog = jest.fn();

// Mock the Chatbot component with onClose handler
jest.mock('../../components/chatbot', () => {
  return function MockChatbot({ onClose }) {
    return (
      <div data-testid="mock-chatbot">
        Mock Chatbot Component
        <button onClick={onClose} data-testid="close-button">
          Close Chatbot
        </button>
      </div>
    );
  };
});

describe('ChatbotPage Component', () => {
  beforeEach(() => {
    // Setup console.log mock before each test
    console.log = mockConsoleLog;
  });

  afterEach(() => {
    // Restore original console.log after each test
    console.log = originalConsoleLog;
    mockConsoleLog.mockClear();
  });

  it('renders the chatbot page with title', () => {
    render(<ChatbotPage />);
    
    // Check if the title is rendered
    expect(screen.getByText('Chatbot Page')).toBeInTheDocument();
  });

  it('renders the Chatbot component', () => {
    render(<ChatbotPage />);
    
    // Check if the mocked Chatbot component is rendered
    expect(screen.getByTestId('mock-chatbot')).toBeInTheDocument();
  });

  it('passes onClose prop to Chatbot component', () => {
    render(<ChatbotPage />);
    
    // Simulate clicking the close button
    fireEvent.click(screen.getByTestId('close-button'));
    
    // Verify that console.log was called with the expected message
    expect(mockConsoleLog).toHaveBeenCalledWith('Chatbot closed');
  });

  it('has the correct structure with container div', () => {
    const { container } = render(<ChatbotPage />);
    
    // Check that the component has the expected structure
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild.tagName).toBe('DIV');
    expect(container.firstChild.childNodes.length).toBe(2); // Title and Chatbot
  });

  it('renders heading with correct level and text', () => {
    render(<ChatbotPage />);
    
    // Check that the heading is an h1 with the correct text
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Chatbot Page');
  });
});