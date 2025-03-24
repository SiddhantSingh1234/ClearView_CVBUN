// // import { useState, useEffect } from 'react';
// // import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
// // import { db } from '../firebase/config';
// // import ArticleCard from '../components/ArticleCard';
// // import CategoryFilter from '../components/CategoryFilter';
// // import { Article } from '../types';
// // import './Home.css'

// // const Home = () => {
// //   const [articles, setArticles] = useState<Article[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
// //   const categories = [
// //     'Politics', 'Business', 'Technology', 'Science', 'Health', 
// //     'Sports', 'Entertainment', 'World', 'Environment', 'Education'
// //   ];

// //   useEffect(() => {
// //     const fetchArticles = async () => {
// //       try {
// //         setLoading(true);
// //         const articlesRef = collection(db, 'articles');
// //         const articlesQuery = query(articlesRef, orderBy('publishedAt', 'desc'), limit(20));
// //         const querySnapshot = await getDocs(articlesQuery);
        
// //         const articlesData = querySnapshot.docs.map(doc => {
// //           const data = doc.data();
// //           return {
// //             ...data,
// //             id: doc.id,
// //             publishedAt: data.publishedAt.toDate(),
// //           } as Article;
// //         });
// //         setArticles(articlesData);
// //       } catch (error) {
// //         console.error('Error fetching articles:', error);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchArticles();
// //   }, []);

// //   const handleLike = (articleId: string) => {
// //     // In a real app, this would update the like count in the database
// //     setArticles(articles.map(article => 
// //       article.id === articleId 
// //         ? { ...article, likes: article.likes + 1 } 
// //         : article
// //     ));
// //   };

// //   const handleShare = (articleId: string) => {
// //     const article = articles.find(a => a.id === articleId);
// //     if (article) {
// //       // In a real app, this would open a share dialog
// //       console.log(`Sharing article: ${article.title}`);
// //     }
// //   };

// //   const filteredArticles = selectedCategories.length > 0
// //     ? articles.filter(article => selectedCategories.includes(article.category))
// //     : articles;

// //   return (
// //     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
// //       <div className="flex flex-col md:flex-row gap-8">
// //         <div className="md:w-3/4">
// //           <h1 className="text-3xl font-bold mb-6">Trending News</h1>
          
// //           {loading ? (
// //             <div className="flex justify-center items-center h-64">
// //               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
// //             </div>
// //           ) : filteredArticles.length > 0 ? (
// //             <div>
// //               {filteredArticles.map(article => (
// //                 <ArticleCard 
// //                   key={article.id} 
// //                   article={article} 
// //                   onLike={handleLike}
// //                   onShare={handleShare}
// //                 />
// //               ))}
// //             </div>
// //           ) : (
// //             <div className="text-center py-12">
// //               <p className="text-xl text-secondary-500">No articles found</p>
// //               {selectedCategories.length > 0 && (
// //                 <p className="mt-2 text-secondary-400">
// //                   Try selecting different categories or clear your filters
// //                 </p>
// //               )}
// //             </div>
// //           )}
// //         </div>
        
// //         <div className="md:w-1/4">
// //           <div className="sticky top-24">
// //             <CategoryFilter 
// //               categories={categories}
// //               selectedCategories={selectedCategories}
// //               onCategoryChange={setSelectedCategories}
// //             />
            
// //             <div className="card p-4 mb-6">
// //               <h3 className="text-lg font-semibold mb-3">Subscribe</h3>
// //               <p className="text-secondary-600 mb-4">
// //                 Get unlimited access to all articles and personalized news recommendations.
// //               </p>
// //               <button className="btn btn-primary w-full">
// //                 Subscribe Now
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Home;
// import { useState, useEffect } from 'react';
// import ArticleCard from '../components/ArticleCard';
// import CategoryFilter from '../components/CategoryFilter';
// import { Article } from '../types';
// import { LeftRightPercentages } from '../types';
// import './Home.css';

