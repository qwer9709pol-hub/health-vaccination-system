import { Search, Filter, Droplet } from 'lucide-react';
import { STATUS_OPTIONS, STATUS_CONFIG } from '../types';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  unitFilter?: string;
  onUnitChange?: (unit: string) => void;
  units?: string[];
  doseFilter?: string;
  onDoseChange?: (dose: string) => void;
  doses?: string[];
}

const allStatuses = [
  { value: '', label: 'الكل' },
  ...STATUS_OPTIONS.map((s) => ({ value: s, label: STATUS_CONFIG[s].label })),
];

export default function SearchFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  unitFilter,
  onUnitChange,
  units,
  doseFilter,
  onDoseChange,
  doses,
}: SearchFilterProps) {
  const selectedStatus = allStatuses.find((s) => s.value === statusFilter);
  const statusColor = selectedStatus?.value
    ? STATUS_CONFIG[selectedStatus.value as keyof typeof STATUS_CONFIG]
    : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4 flex flex-col sm:flex-row gap-4 transition-colors duration-300">
      <div className="relative flex-1">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
          placeholder="بحث بالاسم أو اسم الأم أو رقم الهاتف..."
        />
      </div>

      <div className="relative">
        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className={`pr-10 pl-8 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all min-w-[180px] cursor-pointer ${
            statusColor
              ? `${statusColor.bgColor} ${statusColor.color} border-transparent font-medium`
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white'
          }`}
        >
          {allStatuses.map((s) => (
            <option key={s.value} value={s.value} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {doses && onDoseChange && (
        <div className="relative">
          <Droplet className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={doseFilter ?? ''}
            onChange={(e) => onDoseChange(e.target.value)}
            className="pr-10 pl-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white min-w-[150px] cursor-pointer"
          >
            <option value="">كل الجرعات</option>
            {doses.map((dose) => (
              <option key={dose} value={dose}>{dose}</option>
            ))}
          </select>
        </div>
      )}

      {units && onUnitChange && (
        <div className="relative">
          <select
            value={unitFilter ?? ''}
            onChange={(e) => onUnitChange(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white min-w-[180px] cursor-pointer"
          >
            <option value="">كل الوحدات</option>
            {units.map((unit) => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
