export interface User {
    id: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    preferences: UserPreferences;
    createdAt: Date;
    lastLogin: Date;
  }
  
  export interface UserPreferences {
    categories: string[];
    topics: string[];
    sources: string[];
    favorites: string[];
  }
  
  export interface Article {
    _id: string;
    id: string;
    title: string;
    description: string;
    content: string;
    author: string;
    source: string;
    url: string;
    imageUrl: string;
    publishedAt: Date;
    category: string;
    topics: string[];
    likes: number;
    comments: Comment[];
  }

  export interface LeftRightPercentages {
    id: string;
    left: number;
    lean_left: number;
    center: number;
    lean_right: number;
    right: number;
  }
  
  export interface Comment {
    id: string;
    userId: string;
    userName: string;
    userPhotoURL?: string;
    content: string;
    createdAt: Date;
    likes: number;
  }
  
  export interface Subscription {
    id: string;
    userId: string;
    plan: 'free' | 'basic' | 'premium';
    startDate: Date;
    endDate: Date;
    autoRenew: boolean;
    paymentMethod?: string;
  }
  
  export interface UserActivity {
    id: string;
    userId: string;
    articleId: string;
    action: 'view' | 'like' | 'comment' | 'share';
    timestamp: Date;
    duration?: number; // Time spent reading in seconds
  }