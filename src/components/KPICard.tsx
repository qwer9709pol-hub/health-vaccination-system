import { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: number;
  suffix?: string;
  color: 'blue' | 'emerald' | 'orange' | 'red' | 'yellow' | 'purple' | 'teal' | 'gray';
  icon: ReactNode;
}

const colorMap = {
  blue: 'from-blue-500 to-blue-600',
  emerald: 'from-emerald-500 to-emerald-600',
  orange: 'from-orange-500 to-orange-600',
  red: 'from-red-500 to-red-600',
  yellow: 'from-yellow-500 to-yellow-600',
  purple: 'from-purple-500 to-purple-600',
  teal: 'from-teal-500 to-teal-600',
  gray: 'from-gray-500 to-gray-600',
};

export default function KPICard({ title, value, suffix, color, icon }: KPICardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}{suffix}
          </p>
        </div>
        <div className={`bg-gradient-to-br ${colorMap[color]} p-3 rounded-lg text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
