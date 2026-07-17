import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { fetchChildrenByUnit, updateChild, deleteChild, calculateKPIs } from '../api/data';
import type { Child, KPIs } from '../types';
import ChildrenTable from '../components/ChildrenTable';
import EditChildModal from '../components/EditChildModal';
import { LogOut, Users, Syringe, AlertCircle, BarChart3, Plus, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function UnitDashboard() {
  const { user, logout } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [editChild, setEditChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user?.unit_id) return;
    setLoading(true);
    try {
      const c = await fetchChildrenByUnit(user.unit_id);
      setChildren(c);
      const k = await calculateKPIs(c);
      setKpis(k);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [user?.unit_id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleEditSave = async (id: string, updates: Partial<Child>) => {
    await updateChild(id, updates);
    setEditChild(null);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
    await deleteChild(id);
    loadData();
  };

  const handleExport = () => {
    const data = children.map(c => ({
      'الاسم': c.name,
      'الرقم القومي': c.national_id,
      'تاريخ الميلاد': c.birth_date,
      'الهاتف': c.phone,
      'الحالة': c.status,
      'الجرعة': c.dose_number,
      'تاريخ التطعيم': c.vaccination_date || '',
      'ملاحظات': c.notes || '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!autofilter'] = { ref: ws['!ref'] || 'A1' };
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'البيانات');
    XLSX.writeFile(wb, `بيانات_${user?.unit_name || 'الوحدة'}.xlsx`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-slate-400">جاري التحميل...</div></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                <Syringe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">وحدة {user?.unit_name}</h1>
                <p className="text-xs text-slate-500">مستخدم وحدة</p>
              </div>
            </div>
            <button onClick={logout} className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-slate-100">
              <LogOut className="w-5 h-5" />
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {kpis && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-slate-500">إجمالي الأطفال</p><p className="text-2xl font-bold text-slate-800 mt-1">{kpis.total_children}</p></div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center"><Users className="w-6 h-6 text-blue-600" /></div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-slate-500">تم التطعيم</p><p className="text-2xl font-bold text-green-600 mt-1">{kpis.vaccinated}</p></div>
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center"><Syringe className="w-6 h-6 text-green-600" /></div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-slate-500">لم يتم التطعيم</p><p className="text-2xl font-bold text-red-600 mt-1">{kpis.not_vaccinated}</p></div>
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center"><AlertCircle className="w-6 h-6 text-red-600" /></div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-slate-500">نسبة التطعيم</p><p className="text-2xl font-bold text-teal-600 mt-1">{kpis.vaccination_rate}%</p></div>
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center"><BarChart3 className="w-6 h-6 text-teal-600" /></div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">بيانات الأطفال</h2>
            <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
              <Download className="w-4 h-4" />
              تصدير Excel
            </button>
          </div>
          <ChildrenTable children={children} onEdit={setEditChild} onDelete={handleDelete} />
        </div>
      </main>

      {editChild && <EditChildModal child={editChild} onClose={() => setEditChild(null)} onSave={handleEditSave} />}
    </div>
  );
}
