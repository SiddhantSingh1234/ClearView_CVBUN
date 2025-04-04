// src/pages/__tests__/Subscription.test.js
import React from 'react';
import { jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Subscription from '../Subscription';

// Mock the AuthContext
jest.mock('../../context/AuthContext', () => ({
  __esModule: true,
  useAuth: () => ({
    userData: { id: 'user123', name: 'Test User' }
  })
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, className }) => (
    <a href={to} className={className}>
      {children}
    </a>
  )
}));

describe('Subscription Component', () => {
  beforeEach(() => {
    // Mock console.log
    console.log = jest.fn();
  });

  it('renders subscription plans correctly', () => {
    render(<Subscription />);
    
    // Check for plan titles
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('Basic')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
    
    // Check for prices
    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getByText('$4.99')).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();
    
    // Check for features
    expect(screen.getByText('Limited access to articles')).toBeInTheDocument();
    expect(screen.getByText('Unlimited article access')).toBeInTheDocument();
    expect(screen.getByText('Everything in Basic')).toBeInTheDocument();
  });

  it('allows selecting different plans', () => {
    render(<Subscription />);
    
    // By default, Basic should be selected
    const basicPlanButton = screen.getAllByText('Selected')[0];
    expect(basicPlanButton).toBeInTheDocument();
    
    // Select Free plan
    const freePlanButton = screen.getAllByText('Select')[0];
    fireEvent.click(freePlanButton);
    
    // Now Free plan should be selected
    expect(screen.getAllByText('Selected')[0]).toBeInTheDocument();
    
    // Select Premium plan
    const premiumPlanButton = screen.getAllByText('Select')[1];
    fireEvent.click(premiumPlanButton);
    
    // Now Premium plan should be selected
    expect(screen.getAllByText('Selected')[0]).toBeInTheDocument();
  });

  it('shows login/signup prompt for logged out users', () => {
    // Override auth context to return null user
    jest.spyOn(require('../../context/AuthContext'), 'useAuth').mockReturnValue({
      userData: null
    });
    
    render(<Subscription />);
    
    expect(screen.getByText('You need to be logged in to subscribe')).toBeInTheDocument();
    
    // Check for login/signup links
    const signInLink = screen.getByText('Sign In');
    const createAccountLink = screen.getByText('Create Account');
    
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute('href', '/login');
    
    expect(createAccountLink).toBeInTheDocument();
    expect(createAccountLink).toHaveAttribute('href', '/signup');
  });
});