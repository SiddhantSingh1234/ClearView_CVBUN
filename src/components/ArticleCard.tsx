// import { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { FiThumbsUp, FiMessageSquare, FiShare2 } from 'react-icons/fi';
// import { format } from 'date-fns';
// import { Article } from '../types';
// import { LeftRightPercentages } from '../types';
// import PoliticalLeaningBar from './PoliticalLeaningBar';
// import './ArticleCard.css'

// interface ArticleCardProps {
//   article: Article;
//   percentage?: LeftRightPercentages;
//   onLike: (articleId: string) => void;
//   onShare: (articleId: string) => void;
// }

// const ArticleCard = ({ article, percentage, onLike, onShare }: ArticleCardProps) => {
//   const [isExpanded, setIsExpanded] = useState(false);

//   const toggleExpand = () => {
//     setIsExpanded(!isExpanded);
//   };

//   return (
//     <div className="card mb-6 w-full">
//       {article.imageUrl && (
//         <div className="relative h-48 overflow-hidden">
//           <img 
//             src={article.imageUrl} 
//             alt={article.title} 
//             className="w-full h-full object-cover"
//           />
//           <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
//             {article.category}
//           </div>
//         </div>
//       )}
//       <div className="p-4">
//         <div className="flex justify-between items-start mb-2">
//           <div>
//             <span className="text-xs text-secondary-500">
//               {format(article.publishedAt, 'MMM d, yyyy')} • {article.source}
//             </span>
//           </div>
//         </div>
//         <Link to={`/article/${article.id}`}>
//           <h2 className="text-xl font-bold mb-2 hover:text-primary-600 transition-colors">
//             {article.title}
//           </h2>
//         </Link>
//         <p className="text-secondary-600 mb-4">
//           {isExpanded
//             ? article.description 
//             : article.description 
//               ? `${article.description.slice(0, 150)}${article.description.length > 150 ? '...' : ''}` 
//               : "No description available"}
//           {article.description.length > 150 && (
//             <button 
//               onClick={toggleExpand} 
//               className="text-primary-600 hover:text-primary-700 ml-1 font-medium"
//             >
//               {isExpanded ? 'Show less' : 'Read more'}
//             </button>
//           )}
//         </p>

//         {/* Political Leaning Bar */}
//         {percentage && (
//             <div className="mt-2 w-full">
//               <PoliticalLeaningBar
//                 data = {{
//                   "#003366": (percentage.left / 100) || 0,
//                   "#0074D9": (percentage.lean_left / 100) || 0,
//                   "#A0AEC0": (percentage.center / 100) || 0,
//                   "#FF6B6B": (percentage.lean_right / 100) || 0,
//                   "#8B0000": (percentage.right / 100) || 0
//                 }}
//               />
//             </div>
//         )}

//         <div className="flex items-center text-secondary-500 text-sm">
//           <div className="flex items-center mr-4">
//             <button 
//               onClick={() => onLike(article.id)}
//               className="flex items-center hover:text-primary-600"
//             >
//               <FiThumbsUp className="mr-1" />
//               <span>{article.likes}</span>
//             </button>
//           </div>
//           <Link to={`/article/${article.id}#comments`} className="flex items-center mr-4 hover:text-primary-600">
//             <FiMessageSquare className="mr-1" />
//             <span>{article.comments.length}</span>
//           </Link>
//           <button 
//             onClick={() => onShare(article.id)}
//             className="flex items-center hover:text-primary-600"
//           >
//             <FiShare2 className="mr-1" />
//             <span>Share</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ArticleCard;

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiThumbsUp, FiMessageSquare, FiShare2 } from 'react-icons/fi';
import { format } from 'date-fns';
import { Article, FakeNewsPercentages, SentimentAnalysisScore } from '../types';
import { LeftRightPercentages } from '../types';
import PoliticalLeaningBar from './PoliticalLeaningBar';
import './ArticleCard.css'
import { Progress } from "@/components/ui/progress"

interface ArticleCardProps {
  article: Article;
  percentage?: LeftRightPercentages;
  fakeNewsPercentage?: FakeNewsPercentages;
  sentimentNewsScore?: SentimentAnalysisScore;
  onLike: (articleId: string) => void;
  onShare: (articleId: string) => void;
}

