import React, { useState, useEffect } from 'react';
import {
  User,
  Newspaper,
  ExternalLink,
  Calendar,
  Clock,
  ThumbsUp,
  MessageSquare,
  PlusCircle,
  Search,
  Tag,
  Globe,
  Loader
} from 'lucide-react';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import { FakeNewsPercentages, SentimentAnalysisScore } from '../types';
import { LeftRightPercentages } from '../types';
import ArticleCard from '../components/ArticleCard';
import { Article } from '../types';
import toast from 'react-hot-toast';
import axios from 'axios';

const UserProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'preferences' | 'likes' | 'comments'>('preferences');
  const { userData, loading } = useAuth();
  const navigate = useNavigate();
  const [articlesWithAnalysis, setArticlesWithAnalysis] = useState<(Article & { 
    biasAnalysis?: LeftRightPercentages 
  } & {
    fakeNewsAnalysis?: FakeNewsPercentages
  } & {
    sentimentAnalysis?: SentimentAnalysisScore
  })[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const fetchLikedArticles = async () => {
      if (!userData) return;
      try {
        const queryParam = userData.likedArticles.join(",");
        const response = await fetch(`http://127.0.0.1:5000/user_liked_articles?articleIds=${queryParam}`);
        if (!response.ok) {
          throw new Error("Failed to fetch liked articles");
        }
        const data = await response.json();
        console.log("Liked Articles:", data);
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
        console.error("Error fetching liked articles:", error);
        return [];
      }
    };

    // If not loading and no userData, redirect to login
    if (!loading && !userData) {
      navigate('/login');
    }

    fetchLikedArticles();
  }, [userData, loading, navigate]);

  const handleTabChange = (tab: 'preferences' | 'likes' | 'comments') => {
    setActiveTab(tab);
  };

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
    const article = articles.find(a => a.id === articleId);
    if (article) {
      console.log(`Sharing article: ${article.title}`);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="animate-spin h-10 w-10 text-primary mb-4" />
          <p className="text-lg text-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // If no userData after loading is complete, don't try to render the profile
  if (!userData) {
    return null; // The useEffect will handle redirection
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-card rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-primary to-primary/80 h-48 flex items-end">
          <div className="ml-10 mb-10 flex items-center">
            <div className="bg-background rounded-full h-32 w-32 flex items-center justify-center text-primary font-bold text-4xl border-4 border-primary/30 shadow-xl">
              {userData.username.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-center">
            <User size={24} className="text-primary mr-3" />
            <h1 className="text-3xl font-bold text-foreground">{userData.username}</h1>
          </div>
          <div className="flex items-center mt-2">
            <Globe size={20} className="text-muted-foreground mr-3" />
            <p className="text-muted-foreground text-lg">{userData.email}</p>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="bg-card rounded-lg shadow-md overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex justify-around">
            <button
              onClick={() => handleTabChange('preferences')}
              className={`px-8 py-6 text-base font-medium flex items-center space-x-2 ${activeTab === 'preferences'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground'
                }`}
            >
              <Newspaper size={20} />
              <span>Preferences</span>
            </button>
            <button
              onClick={() => handleTabChange('likes')}
              className={`px-8 py-6 text-base font-medium flex items-center space-x-2 ${activeTab === 'likes'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground'
                }`}
            >
              <ThumbsUp size={20} />
              <span>Liked Articles</span>
            </button>
            <button
              onClick={() => handleTabChange('comments')}
              className={`px-8 py-6 text-base font-medium flex items-center space-x-2 ${activeTab === 'comments'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground'
                }`}
            >
              <MessageSquare size={20} />
              <span>Comments</span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'preferences' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6 flex items-center text-foreground">
                <Newspaper size={24} className="mr-3 text-primary" />
                Your News Preferences
              </h2>

              <div className="mb-8">
                <h3 className="text-xl font-medium mb-4 flex items-center text-foreground">
                  <Tag size={20} className="mr-2 text-primary" />
                  Categories
                </h3>
                <div className="flex flex-wrap gap-3">
                  {userData.preferences?.categories?.map((category, index) => (
                    <span
                      key={index}
                      className="bg-primary/10 text-primary px-4 py-2 rounded-full text-base font-medium"
                    >
                      {category}
                    </span>
                  ))}
                  {/* <button className="bg-muted text-muted-foreground px-4 py-2 rounded-full text-base font-medium flex items-center">
                    <PlusCircle size={18} className="mr-2" />
                    Add Category
                  </button> */}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-4 flex items-center text-foreground">
                  <Globe size={20} className="mr-2 text-primary" />
                  News Sources
                </h3>
                <div className="flex flex-wrap gap-3">
                  {userData.preferences?.sources?.map((source, index) => (
                    <span
                      key={index}
                      className="bg-primary/10 text-primary px-4 py-2 rounded-full text-base font-medium"
                    >
                      {source}
                    </span>
                  ))}
                  {/* <button className="bg-muted text-muted-foreground px-4 py-2 rounded-full text-base font-medium flex items-center">
                    <PlusCircle size={18} className="mr-2" />
                    Add Source
                  </button> */}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'likes' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6 flex items-center text-foreground">
                <ThumbsUp size={24} className="mr-3 text-primary" />
                Liked Articles
              </h2>
              <h3 className="text-lg text-muted-foreground text-left w-full mb-6">
                {userData.likedArticles.length} articles liked
              </h3>
              {userData.likedArticles?.length === 0 ? (
                <div className="text-center py-16">
                  <ThumbsUp className="mx-auto h-20 w-20 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium text-foreground">No liked articles</h3>
                  <p className="mt-2 text-base text-muted-foreground max-w-md mx-auto">You haven't liked any articles yet. Explore our content to find stories that interest you.</p>
                  <div className="mt-8">
                    <button
                      type="button"
                      className="inline-flex items-center px-6 py-3 shadow-lg text-base font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      onClick={() => navigate('/for-you')}
                    >
                      <Search size={20} className="mr-2" />
                      Explore Articles
                    </button>
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6 flex items-center text-foreground">
                <MessageSquare size={24} className="mr-3 text-primary" />
                Your Comments
              </h2>
              {userData.comments?.length === 0 ? (
                <div className="text-center py-16">
                  <MessageSquare className="mx-auto h-20 w-20 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium text-foreground">No comments yet</h3>
                  <p className="mt-2 text-base text-muted-foreground max-w-md mx-auto">Join the conversation by commenting on articles that spark your interest.</p>
                  <div className="mt-8">
                    <button
                      type="button"
                      className="inline-flex items-center px-6 py-3 shadow-lg text-base font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      onClick={() => navigate('/for-you')}
                    >
                      <Search size={20} className="mr-2" />
                      Explore Articles
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userData.comments.map((comment, index) => (
                    <div 
                      key={index} 
                      className="bg-card border border-border rounded-lg overflow-hidden transition-all hover:shadow-md group"
                    >
                      <div className="p-5">
                        <div className="mb-3 flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <MessageSquare size={16} className="text-primary" />
                            <span className="text-sm font-medium text-muted-foreground">Comment</span>
                          </div>
                          <button 
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-foreground hover:text-primary"
                            onClick={() => navigate(`/article/${comment.articleId}`)}
                            aria-label="View article"
                          >
                            <ExternalLink size={16} />
                          </button>
                        </div>
                        
                        <p className="text-foreground font-medium mb-3 line-clamp-3">{comment.text}</p>
                        
                        <div className="flex items-center justify-between mt-4 pt-2 border-t border-border">
                          <div className="flex items-center">
                            <Tag size={14} className="text-primary mr-2" />
                            <span className="text-xs text-muted-foreground font-mono">
                              {truncateText(comment.articleId, 16)}
                            </span>
                          </div>
                          <button 
                            className="text-xs font-medium text-primary hover:underline"
                            onClick={() => navigate(`/article/${comment.articleId}`)}
                          >
                            View Article
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;