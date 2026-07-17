import { useState, useEffect, useMemo } from 'react';
import { BarChart3, TrendingUp, Award, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DelayedChild, Unit, UnitStats, STATUS_OPTIONS, STATUS_CONFIG } from '../types';
import { fetchChildren, fetchUnits, calculateUnitStats } from '../api/data';

export default function AnalyticsPage() {
  const [children, setChildren] = useState<DelayedChild[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [unitStats, setUnitStats] = useState<UnitStats[]>([]);

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { try { setLoading(true); const [c, u] = await Promise.all([fetchChildren(), fetchUnits()]); setChildren(c); setUnits(u); setUnitStats(calculateUnitStats(c, u)); } catch (e) { console.error(e); } finally { setLoading(false); } };

  const statusDistribution = useMemo(() => STATUS_OPTIONS.map((s) => ({ name: STATUS_CONFIG[s].label, value: children.filter(c => c.status === s).length })).filter(d => d.value > 0), [children]);
  const doseDistribution = useMemo(() => { const m = new Map<string, number>(); children.forEach((c) => { if (c.dose) m.set(c.dose, (m.get(c.dose)||0)+1); }); return Array.from(m.entries()).map(([name, value]) => ({ name, value })).sort((a,b) => b.value-a.value); }, [children]);
  const topUnits = useMemo(() => unitStats.sort((a,b) => b.completion-a.completion).slice(0,10), [unitStats]);
  const lowUnits = useMemo(() => unitStats.filter(u => u.completion<50 && u.total>0), [unitStats]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">التحليلات والإحصائيات</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6"><h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-emerald-600" />أداء الوحدات (أعلى 10)</h3><div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={topUnits.map(u => ({ name: u.unit_name.length>12?u.unit_name.substring(0,12)+'...':u.unit_name, 'تم التطعيم':u.vaccinated, 'المتبقي':u.remaining }))} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#374151" /><XAxis type="number" stroke="#9ca3af" /><YAxis type="category" dataKey="name" width={90} tick={{fontSize:10,fill:'#9ca3af'}} /><Tooltip contentStyle={{backgroundColor:'#1f2937',border:'none',borderRadius:'8px'}} /><Legend /><Bar dataKey="تم التطعيم" stackId="a" fill="#059669" /><Bar dataKey="المتبقي" stackId="a" fill="#f59e0b" /></BarChart></ResponsiveContainer></div></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6"><h3 className="font-semibold text-gray-900 dark:text-white mb-4">توزيع الحالات</h3><div className="h-72 flex items-center justify-center"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={70} outerRadius={100} dataKey="value" label={({name,percent})=>`${name} (${((percent||0)*100).toFixed(0)}%)`}>{statusDistribution.map((_,i) => <Cell key={i} fill={['#059669','#f59e0b','#ef4444','#3b82f6','#eab308','#8b5cf6','#14b8a6','#6b7280'][i%8]} />)}</Pie><Tooltip contentStyle={{backgroundColor:'#1f2937',border:'none',borderRadius:'8px'}} /></PieChart></ResponsiveContainer></div></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6"><h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-600" />توزيع الجرعات</h3><div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={doseDistribution}><CartesianGrid strokeDasharray="3 3" stroke="#374151" /><XAxis dataKey="name" stroke="#9ca3af" tick={{fontSize:10,fill:'#9ca3af'}} angle={-20} textAnchor="end" height={60} /><YAxis stroke="#9ca3af" /><Tooltip contentStyle={{backgroundColor:'#1f2937',border:'none',borderRadius:'8px'}} /><Bar dataKey="value" fill="#3b82f6" name="عدد الأطفال" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6"><h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-amber-600" />ترتيب الوحدات حسب الإنجاز</h3><div className="space-y-2 max-h-72 overflow-y-auto">{unitStats.sort((a,b) => b.completion-a.completion).map((s,i) => <div key={s.unit_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"><span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i===0?'bg-amber-100 text-amber-700':i===1?'bg-gray-200 text-gray-700':i===2?'bg-orange-100 text-orange-700':'bg-gray-100 text-gray-500'}`}>{i+1}</span><div className="flex-1"><p className="text-sm font-medium text-gray-900 dark:text-white truncate">{s.unit_name}</p><div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mt-1"><div className={`h-full rounded-full ${s.completion>=70?'bg-emerald-500':s.completion>=40?'bg-orange-500':'bg-red-500'}`} style={{width:`${s.completion}%`}} /></div></div><span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{s.completion}%</span></div>)}</div></div>
      </div>
      {lowUnits.length>0 && <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3"><AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" /><div><h3 className="font-semibold text-red-800 dark:text-red-300">وحدات تحتاج متابعة عاجلة</h3><p className="text-sm text-red-700 dark:text-red-400 mt-1">{lowUnits.map(u=>u.unit_name).join('، ')} - نسبة إنجاز أقل من 50%</p></div></div>}
    </div>
  );
}
