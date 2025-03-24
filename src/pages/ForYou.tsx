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
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import ArticleCard from '../components/ArticleCard';
import { Article } from '../types';

const ForYou = () => {
  const { userData } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPersonalizedArticles = async () => {
      if (!userData) return;

      try {
        setLoading(true);
        const articlesRef = collection(db, 'articles');
        const { categories = [], topics = [] } = userData.preferences;
        let articlesQuery;

        if (categories.length > 0 || topics.length > 0) {
          articlesQuery = query(
            articlesRef,
            where('category', 'in', categories.length > 0 ? categories : ['Politics', 'Technology', 'Business']),
            orderBy('publishedAt', 'desc'),
            limit(20)
          );
        } else {
          articlesQuery = query(
            articlesRef,
            orderBy('publishedAt', 'desc'),
            limit(20)
          );
        }

        const querySnapshot = await getDocs(articlesQuery);
        const articlesData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            publishedAt: data.publishedAt.toDate(),
          } as Article;
        });

        setArticles(articlesData);
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
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <ArticleCard 
              key={article.id} 
              article={article} 
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