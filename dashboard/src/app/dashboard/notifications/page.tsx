'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { App } from '@/lib/types';
import { Send, Search } from 'lucide-react';

export default function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<'new_app' | 'trending' | 'general'>('general');
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [apps, setApps] = useState<App[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    api.get<{ apps: App[] }>('/admin/apps?limit=100')
      .then((res) => setApps(res.apps))
      .catch(console.error);

    api.get<{ notifications: any[] }>('/admin/notifications?limit=20')
      .then((res) => setHistory(res.notifications || []))
      .catch(console.error);
  }, []);

  const filteredApps = apps.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.packageName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.post('/admin/notifications', {
        title,
        body,
        type,
        appId: selectedApp?._id || null,
      });
      setMessage('Notification sent successfully!');
      setTitle('');
      setBody('');
      setSelectedApp(null);
      setSearch('');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none';

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-gray-200 space-y-4 max-w-lg mb-8">
        <h2 className="text-sm font-semibold text-gray-900">Compose Notification</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select className={inputClass} value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="general">General</option>
            <option value="new_app">New App</option>
            <option value="trending">Trending</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Body *</label>
          <textarea className={`${inputClass} min-h-[80px] resize-y`} value={body} onChange={(e) => setBody(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Related App (optional)</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search app..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          {search && (
            <div className="mt-1 max-h-40 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              {filteredApps.map((app) => (
                <button
                  key={app._id}
                  type="button"
                  onClick={() => { setSelectedApp(app); setSearch(app.name); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-3"
                >
                  <img src={app.iconUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                  <span className="font-medium text-gray-900">{app.name}</span>
                </button>
              ))}
              {filteredApps.length === 0 && <p className="px-3 py-2 text-sm text-gray-400">No apps</p>}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <Send className="w-4 h-4" />
          {saving ? 'Sending...' : 'Send Notification'}
        </button>

        {message && (
          <div className={`p-3 text-sm rounded-lg ${message.includes('Failed') ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
            {message}
          </div>
        )}
      </form>

      {history.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Sent Notifications</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {history.map((n: any) => (
              <div key={n._id} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      n.type === 'new_app' ? 'bg-green-50 text-green-700' :
                      n.type === 'trending' ? 'bg-amber-50 text-amber-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {n.type}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.sentAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
