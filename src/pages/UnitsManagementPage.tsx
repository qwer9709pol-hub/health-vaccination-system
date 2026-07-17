import { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, X, Save, Loader2, KeyRound } from 'lucide-react';
import { Unit } from '../types';
import { fetchUnits } from '../api/data';
import { supabase } from '../lib/supabase';

export default function UnitsManagementPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [unitName, setUnitName] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadUnits(); }, []);
  const loadUnits = async () => { try { setLoading(true); setUnits(await fetchUnits()); } catch (e) { console.error(e); } finally { setLoading(false); } };
  const handleOpenAdd = () => { setEditingUnit(null); setUnitName(''); setUnitCode(''); setPassword(''); setError(''); setModalOpen(true); };
  const handleOpenEdit = (u: Unit) => { setEditingUnit(u); setUnitName(u.unit_name); setUnitCode(String(u.unit_code||'')); setPassword(''); setError(''); setModalOpen(true); };

  const handleSave = async () => {
    if (!unitName.trim()) { setError('من فضلك أدخل اسم الوحدة'); return; }
    setSaving(true); setError('');
    try {
      if (editingUnit) { const updates: Record<string, unknown> = { unit_name: unitName.trim() }; if (unitCode) updates.unit_code = parseInt(unitCode); if (password) updates.password = password; const { error } = await supabase.from('units').update(updates).eq('id', editingUnit.id); if (error) throw error; }
      else { const n: Record<string, unknown> = { unit_name: unitName.trim(), password: password || '2468' }; if (unitCode) n.unit_code = parseInt(unitCode); const { error } = await supabase.from('units').insert([n]); if (error) throw error; }
      setModalOpen(false); await loadUnits();
    } catch (e: any) { setError(e.message||'حدث خطأ'); } finally { setSaving(false); }
  };

  const handleDelete = async (u: Unit) => { if (!confirm(`حذف الوحدة "${u.unit_name}"؟ سيتم حذف جميع الأطفال المرتبطين.`)) return; try { const { error: ce } = await supabase.from('delayed_children').delete().eq('unit_id', u.id); if (ce) throw ce; const { error: ue } = await supabase.from('units').delete().eq('id', u.id); if (ue) throw ue; await loadUnits(); } catch (e: any) { alert(e.message||'حدث خطأ'); } };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الوحدات</h1><button onClick={handleOpenAdd} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"><Plus className="w-5 h-5" />إضافة وحدة</button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{units.map(u => <div key={u.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 transition-colors"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg"><Building2 className="w-6 h-6 text-emerald-600" /></div><div><h3 className="font-semibold text-gray-900 dark:text-white">{u.unit_name}</h3>{u.unit_code && <p className="text-sm text-gray-500 dark:text-gray-400">كود: {u.unit_code}</p>}</div></div><div className="flex gap-1"><button onClick={()=>handleOpenEdit(u)} className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button><button onClick={()=>handleDelete(u)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button></div></div></div>)}</div>
      {modalOpen && <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"><div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md" dir="rtl"><div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between rounded-t-2xl"><h2 className="text-xl font-bold text-white">{editingUnit?'تعديل وحدة':'إضافة وحدة جديدة'}</h2><button onClick={()=>setModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors"><X className="w-6 h-6 text-white" /></button></div><div className="p-6 space-y-4">{error && <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">{error}</div>}<div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اسم الوحدة</label><input type="text" value={unitName} onChange={(e)=>setUnitName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" placeholder="اسم الوحدة الصحية" /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">كود الوحدة (اختياري)</label><input type="number" value={unitCode} onChange={(e)=>setUnitCode(e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" placeholder="123" /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"><KeyRound className="w-4 h-4" />كلمة المرور {editingUnit && '(اتركها فارغة لعدم التغيير)'}</label><input type="text" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" placeholder="كلمة المرور" /></div><button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 shadow-lg">{saving?<Loader2 className="w-5 h-5 animate-spin" />:<><Save className="w-5 h-5" /><span>حفظ</span></>}</button></div></div></div>}
    </div>
  );
}
