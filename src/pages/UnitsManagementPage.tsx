import { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, Edit2, X, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Unit } from '../types';

export default function UnitsManagementPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [unitName, setUnitName] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadUnits(); }, []);

  const loadUnits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('units').select('*').order('unit_name');
      if (error) throw error;
      setUnits(data || []);
    } catch (err) {
      console.error('Error loading units:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (unit?: Unit) => {
    if (unit) {
      setEditingUnit(unit);
      setUnitName(unit.unit_name);
      setUnitCode(unit.unit_code?.toString() || '');
    } else {
      setEditingUnit(null);
      setUnitName('');
      setUnitCode('');
    }
    setError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUnit(null);
    setUnitName('');
    setUnitCode('');
    setError('');
  };

  const handleSave = async () => {
    if (!unitName.trim()) {
      setError('اسم الوحدة مطلوب');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingUnit) {
        const { error } = await supabase
          .from('units')
          .update({ unit_name: unitName.trim(), unit_code: unitCode ? parseInt(unitCode) : null })
          .eq('id', editingUnit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('units')
          .insert({ unit_name: unitName.trim(), unit_code: unitCode ? parseInt(unitCode) : null });
        if (error) throw error;
      }
      await loadUnits();
      handleCloseModal();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (unit: Unit) => {
    if (!confirm(`هل أنت متأكد من حذف الوحدة "${unit.unit_name}"؟\n\nسيتم حذف جميع الأطفال المرتبطين بهذه الوحدة.`)) return;
    try {
      const { error } = await supabase.from('units').delete().eq('id', unit.id);
      if (error) throw error;
      await loadUnits();
    } catch (err: any) {
      alert('حدث خطأ أثناء الحذف: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الوحدات الصحية</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          إضافة وحدة
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">#</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">اسم الوحدة</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">كود الوحدة</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">تاريخ الإنشاء</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {units.map((unit, index) => (
                <tr key={unit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      {unit.unit_name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{unit.unit_code || '-'}</td>
                  <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                    {unit.created_at ? new Date(unit.created_at).toLocaleDateString('ar-EG') : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleOpenModal(unit)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="تعديل">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(unit)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="حذف">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {units.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد وحدات</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">{editingUnit ? 'تعديل الوحدة' : 'إضافة وحدة جديدة'}</h2>
              <button onClick={handleCloseModal} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اسم الوحدة <span className="text-red-500">*</span></label>
                <input type="text" value={unitName} onChange={(e) => setUnitName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="أدخل اسم الوحدة" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">كود الوحدة (اختياري)</label>
                <input type="number" value={unitCode} onChange={(e) => setUnitCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="أدخل كود الوحدة" />
              </div>
            </div>
            <div className="px-6 py-4 border-t dark:border-gray-700 flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50">
                {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-5 h-5" /><span>حفظ</span></>}
              </button>
              <button onClick={handleCloseModal}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
