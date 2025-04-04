import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '../AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('axios');
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn()
}));
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Test component to access auth context
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="loading">{auth.loading.toString()}</div>
      <div data-testid="user">{auth.userData ? JSON.stringify(auth.userData) : 'no-user'}</div>
      <button onClick={() => auth.login('test@example.com', 'password')}>Login</button>
      <button onClick={() => auth.signup('testuser', 'test@example.com', 'password')}>Signup</button>
      <button onClick={auth.logout}>Logout</button>
      <button onClick={() => auth.updateUserPreferences({ categories: ['news'], sources: ['bbc'] })}>
        Update Preferences
      </button>
      <button onClick={() => auth.likeArticle('article123')}>Like Article</button>
    </div>
  );
};

describe('AuthContext', () => {
  const mockNavigate = jest.fn();
  const mockUser = {
    _id: 'user123',
    username: 'testuser',
    email: 'test@example.com',
    preferences: { categories: [], sources: [] },
    likedArticles: [],
    likedVideos: [],
    comments: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    // Fix the useNavigate mock
    const navigateMock = useNavigate;
    navigateMock.mockReturnValue(mockNavigate);
  });

//   it('initializes with loading state and no user', async () => {
//     render(
//       <AuthProvider>
//         <TestComponent />
//       </AuthProvider>
//     );

//     expect(screen.getByTestId('loading')).toHaveTextContent('true');
    
//     await waitFor(() => {
//       expect(screen.getByTestId('loading')).toHaveTextContent('false');
//     });
    
//     expect(screen.getByTestId('user')).toHaveTextContent('no-user');
//   });

  it('fetches user data on initialization if token exists', async () => {
    mockLocalStorage.getItem.mockReturnValueOnce('fake-token');
    axios.get.mockResolvedValueOnce({ data: mockUser });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(axios.get).toHaveBeenCalledWith('http://localhost:8000/api/auth/me', {
      headers: { Authorization: 'Bearer fake-token' }
    });
    expect(screen.getByTestId('user')).toContainHTML(mockUser.username);
  });

  it('handles fetch user error by logging out', async () => {
    mockLocalStorage.getItem.mockReturnValueOnce('fake-token');
    axios.get.mockRejectedValueOnce(new Error('Network error'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  it('logs in user successfully', async () => {
    // Setup the mock response
    axios.post.mockResolvedValueOnce({
      data: { token: 'new-token', user: mockUser }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Use waitFor to handle the async click
    await waitFor(() => {
      fireEvent.click(screen.getByText('Login'));
    });

    // Check API call
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/login',
        { email: 'test@example.com', password: 'password' }
      );
    });

    // Check side effects
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'new-token');
      expect(toast.success).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/for-you');
    });
  });

//   it('handles login error', async () => {
//     // Setup error response
//     axios.post.mockRejectedValueOnce({
//       response: {
//         data: { message: 'Invalid credentials' }
//       }
//     });

//     render(
//       <AuthProvider>
//         <TestComponent />
//       </AuthProvider>
//     );

//     await waitFor(() => {
//       expect(screen.getByTestId('loading')).toHaveTextContent('false');
//     });

//     // Use waitFor to handle the async click
//     await waitFor(() => {
//       fireEvent.click(screen.getByText('Login'));
//     });

//     // Check error handling
//     await waitFor(() => {
//       expect(toast.error).toHaveBeenCalled();
//       expect(screen.getByTestId('user')).toHaveTextContent('no-user');
//     });
//   });

  it('signs up user successfully', async () => {
    // Setup the mock response
    axios.post.mockResolvedValueOnce({
      data: { token: 'new-token', user: mockUser }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Use waitFor to handle the async click
    await waitFor(() => {
      fireEvent.click(screen.getByText('Signup'));
    });

    // Check API call
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/signup',
        { username: 'testuser', email: 'test@example.com', password: 'password' }
      );
    });

    // Check side effects
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'new-token');
      expect(toast.success).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/preferences');
    });
  });

//   it('handles signup error', async () => {
//     // Setup error response
//     axios.post.mockRejectedValueOnce({
//       response: {
//         data: { message: 'Email already exists' }
//       }
//     });

//     render(
//       <AuthProvider>
//         <TestComponent />
//       </AuthProvider>
//     );

//     await waitFor(() => {
//       expect(screen.getByTestId('loading')).toHaveTextContent('false');
//     });

//     // Use waitFor to handle the async click
//     await waitFor(() => {
//       fireEvent.click(screen.getByText('Signup'));
//     });

//     // Check error handling
//     await waitFor(() => {
//       expect(toast.error).toHaveBeenCalled();
//       expect(screen.getByTestId('user')).toHaveTextContent('no-user');
//     });
//   });

  it('logs out user', async () => {
    // Setup user as logged in
    mockLocalStorage.getItem.mockReturnValueOnce('fake-token');
    axios.get.mockResolvedValueOnce({ data: mockUser });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toContainHTML(mockUser.username);
    });

    act(() => {
      screen.getByText('Logout').click();
    });

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

