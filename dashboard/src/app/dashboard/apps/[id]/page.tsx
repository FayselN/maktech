'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import AppForm from '@/components/AppForm';
import type { App } from '@/lib/types';

export default function EditAppPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [app, setApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<App>(`/admin/apps/${id}`)
      .then(setApp)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-medium">App not found</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit {app.name}</h1>
      <AppForm app={app} onSuccess={() => router.push('/dashboard/apps')} />
    </div>
  );
}
