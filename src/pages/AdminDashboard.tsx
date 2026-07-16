import { useState, useEffect, useMemo } from 'react';
import { Users, CheckCircle, Clock, TrendingUp, Download, AlertTriangle, BarChart3, XCircle, Plane, Heart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import KPICard from '../components/KPICard';
import ChildrenTable from '../components/ChildrenTable';
import SearchFilter from '../components/SearchFilter';
import EditChildModal from '../components/EditChildModal';
import ChildProfileModal from '../components/ChildProfileModal';
import { DelayedChild, UnitStats, KPIs, Unit } from '../types';
import {
  fetchChildren,
  fetchUnits,
  updateChild,
  deleteChild,
  calculateKPIs,
  calculateUnitStats,
} from '../api/data';
import * as XLSX from 'xlsx';

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function getStatusDetails(child: DelayedChild): string {
  switch (child.status) {
    case 'تم التطعيم فى وحدة بتاريخ':
      return `${child.vaccination_place || ''} ${formatDate(child.vaccination_date)}`.trim();
    case 'مسافر':
    case 'مسافر موثق':
      return `${child.travel_country || ''} ${formatDate(child.travel_date)}`.trim();
    case 'مريض':
      return child.disease_name || '';
    case 'رفض':
      return child.refusal_reason || '';
    case 'تم التحويل الى اقرب وحدة':
      return child.transfer_destination || '';
    case 'متوفى':
      return formatDate(child.death_date);
    default:
      return '';
  }
}

export default function AdminDashboard() {
  const [children, setChildren] = useState<DelayedChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [unitFilter, setUnitFilter] = useState('');
  const [doseFilter, setDoseFilter] = useState('');
  const [editingChild, setEditingChild] = useState<DelayedChild | null>(null);
  const [selectedChild, setSelectedChild] = useState<DelayedChild | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [kpis, setKPIs] = useState<KPIs>({
    total: 0, vaccinated: 0, notVaccinated: 0, refused: 0, traveling: 0,
    documentedTravel: 0, sick: 0, transferred: 0, deceased: 0,
    phoneUnavailable: 0, phoneWrong: 0, completion: 0,
  });
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitStats, setUnitStats] = useState<UnitStats[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [childrenData, unitsData] = await Promise.all([fetchChildren(), fetchUnits()]);
      setChildren(childrenData);
      setUnits(unitsData);
      setKPIs(calculateKPIs(childrenData));
      setUnitStats(calculateUnitStats(childrenData, unitsData));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChild = async (id: string, updates: Partial<DelayedChild>) => {
    await updateChild(id, updates);
    await loadData();
  };

  const handleDeleteChild = async (child: DelayedChild) => {
    if (!confirm(`هل أنت متأكد من حذف الطفل "${child.child_name}"؟`)) return;
    try {
      await deleteChild(child.id);
      await loadData();
    } catch (error) {
      console.error('Error deleting child:', error);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const filteredChildren = useMemo(() => {
    return children.filter((child) => {
      const matchesStatus = !statusFilter || child.status === statusFilter;
      const matchesUnit = !unitFilter || child.unit?.unit_name === unitFilter;
      const matchesDose = !doseFilter || child.dose === doseFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        child.child_name?.toLowerCase().includes(q) ||
        child.mother_name?.toLowerCase().includes(q) ||
        child.phone_number?.includes(q) ||
        child.reporter_phone?.includes(q) ||
        child.registration_number?.toString().includes(q) ||
        child.address?.toLowerCase().includes(q) ||
        child.dose?.toLowerCase().includes(q) ||
        child.unit?.unit_name?.toLowerCase().includes(q);
      return matchesStatus && matchesUnit && matchesDose && matchesSearch;
    });
  }, [children, searchQuery, statusFilter, unitFilter, doseFilter]);

  const availableDoses = useMemo(() => {
    const doses = new Set<string>();
    children.forEach((c) => { if (c.dose) doses.add(c.dose); });
    return Array.from(doses).sort();
  }, [children]);

  const handleExport = () => {
    const exportData = filteredChildren.map((child) => ({
      'الوحدة': child.unit?.unit_name || '',
      'اسم الطفل': child.child_name,
      'اسم الأم': child.mother_name || '',
      'رقم القيد': child.registration_number || '',
      'تاريخ الميلاد': formatDate(child.birth_date),
      'العمر': child.age ? `${child.age} سنة` : '',
      'العنوان': child.address || '',
      'رقم هاتف الطفل': child.phone_number || '',
      'رقم هاتف المُبلغ': child.reporter_phone || '',
      'التطعيم المتخلف': child.dose || '',
      'آخر تطعيم': child.last_vaccine || '',
      'الحالة': child.status,
      'تفاصيل الحالة': getStatusDetails(child),
      'تاريخ التطعيم': formatDate(child.vaccination_date),
      'مكان التطعيم': child.vaccination_place || '',
      'الدولة (للمسافر)': child.travel_country || '',
      'تاريخ السفر': formatDate(child.travel_date),
      'اسم المرض': child.disease_name || '',
      'سبب الرفض': child.refusal_reason || '',
      'جهة التحويل': child.transfer_destination || '',
      'تاريخ الوفاة': formatDate(child.death_date),
      'آخر متابعة': formatDate(child.last_follow_up),
      'ملاحظات المتابعة': child.follow_up_notes || '',
      'تاريخ آخر تعديل': formatDate(child.updated_at),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const colWidths = [
      { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 },
      { wch: 10 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
      { wch: 20 }, { wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 20 },
      { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 20 },
      { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 15 },
    ];
    ws['!cols'] = colWidths;

    const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'C6EFCE' } },
          alignment: { horizontal: 'center', vertical: 'center' },
        };
      }
    }
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };
    ws['!autofilter'] = { ref: ws['!ref'] || 'A1' };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الأطفال المتخلفين');
    XLSX.writeFile(wb, `تقرير_الأطفال_المتخلفين_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const chartData = unitStats.slice(0, 10).map((stat) => ({
    name: stat.unit_name.length > 10 ? stat.unit_name.substring(0, 10) + '...' : stat.unit_name,
    total: stat.total,
    vaccinated: stat.vaccinated,
    remaining: stat.remaining,
  }));

  const statusPieData = [
    { name: 'تم التطعيم', value: kpis.vaccinated, color: '#059669' },
    { name: 'لم يتم التطعيم', value: kpis.notVaccinated, color: '#f59e0b' },
    { name: 'رفض', value: kpis.refused, color: '#ef4444' },
    { name: 'مسافر', value: kpis.traveling, color: '#3b82f6' },
    { name: 'مريض', value: kpis.sick, color: '#eab308' },
  ].filter((d) => d.value > 0);

  const lowPerformingUnits = unitStats.filter((u) => u.completion < 50 && u.total > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">لوحة تحكم المدير</h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Download className="w-5 h-5" />
          تصدير التقرير
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
        <KPICard title="إجمالي الأطفال" value={kpis.total} color="blue" icon={<Users className="w-5 h-5" />} />
        <KPICard title="تم التطعيم" value={kpis.vaccinated} color="emerald" icon={<CheckCircle className="w-5 h-5" />} />
        <KPICard title="لم يتم التطعيم" value={kpis.notVaccinated} color="orange" icon={<Clock className="w-5 h-5" />} />
        <KPICard title="رفض" value={kpis.refused} color="red" icon={<XCircle className="w-5 h-5" />} />
        <KPICard title="مسافر" value={kpis.traveling} color="blue" icon={<Plane className="w-5 h-5" />} />
        <KPICard title="مريض" value={kpis.sick} color="yellow" icon={<Heart className="w-5 h-5" />} />
        <KPICard title="نسبة الإنجاز" value={kpis.completion} suffix="٪" color="emerald" icon={<TrendingUp className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="مسافر موثق" value={kpis.documentedTravel} color="purple" icon={<Plane className="w-5 h-5" />} />
        <KPICard title="محول" value={kpis.transferred} color="teal" icon={<TrendingUp className="w-5 h-5" />} />
        <KPICard title="متوفى" value={kpis.deceased} color="gray" icon={<XCircle className="w-5 h-5" />} />
        <KPICard title="الهاتف غير متاح" value={kpis.phoneUnavailable} color="gray" icon={<Clock className="w-5 h-5" />} />
      </div>

      {lowPerformingUnits.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-300">وحدات تحتاج متابعة عاجلة</h3>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
              {lowPerformingUnits.map((u) => u.unit_name).join('، ')} - نسبة إنجاز أقل من 50٪
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            إحصائيات الوحدات (أعلى 10)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="vaccinated" stackId="a" fill="#059669" name="تم التطعيم" />
                <Bar dataKey="remaining" stackId="a" fill="#f59e0b" name="المتبقي" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">توزيع الحالات</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}٪)`}>
                  {statusPieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {unitStats.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">إحصائيات جميع الوحدات</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">الوحدة</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">إجمالي المتخلفين</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">تم التطعيم</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">المتبقي</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">نسبة الإنجاز</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {unitStats.map((stat) => (
                  <tr key={stat.unit_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{stat.unit_name}</td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{stat.total}</td>
                    <td className="px-4 py-3 text-center"><span className="text-emerald-600 font-medium">{stat.vaccinated}</span></td>
                    <td className="px-4 py-3 text-center"><span className="text-orange-600 font-medium">{stat.remaining}</span></td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${stat.completion >= 70 ? 'bg-emerald-500' : stat.completion >= 40 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${stat.completion}%` }} />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stat.completion}٪</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">قائمة الأطفال المتخلفين</h2>
        <SearchFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          unitFilter={unitFilter}
          onUnitChange={setUnitFilter}
          units={units.map((u) => u.unit_name)}
          doseFilter={doseFilter}
          onDoseChange={setDoseFilter}
          doses={availableDoses}
        />
        <ChildrenTable
          children={filteredChildren}
          loading={loading}
          showUnit
          onEdit={setEditingChild}
          onView={(child) => { setSelectedChild(child); setProfileOpen(true); }}
          onDelete={handleDeleteChild}
        />
      </div>

      <EditChildModal child={editingChild} isOpen={!!editingChild} onClose={() => setEditingChild(null)} onSave={handleSaveChild} />
      <ChildProfileModal child={selectedChild} isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}
