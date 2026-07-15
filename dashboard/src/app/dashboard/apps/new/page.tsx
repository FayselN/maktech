'use client';

import { useRouter } from 'next/navigation';
import AppForm from '@/components/AppForm';

export default function NewAppPage() {
  const router = useRouter();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New App</h1>
      <AppForm onSuccess={() => router.push('/dashboard/apps')} />
    </div>
  );
}
