// src/components/__tests__/CategoryFilter.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CategoryFilter from '../CategoryFilter';

describe('CategoryFilter Component', () => {
  const mockCategories = ['Technology', 'Politics', 'Health', 'Sports', 'Entertainment', 'Business', 'Science'];
  const mockSelectedCategories = ['Technology', 'Health'];
  const mockOnCategoryChange = jest.fn();

  beforeEach(() => {
    mockOnCategoryChange.mockReset();
  });

  it('renders the component with categories', () => {
    render(
      <CategoryFilter 
        categories={mockCategories} 
        selectedCategories={mockSelectedCategories} 
        onCategoryChange={mockOnCategoryChange} 
      />
    );
    
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Politics')).toBeInTheDocument();
    expect(screen.getByText('Health')).toBeInTheDocument();
    expect(screen.getByText('Sports')).toBeInTheDocument();
    expect(screen.getByText('Entertainment')).toBeInTheDocument();
    expect(screen.getByText('+2 More')).toBeInTheDocument();
  });

  it('displays selected categories with different styling', () => {
    render(
      <CategoryFilter 
        categories={mockCategories} 
        selectedCategories={mockSelectedCategories} 
        onCategoryChange={mockOnCategoryChange} 
      />
    );
    
    const technologyButton = screen.getByText('Technology');
    const politicsButton = screen.getByText('Politics');
    
    expect(technologyButton).toHaveClass('bg-primary');
    expect(politicsButton).toHaveClass('bg-secondary');
  });

  it('calls onCategoryChange when a category is clicked to add it', () => {
    render(
      <CategoryFilter 
        categories={mockCategories} 
        selectedCategories={mockSelectedCategories} 
        onCategoryChange={mockOnCategoryChange} 
      />
    );
    
    fireEvent.click(screen.getByText('Politics'));
    
    expect(mockOnCategoryChange).toHaveBeenCalledWith([...mockSelectedCategories, 'Politics']);
  });

  it('calls onCategoryChange when a selected category is clicked to remove it', () => {
    render(
      <CategoryFilter 
        categories={mockCategories} 
        selectedCategories={mockSelectedCategories} 
        onCategoryChange={mockOnCategoryChange} 
      />
    );
    
    fireEvent.click(screen.getByText('Technology'));
    
    expect(mockOnCategoryChange).toHaveBeenCalledWith(['Health']);
  });

  it('expands to show all categories when "More" button is clicked', () => {
    render(
      <CategoryFilter 
        categories={mockCategories} 
        selectedCategories={mockSelectedCategories} 
        onCategoryChange={mockOnCategoryChange} 
      />
    );
    
    fireEvent.click(screen.getByText('+2 More'));
    
    expect(screen.getByText('Business')).toBeInTheDocument();
    expect(screen.getByText('Science')).toBeInTheDocument();
    expect(screen.getByText('Show Less')).toBeInTheDocument();
  });

  it('collapses to show fewer categories when "Show Less" button is clicked', () => {
    render(
      <CategoryFilter 
        categories={mockCategories} 
        selectedCategories={mockSelectedCategories} 
        onCategoryChange={mockOnCategoryChange} 
      />
    );
    
    // First expand
    fireEvent.click(screen.getByText('+2 More'));
    // Then collapse
    fireEvent.click(screen.getByText('Show Less'));
    
    expect(screen.queryByText('Business')).not.toBeInTheDocument();
    expect(screen.queryByText('Science')).not.toBeInTheDocument();
    expect(screen.getByText('+2 More')).toBeInTheDocument();
  });
});