// import { useState, useEffect } from 'react';
// import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
// import { db } from '../firebase/config';
// import { useAuth } from '../context/AuthContext';
// import ArticleCard from '../components/ArticleCard';
// import { Article } from '../types';
// import './ForYou.css'

// const ForYou = () => {
//   const { userData } = useAuth();
//   const [articles, setArticles] = useState<Article[]>([]);
//   const [loading, setLoading] = useState(true);
  
//   useEffect(() => {
//     const fetchPersonalizedArticles = async () => {
//       if (!userData) return;
      
//       try {
//         setLoading(true);
//         const articlesRef = collection(db, 'articles');
        
//         // Get user preferences
//         const { categories = [], topics = [] } = userData.preferences;
        
//         // If user has preferences, filter by them
//         let articlesQuery;
//         if (categories.length > 0 || topics.length > 0) {
//           articlesQuery = query(
//             articlesRef,
//             where('category', 'in', categories.length > 0 ? categories : ['Politics', 'Technology', 'Business']),
//             orderBy('publishedAt', 'desc'),
//             limit(20)
//           );
//         } else {
//           // Default recommendations if no preferences
//           articlesQuery = query(
//             articlesRef,
//             orderBy('publishedAt', 'desc'),
//             limit(20)
//           );
//         }
        
//         const querySnapshot = await getDocs(articlesQuery);
        
//         const articlesData = querySnapshot.docs.map(doc => {
//           const data = doc.data();
//           return {
//             ...data,
//             id: doc.id,
//             publishedAt: data.publishedAt.toDate(),
//           } as Article;
//         });
        
//         setArticles(articlesData);
//       } catch (error) {
//         console.error('Error fetching personalized articles:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPersonalizedArticles();
//   }, [userData]);

//   const handleLike = (articleId: string) => {
//     setArticles(articles.map(article => 
//       article.id === articleId 
//         ? { ...article, likes: article.likes + 1 } 
//         : article
//     ));
//   };

//   const handleShare = (articleId: string) => {
//     const article = articles.find(a => a.id === articleId);
//     if (article) {
//       console.log(`Sharing article: ${article.title}`);
//     }
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <h1 className="text-3xl font-bold mb-6">For You</h1>
      
//       {!userData ? (
//         <div className="card p-6 text-center">
//           <h2 className="text-xl font-semibold mb-3">Personalize Your News Feed</h2>
//           <p className="text-secondary-600 mb-4">
//             Sign in to get news recommendations tailored to your interests.
//           </p>
//           <div className="flex justify-center space-x-4">
//             <a href="/login" className="btn btn-primary">
//               Sign In
//             </a>
//             <a href="/signup" className="btn btn-outline">
//               Create Account
//             </a>
//           </div>
//         </div>
//       ) : loading ? (
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
//         </div>
//       ) : articles.length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {articles.map(article => (
//             <ArticleCard 
//               key={article.id} 
//               article={article} 
//               onLike={handleLike}
//               onShare={handleShare}
//             />
//           ))}
//         </div>
//       ) : (
//         <div className="text-center py-12">
//           <p className="text-xl text-secondary-500">No personalized articles found</p>
//           <p className="mt-2 text-secondary-400">
//             Update your preferences to get more relevant news
//           </p>
//           <a href="/preferences" className="btn btn-primary mt-4">
//             Update Preferences
//           </a>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ForYou;

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ArticleCard from '../components/ArticleCard';
import { Article } from '../types';
import axios from 'axios';
import { FakeNewsPercentages, SentimentAnalysisScore } from '../types';
import { LeftRightPercentages } from '../types';

interface FilterType {
  category?: { $in: string[] };
  source?: { $in: string[] };
}

