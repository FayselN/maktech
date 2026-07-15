'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { ActivityLog, Pagination } from '@/lib/types';

const actionLabels: Record<string, string> = {
  app_created: 'Created app',
  app_updated: 'Updated app',
  app_deleted: 'Deleted app',
  app_published: 'Published app',
  category_created: 'Created category',
  category_updated: 'Updated category',
  category_deleted: 'Deleted category',
  featured_set: 'Set featured app',
  notification_sent: 'Sent notification',
};

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<{ logs: ActivityLog[]; pagination: Pagination }>(`/admin/activity-log?page=${page}&limit=50`)
      .then((res) => {
        setLogs(res.logs);
        setPagination(res.pagination);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Activity Log</h1>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No activity logged yet</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map((log) => (
              <div key={log._id} className="px-4 py-3 flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  log.action.includes('deleted') ? 'bg-red-400' :
                  log.action.includes('created') || log.action.includes('published') ? 'bg-green-400' :
                  'bg-blue-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{log.adminId?.name || 'Unknown'}</span>
                    {' '}{actionLabels[log.action] || log.action}
                    {log.targetType === 'app' && ' an app'}
                    {log.targetType === 'category' && ' a category'}
                  </p>
                  {log.changes && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {JSON.stringify(log.changes)}
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page >= pagination.pages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
