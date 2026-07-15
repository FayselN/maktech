'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { api } from '@/lib/api';
import type { App, Category } from '@/lib/types';
import { Plus, X, GripVertical } from 'lucide-react';

interface Props {
  app?: App;
  onSuccess: () => void;
}

interface ListItem {
  id: string;
  value: string;
}

interface FormData {
  name: string;
  shortDescription: string;
  longDescription: string;
  developerName: string;
  packageName: string;
  playStoreUrl: string;
  iconUrl: string;
  priceType: 'free' | 'paid' | 'freemium';
  playStoreRating: number;
  categories: string[];
  features: ListItem[];
  pros: ListItem[];
  cons: ListItem[];
  status: 'draft' | 'published';
}

const emptyForm: FormData = {
  name: '',
  shortDescription: '',
  longDescription: '',
  developerName: '',
  packageName: '',
  playStoreUrl: '',
  iconUrl: '',
  priceType: 'free',
  playStoreRating: 0,
  categories: [],
  features: [],
  pros: [],
  cons: [],
  status: 'draft',
};

export default function AppForm({ app, onSuccess }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<Category[]>('/categories')
      .then(setAllCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (app) {
      setForm({
        name: app.name || '',
        shortDescription: app.shortDescription || '',
        longDescription: app.longDescription || '',
        developerName: app.developerName || '',
        packageName: app.packageName || '',
        playStoreUrl: app.playStoreUrl || '',
        iconUrl: app.iconUrl || '',
        priceType: app.priceType ?? 'free',
        playStoreRating: app.playStoreRating || 0,
        categories: app.categories || [],
        features: (app.features || []).map((v) => ({ id: crypto.randomUUID(), value: v })),
        pros: (app.pros || []).map((v) => ({ id: crypto.randomUUID(), value: v })),
        cons: (app.cons || []).map((v) => ({ id: crypto.randomUUID(), value: v })),
        status: app.status || 'draft',
      });
    }
  }, [app]);

  const addItem = (list: ListItem[], setter: (items: ListItem[]) => void) => {
    setter([...list, { id: crypto.randomUUID(), value: '' }]);
  };

  const updateItem = (list: ListItem[], setter: (items: ListItem[]) => void, id: string, value: string) => {
    setter(list.map((item) => item.id === id ? { ...item, value } : item));
  };

  const removeItem = (list: ListItem[], setter: (items: ListItem[]) => void, id: string) => {
    setter(list.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const body = {
        name: form.name,
        shortDescription: form.shortDescription,
        longDescription: form.longDescription,
        developerName: form.developerName,
        packageName: form.packageName,
        playStoreUrl: form.playStoreUrl,
        iconUrl: form.iconUrl,
        priceType: form.priceType,
        playStoreRating: form.playStoreRating,
        categories: form.categories,
        features: form.features.map((f) => f.value).filter(Boolean),
        pros: form.pros.map((p) => p.value).filter(Boolean),
        cons: form.cons.map((c) => c.value).filter(Boolean),
        status: form.status,
      };

      if (app) {
        await api.put(`/admin/apps/${app._id}`, body);
      } else {
        await api.post('/admin/apps', body);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save app');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none';

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
      )}

      <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">Basic Info</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">App Name *</label>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Package Name *</label>
            <input className={inputClass} value={form.packageName} onChange={(e) => setForm({ ...form, packageName: e.target.value })} required placeholder="com.example.app" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Short Description *</label>
          <input className={inputClass} value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} maxLength={200} required />
          <p className="text-xs text-gray-400 mt-1">{form.shortDescription.length}/200</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Long Description</label>
          <textarea className={`${inputClass} min-h-[120px] resize-y`} value={form.longDescription} onChange={(e) => setForm({ ...form, longDescription: e.target.value })} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Developer Name</label>
            <input className={inputClass} value={form.developerName} onChange={(e) => setForm({ ...form, developerName: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Type</label>
            <select className={inputClass} value={form.priceType} onChange={(e) => setForm({ ...form, priceType: e.target.value as any })}>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
              <option value="freemium">Freemium</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Play Store URL *</label>
            <input className={inputClass} value={form.playStoreUrl} onChange={(e) => setForm({ ...form, playStoreUrl: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon URL *</label>
            <input className={inputClass} value={form.iconUrl} onChange={(e) => setForm({ ...form, iconUrl: e.target.value })} required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Play Store Rating</label>
            <input type="number" step="0.1" min="0" max="5" className={inputClass} value={form.playStoreRating} onChange={(e) => setForm({ ...form, playStoreRating: parseFloat(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {allCategories.map((cat) => {
            const selected = form.categories.includes(cat.slug);
            return (
              <button
                key={cat._id}
                type="button"
                onClick={() => {
                  setForm({
                    ...form,
                    categories: selected
                      ? form.categories.filter((s) => s !== cat.slug)
                      : [...form.categories, cat.slug],
                  });
                }}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  selected
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      <DynamicList label="Features" items={form.features} onChange={(items) => setForm({ ...form, features: items })} />
      <DynamicList label="Pros" items={form.pros} onChange={(items) => setForm({ ...form, pros: items })} />
      <DynamicList label="Cons" items={form.cons} onChange={(items) => setForm({ ...form, cons: items })} />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="py-2 px-6 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : app ? 'Update App' : 'Create App'}
        </button>
        <button
          type="button"
          onClick={onSuccess}
          className="py-2 px-6 text-sm text-gray-600 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function DynamicList({ label, items, onChange }: { label: string; items: ListItem[]; onChange: (items: ListItem[]) => void }) {
  const add = () => onChange([...items, { id: crypto.randomUUID(), value: '' }]);
  const update = (id: string, value: string) =>
    onChange(items.map((item) => (item.id === id ? { ...item, value } : item)));
  const remove = (id: string) => onChange(items.filter((item) => item.id !== id));

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">{label}</h2>
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>
      {items.length === 0 && (
        <p className="text-sm text-gray-400">No items added yet.</p>
      )}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
            <input
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              value={item.value}
              onChange={(e) => update(item.id, e.target.value)}
              placeholder={`Enter ${label.toLowerCase().slice(0, -1)}...`}
            />
            <button
              type="button"
              onClick={() => remove(item.id)}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
