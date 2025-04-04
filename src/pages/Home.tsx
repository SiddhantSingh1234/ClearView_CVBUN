import { useState, useEffect } from 'react';
import ArticleCard from '../components/ArticleCard';
import CategoryFilter from '../components/CategoryFilter';
import { Article, FakeNewsPercentages, SentimentAnalysisScore } from '../types';
import { LeftRightPercentages } from '../types';
import './Home.css';
import toast from 'react-hot-toast'; // Assuming you're using Lucide icons
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [articlesWithAnalysis, setArticlesWithAnalysis] = useState<(Article & { 
    biasAnalysis?: LeftRightPercentages 
  } & {
    fakeNewsAnalysis?: FakeNewsPercentages
  } & {
    sentimentAnalysis?: SentimentAnalysisScore
  })[]>([]);
  const { userData, setUserData } = useAuth();

  const categories = [
    'Politics', 'Business', 'Tech', 'Sports', 'Entertainment', 'General'
  ];

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:5000/news');
        const data = await response.json();

        // Initialize articles without analysis
        setArticlesWithAnalysis(data.map((article: Article) => ({
          ...article,
          biasAnalysis: undefined
        })));
        
        // Process each article's analysis independently
        // Political Bias (Left-Right)
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
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleLike = async (articleId: string) => {
    try {
      // 1. Get fresh token (avoid stale token from localStorage)
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (!token) {
        toast.error("Login to like articles.", {
          id: `login-first`, // To prevent duplicates
          duration: 2000, // 2 seconds
          position: 'bottom-center',
        });
        throw new Error('No authentication token found');
      }
  
      // 2. Make request with debug logs
      console.log('Using token:', token.slice(0, 10) + '...'); // Log partial token
      const response = await axios.post(
        `http://localhost:8000/api/user/articles/${articleId}/like`,
        {
          userId: userId, // Replace with the actual user ID
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Replace 'token' with the actual token variable
          }
        }
      );            
      console.log(response)
  
      // if (!response.ok) throw new Error("Failed to like article");
      if (response.data.success === true) {
        const response = await fetch(`http://localhost:5000/api/articles/${articleId}/like`, {
          method: "POST",
        });
    
        if (!response.ok) throw new Error("Failed to like article");
        const updatedArticle = await response.json();
    
        setArticlesWithAnalysis(prevArticles =>
          prevArticles.map(prevArticle =>
            prevArticle.id === articleId ? { ...prevArticle, likes: updatedArticle.likes } : prevArticle
          )
        );

        setUserData(prevUserData => {
          if (!prevUserData) return null;
          
          return {
            ...prevUserData,
            likedArticles: [...prevUserData.likedArticles, articleId]
          };
        });

        console.log(`Liked article: ${updatedArticle.title}`);
        toast.success(`Liked "${updatedArticle.title}"`, {
          id: `liked-${articleId}`, // To prevent duplicates
          duration: 2000, // 2 seconds
          position: 'bottom-center',
        });
      }
      else {
        toast.error("You've already liked this article", {
          id: `already-liked-${articleId}`, // To prevent duplicates
          duration: 2000, // 2 seconds
          position: 'bottom-center',
        });
      }
    } catch (error) {
      console.error("Error liking article:", error);
    }
  };  

  const handleShare = (articleId: string) => {
    const url = `${window.location.origin}/article/${articleId}`;
    navigator.clipboard.writeText(url);
    toast.success("Article link copied to clipboard!", {
      id: `shared-${articleId}`, // To prevent duplicates
      duration: 2000, // 2 seconds
      position: 'bottom-center',
    });
  };

  const filteredArticles = selectedCategories.length > 0
    ? articlesWithAnalysis.filter(article => selectedCategories.includes(article.category))
    : articlesWithAnalysis;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <main className="md:w-3/4">
          <h1 className="text-3xl font-bold mb-6 text-foreground">Trending News</h1>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="space-y-6">
              {filteredArticles.map(article => (
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
              <p className="text-xl text-muted-foreground">No articles found</p>
              {selectedCategories.length > 0 && (
                <p className="mt-2 text-muted-foreground/70">
                  Try selecting different categories or clear your filters
                </p>
              )}
            </div>
          )}
        </main>
        
        <aside className="md:w-1/4">
          <div className="sticky top-24 space-y-6">
            <CategoryFilter 
              categories={categories}
              selectedCategories={selectedCategories}
              onCategoryChange={setSelectedCategories}
            />
            
            <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-4">
              <h3 className="text-lg font-semibold mb-3">Subscribe</h3>
              <p className="text-muted-foreground mb-4">
                Get unlimited access to all articles and personalized news recommendations.
              </p>
              <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors">
                Subscribe Now
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Home;