// src/components/__tests__/progress.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Progress } from '../ui/progress';

describe('Progress Component', () => {

  it('applies green color for values <= 25', () => {
    render(<Progress value={20} />);
    
    const indicator = screen.getByRole('progressbar').querySelector('[data-slot="progress-indicator"]');
    expect(indicator).toHaveClass('bg-green-500');
    expect(screen.getByText('20%')).toHaveClass('text-green-500');
  });

  it('applies yellow color for values <= 50', () => {
    render(<Progress value={45} />);
    
    const indicator = screen.getByRole('progressbar').querySelector('[data-slot="progress-indicator"]');
    expect(indicator).toHaveClass('bg-yellow-500');
    expect(screen.getByText('45%')).toHaveClass('text-yellow-500');
  });

  it('applies orange color for values <= 75', () => {
    render(<Progress value={70} />);
    
    const indicator = screen.getByRole('progressbar').querySelector('[data-slot="progress-indicator"]');
    expect(indicator).toHaveClass('bg-orange-500');
    expect(screen.getByText('70%')).toHaveClass('text-orange-500');
  });

  it('applies red color for values > 75', () => {
    render(<Progress value={90} />);
    
    const indicator = screen.getByRole('progressbar').querySelector('[data-slot="progress-indicator"]');
    expect(indicator).toHaveClass('bg-red-500');
    expect(screen.getByText('90%')).toHaveClass('text-red-500');
  });

  it('applies custom className to the root element', () => {
    render(<Progress className="custom-class" value={50} />);
    
    expect(screen.getByRole('progressbar')).toHaveClass('custom-class');
  });
});