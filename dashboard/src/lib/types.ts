export interface User {
  id: string;
  name: string;
  email: string;
  profileImage: string | null;
  role: 'user' | 'admin';
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
  sortOrder: number;
}

export interface Screenshot {
  _id: string;
  url: string;
  order: number;
}

export interface RatingStats {
  average: number;
  count: number;
}

export interface App {
  _id: string;
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  developerName?: string;
  packageName: string;
  playStoreUrl: string;
  iconUrl: string;
  priceType: 'free' | 'paid' | 'freemium';
  playStoreRating: number;
  categories: string[];
  screenshots: Screenshot[];
  features: string[];
  pros: string[];
  cons: string[];
  ratingStats: RatingStats;
  status: 'draft' | 'published';
  isNewApp: boolean;
  viewCount: number;
  favoriteCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  appId: string;
  userId: { _id: string; name: string; profileImage?: string };
  rating: number;
  comment: string;
  createdAt: string;
}

export interface DailyFeatured {
  _id: string;
  appId: App;
  featuredDate: string;
}

export interface Notification {
  _id: string;
  title: string;
  body: string;
  appId: string | null;
  type: 'new_app' | 'trending' | 'general';
  sentBy: { _id: string; name: string };
  sentAt: string;
}

export interface ActivityLog {
  _id: string;
  adminId: { _id: string; name: string; email: string };
  action: string;
  targetType: string;
  targetId: string;
  changes: Record<string, unknown>;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
