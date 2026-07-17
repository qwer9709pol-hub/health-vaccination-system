import { useState, useMemo } from 'react';
import type { Child, ChildStatus } from '../types';
import { STATUS_OPTIONS, STATUS_CONFIG } from '../types';
import { Edit2, Trash2, Search, Filter, Phone, MessageCircle, X } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';

interface Props {
  children: Child[];
  onEdit: (child: Child) => void;
  onDelete: (id: string) => void;
  showUnit?: boolean;
}

export default function ChildrenTable({ children, onEdit, onDelete, showUnit }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ChildStatus | 'all'>('all');
  const [doseFilter, setDoseFilter] = useState<number | 'all'>('all');

  const filtered = useMemo(() => {
    return children.filter(c => {
      const matchSearch = !search ||
        c.name.includes(search) ||
        c.national_id.includes(search) ||
        c.phone.includes(search);
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchDose = doseFilter === 'all' || c.dose_number === doseFilter;
      return matchSearch && matchStatus && matchDose;
    });
  }, [children, search, statusFilter, doseFilter]);

  const statusIcons: Record<ChildStatus, React.ReactNode> = {
    'لم يتم التطعيم': <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />,
    'تم التطعيم فى وحدة بتاريخ': <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />,
    'مسافر': <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />,
    'مسافر موثق': <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />,
    'مريض': <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />,
    'الهاتف خطأ': <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />,
    'الهاتف غير متاح': <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />,
    'الهاتف مغلق': <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />,
    'رفض': <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />,
    'منزل مغلق': <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />,
    'تم التحويل الى اقرب وحدة': <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />,
    'متوفى': <span className="w-2 h-2 rounded-full bg-slate-700 inline-block" />,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو الرقم القومي أو الهاتف"
            className="input-field pr-10"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ChildStatus | 'all')} className="input-field w-auto">
          <option value="all">كل الحالات</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={doseFilter} onChange={e => setDoseFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="input-field w-auto">
          <option value="all">كل الجرعات</option>
          <option value={1}>الجرعة الأولى</option>
          <option value={2}>الجرعة الثانية</option>
          <option value={3}>الجرعة الثالثة</option>
        </select>
      </div>

      <div className="text-sm text-slate-500">عدد النتائج: {filtered.length}</div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-right font-medium">#</th>
              <th className="px-4 py-3 text-right font-medium">الاسم</th>
              <th className="px-4 py-3 text-right font-medium">الرقم القومي</th>
              <th className="px-4 py-3 text-right font-medium">تاريخ الميلاد</th>
              <th className="px-4 py-3 text-right font-medium">الهاتف</th>
              {showUnit && <th className="px-4 py-3 text-right font-medium">الوحدة</th>}
              <th className="px-4 py-3 text-right font-medium">الحالة</th>
              <th className="px-4 py-3 text-right font-medium">الجرعة</th>
              <th className="px-4 py-3 text-right font-medium">تاريخ التطعيم</th>
              <th className="px-4 py-3 text-center font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={showUnit ? 10 : 9} className="text-center py-8 text-slate-400">لا توجد بيانات</td></tr>
            ) : filtered.map((child, idx) => {
              const cfg = STATUS_CONFIG[child.status];
              return (
                <tr key={child.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{child.name}</td>
                  <td className="px-4 py-3 text-slate-600">{child.national_id}</td>
                  <td className="px-4 py-3 text-slate-600">{child.birth_date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">{child.phone}</span>
                      <a href={`https://wa.me/2${child.phone.replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">
                        <WhatsAppIcon className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                  {showUnit && <td className="px-4 py-3 text-slate-600">{child.unit_name || '-'}</td>}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bgColor} ${cfg.textColor}`}>
                      {statusIcons[child.status]}
                      {child.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">الجرعة {child.dose_number}</td>
                  <td className="px-4 py-3 text-slate-600">{child.vaccination_date || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => onEdit(child)} className="text-teal-600 hover:text-teal-700 p-1.5 rounded-lg hover:bg-teal-50 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(child.id)} className="text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
