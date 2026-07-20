export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

export interface App {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  description: string;
  iconUrl: string;
  iconColor: string;
  categories: string[];
  rating: number;
  ratingCount: string;
  downloadCount: number;
  status: 'published' | 'draft';
  viewCount: number;
  favoriteCount: number;
  isNew?: boolean;
  isTrending?: boolean;
  isDailyFeatured?: boolean;
  curiosityTitle?: string;
  shortDescription?: string;
  longDescription?: string;
  ratingStats?: {
    average: number;
    count: number;
  };
  screenshots?: any[];
  reviews?: any[];
  searchCode?: string;
  packageName?: string;
  priceType?: 'free' | 'paid' | 'freemium';
  playStoreUrl?: string;
  playStoreRating?: number;
  developerName?: string;
  features?: string[];
  pros?: string[];
  cons?: string[];
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  sortOrder: number;
}

export interface CategoryModel {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  appId?: string;
  type?: string;
}

export interface Review {
  id: string;
  username: string;
  rating: number;
  date: string;
  comment: string;
}

export interface ActivityLog {
  _id: string;
  action: string;
  adminId?: { name?: string };
  targetType: string;
  changes?: any;
  createdAt: string;
}

export interface Pagination {
  page: number;
  pages: number;
  limit: number;
  total: number;
}

export interface Stats {
  totalApps: number;
  publishedApps: number;
  draftApps: number;
  totalReviews: number;
  totalViews: number;
  totalFavorites: number;
}

export interface ApiError {
  message: string;
  type?: string;
}
