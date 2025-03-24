// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { UserPreferences } from '../types';
// import './Preferences.css'

// const Preferences = () => {
//   const { userData, updateUserPreferences } = useAuth();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [preferences, setPreferences] = useState<UserPreferences>({
//     categories: [],
//     topics: [],
//     sources: [],
//     favorites: []
//   });

//   const categories = [
//     'Politics', 'Business', 'Technology', 'Science', 'Health', 
//     'Sports', 'Entertainment', 'World', 'Environment', 'Education'
//   ];

//   const topicsByCategory: Record<string, string[]> = {
//     Politics: ['US Politics', 'International Relations', 'Elections', 'Policy', 'Legislation'],
//     Business: ['Economy', 'Markets', 'Startups', 'Finance', 'Real Estate'],
//     Technology: ['AI', 'Cybersecurity', 'Gadgets', 'Software', 'Internet'],
//     Science: ['Space', 'Physics', 'Biology', 'Climate', 'Research'],
//     Health: ['Medicine', 'Wellness', 'Nutrition', 'Mental Health', 'Fitness'],
//     Sports: ['Football', 'Basketball', 'Tennis', 'Soccer', 'Olympics'],
//     Entertainment: ['Movies', 'Music', 'TV Shows', 'Celebrities', 'Gaming'],
//     World: ['Europe', 'Asia', 'Middle East', 'Africa', 'Americas'],
//     Environment: ['Climate Change', 'Conservation', 'Pollution', 'Renewable Energy', 'Wildlife'],
//     Education: ['Higher Education', 'K-12', 'Learning', 'Teaching', 'Research']
//   };

//   const sources = [
//     'Associated Press', 'Reuters', 'BBC', 'CNN', 'The New York Times', 
//     'The Washington Post', 'The Guardian', 'Al Jazeera', 'Bloomberg', 'CNBC'
//   ];

//   useEffect(() => {
//     if (userData?.preferences) {
//       setPreferences(userData.preferences);
//     }
//   }, [userData]);

//   const handleCategoryToggle = (category: string) => {
//     setPreferences(prev => {
//       const newCategories = prev.categories.includes(category)
//         ? prev.categories.filter(c => c !== category)
//         : [...prev.categories, category];
      
//       return { ...prev, categories: newCategories };
//     });
//   };

//   const handleTopicToggle = (topic: string) => {
//     setPreferences(prev => {
//       const newTopics = prev.topics.includes(topic)
//         ? prev.topics.filter(t => t !== topic)
//         : [...prev.topics, topic];
      
//       return { ...prev, topics: newTopics };
//     });
//   };

//   const handleSourceToggle = (source: string) => {
//     setPreferences(prev => {
//       const newSources = prev.sources.includes(source)
//         ? prev.sources.filter(s => s !== source)
//         : [...prev.sources, source];
      
//       return { ...prev, sources: newSources };
//     });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     try {
//       setLoading(true);
//       await updateUserPreferences(preferences);
//       navigate('/for-you');
//     } catch (error) {
//       console.error('Error updating preferences:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <h1 className="text-3xl font-bold mb-6">Personalize Your News</h1>
//       <p className="text-secondary-600 mb-8">
//         Select your preferences to get news that matters to you. You can update these anytime.
//       </p>
      
//       <form onSubmit={handleSubmit}>
//         <div className="space-y-8">
//           {/* Categories */}
//           <div>
//             <h2 className="text-xl font-semibold mb-4">Categories</h2>
//             <p className="text-secondary-600 mb-4">Select categories you're interested in:</p>
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
//               {categories.map(category => (
//                 <div key={category} className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id={`category-${category}`}
//                     checked={preferences.categories.includes(category)}
//                     onChange={() => handleCategoryToggle(category)}
//                     className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
//                   />
//                   <label htmlFor={`category-${category}`} className="ml-2 block text-sm text-secondary-700">
//                     {category}
//                   </label>
//                 </div>
//               ))}
//             </div>
//           </div>
          
//           {/* Topics */}
//           <div>
//             <h2 className="text-xl font-semibold mb-4">Topics</h2>
//             <p className="text-secondary-600 mb-4">Select specific topics within your chosen categories:</p>
            
