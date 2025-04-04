import { useEffect, useState } from "react";
import ArticleCard from "./ArticleCard";
import { FakeNewsPercentages, LeftRightPercentages } from '../types';
import { Article } from "../types";
import toast from 'react-hot-toast';
import axios from 'axios';
import { SentimentAnalysisScore } from "../types";

const NewsList = () => {
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
        data.forEach(async (article: Article, index: number) => {
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
            console.error(`Error analyzing article ${article.id}:`, error);
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

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 lg:py-12 max-w-7xl">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          Trending News
          <span className="ml-2 text-sm font-normal text-muted-foreground align-middle">
            {articlesWithAnalysis.length} articles
          </span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Browse the latest news with political bias analysis
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-12 h-12 rounded-full border-4 border-muted border-t-primary animate-spin"></div>
          <p className="mt-4 text-muted-foreground font-medium">Loading articles...</p>
        </div>
      ) : articlesWithAnalysis.length === 0 ? (
        <div className="bg-card rounded-lg p-8 text-center border border-border">
          <p className="text-card-foreground text-lg">No articles found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 md:gap-6">
          {articlesWithAnalysis.map((article) => (
            <ArticleCard
              key={article._id}
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

      <div className="mt-8 py-4 border-t border-border text-center text-muted-foreground text-sm">
        <p>Data refreshed every hour • Analysis powered by AI</p>
      </div>
    </div>
  );
};

export default NewsList;