const ArticleCard = ({ article, percentage, fakeNewsPercentage, sentimentNewsScore, onLike, onShare }: ArticleCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const renderSentimentEmoji = () => {
    if (!sentimentNewsScore) return null;
  
    const sentimentMap = {
      Positive: {
        emoji: '😄',
        textClass: 'text-green-600 dark:text-green-400',
        bgClass: 'bg-green-200 dark:bg-green-800',
        percentage: sentimentNewsScore.positive
      },
      Neutral: {
        emoji: '😐',
        textClass: 'text-blue-600 dark:text-blue-400',
        bgClass: 'bg-blue-200 dark:bg-blue-800',
        percentage: sentimentNewsScore.neutral
      },
      Negative: {
        emoji: '😠',
        textClass: 'text-red-600 dark:text-red-400',
        bgClass: 'bg-red-200 dark:bg-red-800',
        percentage: sentimentNewsScore.negative
      }
    };
  
    return (
      <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs backdrop-blur-sm rounded-md px-3 py-1 flex flex-col space-y-1 shadow-md">
        {Object.entries(sentimentMap).map(([label, sentiment]) => (
          <div
            key={label}
            className={`flex items-center space-x-1 px-2 py-1 rounded ${label === sentimentNewsScore.label ? `font-semibold shadow-sm ${sentiment.bgClass}` : ''}`}
          >
            <span className={`text-base ${sentiment.textClass}`}>{sentiment.emoji}</span>
            <span className={`text-xs ${sentiment.textClass}`}>
              {sentiment.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="card w-full mb-6 bg-card text-card-foreground rounded-lg shadow-sm overflow-hidden">
      {article.imageUrl && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-full object-cover"
          />
          {/* Sentiment Analysis Score */}
          {renderSentimentEmoji()}
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
            {article.category}
          </div>
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="text-xs text-muted-foreground">
              {format(article.publishedAt, 'MMM d, yyyy')} • {article.source}
            </span>
          </div>
          {/* Fake News Flag */}
          {fakeNewsPercentage && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">Fake Meter:</span>
              <div className="w-32"> {/* Increased width */}
                <Progress value={fakeNewsPercentage.fake} />
              </div>
            </div>
          )}
        </div>
        <Link to={`/article/${article.id}`}>
          <h2 className="text-xl font-bold mb-2 text-foreground hover:text-primary transition-colors duration-200">
            {article.title}
          </h2>
        </Link>
        <p className="text-left text-muted-foreground mb-4">
          {isExpanded
            ? article.description 
            : article.description 
              ? `${article.description.slice(0, 150)}${article.description.length > 150 ? '...' : ''}` 
              : "No description available"}
          {article.description.length > 150 && (
            <button 
              onClick={toggleExpand} 
              className="text-primary hover:text-primary/90 ml-1 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </p>

        {/* Political Leaning Bar */}
        {percentage && (
            <div className="mt-2 w-full">
              <PoliticalLeaningBar
                data = {{
                  farLeft: (percentage.left / 100) || 0,
                  leanLeft: (percentage.lean_left / 100) || 0,
                  center: (percentage.center / 100) || 0,
                  leanRight: (percentage.lean_right / 100) || 0,
                  farRight: (percentage.right / 100) || 0
                }}
              />
            </div>
        )}

        <div className="flex items-center text-muted-foreground text-sm mt-4">
          <div className="flex items-center mr-4">
            <button 
              onClick={() => onLike(article.id)}
              className="flex items-center hover:text-primary transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded p-1"
              aria-label="Like article"
            >
              <FiThumbsUp className="mr-1" />
              <span>{article.likes}</span>
            </button>
          </div>
          <Link 
            to={`/article/${article.id}#comments`} 
            className="flex items-center mr-4 hover:text-primary transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded p-1"
            aria-label="View comments"
          >
            <FiMessageSquare className="mr-1" />
            <span>{article.comments.length}</span>
          </Link>
          <button 
            onClick={() => onShare(article.id)}
            className="flex items-center hover:text-primary transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded p-1"
            aria-label="Share article"
          >
            <FiShare2 className="mr-1" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;