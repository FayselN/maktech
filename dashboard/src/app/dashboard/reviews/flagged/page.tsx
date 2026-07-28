'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AlertTriangle, Trash2, CheckCircle } from 'lucide-react';

interface ReviewReport {
  _id: string;
  appId: { _id: string; name: string } | null;
  deviceId: string;
  rating: number;
  comment: string;
  status: string;
  reportCount: number;
  reports: string[];
  createdAt: string;
}

export default function FlaggedReviewsPage() {
  const [reviews, setReviews] = useState<ReviewReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const data = await api.get<ReviewReport[]>('/admin/reviews/flagged');
      setReviews(data);
    } catch (error) {
      console.error('Failed to fetch flagged reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id: string, action: 'delete' | 'dismiss') => {
    if (!confirm(`Are you sure you want to ${action} this review?`)) return;
    
    setActionLoading(id);
    try {
      await api.put(`/admin/reviews/${id}/moderate`, { action });
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (error) {
      console.error(`Failed to ${action} review:`, error);
      alert(`Failed to ${action} review.`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flagged Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">Reviews reported multiple times by users.</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-900">No flagged reviews</h3>
          <p className="text-sm text-gray-500 mt-1">There are currently no reviews requiring moderation.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">App</th>
                <th className="px-6 py-4 font-medium">Review</th>
                <th className="px-6 py-4 font-medium">Reports</th>
                <th className="px-6 py-4 font-medium">Reasons</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reviews.map((review) => (
                <tr key={review._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{review.appId?.name || 'Unknown App'}</div>
                    <div className="text-gray-500 text-xs mt-1">Rating: {review.rating}/5</div>
                  </td>
                  <td className="px-6 py-4 max-w-md">
                    <p className="text-gray-600 truncate">{review.comment || '(No text)'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {review.reportCount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {review.reports.slice(0, 3).map((reason, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
                          {reason}
                        </span>
                      ))}
                      {review.reports.length > 3 && (
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">+{review.reports.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleModerate(review._id, 'dismiss')}
                        disabled={actionLoading === review._id}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Dismiss Reports"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleModerate(review._id, 'delete')}
                        disabled={actionLoading === review._id}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