// const Home = () => {
//   const [articles, setArticles] = useState<Article[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
//   // const [leftRightPercentages, setLeftRightPercentages] = useState<LeftRightPercentages[]>([])
//   const [articlesWithAnalysis, setArticlesWithAnalysis] = useState<(Article & { 
//     biasAnalysis?: LeftRightPercentages 
//   })[]>([]);

//   const categories = [
//     'Politics', 'Business', 'Technology', 'Science', 'Health', 
//     'Sports', 'Entertainment', 'World', 'Environment', 'Education', 'General'
//   ];

//   useEffect(() => {
//     const fetchArticles = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch('http://127.0.0.1:5000/news');
//         const data = await response.json();
//         // console.log(data);
//         // setArticles(data);

//         // // Parallel requests for bias analysis
//         // const analysisPromises = data.map(async (article: Article) => {
//         //   try {
//         //     const response = await fetch('http://127.0.0.1:3000/analyse', {
//         //       method: 'POST',
//         //       headers: { 'Content-Type': 'application/json' },
//         //       body: JSON.stringify({
//         //         input_text: `${article.title} [SEP] ${article.content} [SEP] ${article.source}`
//         //       })
//         //     });

//         //     const result = await response.json();
//         //     return {
//         //       id: article.id,
//         //       left: result.left,
//         //       lean_left: result.lean_left,
//         //       center: result.center,
//         //       lean_right: result.lean_right,
//         //       right: result.right
//         //     };
//         //   } catch (error) {
//         //     console.error("Error fetching bias analysis:", error);
//         //     return null; // Handle failures gracefully
//         //   }
//         // });

//         // // Process results as they arrive
//         // Promise.allSettled(analysisPromises).then(results => {
//         //   results.forEach(result => {
//         //     if (result.status === 'fulfilled' && result.value) {
//         //       setLeftRightPercentages(prev => [...prev, result.value]);
//         //     }
//         //   });
//         // });

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

//   const filteredArticles = selectedCategories.length > 0
//     ? articlesWithAnalysis.filter(article => selectedCategories.includes(article.category))
//     : articlesWithAnalysis;

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <div className="flex flex-col md:flex-row gap-8">
//         <div className="md:w-3/4">
//           <h1 className="text-3xl font-bold mb-6">Trending News</h1>
          
//           {loading ? (
//             <div className="flex justify-center items-center h-64">
//               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
//             </div>
//           ) : filteredArticles.length > 0 ? (
//             <div>
//               {filteredArticles.map(article => (
//                 <ArticleCard 
//                   key={article.id} 
//                   article={article}
//                   percentage={article.biasAnalysis} 
//                   onLike={handleLike}
//                   onShare={handleShare}
//                 />
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-12">
//               <p className="text-xl text-secondary-500">No articles found</p>
//               {selectedCategories.length > 0 && (
//                 <p className="mt-2 text-secondary-400">
//                   Try selecting different categories or clear your filters
//                 </p>
//               )}
//             </div>
//           )}
//         </div>
        
//         <div className="md:w-1/4">
//           <div className="sticky top-24">
//             <CategoryFilter 
//               categories={categories}
//               selectedCategories={selectedCategories}
//               onCategoryChange={setSelectedCategories}
//             />
            
//             <div className="card p-4 mb-6">
//               <h3 className="text-lg font-semibold mb-3">Subscribe</h3>
//               <p className="text-secondary-600 mb-4">
//                 Get unlimited access to all articles and personalized news recommendations.
//               </p>
//               <button className="btn btn-primary w-full">
//                 Subscribe Now
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;

import { useState, useEffect } from 'react';
import ArticleCard from '../components/ArticleCard';
import CategoryFilter from '../components/CategoryFilter';
import { Article } from '../types';
import { LeftRightPercentages } from '../types';
import './Home.css';

const Home = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [articlesWithAnalysis, setArticlesWithAnalysis] = useState<(Article & { 
    biasAnalysis?: LeftRightPercentages 
  })[]>([]);

  const categories = [
    'Politics', 'Business', 'Technology', 'Science', 'Health', 
    'Sports', 'Entertainment', 'World', 'Environment', 'Education', 'General'
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