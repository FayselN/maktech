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
  curiosityTitle: string;
  shortDescription: string;
  longDescription: string;
  developerName: string;
  playStoreUrl: string;
  appStoreUrl: string;
  iconUrl: string;
  priceType: 'free' | 'paid' | 'freemium';
  playStoreRating: number;
  categories: string[];
  features: ListItem[];
  pros: ListItem[];
  cons: ListItem[];
  status: 'draft' | 'published';
}

const DEFAULT_DEVELOPER = 'Mak Tech';

const emptyForm: FormData = {
  name: '',
  curiosityTitle: '',
  shortDescription: '',
  longDescription: '',
  developerName: DEFAULT_DEVELOPER,
  playStoreUrl: '',
  appStoreUrl: '',
  iconUrl: '',
  priceType: 'free',
  playStoreRating: 0,
  categories: [],
  features: [],
  pros: [],
  cons: [],
  status: 'draft',
};

export function extractPackageName(playStoreUrl: string, slug: string): string {
  try {
    const match = playStoreUrl.match(/details\?id=([a-zA-Z0-9._]+)/);
    if (match?.[1]) return match[1];
  } catch {
    // fall through to generated id
  }
  return `com.maktech.${slug}`;
}

export function generateSearchCode(): string {
  return `mt${Date.now().toString(36)}${Math.floor(Math.random() * 10000)}`;
}

export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || `app-${Date.now().toString(36)}`;
}

export default function AppForm({ app, onSuccess }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Icon upload state
  const [uploadMode, setUploadMode] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);

  useEffect(() => {
    api.get<Category[]>('/categories')
      .then(setAllCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (app) {
      setForm({
        name: app.name || '',
        curiosityTitle: app.curiosityTitle || '',
        shortDescription: app.shortDescription || '',
        longDescription: app.longDescription || '',
        developerName: app.developerName || DEFAULT_DEVELOPER,
        playStoreUrl: app.playStoreUrl || '',
        appStoreUrl: app.appStoreUrl || '',
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

  // derived technical values that the system manages for the admin
  const previewSlug = app?.slug || slugifyName(form.name);
  const previewPackageName = extractPackageName(
    form.playStoreUrl,
    previewSlug,
  );
  const previewSearchCode = app?.searchCode || 'auto-generated on save';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const slug = app?.slug || slugifyName(form.name);
      const body = {
        name: form.name,
        slug,
        searchCode: app?.searchCode || generateSearchCode(),
        curiosityTitle: form.curiosityTitle || form.name,
        shortDescription: form.shortDescription,
        longDescription: form.longDescription || `${form.shortDescription}`,
        developerName: form.developerName || DEFAULT_DEVELOPER,
        packageName: extractPackageName(form.playStoreUrl, slug),
        playStoreUrl: form.playStoreUrl,
        appStoreUrl: form.appStoreUrl || null,
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIcon(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const res = await api.upload<{ url: string }>('/admin/apps/upload', formData);
      setForm((prev) => ({ ...prev, iconUrl: res.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploadingIcon(false);
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">App Name *</label>
          <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catchy Tagline <span className="text-gray-400 font-normal">(shown on the app card; leave empty to use the name)</span></label>
          <input className={inputClass} value={form.curiosityTitle} onChange={(e) => setForm({ ...form, curiosityTitle: e.target.value })} placeholder="e.g. Your Second Brain" />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Download Link (Play Store or any store URL) *</label>
            <input className={inputClass} value={form.playStoreUrl} onChange={(e) => setForm({ ...form, playStoreUrl: e.target.value })} required placeholder="https://play.google.com/store/apps/details?id=..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Second Link <span className="text-gray-400 font-normal">(e.g. App Store — optional)</span></label>
            <input className={inputClass} value={form.appStoreUrl} onChange={(e) => setForm({ ...form, appStoreUrl: e.target.value })} placeholder="https://apps.apple.com/..." />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon *</label>
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" name="iconMode" checked={!uploadMode} onChange={() => setUploadMode(false)} className="text-indigo-600 focus:ring-indigo-500" />
                  Paste URL
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" name="iconMode" checked={uploadMode} onChange={() => setUploadMode(true)} className="text-indigo-600 focus:ring-indigo-500" />
                  Upload Image
                </label>
              </div>
              
              {!uploadMode ? (
                <input className={inputClass} value={form.iconUrl} onChange={(e) => setForm({ ...form, iconUrl: e.target.value })} placeholder="https://..." required />
              ) : (
                <div className="flex flex-col gap-3">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" />
                  {uploadingIcon && <p className="text-xs text-indigo-600 font-medium">Uploading...</p>}
                  {form.iconUrl && (
                    <div className="flex items-center gap-3 mt-2">
                      <img src={form.iconUrl} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-gray-200 shadow-sm" />
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Uploaded successfully
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Type</label>
            <select className={inputClass} value={form.priceType} onChange={(e) => setForm({ ...form, priceType: e.target.value as any })}>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
              <option value="freemium">Freemium</option>
            </select>
          </div>
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

        <details className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <summary className="text-xs font-medium text-gray-500 cursor-pointer select-none">
            Technical details (handled automatically)
          </summary>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-gray-400 mb-0.5">Developer Name</p>
              <input
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-gray-700 bg-white"
                value={form.developerName}
                onChange={(e) => setForm({ ...form, developerName: e.target.value })}
              />
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Slug</p>
              <input readOnly value={previewSlug} className="w-full px-2 py-1.5 border border-gray-200 rounded text-gray-600 bg-white/60" />
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Package Name</p>
              <input readOnly value={previewPackageName} className="w-full px-2 py-1.5 border border-gray-200 rounded text-gray-600 bg-white/60" />
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Search Code</p>
              <input readOnly value={previewSearchCode} className="w-full px-2 py-1.5 border border-gray-200 rounded text-gray-600 bg-white/60" />
            </div>
          </div>
        </details>
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
