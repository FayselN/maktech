export interface Review {
  id: string;
  username: string;
  avatarUrl?: string;
  rating: number;
  date: string;
  comment: string;
}

export interface AppScreenshot {
  title: string;
  type: 'dashboard' | 'feature_list' | 'stats' | 'chat' | 'editor' | 'map' | 'custom';
  content: string; // Describes the UI mock content
  accentColor: string; // Tailwind hex or class color for the mock
}

export interface AppItem {
  id: string;
  name: string;
  developer: string;
  category: 'AI' | 'Productivity' | 'Education' | 'Utilities' | 'Photo Editing' | 'Finance' | 'VPN' | 'Games';
  rating: number;
  ratingCount: string;
  description: string;
  longDescription: string;
  downloadUrl: string;
  iconUrl: string; // Icon or Lucide icon string
  iconColor: string; // Brand color for the icon background
  features: string[];
  advantages: string[];
  disadvantages: string[];
  screenshots: AppScreenshot[];
  reviews: Review[];
  isTrending?: boolean;
  isNew?: boolean;
  isDailyFeatured?: boolean;
  searchCode?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  appId?: string; // Optional links directly to an app
}
