// import { useEffect, useState } from "react";
// import ArticleCard from "./ArticleCard";
// import { LeftRightPercentages } from '../types';
// import { Article } from "../types";

// const NewsList = () => {
//   const [articles, setArticles] = useState<Article[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [articlesWithAnalysis, setArticlesWithAnalysis] = useState<(Article & { 
//     biasAnalysis?: LeftRightPercentages 
//   })[]>([]);

//   useEffect(() => {
//     const fetchArticles = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch('http://127.0.0.1:5000/news');
//         const data = await response.json();

//         // Initialize articles without analysis
//         setArticlesWithAnalysis(data.map((article: Article) => ({
//           ...article,
//           biasAnalysis: undefined
//         })));
        
//         // Process each article's analysis independently
//         data.forEach(async (article: Article, index: number) => {
//           try {
//             const response = await fetch('http://127.0.0.1:3000/analyse', {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({
//                 input_text: `${article.title} [SEP] ${article.content} [SEP] ${article.source}`
//               })
//             });
            
//             const biasResult = await response.json();
//             console.log(biasResult)
            
//             // Update just this specific article with its analysis
//             setArticlesWithAnalysis(prevArticles => 
//               prevArticles.map(prevArticle => 
//                 prevArticle.id === article.id 
//                   ? {
//                       ...prevArticle,
//                       biasAnalysis: {
//                         id: article.id,
//                         left: biasResult.left,
//                         lean_left: biasResult["lean left"],
//                         center: biasResult.center,
//                         lean_right: biasResult["lean right"],
//                         right: biasResult.right
//                       }
//                     }
//                   : prevArticle
//               )
//             );
//           } catch (error) {
//             console.error(`Error analyzing article ${article.id}:`, error);
//           }
//         });
//       } catch (error) {
//         console.error('Error fetching articles:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchArticles();
//   }, []);

//   if (loading) return <p>Loading...</p>;

//   const handleLike = async (articleId: string) => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/articles/${articleId}/like`, {
//         method: "POST",
//       });
  
//       if (!response.ok) throw new Error("Failed to like article");
  
//       const updatedArticle = await response.json();
  
//       setArticlesWithAnalysis(prevArticles =>
//         prevArticles.map(prevArticle =>
//           prevArticle.id === articleId ? { ...prevArticle, likes: updatedArticle.likes } : prevArticle
//         )
//       );
  
//       console.log(`Liked article: ${updatedArticle.title}`);
//     } catch (error) {
//       console.error("Error liking article:", error);
//     }
//   };

//   const handleShare = (articleId: string) => {
//     const article = articlesWithAnalysis.find(a => a.id === articleId);
//     if (article) {
//       console.log(`Sharing article: ${article.title}`);
//     }
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Trending News</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {articlesWithAnalysis.map((article) => (
//           <ArticleCard
//             key={article._id}
//             article={article}
//             percentage={article.biasAnalysis}
//             onLike={handleLike}
//             onShare={handleShare}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default NewsList;

import { useEffect, useState } from "react";
import ArticleCard from "./ArticleCard";
import { LeftRightPercentages } from '../types';
import { Article } from "../types";

const NewsList = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [articlesWithAnalysis, setArticlesWithAnalysis] = useState<(Article & { 
    biasAnalysis?: LeftRightPercentages 
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
    } catch (error) {
      console.error("Error liking article:", error);
    }
  };

  const handleShare = (articleId: string) => {
    const article = articlesWithAnalysis.find(a => a.id === articleId);
    if (article) {
      console.log(`Sharing article: ${article.title}`);
    }
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {articlesWithAnalysis.map((article) => (
            <ArticleCard
              key={article._id}
              article={article}
              percentage={article.biasAnalysis}
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