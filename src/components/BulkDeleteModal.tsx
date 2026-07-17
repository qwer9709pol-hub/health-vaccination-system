import { useState } from 'react';
import type { Unit, ChildStatus } from '../types';
import { STATUS_OPTIONS } from '../types';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface Props {
  units: Unit[];
  onClose: () => void;
  onConfirm: (filters: { unit_id?: string; status?: ChildStatus; dose_number?: number }) => Promise<number>;
}

export default function BulkDeleteModal({ units, onClose, onConfirm }: Props) {
  const [unitId, setUnitId] = useState<string>('');
  const [status, setStatus] = useState<ChildStatus | ''>('');
  const [dose, setDose] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    const filters: { unit_id?: string; status?: ChildStatus; dose_number?: number } = {};
    if (unitId) filters.unit_id = unitId;
    if (status) filters.status = status as ChildStatus;
    if (dose) filters.dose_number = Number(dose);
    const count = await onConfirm(filters);
    setResult(count);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            حذف جماعي
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {result === null ? (
            <>
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>سيتم حذف جميع السجلات المطابقة للفلاتر المحددة. لا يمكن التراجع عن هذا الإجراء.</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الوحدة</label>
                <select value={unitId} onChange={e => setUnitId(e.target.value)} className="input-field">
                  <option value="">كل الوحدات</option>
                  {units.map(u => <option key={u.id} value={u.id}>{u.unit_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الحالة</label>
                <select value={status} onChange={e => setStatus(e.target.value as ChildStatus | '')} className="input-field">
                  <option value="">كل الحالات</option>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الجرعة</label>
                <select value={dose} onChange={e => setDose(e.target.value === '' ? '' : Number(e.target.value))} className="input-field">
                  <option value="">كل الجرعات</option>
                  <option value={1}>الجرعة الأولى</option>
                  <option value={2}>الجرعة الثانية</option>
                  <option value={3}>الجرعة الثالثة</option>
                </select>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">{result > 0 ? '✓' : '!'}</div>
              <p className="text-lg font-medium text-slate-800">
                {result > 0 ? `تم حذف ${result} سجل` : 'لا توجد سجلات مطابقة'}
              </p>
            </div>
          )}
        </div>
        <div className="flex gap-3 p-6 border-t border-slate-200 flex-shrink-0">
          {result === null ? (
            <>
              <button onClick={handleConfirm} disabled={loading} className="btn-danger flex items-center gap-2 disabled:opacity-50">
                <Trash2 className="w-5 h-5" />
                {loading ? 'جاري الحذف...' : 'حذف'}
              </button>
              <button onClick={onClose} className="btn-secondary">إلغاء</button>
            </>
          ) : (
            <button onClick={onClose} className="btn-primary w-full">إغلاق</button>
          )}
        </div>
      </div>
    </div>
  );
}
