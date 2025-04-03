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
import { Toaster } from 'react-hot-toast';
import {  
  MessageSquare, 
  Share2,
  Heart,
} from 'lucide-react';
// import { useAuth } from '../context/AuthContext';
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
  // const { userData } = useAuth();
  // console.log(userData);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // const renderSentimentEmoji = () => {
  //   if (!sentimentNewsScore) return null;
  
  //   const sentimentMap = {
  //     Positive: {
  //       emoji: '😄',
  //       textClass: 'text-green-600 dark:text-green-400',
  //       bgClass: 'bg-green-200 dark:bg-green-800',
  //       percentage: sentimentNewsScore.positive
  //     },
  //     Neutral: {
  //       emoji: '😐',
  //       textClass: 'text-blue-600 dark:text-blue-400',
  //       bgClass: 'bg-blue-200 dark:bg-blue-800',
  //       percentage: sentimentNewsScore.neutral
  //     },
  //     Negative: {
  //       emoji: '😠',
  //       textClass: 'text-red-600 dark:text-red-400',
  //       bgClass: 'bg-red-200 dark:bg-red-800',
  //       percentage: sentimentNewsScore.negative
  //     }
  //   };
  
  //   return (
  //     <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs backdrop-blur-sm rounded-md px-3 py-1 flex flex-col space-y-1 shadow-md">
  //       {Object.entries(sentimentMap).map(([label, sentiment]) => (
  //         <div
  //           key={label}
  //           className={`flex items-center space-x-1 px-2 py-1 rounded ${label === sentimentNewsScore.label ? `font-semibold shadow-sm ${sentiment.bgClass}` : ''}`}
  //         >
  //           <span className={`text-base ${sentiment.textClass}`}>{sentiment.emoji}</span>
  //           <span className={`text-xs ${sentiment.textClass}`}>
  //             {sentiment.percentage.toFixed(1)}%
  //           </span>
  //         </div>
  //       ))}
  //     </div>
  //   );
  // };

  const renderSentimentAnalysis = () => {
    if (!sentimentNewsScore) return null;
  
    const sentimentConfig = [
      {
        label: "Positive",
        emoji: "😊",
        color: "bg-green-400 dark:bg-green-600",
        hoverColor: "bg-green-300 dark:bg-green-500",
        textColor: "text-green-700 dark:text-green-200",
        percentage: sentimentNewsScore.positive,
        tooltipColor: "bg-green-50 dark:bg-green-900/70",
        tooltipBorder: "border-green-200 dark:border-green-700"
      },
      {
        label: "Neutral",
        emoji: "😐",
        color: "bg-gray-400 dark:bg-gray-600",
        hoverColor: "bg-gray-300 dark:bg-gray-500",
        textColor: "text-gray-700 dark:text-gray-200",
        percentage: sentimentNewsScore.neutral,
        tooltipColor: "bg-gray-50 dark:bg-gray-900/70",
        tooltipBorder: "border-gray-200 dark:border-gray-700"
      },
      {
        label: "Negative",
        emoji: "😞",
        color: "bg-red-400 dark:bg-red-600",
        hoverColor: "bg-red-300 dark:bg-red-500",
        textColor: "text-red-700 dark:text-red-200",
        percentage: sentimentNewsScore.negative,
        tooltipColor: "bg-red-50 dark:bg-red-900/70",
        tooltipBorder: "border-red-200 dark:border-red-700"
      }
    ];
  
    const primarySentiment = sentimentConfig.reduce(
      (max, sentiment) => (sentiment.percentage > max.percentage ? sentiment : max),
      sentimentConfig[0]
    );
  
    const displaySentiment =
      primarySentiment.label === "Neutral" && primarySentiment.percentage < 100
        ? sentimentConfig.filter(s => s.label !== "Neutral").reduce(
            (max, sentiment) => (sentiment.percentage > max.percentage ? sentiment : max),
            sentimentConfig.find(s => s.label === "Positive")!
          )
        : primarySentiment;
  
    return (
      <TooltipProvider>
        <div className="absolute top-2 left-2 flex flex-col gap-2 items-center">
          <div className="flex items-center gap-2">
            {sentimentConfig.map(sentiment => {
              const isNeutral = sentiment.label === "Neutral";
              const shouldEnlarge = !isNeutral || (isNeutral && sentiment.percentage === 100);
              const isSelected = sentiment === displaySentiment;
              return (
                <Tooltip key={sentiment.label}>
                  <TooltipTrigger asChild>
                  <div
                    className={`
                      rounded-full overflow-hidden border-2 shadow-md
                      transition-all duration-300 transform
                      border-neutral-800 dark:border-neutral-200
                      ${isSelected ? 'shadow-2xl scale-135' : 'border-neutral-400 dark:border-neutral-600 scale-100'}
                      hover:scale-125 hover:z-20
                    `}
                    style={{
                      width: `${isSelected ? 36 : 28}px`, // Selected one is larger
                      height: `${isSelected ? 36 : 28}px`,
                      boxShadow: isSelected
                        ? '0 0 16px rgba(255, 255, 255, 0.5), 0 0 14px rgba(0, 0, 0, 0.5)'
                        : 'none'
                    }}
                  >
                    <div
                      className={`
                        ${sentiment.color} hover:${sentiment.hoverColor}
                        w-full h-full flex items-center justify-center
                        text-white dark:text-white font-semibold
                        transition-colors duration-300
                      `}
                      style={{ fontSize: "16px" }} // Uniform text size for clarity
                    >
                      {sentiment.emoji}
                    </div>
                  </div>
                  </TooltipTrigger>
                  <TooltipContent
                    className={`${sentiment.tooltipColor} border ${sentiment.tooltipBorder} p-2 shadow-md text-xs`}
                    side="bottom"
                  >
                    <div className={`${sentiment.textColor} font-semibold`}>
                      {sentiment.label}: {sentiment.percentage.toFixed(1)}%
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
          <Badge
            variant="outline"
            className="bg-primary text-primary-foreground backdrop-blur-md text-xs px-3 py-1 shadow-lg flex items-center gap-1.5 rounded-full border-none"
          >
            <span className="text-lg">{displaySentiment.emoji}</span>
            <span className="font-semibold">{displaySentiment.label}</span>
          </Badge>
        </div>
      </TooltipProvider>
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
          {renderSentimentAnalysis()}
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
          {article.description && article.description.length > 150 && (
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

        <div className="flex items-center space-x-3 text-muted-foreground text-sm mt-4">
          <button 
            onClick={() => onLike(article.id)}
            className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors group"
            aria-label="Like article"
          >
            <Heart 
              className="group-hover:scale-110 transition-transform h-5 w-5" 
              fill="none"
            />
            <span>{article.likes}</span>
          </button>
          {/* <Toaster /> */}
          <Link 
            to={`/article/${article.id}#comments`} 
            className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors"
            aria-label="View comments"
          >
            <MessageSquare className="h-5 w-5" />
            <span>{article.comments.length}</span>
          </Link>
          <button 
            onClick={() => onShare(article.id)}
            className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors group"
            aria-label="Share article"
          >
            <Share2 className="group-hover:rotate-12 transition-transform h-5 w-5" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;