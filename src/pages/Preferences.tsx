import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPreferences } from '../types';
import axios from 'axios'; // Add axios for API calls

const Preferences = () => {
  const { userData, updateUserPreferences } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    categories: [],
    // topics: [],
    sources: [],
    // favorites: []
  });

  const categories = [
    'Politics', 'Business', 'Tech',
    'Sports', 'Entertainment', 'General'
  ];

  const topicsByCategory: Record<string, string[]> = {
    Politics: ['US Politics', 'International Relations', 'Elections', 'Policy', 'Legislation'],
    Business: ['Economy', 'Markets', 'Startups', 'Finance', 'Real Estate'],
    Tech: ['AI', 'Cybersecurity', 'Gadgets', 'Software', 'Internet'],
    Sports: ['Football', 'Basketball', 'Tennis', 'Soccer', 'Olympics'],
    Entertainment: ['Movies', 'Music', 'TV Shows', 'Celebrities', 'Gaming']
  };

  const sources = [
    'Associated Press', 'Reuters', 'BBC News', 'CNN', 'The New York Times', 
    'The Washington Post', 'The Guardian', 'Al Jazeera', 'Bloomberg', 'CNBC', 'Fox News', 'The Daily Wire'
  ];

  // useEffect(() => {
  //   if (userData?.preferences) {
  //     updateUserPreferences(userData.preferences);
  //   }
  // }, [userData]);

  const handleCategoryToggle = (category: string) => {
    setPreferences(prev => {
      const newCategories = prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories: newCategories };
    });
  };

  // const handleTopicToggle = (topic: string) => {
  //   setPreferences(prev => {
  //     const newTopics = prev.topics.includes(topic)
  //       ? prev.topics.filter(t => t !== topic)
  //       : [...prev.topics, topic];
  //     return { ...prev, topics: newTopics };
  //   });
  // };

  const handleSourceToggle = (source: string) => {
    setPreferences(prev => {
      const newSources = prev.sources.includes(source)
        ? prev.sources.filter(s => s !== source)
        : [...prev.sources, source];
      return { ...prev, sources: newSources };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
  
      // // 1. Get fresh token (avoid stale token from localStorage)
      // const token = localStorage.getItem('token');
      // if (!token) {
      //   throw new Error('No authentication token found');
      // }
  
      // // 2. Make request with debug logs
      // console.log('Using token:', token.slice(0, 10) + '...'); // Log partial token
      // const response = await axios.put(
      //   'http://localhost:8000/api/user/preferences',
      //   { preferences },
      //   {
      //     headers: {
      //       'Content-Type': 'application/json',
      //       'Authorization': `Bearer ${token}`
      //     }
      //   }
      // );

      // // 3. Save updated preferences to localStorage
      // localStorage.setItem('preferences', JSON.stringify(response.data.preferences));

      // // 4. Provide user feedback (optional)
      // alert('Preferences updated successfully!');

      // // 5. Navigate to main page
      // navigate("/for-you");

      updateUserPreferences(preferences);
    } catch (error:any) {
      if (error.response?.data?.error === 'Invalid token') {
        // 3. Handle token invalidation
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert('Session expired. Please login again.');
        navigate('/login');
      } else {
        console.error('Update error:', error);
        alert(error.response?.data?.error || 'Update failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Personalize Your News</h1>
      <p className="text-muted-foreground mb-8">Select your preferences to get news that matters to you.</p>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Categories</h2>
          <p className="text-muted-foreground mb-4">Select categories you're interested in:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map(category => (
              <div key={category} className="flex items-center">
                <input
                  type="checkbox"
                  id={`category-${category}`}
                  checked={preferences.categories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                  disabled={loading}
                />
                <label htmlFor={`category-${category}`} className="ml-2 text-sm text-foreground">
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Topics
        <div>
          <h2 className="text-xl font-semibold mb-4">Topics</h2>
          <p className="text-secondary-600 mb-4">Select specific topics within your chosen categories:</p>
          
          {preferences.categories.length > 0 ? (
            <div className="space-y-6">
              {preferences.categories.map(category => (
                <div key={category} className="border-b pb-4">
                  <h3 className="font-medium text-lg mb-2">{category}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {topicsByCategory[category]?.map(topic => (
                      <div key={topic} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`topic-${topic}`}
                          checked={preferences.topics.includes(topic)}
                          onChange={() => handleTopicToggle(topic)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                          disabled={loading}
                        />
                        <label htmlFor={`topic-${topic}`} className="ml-2 block text-sm text-secondary-700">
                          {topic}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-secondary-50 p-4 rounded-md text-secondary-600">
              Please select at least one category to see related topics.
            </div>
          )}
        </div> */}
        
        {/* Sources */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground">News Sources</h2>
          <p className="text-muted-foreground mb-4">Select your preferred news sources:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {sources.map(source => (
              <div key={source} className="flex items-center">
                <input
                  type="checkbox"
                  id={`source-${source}`}
                  checked={preferences.sources.includes(source)}
                  onChange={() => handleSourceToggle(source)}
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                  disabled={loading}
                />
                <label htmlFor={`source-${source}`} className="ml-2 text-sm text-foreground">
                  {source}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="pt-6 border-t border-border flex justify-end">
          <button type="button" onClick={() => navigate('/')} className="px-4 py-2 text-primary border border-primary rounded-md font-medium hover:bg-primary/10 mr-4" disabled={loading}>
            Skip for now
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Preferences;