//             {preferences.categories.length > 0 ? (
//               <div className="space-y-6">
//                 {preferences.categories.map(category => (
//                   <div key={category} className="border-b pb-4">
//                     <h3 className="font-medium text-lg mb-2">{category}</h3>
//                     <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//                       {topicsByCategory[category]?.map(topic => (
//                         <div key={topic} className="flex items-center">
//                           <input
//                             type="checkbox"
//                             id={`topic-${topic}`}
//                             checked={preferences.topics.includes(topic)}
//                             onChange={() => handleTopicToggle(topic)}
//                             className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
//                           />
//                           <label htmlFor={`topic-${topic}`} className="ml-2 block text-sm text-secondary-700">
//                             {topic}
//                           </label>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="bg-secondary-50 p-4 rounded-md text-secondary-600">
//                 Please select at least one category to see related topics.
//               </div>
//             )}
//           </div>
          
//           {/* Sources */}
//           <div>
//             <h2 className="text-xl font-semibold mb-4">News Sources</h2>
//             <p className="text-secondary-600 mb-4">Select your preferred news sources:</p>
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
//               {sources.map(source => (
//                 <div key={source} className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id={`source-${source}`}
//                     checked={preferences.sources.includes(source)}
//                     onChange={() => handleSourceToggle(source)}
//                     className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
//                   />
//                   <label htmlFor={`source-${source}`} className="ml-2 block text-sm text-secondary-700">
//                     {source}
//                   </label>
//                 </div>
//               ))}
//             </div>
//           </div>
          
//           <div className="pt-6 border-t border-secondary-200">
//             <div className="flex justify-end">
//               <button
//                 type="button"
//                 onClick={() => navigate('/')}
//                 className="btn btn-secondary mr-4"
//               >
//                 Skip for now
//               </button>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="btn btn-primary"
//               >
//                 {loading ? 'Saving...' : 'Save Preferences'}
//               </button>
//             </div>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default Preferences;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPreferences } from '../types';

const Preferences = () => {
  const { userData, updateUserPreferences } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    categories: [],
    topics: [],
    sources: [],
    favorites: []
  });

  const categories = [
    'Politics', 'Business', 'Technology', 'Science', 'Health', 
    'Sports', 'Entertainment', 'World', 'Environment', 'Education'
  ];

  const topicsByCategory: Record<string, string[]> = {
    Politics: ['US Politics', 'International Relations', 'Elections', 'Policy', 'Legislation'],
    Business: ['Economy', 'Markets', 'Startups', 'Finance', 'Real Estate'],
    Technology: ['AI', 'Cybersecurity', 'Gadgets', 'Software', 'Internet'],
    Science: ['Space', 'Physics', 'Biology', 'Climate', 'Research'],
    Health: ['Medicine', 'Wellness', 'Nutrition', 'Mental Health', 'Fitness'],
    Sports: ['Football', 'Basketball', 'Tennis', 'Soccer', 'Olympics'],
    Entertainment: ['Movies', 'Music', 'TV Shows', 'Celebrities', 'Gaming'],
    World: ['Europe', 'Asia', 'Middle East', 'Africa', 'Americas'],
    Environment: ['Climate Change', 'Conservation', 'Pollution', 'Renewable Energy', 'Wildlife'],
    Education: ['Higher Education', 'K-12', 'Learning', 'Teaching', 'Research']
  };

  const sources = [
    'Associated Press', 'Reuters', 'BBC', 'CNN', 'The New York Times', 
    'The Washington Post', 'The Guardian', 'Al Jazeera', 'Bloomberg', 'CNBC'
  ];

  useEffect(() => {
    if (userData?.preferences) {
      setPreferences(userData.preferences);
    }
  }, [userData]);

  const handleCategoryToggle = (category: string) => {
    setPreferences(prev => {
      const newCategories = prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories: newCategories };
    });
  };

  const handleTopicToggle = (topic: string) => {
    setPreferences(prev => {
      const newTopics = prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic];
      return { ...prev, topics: newTopics };
    });
  };

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
      await updateUserPreferences(preferences);
      navigate('/for-you');
    } catch (error) {
      console.error('Error updating preferences:', error);
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
                />
                <label htmlFor={`category-${category}`} className="ml-2 text-sm text-foreground">
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

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
                />
                <label htmlFor={`source-${source}`} className="ml-2 text-sm text-foreground">
                  {source}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="pt-6 border-t border-border flex justify-end">
          <button type="button" onClick={() => navigate('/')} className="px-4 py-2 text-primary border border-primary rounded-md font-medium hover:bg-primary/10 mr-4">
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