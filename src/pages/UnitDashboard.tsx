import { useState, useEffect, useMemo } from 'react';
import { Users, CheckCircle, Clock, TrendingUp, Download, XCircle, Plane, Heart } from 'lucide-react';
import KPICard from '../components/KPICard';
import ChildrenTable from '../components/ChildrenTable';
import SearchFilter from '../components/SearchFilter';
import EditChildModal from '../components/EditChildModal';
import ChildProfileModal from '../components/ChildProfileModal';
import { DelayedChild, KPIs } from '../types';
import { useAuth } from '../auth/AuthContext';
import { fetchChildren, updateChild, calculateKPIs } from '../api/data';
import * as XLSX from 'xlsx';

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

function getStatusDetails(child: DelayedChild): string {
  switch (child.status) {
    case 'تم التطعيم فى وحدة بتاريخ': return `${child.vaccination_place || ''} ${formatDate(child.vaccination_date)}`.trim();
    case 'مسافر': case 'مسافر موثق': return `${child.travel_country || ''} ${formatDate(child.travel_date)}`.trim();
    case 'مريض': return child.disease_name || '';
    case 'رفض': return child.refusal_reason || '';
    case 'تم التحويل الى اقرب وحدة': return child.transfer_destination || '';
    case 'متوفى': return formatDate(child.death_date);
    default: return '';
  }
}

export default function UnitDashboard() {
  const { user } = useAuth();
  const [children, setChildren] = useState<DelayedChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [doseFilter, setDoseFilter] = useState('');
  const [editingChild, setEditingChild] = useState<DelayedChild | null>(null);
  const [selectedChild, setSelectedChild] = useState<DelayedChild | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [kpis, setKPIs] = useState<KPIs>({
    total: 0, vaccinated: 0, notVaccinated: 0, refused: 0, traveling: 0,
    documentedTravel: 0, sick: 0, transferred: 0, deceased: 0,
    phoneUnavailable: 0, phoneWrong: 0, completion: 0,
  });

  useEffect(() => { loadData(); }, [user?.unit_id]);

  const loadData = async () => {
    if (!user?.unit_id) return;
    try {
      setLoading(true);
      const data = await fetchChildren(user.unit_id);
      setChildren(data);
      setKPIs(calculateKPIs(data));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChild = async (id: string, updates: Partial<DelayedChild>) => {
    await updateChild(id, updates, user?.id);
    await loadData();
  };

  const filteredChildren = useMemo(() => {
    return children.filter((child) => {
      const matchesStatus = !statusFilter || child.status === statusFilter;
      const matchesDose = !doseFilter || child.dose === doseFilter;
      const matchesSearch = !searchQuery ||
        child.child_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (child.mother_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (child.phone_number?.includes(searchQuery));
      return matchesStatus && matchesDose && matchesSearch;
    });
  }, [children, searchQuery, statusFilter, doseFilter]);

  const availableDoses = useMemo(() => {
    const doses = new Set<string>();
    children.forEach((c) => { if (c.dose) doses.add(c.dose); });
    return Array.from(doses).sort();
  }, [children]);

  const handleExport = () => {
    const exportData = filteredChildren.map((child) => ({
      'اسم الطفل': child.child_name, 'اسم الأم': child.mother_name || '', 'رقم القيد': child.registration_number || '',
      'تاريخ الميلاد': formatDate(child.birth_date), 'العمر': child.age ? `${child.age} سنة` : '', 'العنوان': child.address || '',
      'رقم هاتف الطفل': child.phone_number || '', 'رقم هاتف المُبلغ': child.reporter_phone || '',
      'التطعيم المتخلف': child.dose || '', 'آخر تطعيم': child.last_vaccine || '',
      'الحالة': child.status, 'تفاصيل الحالة': getStatusDetails(child),
      'تاريخ التطعيم': formatDate(child.vaccination_date), 'مكان التطعيم': child.vaccination_place || '',
      'الدولة (للمسافر)': child.travel_country || '', 'تاريخ السفر': formatDate(child.travel_date),
      'اسم المرض': child.disease_name || '', 'سبب الرفض': child.refusal_reason || '',
      'جهة التحويل': child.transfer_destination || '', 'تاريخ الوفاة': formatDate(child.death_date),
      'آخر متابعة': formatDate(child.last_follow_up), 'ملاحظات المتابعة': child.follow_up_notes || '',
      'تاريخ آخر تعديل': formatDate(child.updated_at),
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = Array.from({ length: 23 }, () => ({ wch: 20 }));
    ws['!autofilter'] = { ref: ws['!ref'] || 'A1' };
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الأطفال المتخلفين');
    XLSX.writeFile(wb, `تقرير_الأطفال_المتخلفين_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">لوحة تحكم الوحدة</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{user?.unit_name}</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
          <Download className="w-5 h-5" />تصدير التقرير
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <KPICard title="إجمالي الأطفال" value={kpis.total} color="blue" icon={<Users className="w-5 h-5" />} />
        <KPICard title="تم التطعيم" value={kpis.vaccinated} color="emerald" icon={<CheckCircle className="w-5 h-5" />} />
        <KPICard title="لم يتم التطعيم" value={kpis.notVaccinated} color="orange" icon={<Clock className="w-5 h-5" />} />
        <KPICard title="رفض" value={kpis.refused} color="red" icon={<XCircle className="w-5 h-5" />} />
        <KPICard title="مسافر" value={kpis.traveling} color="blue" icon={<Plane className="w-5 h-5" />} />
        <KPICard title="مريض" value={kpis.sick} color="yellow" icon={<Heart className="w-5 h-5" />} />
        <KPICard title="نسبة الإنجاز" value={kpis.completion} suffix="٪" color={kpis.completion >= 70 ? 'emerald' : kpis.completion >= 40 ? 'orange' : 'red'} icon={<TrendingUp className="w-5 h-5" />} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard title="مسافر موثق" value={kpis.documentedTravel} color="purple" icon={<Plane className="w-5 h-5" />} />
        <KPICard title="محول" value={kpis.transferred} color="teal" icon={<TrendingUp className="w-5 h-5" />} />
        <KPICard title="متوفى" value={kpis.deceased} color="gray" icon={<XCircle className="w-5 h-5" />} />
        <KPICard title="الهاتف غير متاح" value={kpis.phoneUnavailable} color="gray" icon={<Clock className="w-5 h-5" />} />
      </div>
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">قائمة الأطفال المتخلفين</h2>
        <SearchFilter
          searchQuery={searchQuery} onSearchChange={setSearchQuery}
          statusFilter={statusFilter} onStatusChange={setStatusFilter}
          doseFilter={doseFilter} onDoseChange={setDoseFilter} doses={availableDoses}
        />
        <ChildrenTable
          children={filteredChildren} loading={loading}
          onEdit={setEditingChild}
          onView={(child) => { setSelectedChild(child); setProfileOpen(true); }}
        />
      </div>
      <EditChildModal child={editingChild} isOpen={!!editingChild} onClose={() => setEditingChild(null)} onSave={handleSaveChild} />
      <ChildProfileModal child={selectedChild} isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}
