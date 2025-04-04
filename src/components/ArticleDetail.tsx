import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  ArrowLeft, 
  Bookmark, 
  Clock,
  Heart,
  Send,
  Eye,
  Calendar,
  Tag,
  Globe,
  ChevronLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { Article, Comment } from '../types';
import { cn } from '../lib/utils'; // Assuming you have a cn utility for class merging
import { LeftRightPercentages, FakeNewsPercentages, SentimentAnalysisScore } from '../types';
import toast from 'react-hot-toast';
import axios from 'axios'
import { useAuth } from '../context/AuthContext';

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [articlesWithAnalysis, setArticlesWithAnalysis] = useState<(Article & { 
    biasAnalysis?: LeftRightPercentages 
  } & {
    fakeNewsAnalysis?: FakeNewsPercentages
  } & {
    sentimentAnalysis?: SentimentAnalysisScore
  })[]>([]);
  // const { userData } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
  
  // Estimated reading time calculation
  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  };

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:5000/api/articles/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch article');
        }
        
        const data = await response.json();
        setArticle(data);
      } catch (error) {
        console.error('Error fetching article:', error);
        setError('Failed to load article. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]);

  // Scroll to comments section if URL has #comments hash
  useEffect(() => {
    if (window.location.hash === '#comments' && commentsRef.current) {
      setTimeout(() => {
        commentsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, [loading]);

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim() || !article) return;
    
    try {
      setIsSubmitting(true);
      
      // Get user token from localStorage
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      // console.log(userId);
      
      if (!token) {
        toast.error("Login to add comment.", {
          id: `login-first-comment`, // To prevent duplicates
          duration: 2000, // 2 seconds
          position: 'bottom-center',
        });
        throw new Error('No authentication token found');
      }
      console.log(article.id)
      
      // Skip the user profile fetch and use stored information instead
      // Post the comment directly to the news backend
      // const commentResponse = await fetch(`http://localhost:5000/api/articles/${article.id}/comment`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     userId: userId || 'anonymous',
      //     text: commentText
      //   })
      // });
      const response = await axios.post(
        `http://localhost:8000/api/user/articles/${article.id}/comment`,
        {
          userId: userId, // Replace with the actual user ID
          text: commentText,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Replace 'token' with the actual token variable
          }
        },
      );
      console.log(response);
      
      if (!response.data.success) {
        throw new Error('Failed to add comment');
      }
      
      // Get the updated article with the new comment
      const updatedArticle = await response.data.article;
      setArticle(updatedArticle);
      
      // Clear comment input
      setCommentText('');
      toast.success(`Comment added to article "${updatedArticle.title}"`, {
        id: `commented_added_${updatedArticle.id}`, // To prevent duplicates
        duration: 2000, // 2 seconds
        position: 'bottom-center',
      });

    } catch (error) {
      console.error('Error adding comment:', error);
      // alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-destructive/10 dark:bg-destructive/20 border border-destructive/20 text-destructive dark:text-destructive-foreground px-6 py-4 rounded-lg">
          <p className="font-medium">{error || 'Article not found'}</p>
          <Link to="/news" className="text-primary hover:underline mt-3 inline-flex items-center">
            <ChevronLeft className="h-4 w-4 mr-1" /> Return to news
          </Link>
        </div>
      </div>
    );
  }

  const readingTime = getReadingTime(article.content);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link 
        to="/news" 
        className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8 group"
      >
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to articles
      </Link>
      
      <article className="bg-card dark:bg-card text-card-foreground dark:text-card-foreground rounded-xl overflow-hidden shadow-md dark:shadow-lg dark:shadow-primary/5 border border-border">
        {article.imageUrl && (
          <div className="w-full h-[400px] overflow-hidden relative group">
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10"></div>
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute top-4 right-4 z-20">
              <div className="bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center">
                <Eye className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                <span className="text-xs font-medium">2.4k views</span>
              </div>
            </div>
          </div>
        )}
        
        <header className="p-6 md:p-8 border-b border-border">
          <div className="flex flex-wrap items-center text-sm text-muted-foreground mb-3 gap-2">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium flex items-center">
              <Tag className="h-3 w-3 mr-1" />
              {article.category}
            </span>
            <span className="flex items-center">
              <Globe className="h-3.5 w-3.5 mr-1.5" />
              {article.source}
            </span>
            <span className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              {format(new Date(article.publishedAt), 'MMMM d, yyyy')}
            </span>
            <span className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              {readingTime} min read
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">{article.title}</h1>
          
          <div className="flex items-center justify-between">
            {article.author && (
              <div className="text-muted-foreground flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                  {article.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-foreground">By {article.author}</div>
                  <div className="text-xs text-muted-foreground">Contributing Editor</div>
                </div>
              </div>
            )}
            
            <button 
              onClick={toggleBookmark}
              className={cn(
                "flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm transition-colors",
                isBookmarked 
                  ? "bg-primary/10 text-primary"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              <Bookmark 
                className={cn("h-4 w-4", isBookmarked && "fill-primary")} 
                fill={isBookmarked ? "currentColor" : "none"}
              />
              <span>{isBookmarked ? "Saved" : "Save"}</span>
            </button>
          </div>
        </header>
        
        <div className="p-6 md:p-8">
          <div className="text-left prose dark:prose-invert prose-lg max-w-none mb-8">
            {article.content.split('\n').map((paragraph, index) => (
              paragraph.trim() ? (
                <p key={index} className="mb-5 leading-relaxed">
                  {paragraph}
                </p>
              ) : null
            ))}
          </div>
          
          <div className="border-t border-b border-border py-5 my-8">
            <div className="flex flex-wrap items-center gap-6">
              <button 
                onClick={() => handleLike(article.id)}
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors group"
              >
                <Heart 
                  className="group-hover:scale-110 transition-transform h-5 w-5" 
                  fill="none"
                />
                <span>{article.likes} Likes</span>
              </button>
              
              <button 
                onClick={() => handleShare(article.id)}
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors group"
              >
                <Share2 className="group-hover:rotate-12 transition-transform h-5 w-5" />
                <span>Share</span>
              </button>
              
              <a 
                href="#comments" 
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageSquare className="h-5 w-5" />
                <span>{article.comments?.length || 0} Comments</span>
              </a>
            </div>
          </div>
          
          {/* <div id="comments" className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-foreground">Comments ({article.comments?.length || 0})</h2>
            
            {!article.comments || article.comments.length === 0 ? (
              <div className="bg-muted/40 dark:bg-muted/20 p-6 rounded-lg text-center border border-border">
                <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
                <button className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center">
                  <Send className="h-4 w-4 mr-2" /> Add Comment
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {article.comments.map((comment, index) => (
                  <div key={index} className="bg-muted/40 dark:bg-muted/20 p-5 rounded-lg border border-border">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                        U
                      </div>
                      <div>
                        <div className="font-medium text-foreground">User</div>
                        <div className="text-xs text-muted-foreground">2 hours ago</div>
                      </div>
                    </div>
                    <p className="text-card-foreground">{typeof comment === 'string' ? comment : JSON.stringify(comment)}</p>
                    <div className="flex items-center mt-3 gap-4">
                      <button className="flex items-center text-xs text-muted-foreground hover:text-primary">
                        <ThumbsUp className="h-3.5 w-3.5 mr-1" /> Like
                      </button>
                      <button className="flex items-center text-xs text-muted-foreground hover:text-primary">
                        <MessageSquare className="h-3.5 w-3.5 mr-1" /> Reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div> */}
          <div id="comments" ref={commentsRef} className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-foreground">Comments ({article.comments?.length || 0})</h2>
            
            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="flex flex-col space-y-3">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                  rows={3}
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !commentText.trim()}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                      (isSubmitting || !commentText.trim()) && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </div>
            </form>
            
            {/* Comments List */}
            {!article.comments || article.comments.length === 0 ? (
              <div className="bg-muted/50 dark:bg-muted/20 p-6 rounded-lg text-center">
                <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {article.comments.map((comment, index) => (
                  <div key={index} className="bg-muted dark:bg-muted/60 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
                        {typeof comment === 'string' 
                          ? 'U' 
                          : comment.userName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-medium text-foreground text-left">
                          {typeof comment === 'string' 
                            ? 'User' 
                            : comment.userName || 'Anonymous'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {typeof comment === 'string' 
                            ? 'Just now' 
                            : format(new Date(comment.createdAt), 'MMM d, yyyy • h:mm a')}
                        </div>
                      </div>
                    </div>
                    <p className="text-foreground text-left">
                      {typeof comment === 'string' ? comment : comment.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};

export default ArticleDetail;