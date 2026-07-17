import { useState, useEffect, useMemo } from 'react';
import { Users, CheckCircle, Clock, TrendingUp, XCircle, Plane, Heart } from 'lucide-react';
import KPICard from '../components/KPICard';
import ChildrenTable from '../components/ChildrenTable';
import SearchFilter from '../components/SearchFilter';
import EditChildModal from '../components/EditChildModal';
import ChildProfileModal from '../components/ChildProfileModal';
import { DelayedChild, KPIs, Unit } from '../types';
import { fetchChildren, updateChild, calculateKPIs } from '../api/data';
import { useAuth } from '../auth/AuthContext';

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
  const [kpis, setKPIs] = useState<KPIs>({ total:0, vaccinated:0, notVaccinated:0, refused:0, traveling:0, documentedTravel:0, sick:0, transferred:0, deceased:0, phoneUnavailable:0, phoneWrong:0, completion:0 });
  const [unit, setUnit] = useState<Unit | null>(null);
  const unitId = user?.unit_id;

  useEffect(() => { loadData(); }, [unitId]);
  const loadData = async () => { if (!unitId) return; try { setLoading(true); const c = await fetchChildren(unitId); setChildren(c); setKPIs(calculateKPIs(c)); if (c.length>0 && c[0].unit) setUnit(c[0].unit); } catch (e) { console.error(e); } finally { setLoading(false); } };
  const handleSaveChild = async (id: string, updates: Partial<DelayedChild>) => { await updateChild(id, updates, user?.id); await loadData(); };

  const filteredChildren = useMemo(() => children.filter((c) => { const ms = !statusFilter || c.status === statusFilter; const md = !doseFilter || c.dose === doseFilter; const q = searchQuery.trim().toLowerCase(); const mq = !q || c.child_name?.toLowerCase().includes(q) || c.mother_name?.toLowerCase().includes(q) || c.phone_number?.includes(q) || c.reporter_phone?.includes(q) || c.registration_number?.toString().includes(q) || c.address?.toLowerCase().includes(q) || c.dose?.toLowerCase().includes(q); return ms && md && mq; }), [children, searchQuery, statusFilter, doseFilter]);
  const availableDoses = useMemo(() => { const d = new Set<string>(); children.forEach((c) => { if (c.dose) d.add(c.dose); }); return Array.from(d).sort(); }, [children]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">لوحة تحكم الوحدة - {unit?.unit_name || user?.unit_name || ''}</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4"><KPICard title="إجمالي الأطفال" value={kpis.total} color="blue" icon={<Users className="w-5 h-5" />} /><KPICard title="تم التطعيم" value={kpis.vaccinated} color="emerald" icon={<CheckCircle className="w-5 h-5" />} /><KPICard title="لم يتم التطعيم" value={kpis.notVaccinated} color="orange" icon={<Clock className="w-5 h-5" />} /><KPICard title="رفض" value={kpis.refused} color="red" icon={<XCircle className="w-5 h-5" />} /><KPICard title="مسافر" value={kpis.traveling} color="blue" icon={<Plane className="w-5 h-5" />} /><KPICard title="مريض" value={kpis.sick} color="yellow" icon={<Heart className="w-5 h-5" />} /><KPICard title="نسبة الإنجاز" value={kpis.completion} suffix="%" color="emerald" icon={<TrendingUp className="w-5 h-5" />} /></div>
      <div className="space-y-4"><h2 className="text-xl font-bold text-gray-900 dark:text-white">قائمة الأطفال المتخلفين</h2><SearchFilter searchQuery={searchQuery} onSearchChange={setSearchQuery} statusFilter={statusFilter} onStatusChange={setStatusFilter} doseFilter={doseFilter} onDoseChange={setDoseFilter} doses={availableDoses} /><ChildrenTable children={filteredChildren} loading={loading} onEdit={setEditingChild} onView={(c)=>{setSelectedChild(c);setProfileOpen(true);}} /></div>
      <EditChildModal child={editingChild} isOpen={!!editingChild} onClose={()=>setEditingChild(null)} onSave={handleSaveChild} />
      <ChildProfileModal child={selectedChild} isOpen={profileOpen} onClose={()=>setProfileOpen(false)} />
    </div>
  );
}