//   it('updates user preferences successfully', async () => {
//     // Setup user as logged in
//     mockLocalStorage.getItem.mockReturnValueOnce('fake-token');
//     axios.get.mockResolvedValueOnce({ data: mockUser });
    
//     const updatedPreferences = { categories: ['news'], sources: ['bbc'] };
//     axios.put.mockResolvedValueOnce({
//       data: { preferences: updatedPreferences }
//     });

//     render(
//       <AuthProvider>
//         <TestComponent />
//       </AuthProvider>
//     );

//     await waitFor(() => {
//       expect(screen.getByTestId('loading')).toHaveTextContent('false');
//     });

//     // Use waitFor to handle the async click
//     await waitFor(() => {
//       fireEvent.click(screen.getByText('Update Preferences'));
//     });

//     // Check API call
//     await waitFor(() => {
//       expect(axios.put).toHaveBeenCalledWith(
//         'http://localhost:8000/api/user/preferences',
//         { preferences: updatedPreferences },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': 'Bearer fake-token'
//           }
//         }
//       );
//     });

//     // Check side effects
//     await waitFor(() => {
//       expect(toast.success).toHaveBeenCalled();
//       expect(mockNavigate).toHaveBeenCalledWith('/for-you');
//     });
//   });

//   it('handles preference update with no token', async () => {
//     // Ensure localStorage.getItem returns null for token
//     mockLocalStorage.getItem.mockReturnValue(null);

//     render(
//       <AuthProvider>
//         <TestComponent />
//       </AuthProvider>
//     );

//     await waitFor(() => {
//       expect(screen.getByTestId('loading')).toHaveTextContent('false');
//     });

//     // Use waitFor to handle the async click
//     await waitFor(() => {
//       fireEvent.click(screen.getByText('Update Preferences'));
//     });

//     // Check error handling
//     await waitFor(() => {
//       expect(toast.error).toHaveBeenCalled();
//     });
//   });

//   it('handles preference update error', async () => {
//     mockLocalStorage.getItem.mockReturnValue('fake-token');
//     axios.put.mockRejectedValueOnce({
//       response: {
//         data: { message: 'Update failed' }
//       }
//     });

//     render(
//       <AuthProvider>
//         <TestComponent />
//       </AuthProvider>
//     );

//     await waitFor(() => {
//       expect(screen.getByTestId('loading')).toHaveTextContent('false');
//     });

//     // Use waitFor to handle the async click
//     await waitFor(() => {
//       fireEvent.click(screen.getByText('Update Preferences'));
//     });

//     // Check error handling
//     await waitFor(() => {
//       expect(toast.error).toHaveBeenCalled();
//     });
//   });

  it('likes an article successfully', async () => {
    // Setup user as logged in
    mockLocalStorage.getItem.mockReturnValue('fake-token');
    axios.get.mockResolvedValueOnce({ data: mockUser });
    
    const updatedUser = {
      ...mockUser,
      likedArticles: ['article123']
    };
    
    axios.post.mockResolvedValueOnce({ data: updatedUser });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Use waitFor to handle the async click
    await waitFor(() => {
      fireEvent.click(screen.getByText('Like Article'));
    });

    // Check API call
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/user/like',
        { articleId: 'article123' },
        {
          headers: { Authorization: 'Bearer fake-token' }
        }
      );
    });
  });

//   it('handles like article with no token', async () => {
//     // Ensure localStorage.getItem returns null for token
//     mockLocalStorage.getItem.mockReturnValue(null);

//     render(
//       <AuthProvider>
//         <TestComponent />
//       </AuthProvider>
//     );

//     await waitFor(() => {
//       expect(screen.getByTestId('loading')).toHaveTextContent('false');
//     });

//     // Mock console.error to prevent test output pollution
//     const originalError = console.error;
//     console.error = jest.fn();

//     // Click and expect error to be handled
//     fireEvent.click(screen.getByText('Like Article'));
    
//     // Wait for any async operations
//     await waitFor(() => {});
    
//     // Restore console.error
//     console.error = originalError;
//   });

//   it('handles like article error', async () => {
//     mockLocalStorage.getItem.mockReturnValue('fake-token');
//     axios.post.mockRejectedValueOnce(new Error('Like failed'));

//     render(
//       <AuthProvider>
//         <TestComponent />
//       </AuthProvider>
//     );

//     await waitFor(() => {
//       expect(screen.getByTestId('loading')).toHaveTextContent('false');
//     });

//     // Mock console.error to prevent test output pollution
//     const originalError = console.error;
//     console.error = jest.fn();

//     // Click and expect error to be handled
//     fireEvent.click(screen.getByText('Like Article'));
    
//     // Wait for any async operations
//     await waitFor(() => {});
    
//     // Restore console.error
//     console.error = originalError;
//   });
});