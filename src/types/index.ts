// ============================================
// Core Types for Lyrii 3.0
// ============================================

export interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
  profilePic?: string;
  isVerified: boolean;
  isAdmin: boolean;
  isFeatured: boolean;
  createdAt: string;
  followerCount?: number;
  followingCount?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export type PostType = "poem" | "story" | "micro_tale";

export interface Post {
  id: number;
  authorId: number;
  authorName: string;
  authorPic?: string;
  title: string;
  content: string;
  type: PostType;
  mood?: MoodTag | null;
  views: number;
  isPublished: boolean;
  isFeatured?: boolean;
  featuredAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  ratingCount?: number;
  avgRating?: number;
  readTime?: number;
  isBookmarked?: boolean;
  myRating?: { rating: number; comment?: string | null } | null;
  /** Explore page: algorithm relevance score (0-100) */
  score?: number;
}

export interface DailyPrompt {
  id: number;
  prompt: string;
  theme?: string;
  activeDate: string;
  isActive: boolean;
  responseCount: number;
  createdAt: string;
}

export interface Rating {
  id: number;
  postId: number;
  userId: number;
  username: string;
  userPic?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Conversation {
  id: number;
  otherUser: {
    id: number;
    username: string;
    profilePic?: string;
  };
  lastMessage?: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
  readAt?: string;
}

export interface Notification {
  id: number;
  type: string;
  message: string;
  relatedPostId?: number;
  relatedUserId?: number;
  read: boolean;
  createdAt: string;
}

export interface Bottle {
  id: number;
  message: string;
  wordCount: number;
  createdAt: string;
  senderName?: string;
}

export interface Analytics {
  stats: {
    totalPosts: number;
    totalViews: number;
    totalLikes: number;
    followersCount: number;
    followingCount: number;
  };
  contentDistribution: {
    type: string;
    count: number;
    percentage: number;
  }[];
  engagementData: {
    date: string;
    views: number;
    likes: number;
  }[];
  badges: Badge[];
  recentActivity: Activity[];
  topPosts: Post[];
  growth: {
    postsThisMonth: number;
    postsLastMonth: number;
    newFollowersThisMonth: number;
    viewsLast30Days: number;
  };
  peakHours?: number[][];
  writingHeatmap?: Record<string, number>;
}

export interface Badge {
  badgeName: string;
  badgeIcon?: string;
  level: number;
  description?: string;
  milestoneType: string;
  milestoneValue: number;
  achievedAt: string;
}

export interface Activity {
  type: string;
  actorName: string;
  targetTitle?: string;
  activityTime: string;
}

export type MoodTag =
  | "melancholy"
  | "joy"
  | "longing"
  | "rage"
  | "serenity"
  | "love"
  | "nostalgia"
  | "hope"
  | "grief"
  | "wonder";
