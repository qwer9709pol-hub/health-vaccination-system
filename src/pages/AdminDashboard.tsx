import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { fetchChildren, fetchUnits, updateChild, deleteChild, deleteChildrenByFilters, calculateKPIs, calculateUnitStats, addUnit, updateUnit, deleteUnit } from '../api/data';
import type { Child, Unit, KPIs, UnitStats, ChildStatus } from '../types';
import { STATUS_CONFIG } from '../types';
import ChildrenTable from '../components/ChildrenTable';
import EditChildModal from '../components/EditChildModal';
import BulkDeleteModal from '../components/BulkDeleteModal';
import UnitsManagementPage from './UnitsManagementPage';
import { LogOut, Users, Syringe, AlertCircle, BarChart3, Trash2, Building2, Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

type Tab = 'overview' | 'children' | 'units' | 'analytics';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [children, setChildren] = useState<Child[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [unitStats, setUnitStats] = useState<UnitStats[]>([]);
  const [editChild, setEditChild] = useState<Child | null>(null);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [c, u] = await Promise.all([fetchChildren(), fetchUnits()]);
      setChildren(c);
      setUnits(u);
      const k = await calculateKPIs(c);
      setKpis(k);
      const us = await calculateUnitStats(c, u);
      setUnitStats(us);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

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

  const handleBulkDelete = async (filters: { unit_id?: string; status?: ChildStatus; dose_number?: number }) => {
    const count = await deleteChildrenByFilters(filters);
    loadData();
    return count;
  };

  const handleExport = () => {
    const data = children.map(c => ({
      'الاسم': c.name,
      'الرقم القومي': c.national_id,
      'تاريخ الميلاد': c.birth_date,
      'الهاتف': c.phone,
      'الوحدة': c.unit_name || units.find(u => u.id === c.unit_id)?.unit_name || '',
      'الحالة': c.status,
      'الجرعة': c.dose_number,
      'تاريخ التطعيم': c.vaccination_date || '',
      'ملاحظات': c.notes || '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!autofilter'] = { ref: ws['!ref'] || 'A1' };
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'البيانات');
    XLSX.writeFile(wb, 'بيانات_التطعيمات.xlsx');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws);
        alert(`تم قراءة ${rows.length} سجل من الملف. استيراد البيانات يتطلب ربط مع الوحدات.`);
      } catch { alert('خطأ في قراءة الملف'); }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
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
                <h1 className="text-lg font-bold text-slate-800">لوحة تحكم الأدمن</h1>
                <p className="text-xs text-slate-500">{user?.username || 'admin'}</p>
              </div>
            </div>
            <button onClick={logout} className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-slate-100">
              <LogOut className="w-5 h-5" />
              خروج
            </button>
          </div>
          <div className="flex gap-1 pb-2 overflow-x-auto">
            {([
              { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
              { id: 'children', label: 'بيانات الأطفال', icon: Users },
              { id: 'units', label: 'الوحدات', icon: Building2 },
              { id: 'analytics', label: 'التحليلات', icon: BarChart3 },
            ] as { id: Tab; label: string; icon: any }[]).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  tab === t.id ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}>
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {tab === 'overview' && kpis && (
          <div className="space-y-6">
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

            <div className="card">
              <h3 className="text-lg font-bold text-slate-800 mb-4">إحصائيات الوحدات</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 text-right font-medium">الوحدة</th>
                      <th className="px-4 py-3 text-right font-medium">الإجمالي</th>
                      <th className="px-4 py-3 text-right font-medium">تم التطعيم</th>
                      <th className="px-4 py-3 text-right font-medium">لم يتم</th>
                      <th className="px-4 py-3 text-right font-medium">متأخر</th>
                      <th className="px-4 py-3 text-right font-medium">النسبة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {unitStats.map(us => (
                      <tr key={us.unit_name} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">{us.unit_name}</td>
                        <td className="px-4 py-3 text-slate-600">{us.total}</td>
                        <td className="px-4 py-3 text-green-600">{us.vaccinated}</td>
                        <td className="px-4 py-3 text-red-600">{us.not_vaccinated}</td>
                        <td className="px-4 py-3 text-amber-600">{us.delayed}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-teal-500 rounded-full" style={{ width: `${us.vaccination_rate}%` }} />
                            </div>
                            <span className="text-slate-600 text-xs">{us.vaccination_rate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'children' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">بيانات الأطفال</h2>
              <div className="flex gap-2">
                <label className="btn-secondary flex items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  استيراد
                  <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
                </label>
                <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  تصدير
                </button>
                <button onClick={() => setShowBulkDelete(true)} className="btn-danger flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  حذف جماعي
                </button>
              </div>
            </div>
            <ChildrenTable children={children} onEdit={setEditChild} onDelete={handleDelete} showUnit />
          </div>
        )}

        {tab === 'units' && (
          <UnitsManagementPage units={units} onRefresh={loadData} onAddUnit={addUnit} onUpdateUnit={updateUnit} onDeleteUnit={deleteUnit} />
        )}

        {tab === 'analytics' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-bold text-slate-800 mb-4">توزيع الحالات</h3>
              <div className="space-y-2">
                {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                  const count = children.filter(c => c.status === status).length;
                  const pct = children.length > 0 ? Math.round((count / children.length) * 100) : 0;
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <span className="text-sm text-slate-600 w-48">{status}</span>
                      <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
                      </div>
                      <span className="text-sm text-slate-600 w-16 text-left">{count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {editChild && <EditChildModal child={editChild} onClose={() => setEditChild(null)} onSave={handleEditSave} />}
      {showBulkDelete && <BulkDeleteModal units={units} onClose={() => setShowBulkDelete(false)} onConfirm={handleBulkDelete} />}
    </div>
  );
}
