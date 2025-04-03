// src/components/__tests__/PoliticalLeaningBar.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PoliticalLeaningBar from '../PoliticalLeaningBar';

describe('PoliticalLeaningBar Component', () => {
  it('renders with left and right percentages', () => {
    render(<PoliticalLeaningBar leftPercentage={30} rightPercentage={70} />);
    
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('Left')).toBeInTheDocument();
    expect(screen.getByText('Right')).toBeInTheDocument();
  });

  it('renders with equal percentages', () => {
    render(<PoliticalLeaningBar leftPercentage={50} rightPercentage={50} />);
    
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getAllByText('50%')).toHaveLength(2);
  });

  it('renders with extreme left bias', () => {
    render(<PoliticalLeaningBar leftPercentage={90} rightPercentage={10} />);
    
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('10%')).toBeInTheDocument();
    
    // Check that left bar is much wider than right bar
    const leftBar = screen.getByTestId('left-bar');
    const rightBar = screen.getByTestId('right-bar');
    
    expect(leftBar).toHaveStyle('width: 90%');
    expect(rightBar).toHaveStyle('width: 10%');
  });

  it('renders with extreme right bias', () => {
    render(<PoliticalLeaningBar leftPercentage={5} rightPercentage={95} />);
    
    expect(screen.getByText('5%')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
    
    // Check that right bar is much wider than left bar
    const leftBar = screen.getByTestId('left-bar');
    const rightBar = screen.getByTestId('right-bar');
    
    expect(leftBar).toHaveStyle('width: 5%');
    expect(rightBar).toHaveStyle('width: 95%');
  });

  it('renders with custom class names', () => {
    render(
      <PoliticalLeaningBar 
        leftPercentage={40} 
        rightPercentage={60} 
        className="custom-container"
        leftClassName="custom-left"
        rightClassName="custom-right"
      />
    );
    
    const container = screen.getByTestId('political-leaning-container');
    const leftBar = screen.getByTestId('left-bar');
    const rightBar = screen.getByTestId('right-bar');
    
    expect(container).toHaveClass('custom-container');
    expect(leftBar).toHaveClass('custom-left');
    expect(rightBar).toHaveClass('custom-right');
  });

  it('renders with custom labels', () => {
    render(
      <PoliticalLeaningBar 
        leftPercentage={40} 
        rightPercentage={60} 
        leftLabel="Liberal"
        rightLabel="Conservative"
      />
    );
    
    expect(screen.getByText('Liberal')).toBeInTheDocument();
    expect(screen.getByText('Conservative')).toBeInTheDocument();
    expect(screen.queryByText('Left')).not.toBeInTheDocument();
    expect(screen.queryByText('Right')).not.toBeInTheDocument();
  });

  it('handles zero percentages gracefully', () => {
    render(<PoliticalLeaningBar leftPercentage={0} rightPercentage={100} />);
    
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    
    const leftBar = screen.getByTestId('left-bar');
    const rightBar = screen.getByTestId('right-bar');
    
    expect(leftBar).toHaveStyle('width: 0%');
    expect(rightBar).toHaveStyle('width: 100%');
  });

  it('renders with title when provided', () => {
    render(
      <PoliticalLeaningBar 
        leftPercentage={40} 
        rightPercentage={60} 
        title="Political Bias Analysis"
      />
    );
    
    expect(screen.getByText('Political Bias Analysis')).toBeInTheDocument();
  });

  it('renders without title when not provided', () => {
    render(<PoliticalLeaningBar leftPercentage={40} rightPercentage={60} />);
    
    expect(screen.queryByText('Political Bias Analysis')).not.toBeInTheDocument();
  });
});