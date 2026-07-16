import { useState } from 'react';
import { X, Trash2, AlertTriangle, Building2, Filter, Droplet, Loader2 } from 'lucide-react';
import { STATUS_OPTIONS, STATUS_CONFIG, Unit } from '../types';
import { deleteChildrenByFilters } from '../api/data';

interface BulkDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleted: () => void;
  units: Unit[];
  doses: string[];
}

export default function BulkDeleteModal({ isOpen, onClose, onDeleted, units, doses }: BulkDeleteModalProps) {
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDose, setSelectedDose] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!selectedUnit && !selectedStatus && !selectedDose) {
      setError('من فضلك اختر فلتر واحد على الأقل (وحدة، حالة، أو جرعة)');
      return;
    }

    const confirmParts: string[] = [];
    if (selectedUnit) confirmParts.push(`الوحدة: ${selectedUnit}`);
    if (selectedStatus) confirmParts.push(`الحالة: ${selectedStatus}`);
    if (selectedDose) confirmParts.push(`الجرعة: ${selectedDose}`);

    const confirmMsg = `هل أنت متأكد من حذف جميع الأطفال المطابقين للفلاتر التالية؟\n\n${confirmParts.join('\n')}\n\nهذا الإجراء لا يمكن التراجع عنه!`;
    if (!confirm(confirmMsg)) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const filters: { unitId?: string; status?: string; dose?: string } = {};
      if (selectedUnit) {
        const unit = units.find((u) => u.unit_name === selectedUnit);
        if (unit) filters.unitId = unit.id;
      }
      if (selectedStatus) filters.status = selectedStatus;
      if (selectedDose) filters.dose = selectedDose;

      const count = await deleteChildrenByFilters(filters);
      setResult(count);
      onDeleted();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الحذف');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedUnit('');
    setSelectedStatus('');
    setSelectedDose('');
    setError('');
    setResult(null);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" dir="rtl">
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trash2 className="w-6 h-6" />
            حذف جماعي للأطفال
          </h2>
          <button onClick={handleClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                تحذير: سيتم حذف جميع الأطفال المطابقين للفلاتر المحددة نهائياً
              </p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                يمكنك الحذف حسب الوحدة، الحالة، الجرعة، أو أي مجموعة منهم
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
              <AlertTriangle className="w-5 h-5" /><span className="text-sm">{error}</span>
            </div>
          )}

          {result !== null && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg">
              <Trash2 className="w-5 h-5" /><span className="text-sm">تم حذف {result} طفل بنجاح</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4" />الوحدة الصحية
            </label>
            <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none cursor-pointer">
              <option value="">كل الوحدات</option>
              {units.map((unit) => (<option key={unit.id} value={unit.unit_name}>{unit.unit_name}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Filter className="w-4 h-4" />الحالة
            </label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none cursor-pointer">
              <option value="">كل الحالات</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Droplet className="w-4 h-4" />الجرعة
            </label>
            <select value={selectedDose} onChange={(e) => setSelectedDose(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none cursor-pointer">
              <option value="">كل الجرعات</option>
              {doses.map((dose) => (<option key={dose} value={dose}>{dose}</option>))}
            </select>
          </div>
        </div>

        <div className="px-6 py-4 border-t dark:border-gray-700 flex gap-3 flex-shrink-0 bg-white dark:bg-gray-800 rounded-b-2xl">
          <button onClick={handleDelete} disabled={loading || result !== null}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Trash2 className="w-5 h-5" /><span>حذف</span></>}
          </button>
          <button onClick={handleClose}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
