// import { useState, useEffect } from 'react';
// import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
// import { db } from '../firebase/config';
// import { useAuth } from '../context/AuthContext';
// import { UserActivity } from '../types';
// import { format } from 'date-fns';
// import { FiClock, FiEye, FiThumbsUp, FiMessageSquare, FiShare2 } from 'react-icons/fi';
// import './Usage.css'

// const Usage = () => {
//   const { currentUser } = useAuth();
//   const [activities, setActivities] = useState<UserActivity[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({
//     totalArticlesRead: 0,
//     totalTimeSpent: 0,
//     totalLikes: 0,
//     totalComments: 0,
//     totalShares: 0
//   });

//   useEffect(() => {
//     const fetchUserActivity = async () => {
//       if (!currentUser) return;
      
//       try {
//         setLoading(true);
//         const activitiesRef = collection(db, 'userActivities');
//         const activitiesQuery = query(
//           activitiesRef,
//           where('userId', '==', currentUser.uid),
//           orderBy('timestamp', 'desc'),
//           limit(50)
//         );
        
//         const querySnapshot = await getDocs(activitiesQuery);
        
//         const activitiesData = querySnapshot.docs.map(doc => {
//           const data = doc.data();
//           return {
//             ...data,
//             id: doc.id,
//             timestamp: data.timestamp.toDate(),
//           } as UserActivity;
//         });
        
//         setActivities(activitiesData);
        
//         // Calculate stats
//         const views = activitiesData.filter(a => a.action === 'view').length;
//         const likes = activitiesData.filter(a => a.action === 'like').length;
//         const comments = activitiesData.filter(a => a.action === 'comment').length;
//         const shares = activitiesData.filter(a => a.action === 'share').length;
//         const totalTime = activitiesData.reduce((sum, activity) => sum + (activity.duration || 0), 0);
        
//         setStats({
//           totalArticlesRead: views,
//           totalTimeSpent: totalTime,
//           totalLikes: likes,
//           totalComments: comments,
//           totalShares: shares
//         });
//       } catch (error) {
//         console.error('Error fetching user activity:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserActivity();
//   }, [currentUser]);

//   const formatTime = (seconds: number) => {
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
    
//     if (hours > 0) {
//       return `${hours}h ${minutes}m`;
//     }
//     return `${minutes}m`;
//   };

//   const getActionIcon = (action: string) => {
//     switch (action) {
//       case 'view':
//         return <FiEye className="text-blue-500" />;
//       case 'like':
//         return <FiThumbsUp className="text-red-500" />;
//       case 'comment':
//         return <FiMessageSquare className="text-green-500" />;
//       case 'share':
//         return <FiShare2 className="text-purple-500" />;
//       default:
//         return null;
//     }
//   };

//   const getActionText = (action: string) => {
//     switch (action) {
//       case 'view':
//         return 'Read an article';
//       case 'like':
//         return 'Liked an article';
//       case 'comment':
//         return 'Commented on an article';
//       case 'share':
//         return 'Shared an article';
//       default:
//         return 'Interacted with an article';
//     }
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <h1 className="text-3xl font-bold mb-6">Your Usage</h1>
      
//       {!currentUser ? (
//         <div className="card p-6 text-center">
//           <h2 className="text-xl font-semibold mb-3">Sign In to View Your Usage</h2>
//           <p className="text-secondary-600 mb-4">
//             You need to be logged in to see your reading history and activity.
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
//       ) : (
//         <div className="space-y-8">
//           {/* Stats Overview */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//             <div className="card p-4">
//               <div className="flex items-center">
//                 <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
//                   <FiEye className="h-6 w-6" />
//                 </div>
//                 <div>
//                   <p className="text-sm text-secondary-500">Articles Read</p>
//                   <p className="text-2xl font-bold">{stats.totalArticlesRead}</p>
//                 </div>
//               </div>
//             </div>
            
//             <div className="card p-4">
//               <div className="flex items-center">
//                 <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
//                   <FiClock className="h-6 w-6" />
//                 </div>
//                 <div>
//                   <p className="text-sm text-secondary-500">Time Spent</p>
//                   <p className="text-2xl font-bold">{formatTime(stats.totalTimeSpent)}</p>
//                 </div>
//               </div>
//             </div>
            
//             <div className="card p-4">
//               <div className="flex items-center">
//                 <div className="p-3 rounded-full bg-red-100 text-red-500 mr-4">
//                   <FiThumbsUp className="h-6 w-6" />
//                 </div>
//                 <div>
//                   <p className="text-sm text-secondary-500">Likes</p>
//                   <p className="text-2xl font-bold">{stats.totalLikes}</p>
//                 </div>
//               </div>
//             </div>
            
