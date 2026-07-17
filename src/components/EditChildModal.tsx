import { useState, useEffect } from 'react';
import type { Child, ChildStatus } from '../types';
import { STATUS_OPTIONS } from '../types';
import { X, Save } from 'lucide-react';

interface Props {
  child: Child | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Child>) => void;
}

export default function EditChildModal({ child, onClose, onSave }: Props) {
  const [form, setForm] = useState<Partial<Child>>({});

  useEffect(() => {
    if (child) setForm({ ...child });
  }, [child]);

  if (!child) return null;

  const handleSave = () => {
    const updates: Partial<Child> = { ...form };
    if (form.status !== 'تم التطعيم فى وحدة بتاريخ') {
      updates.vaccination_date = null;
    }
    onSave(child.id, updates);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800">تعديل بيانات الطفل</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الاسم</label>
            <input type="text" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الرقم القومي</label>
            <input type="text" value={form.national_id || ''} onChange={e => setForm({ ...form, national_id: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ الميلاد</label>
            <input type="date" value={form.birth_date || ''} onChange={e => setForm({ ...form, birth_date: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الهاتف</label>
            <input type="text" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الحالة</label>
            <select value={form.status || ''} onChange={e => setForm({ ...form, status: e.target.value as ChildStatus })} className="input-field">
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">رقم الجرعة</label>
            <select value={form.dose_number || 1} onChange={e => setForm({ ...form, dose_number: Number(e.target.value) })} className="input-field">
              <option value={1}>الجرعة الأولى</option>
              <option value={2}>الجرعة الثانية</option>
              <option value={3}>الجرعة الثالثة</option>
            </select>
          </div>
          {form.status === 'تم التطعيم فى وحدة بتاريخ' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ التطعيم</label>
              <input type="date" value={form.vaccination_date || ''} onChange={e => setForm({ ...form, vaccination_date: e.target.value })} className="input-field" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ملاحظات</label>
            <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} className="input-field" rows={3} />
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-slate-200 flex-shrink-0">
          <button onClick={handleSave} className="btn-primary flex items-center gap-2">
            <Save className="w-5 h-5" />
            حفظ
          </button>
          <button onClick={onClose} className="btn-secondary">إلغاء</button>
        </div>
      </div>
    </div>
  );
}
