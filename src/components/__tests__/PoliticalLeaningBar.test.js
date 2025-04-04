// src/components/__tests__/PoliticalLeaningBar.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PoliticalLeaningBar from '../PoliticalLeaningBar';

// Mock the next-themes hook
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    systemTheme: 'light',
  }),
}));

// Mock canvas operations
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  createLinearGradient: jest.fn(() => ({
    addColorStop: jest.fn(),
  })),
  fillRect: jest.fn(),
}));

Object.defineProperty(HTMLCanvasElement.prototype, 'offsetWidth', {
  configurable: true,
  value: 500,
});

Object.defineProperty(HTMLCanvasElement.prototype, 'offsetHeight', {
  configurable: true,
  value: 50,
});

describe('PoliticalLeaningBar Component', () => {
  const defaultData = {
    farLeft: 0.2,
    leanLeft: 0.2,
    center: 0.2,
    leanRight: 0.2,
    farRight: 0.2,
  };

  it('renders with political leaning data', () => {
    render(<PoliticalLeaningBar data={defaultData} />);
    
    expect(screen.getByText('Far Left')).toBeInTheDocument();
    expect(screen.getByText('Lean Left')).toBeInTheDocument();
    expect(screen.getByText('Center')).toBeInTheDocument();
    expect(screen.getByText('Lean Right')).toBeInTheDocument();
    expect(screen.getByText('Far Right')).toBeInTheDocument();
    
    // Check percentages - use regex to match the formatted percentage
    const percentageTexts = screen.getAllByText(/20\.0%/);
    expect(percentageTexts.length).toBe(5); // One for each category
  });

  it('renders with left-leaning bias', () => {
    const leftBiasData = {
      farLeft: 0.4,
      leanLeft: 0.3,
      center: 0.2,
      leanRight: 0.05,
      farRight: 0.05,
    };
    
    render(<PoliticalLeaningBar data={leftBiasData} />);
    
    // Check for specific percentages
    expect(screen.getByText(/40\.0%/)).toBeInTheDocument(); // farLeft
    expect(screen.getByText(/30\.0%/)).toBeInTheDocument(); // leanLeft
    expect(screen.getByText(/20\.0%/)).toBeInTheDocument(); // center
    
    // Both leanRight and farRight have 5.0%
    const fivePercentTexts = screen.getAllByText(/5\.0%/);
    expect(fivePercentTexts.length).toBe(2);
  });

  it('renders with right-leaning bias', () => {
    const rightBiasData = {
      farLeft: 0.05,
      leanLeft: 0.05,
      center: 0.2,
      leanRight: 0.3,
      farRight: 0.4,
    };
    
    render(<PoliticalLeaningBar data={rightBiasData} />);
    
    // Both farLeft and leanLeft have 5.0%
    const fivePercentTexts = screen.getAllByText(/5\.0%/);
    expect(fivePercentTexts.length).toBe(2);
    
    expect(screen.getByText(/20\.0%/)).toBeInTheDocument(); // center
    expect(screen.getByText(/30\.0%/)).toBeInTheDocument(); // leanRight
    expect(screen.getByText(/40\.0%/)).toBeInTheDocument(); // farRight
  });

  it('renders with center bias', () => {
    const centerBiasData = {
      farLeft: 0.1,
      leanLeft: 0.2,
      center: 0.4,
      leanRight: 0.2,
      farRight: 0.1,
    };
    
    render(<PoliticalLeaningBar data={centerBiasData} />);
    
    // Both farLeft and farRight have 10.0%
    const tenPercentTexts = screen.getAllByText(/10\.0%/);
    expect(tenPercentTexts.length).toBe(2);
    
    // Both leanLeft and leanRight have 20.0%
    const twentyPercentTexts = screen.getAllByText(/20\.0%/);
    expect(twentyPercentTexts.length).toBe(2);
    
    expect(screen.getByText(/40\.0%/)).toBeInTheDocument(); // center
  });

  it('renders with custom class name', () => {
    render(<PoliticalLeaningBar data={defaultData} className="custom-container" />);
    
    const container = screen.getByLabelText('Political leaning distribution visualization').closest('div');
    expect(container).toHaveClass('custom-container');
  });

  it('handles zero values gracefully', () => {
    const zeroData = {
      farLeft: 0,
      leanLeft: 0,
      center: 0,
      leanRight: 0,
      farRight: 1,
    };
    
    render(<PoliticalLeaningBar data={zeroData} />);
    
    // Check for zero percentages
    const zeroPercentTexts = screen.getAllByText(/0\.0%/);
    expect(zeroPercentTexts.length).toBe(5); // Four categories with 0%
    
    expect(screen.getByText(/100\.0%/)).toBeInTheDocument(); // farRight with 100%
  });

  it('renders canvas element correctly', () => {
    render(<PoliticalLeaningBar data={defaultData} />);
    
    const canvas = screen.getByLabelText('Political leaning distribution visualization');
    expect(canvas).toBeInTheDocument();
    expect(canvas.tagName.toLowerCase()).toBe('canvas');
  });

  it('renders color indicators for each category', () => {
    render(<PoliticalLeaningBar data={defaultData} />);
    
    // Check that we have 5 color indicators (one for each category)
    const colorIndicators = document.querySelectorAll('.w-4.h-4.rounded-full');
    expect(colorIndicators.length).toBe(5);
  });
});