//             <div className="card p-4">
//               <div className="flex items-center">
//                 <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
//                   <FiMessageSquare className="h-6 w-6" />
//                 </div>
//                 <div>
//                   <p className="text-sm text-secondary-500">Comments</p>
//                   <p className="text-2xl font-bold">{stats.totalComments}</p>
//                 </div>
//               </div>
//             </div>
            
//             <div className="card p-4">
//               <div className="flex items-center">
//                 <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
//                   <FiShare2 className="h-6 w-6" />
//                 </div>
//                 <div>
//                   <p className="text-sm text-secondary-500">Shares</p>
//                   <p className="text-2xl font-bold">{stats.totalShares}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           {/* Activity Timeline */}
//           <div>
//             <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            
//             {activities.length > 0 ? (
//               <div className="card divide-y divide-secondary-200">
//                 {activities.map((activity) => (
//                   <div key={activity.id} className="p-4 flex items-start">
//                     <div className="mr-4 mt-1">
//                       {getActionIcon(activity.action)}
//                     </div>
//                     <div className="flex-1">
//                       <p className="font-medium text-secondary-900">
//                         {getActionText(activity.action)}
//                       </p>
//                       <p className="text-sm text-secondary-500">
//                         {format(activity.timestamp, 'MMM d, yyyy • h:mm a')}
//                       </p>
//                       {activity.duration && (
//                         <p className="text-xs text-secondary-400 mt-1">
//                           Spent {formatTime(activity.duration)} reading
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-12 bg-secondary-50 rounded-lg">
//                 <p className="text-secondary-600">No activity recorded yet</p>
//                 <p className="text-sm text-secondary-500 mt-2">
//                   Start reading articles to track your activity
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Usage;

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { UserActivity } from '../types';
import { format } from 'date-fns';
import { FiClock, FiEye, FiThumbsUp, FiMessageSquare, FiShare2 } from 'react-icons/fi';

const Usage = () => {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalArticlesRead: 0,
    totalTimeSpent: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0
  });

  useEffect(() => {
    const fetchUserActivity = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        const activitiesRef = collection(db, 'userActivities');
        const activitiesQuery = query(
          activitiesRef,
          where('userId', '==', currentUser.uid),
          orderBy('timestamp', 'desc'),
          limit(50)
        );
        const querySnapshot = await getDocs(activitiesQuery);
        const activitiesData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            timestamp: data.timestamp.toDate(),
          } as UserActivity;
        });
        setActivities(activitiesData);
        
        // Calculate stats
        const views = activitiesData.filter(a => a.action === 'view').length;
        const likes = activitiesData.filter(a => a.action === 'like').length;
        const comments = activitiesData.filter(a => a.action === 'comment').length;
        const shares = activitiesData.filter(a => a.action === 'share').length;
        const totalTime = activitiesData.reduce((sum, activity) => sum + (activity.duration || 0), 0);
        
        setStats({
          totalArticlesRead: views,
          totalTimeSpent: totalTime,
          totalLikes: likes,
          totalComments: comments,
          totalShares: shares
        });
      } catch (error) {
        console.error('Error fetching user activity:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserActivity();
  }, [currentUser]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'view':
        return <FiEye className="text-primary" />;
      case 'like':
        return <FiThumbsUp className="text-primary" />;
      case 'comment':
        return <FiMessageSquare className="text-primary" />;
      case 'share':
        return <FiShare2 className="text-primary" />;
      default:
        return null;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'view':
        return 'Read an article';
      case 'like':
        return 'Liked an article';
      case 'comment':
        return 'Commented on an article';
      case 'share':
        return 'Shared an article';
      default:
        return 'Interacted with an article';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Your Usage</h1>
      {!currentUser ? (
        <div className="bg-card p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold mb-3 text-foreground">Sign In to View Your Usage</h2>
          <p className="text-muted-foreground mb-4">You need to be logged in to see your reading history and activity.</p>
          <div className="flex justify-center space-x-4">
            <a href="/login" className="bg-primary text-primary-foreground py-2 px-4 rounded-md font-medium hover:bg-primary/90">Sign In</a>
            <a href="/signup" className="border border-primary text-primary py-2 px-4 rounded-md font-medium hover:bg-primary/10">Create Account</a>
          </div>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Articles Read', value: stats.totalArticlesRead, icon: <FiEye className="text-primary" /> },
              { label: 'Time Spent', value: formatTime(stats.totalTimeSpent), icon: <FiClock className="text-primary" /> },
              { label: 'Likes', value: stats.totalLikes, icon: <FiThumbsUp className="text-primary" /> },
              { label: 'Comments', value: stats.totalComments, icon: <FiMessageSquare className="text-primary" /> },
              { label: 'Shares', value: stats.totalShares, icon: <FiShare2 className="text-primary" /> },
            ].map((stat, index) => (
              <div key={index} className="bg-card p-4 rounded-lg shadow-md flex items-center">
                <div className="p-3 rounded-full bg-muted text-primary mr-4">{stat.icon}</div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Usage;
