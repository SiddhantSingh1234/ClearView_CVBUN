// src/components/__tests__/dropdown-menu.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup
} from '../ui/dropdown-menu';

// Mock the Radix UI components
jest.mock('@radix-ui/react-dropdown-menu', () => ({
  Root: ({ children, open, onOpenChange }) => (
    <div data-testid="dropdown-root" data-open={open} onClick={() => onOpenChange && onOpenChange(!open)}>
      {children}
    </div>
  ),
  Trigger: ({ children }) => <button data-testid="dropdown-trigger">{children}</button>,
  Portal: ({ children }) => <div data-testid="dropdown-portal">{children}</div>,
  Content: ({ children, ...props }) => (
    <div data-testid="dropdown-content" {...props}>
      {children}
    </div>
  ),
  Item: ({ children, onSelect, ...props }) => (
    <div data-testid="dropdown-item" onClick={() => onSelect && onSelect()} {...props}>
      {children}
    </div>
  ),
  CheckboxItem: ({ children, checked, onCheckedChange, ...props }) => (
    <div 
      data-testid="dropdown-checkbox-item" 
      data-checked={checked} 
      onClick={() => onCheckedChange && onCheckedChange(!checked)}
      {...props}
    >
      {children}
    </div>
  ),
  RadioGroup: ({ children, value, onValueChange, ...props }) => (
    <div 
      data-testid="dropdown-radio-group" 
      data-value={value}
      {...props}
    >
      {children}
    </div>
  ),
  RadioItem: ({ children, value, onSelect, ...props }) => (
    <div 
      data-testid="dropdown-radio-item" 
      data-value={value}
      onClick={() => onSelect && onSelect()}
      {...props}
    >
      {children}
    </div>
  ),
  Label: ({ children, ...props }) => <div data-testid="dropdown-label" {...props}>{children}</div>,
  Separator: ({ ...props }) => <hr data-testid="dropdown-separator" {...props} />
}));

describe('DropdownMenu Component', () => {
  it('renders dropdown trigger and content', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    
    expect(screen.getByText('Open Menu')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
  });

  it('renders dropdown menu items', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('handles item selection', () => {
    const handleSelect = jest.fn();
    
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={handleSelect}>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    
    fireEvent.click(screen.getByText('Item 1'));
    expect(handleSelect).toHaveBeenCalledTimes(1);
  });

  it('renders label and separator', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Menu Label</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    
    expect(screen.getByText('Menu Label')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-separator')).toBeInTheDocument();
  });

  it('applies custom className to content', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent className="custom-content-class">
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    
    expect(screen.getByTestId('dropdown-content')).toHaveClass('custom-content-class');
  });
});