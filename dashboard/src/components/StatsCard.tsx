import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: 'indigo' | 'blue' | 'amber' | 'green' | 'red' | 'purple';
}

export default function StatsCard({ icon: Icon, label, value, color }: StatsCardProps) {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  return (
    <div className={`rounded-xl p-6 border ${colorClasses[color]} transition-all hover:scale-105`}>
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-white shadow-sm">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-600 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
