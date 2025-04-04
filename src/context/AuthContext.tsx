import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import mongoose from 'mongoose'

interface User {
  _id: string;
  username: string;
  email: string;
  preferences: { categories: string[], sources: string[] };
  likedArticles: string[];
  likedVideos: string[];
  comments: { articleId: string; text: string }[];
}

interface AuthContextType {
  userData: User | null;
  setUserData: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserPreferences: (preferences: { categories: string[], sources: string[] }) => Promise<void>;
  likeArticle: (articleId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return setLoading(false);

        const response = await axios.get('http://localhost:8000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      console.log(response.data.user);
      setUserData(response.data.user);
      toast.success("Login successfull.", {
        id: `login-successful`, // To prevent duplicates
        duration: 2000, // 2 seconds
        position: 'bottom-center',
      });
      navigate('/for-you')
    } catch (error) {
      console.error('Login failed:', error);
      toast.error("Login failed.", {
        id: `login-failed`, // To prevent duplicates
        duration: 2000, // 2 seconds
        position: 'bottom-center',
      });
      throw new Error('Invalid credentials');
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/signup', { username, email, password });
      localStorage.setItem('token', response.data.token);
      setUserData(response.data.user);
      toast.success("Account created successfully", {
        id: `account-created`, // To prevent duplicates
        duration: 2000, // 2 seconds
        position: 'bottom-center',
      });
      navigate('/preferences');
    } catch (error) {
      console.error('Signup failed:', error);
      toast.error("Signup failed.", {
        id: `signin-failed`, // To prevent duplicates
        duration: 2000, // 2 seconds
        position: 'bottom-center',
      });
      throw new Error('Signup error');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUserData(null);
  };

  const updateUserPreferences = async (preferences: { categories: string[], sources: string[] }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Login to set preferences.", {
          id: `login-first-preferences`, // To prevent duplicates
          duration: 2000, // 2 seconds
          position: 'bottom-center',
        });
        throw new Error('Not authenticated');
      }

      const response = await axios.put(
          'http://localhost:8000/api/user/preferences',
          { preferences },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

      setUserData(prevUserData => {
        if (!prevUserData) return null; // Handle case where userData is null
      
        return {
          ...prevUserData,  // Spread previous user data
          preferences: response.data.preferences, // Update only preferences
        };
      });
      toast.success("Preferences updated successfully", {
        id: `preferences-updated`, // To prevent duplicates
        duration: 2000, // 2 seconds
        position: 'bottom-center',
      });
      navigate('/for-you')
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error("Error updating preferences", {
        id: `error-updating-preferences`, // To prevent duplicates
        duration: 2000, // 2 seconds
        position: 'bottom-center',
      });
      throw new Error('Failed to update preferences');
    }
  };

  const likeArticle = async (articleId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await axios.post('http://localhost:8000/api/user/like', { articleId }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserData(response.data);
    } catch (error) {
      console.error('Error liking article:', error);
      throw new Error('Failed to like article');
    }
  };

  return (
    <AuthContext.Provider value={{ userData, setUserData, loading, login, signup, logout, updateUserPreferences, likeArticle }}>
      {children}
    </AuthContext.Provider>
  );
};