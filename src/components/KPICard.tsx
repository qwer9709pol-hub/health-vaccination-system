
interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'emerald' | 'blue' | 'orange' | 'red' | 'purple' | 'yellow' | 'gray' | 'teal';
  suffix?: string;
}

const colorClasses = {
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', iconBg: 'bg-emerald-100 dark:bg-emerald-800', iconColor: 'text-emerald-600 dark:text-emerald-400', valueColor: 'text-emerald-700 dark:text-emerald-300' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/30', iconBg: 'bg-blue-100 dark:bg-blue-800', iconColor: 'text-blue-600 dark:text-blue-400', valueColor: 'text-blue-700 dark:text-blue-300' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/30', iconBg: 'bg-orange-100 dark:bg-orange-800', iconColor: 'text-orange-600 dark:text-orange-400', valueColor: 'text-orange-700 dark:text-orange-300' },
  red: { bg: 'bg-red-50 dark:bg-red-900/30', iconBg: 'bg-red-100 dark:bg-red-800', iconColor: 'text-red-600 dark:text-red-400', valueColor: 'text-red-700 dark:text-red-300' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/30', iconBg: 'bg-purple-100 dark:bg-purple-800', iconColor: 'text-purple-600 dark:text-purple-400', valueColor: 'text-purple-700 dark:text-purple-300' },
  yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/30', iconBg: 'bg-yellow-100 dark:bg-yellow-800', iconColor: 'text-yellow-600 dark:text-yellow-400', valueColor: 'text-yellow-700 dark:text-yellow-300' },
  gray: { bg: 'bg-gray-100 dark:bg-gray-700/50', iconBg: 'bg-gray-200 dark:bg-gray-600', iconColor: 'text-gray-600 dark:text-gray-400', valueColor: 'text-gray-700 dark:text-gray-300' },
  teal: { bg: 'bg-teal-50 dark:bg-teal-900/30', iconBg: 'bg-teal-100 dark:bg-teal-800', iconColor: 'text-teal-600 dark:text-teal-400', valueColor: 'text-teal-700 dark:text-teal-300' },
};

export default function KPICard({ title, value, icon, color, suffix = '' }: KPICardProps) {
  const classes = colorClasses[color];
  return (
    <div className={`${classes.bg} rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
          <p className={`text-3xl font-bold ${classes.valueColor}`}>{value}{suffix && <span className="text-lg mr-1">{suffix}</span>}</p>
        </div>
        <div className={`${classes.iconBg} p-3 rounded-lg`}><div className={classes.iconColor}>{icon}</div></div>
      </div>
    </div>
  );
}