const ForYou = () => {
  const { userData } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [articlesWithAnalysis, setArticlesWithAnalysis] = useState<(Article & { 
      biasAnalysis?: LeftRightPercentages 
    } & {
      fakeNewsAnalysis?: FakeNewsPercentages
    } & {
      sentimentAnalysis?: SentimentAnalysisScore
    })[]>([]);

  useEffect(() => {
    const fetchPersonalizedArticles = async () => {
      if (!userData) return;

      try {
        setLoading(true);
        console.log(userData.preferences);  // Debugging line to check user preferences

        // Get categories and sources from user preferences
        const { categories = [], sources = [] } = userData.preferences;

        // Default categories and sources if none are set
        const defaultCategories = ['Politics', 'Technology', 'Business'];
        const queryCategories = categories.length > 0 ? categories : defaultCategories;
        const querySources = sources.length > 0 ? sources : [];

        const filter: FilterType = {};
        if (queryCategories.length > 0) {
          filter.category = { $in: queryCategories };
        }
        if (querySources.length > 0) {
          filter.source = { $in: querySources };
        }

        // Convert filter to a query string
        const queryString = new URLSearchParams({ filter: JSON.stringify(filter) }).toString();
        console.log(queryString);

        try {
          const response = await fetch(`http://127.0.0.1:5000/for_you_news?${queryString}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();
          console.log(data); // Debugging line to check the fetched articles
          // Initialize articles without analysis
          setArticlesWithAnalysis(data.map((article: Article) => ({
            ...article,
            biasAnalysis: undefined
          })));

          data.forEach(async (article: Article) => {
            try {
              const response = await fetch('http://127.0.0.1:3000/analyse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  input_text: `${article.title} [SEP] ${article.content} [SEP] ${article.source}`
                })
              });
              
              const biasResult = await response.json();
              console.log(biasResult)
              
              // Update just this specific article with its analysis
              setArticlesWithAnalysis(prevArticles => 
                prevArticles.map(prevArticle => 
                  prevArticle.id === article.id 
                    ? {
                        ...prevArticle,
                        biasAnalysis: {
                          id: article.id,
                          left: biasResult.left,
                          lean_left: biasResult["lean left"],
                          center: biasResult.center,
                          lean_right: biasResult["lean right"],
                          right: biasResult.right
                        }
                      }
                    : prevArticle
                )
              );
            } catch (error) {
              console.error(`Error analysing article ${article.id}:`, error);
            }
          });
  
          // Fake News Flag
          data.forEach(async (article: Article) => {
            try {
              const response = await fetch('http://127.0.0.1:4000/analyse_fake_news', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  input_text: `${article.title} [SEP] ${article.content}`
                })
              });
              
              const fakeNewsResult = await response.json();
              console.log(fakeNewsResult)
              
              // Update just this specific article with its analysis
              setArticlesWithAnalysis(prevArticles => 
                prevArticles.map(prevArticle => 
                  prevArticle.id === article.id 
                    ? {
                        ...prevArticle,
                        fakeNewsAnalysis: {
                          id: article.id,
                          true: fakeNewsResult.true,
                          fake: fakeNewsResult.fake,
                        }
                      }
                    : prevArticle
                )
              );
            } catch (error) {
              console.error(`Error analysing fake news flag for article ${article.id}:`, error);
            }
          });
  
          // Sentiment Analysis Score
          data.forEach(async (article: Article) => {
            try {
              const response = await fetch('http://127.0.0.1:7000/analyse_sentiment_analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  input_text: `${article.title}: ${article.content}`
                })
              });
              
              const sentimentAnalysisResult = await response.json();
              console.log(sentimentAnalysisResult)
              
              // Update just this specific article with its analysis
              setArticlesWithAnalysis(prevArticles => 
                prevArticles.map(prevArticle => 
                  prevArticle.id === article.id 
                    ? {
                        ...prevArticle,
                        sentimentAnalysis: {
                          id: article.id,
                          label: sentimentAnalysisResult.sentiment,
                          score: sentimentAnalysisResult.score,
                          positive: sentimentAnalysisResult.positive,
                          neutral: sentimentAnalysisResult.neutral,
                          negative: sentimentAnalysisResult.negative,
                        }
                      }
                    : prevArticle
                )
              );
            } catch (error) {
              console.error(`Error analysing sentiment analysis score for article ${article.id}:`, error);
            }
          });
        } catch (error) {
          console.error('Error fetching news articles:', error);
        }
      } catch (error) {
        console.error('Error fetching personalized articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalizedArticles();
  }, [userData]);

  const handleLike = (articleId: string) => {
    setArticles(articles.map(article =>
      article.id === articleId
        ? { ...article, likes: article.likes + 1 }
        : article
    ));
  };

  const handleShare = (articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    if (article) {
      console.log(`Sharing article: ${article.title}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">For You</h1>
      {!userData ? (
        <div className="bg-card rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-3">Personalize Your News Feed</h2>
          <p className="text-secondary mb-4">Sign in to get news recommendations tailored to your interests.</p>
          <div className="flex justify-center space-x-4">
            <a href="/login" className="bg-primary text-primary-foreground py-2 px-4 rounded-md font-medium hover:bg-primary/90">Sign In</a>
            <a href="/signup" className="border border-primary text-primary py-2 px-4 rounded-md font-medium hover:bg-primary/10">Create Account</a>
          </div>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : articlesWithAnalysis.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articlesWithAnalysis.map(article => (
            <ArticleCard
              key={article.id} 
              article={article}
              percentage={article.biasAnalysis}
              fakeNewsPercentage={article.fakeNewsAnalysis}
              sentimentNewsScore={article.sentimentAnalysis}
              onLike={handleLike}
              onShare={handleShare}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No personalized articles found</p>
          <p className="mt-2 text-muted">Update your preferences to get more relevant news</p>
          <a href="/preferences" className="bg-primary text-primary-foreground py-2 px-4 rounded-md font-medium hover:bg-primary/90 mt-4">Update Preferences</a>
        </div>
      )}
    </div>
  );
};

export default ForYou;