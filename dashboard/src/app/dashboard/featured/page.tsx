'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { App } from '@/lib/types';
import { Search } from 'lucide-react';

export default function FeaturedPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [currentFeatured, setCurrentFeatured] = useState<any>(null);
  const [featuredHistory, setFeaturedHistory] = useState<any[]>([]);

  useEffect(() => {
    api.get<{ apps: App[] }>('/admin/apps?limit=100')
      .then((res) => setApps(res.apps))
      .catch(console.error);

    api.get('/admin/featured?limit=10')
      .then((res: any) => setFeaturedHistory(res || []))
      .catch(console.error);

    const today = new Date().toISOString().split('T')[0];
    api.get(`/admin/featured/${today}`)
      .then((res: any) => setCurrentFeatured(res?.appId || null))
      .catch(() => {});
  }, []);

  const filteredApps = apps.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.packageName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setSaving(true);
    setMessage('');
    try {
      await api.post('/admin/featured', { appId: selectedApp._id, date });
      setMessage(`Featured app set to "${selectedApp.name}" for ${date}`);
      setSelectedApp(null);
      setSearch('');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to set featured');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Daily Featured App</h1>

      {currentFeatured && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-amber-800">
            Today&apos;s featured: <strong>{currentFeatured.name}</strong>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-gray-200 space-y-4 max-w-lg mb-8">
        <h2 className="text-sm font-semibold text-gray-900">Set Featured App</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search App</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or package..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        {search && (
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
            {filteredApps.map((app) => (
              <button
                key={app._id}
                type="button"
                onClick={() => {
                  setSelectedApp(app);
                  setSearch(app.name);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <img src={app.iconUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                <div>
                  <p className="font-medium text-gray-900">{app.name}</p>
                  <p className="text-xs text-gray-500">{app.packageName}</p>
                </div>
              </button>
            ))}
            {filteredApps.length === 0 && (
              <p className="px-3 py-2 text-sm text-gray-400">No apps found</p>
            )}
          </div>
        )}

        {selectedApp && (
          <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
            <img src={selectedApp.iconUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
            <div>
              <p className="text-sm font-medium text-gray-900">{selectedApp.name}</p>
              <p className="text-xs text-gray-500">{selectedApp.packageName}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedApp || saving}
          className="w-full py-2 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Set as Featured'}
        </button>

        {message && (
          <div className={`p-3 text-sm rounded-lg ${message.includes('Failed') ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
            {message}
          </div>
        )}
      </form>

      {featuredHistory.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Featured History</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">App</th>
              </tr>
            </thead>
            <tbody>
              {featuredHistory.map((f: any) => (
                <tr key={f._id} className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(f.featuredDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    {f.appId && (
                      <>
                        <img src={f.appId.iconUrl} alt="" className="w-6 h-6 rounded object-cover" />
                        <span className="font-medium text-gray-900">{f.appId.name}</span>
                      </>
                    )}
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
