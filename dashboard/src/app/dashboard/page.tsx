'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Smartphone, Eye, Star, MessageSquare } from 'lucide-react';
import StatsCard from '@/components/StatsCard';

interface Stats {
  totalApps: number;
  publishedApps: number;
  draftApps: number;
  totalReviews: number;
  totalViews: number;
  totalFavorites: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<{ apps: any[]; pagination: any }>('/admin/apps?limit=1000'),
      api.get<{ reviews: any[] }>('/admin/apps/...'),
    ]).then(([appsRes]) => {
      const apps = appsRes.apps;
      setStats({
        totalApps: apps.length,
        publishedApps: apps.filter((a: any) => a.status === 'published').length,
        draftApps: apps.filter((a: any) => a.status === 'draft').length,
        totalReviews: apps.reduce((sum: number, a: any) => sum + (a.ratingStats?.count || 0), 0),
        totalViews: apps.reduce((sum: number, a: any) => sum + (a.viewCount || 0), 0),
        totalFavorites: apps.reduce((sum: number, a: any) => sum + (a.favoriteCount || 0), 0),
      });
    }).catch(console.error);
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={Smartphone} label="Total Apps" value={stats.totalApps} color="indigo" />
        <StatsCard icon={Eye} label="Total Views" value={stats.totalViews} color="blue" />
        <StatsCard icon={Star} label="Total Reviews" value={stats.totalReviews} color="amber" />
        <StatsCard icon={MessageSquare} label="Published" value={`${stats.publishedApps}/${stats.totalApps}`} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">App Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Published</span>
              <span className="font-medium text-gray-900">{stats.publishedApps}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${stats.totalApps ? (stats.publishedApps / stats.totalApps) * 100 : 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Drafts</span>
              <span className="font-medium text-gray-900">{stats.draftApps}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{ width: `${stats.totalApps ? (stats.draftApps / stats.totalApps) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <a
              href="/dashboard/apps/new"
              className="block w-full text-center py-2 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add New App
            </a>
            <a
              href="/dashboard/featured"
              className="block w-full text-center py-2 px-4 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
            >
              Set Daily Featured
            </a>
            <a
              href="/dashboard/notifications"
              className="block w-full text-center py-2 px-4 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              Send Notification
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
