import { useState } from 'react';
import type { Unit } from '../types';
import { Plus, Edit2, Trash2, X, Save, Building2 } from 'lucide-react';

interface Props {
  units: Unit[];
  onRefresh: () => void;
  onAddUnit: (name: string, password: string) => Promise<Unit>;
  onUpdateUnit: (id: string, updates: Partial<Unit>) => Promise<Unit>;
  onDeleteUnit: (id: string) => Promise<void>;
}

export default function UnitsManagementPage({ units, onRefresh, onAddUnit, onUpdateUnit, onDeleteUnit }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('2468');
  const [editUnit, setEditUnit] = useState<Unit | null>(null);
  const [editName, setEditName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try { await onAddUnit(newName.trim(), newPassword); setNewName(''); setNewPassword('2468'); setShowAdd(false); onRefresh(); }
    catch { alert('خطأ في إضافة الوحدة'); }
    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!editUnit || !editName.trim()) return;
    setLoading(true);
    try {
      const updates: Partial<Unit> = { unit_name: editName.trim(), password: editPassword };
      await onUpdateUnit(editUnit.id, updates);
      setEditUnit(null); onRefresh();
    } catch { alert('خطأ في تعديل الوحدة'); }
    setLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف وحدة "${name}"؟`)) return;
    try { await onDeleteUnit(id); onRefresh(); }
    catch { alert('خطأ في حذف الوحدة'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          إدارة الوحدات ({units.length})
        </h2>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          إضافة وحدة
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-right font-medium">#</th>
              <th className="px-4 py-3 text-right font-medium">اسم الوحدة</th>
              <th className="px-4 py-3 text-right font-medium">كلمة المرور</th>
              <th className="px-4 py-3 text-center font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {units.map((u, idx) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{u.unit_name}</td>
                <td className="px-4 py-3 text-slate-600">{u.password || '2468'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => { setEditUnit(u); setEditName(u.unit_name); setEditPassword(u.password || '2468'); }}
                      className="text-teal-600 hover:text-teal-700 p-1.5 rounded-lg hover:bg-teal-50">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(u.id, u.unit_name)}
                      className="text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">إضافة وحدة جديدة</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">اسم الوحدة</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="input-field" placeholder="اسم الوحدة الصحية" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور</label>
                <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field" />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-200">
              <button onClick={handleAdd} disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                <Save className="w-4 h-4" />
                {loading ? 'جاري الحفظ...' : 'حفظ'}
              </button>
              <button onClick={() => setShowAdd(false)} className="btn-secondary">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {editUnit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">تعديل الوحدة</h2>
              <button onClick={() => setEditUnit(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">اسم الوحدة</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور</label>
                <input type="text" value={editPassword} onChange={e => setEditPassword(e.target.value)} className="input-field" />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-200">
              <button onClick={handleUpdate} disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                <Save className="w-4 h-4" />
                {loading ? 'جاري الحفظ...' : 'حفظ'}
              </button>
              <button onClick={() => setEditUnit(null)} className="btn-secondary">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
