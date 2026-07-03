import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Plane,
  Heart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  PhoneOff,
  ArrowUpDown,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  ComposedChart,
  Area,
} from 'recharts';
import { DelayedChild, Unit, KPIs, UnitStats } from '../types';
import { fetchChildren, fetchUnits, calculateUnitStats, calculateKPIs } from '../api/data';
import KPICard from '../components/KPICard';

const STATUS_COLORS: Record<string, string> = {
  'تم التطعيم فى وحدة بتاريخ': '#059669',
  'لم يتم التطعيم': '#f59e0b',
  'رفض': '#ef4444',
  'مسافر': '#3b82f6',
  'مسافر موثق': '#8b5cf6',
  'مريض': '#eab308',
  'متوفى': '#6b7280',
  'تم التحويل الى اقرب وحدة': '#14b8a6',
  'الهاتف غير متاح': '#9ca3af',
  'الهاتف خطأ': '#6b7280',
  'منزل مغلق': '#d97706',
  'غير متاح': '#94a3b8',
};

function getPerformanceRating(completion: number): { label: string; color: string; icon: string } {
  if (completion >= 80) return { label: 'ممتاز', color: 'text-emerald-600', icon: '⭐' };
  if (completion >= 60) return { label: 'جيد جداً', color: 'text-green-600', icon: '✓' };
  if (completion >= 40) return { label: 'جيد', color: 'text-yellow-600', icon: '○' };
  if (completion >= 20) return { label: 'ضعيف', color: 'text-orange-600', icon: '△' };
  return { label: 'سيء', color: 'text-red-600', icon: '✗' };
}

export default function AnalyticsPage() {
  const [children, setChildren] = useState<DelayedChild[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [unitFilter, setUnitFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [childrenData, unitsData] = await Promise.all([fetchChildren(), fetchUnits()]);
      setChildren(childrenData);
      setUnits(unitsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChildren = useMemo(() => {
    return children.filter((child) => {
      const matchesUnit = !unitFilter || child.unit?.unit_name === unitFilter;
      const matchesStatus = !statusFilter || child.status === statusFilter;
      let matchesDate = true;
      if (dateFrom) {
        const childDate = new Date(child.created_at || '');
        if (childDate < new Date(dateFrom)) matchesDate = false;
      }
      if (dateTo) {
        const childDate = new Date(child.created_at || '');
        if (childDate > new Date(dateTo)) matchesDate = false;
      }
      return matchesUnit && matchesStatus && matchesDate;
    });
  }, [children, unitFilter, statusFilter, dateFrom, dateTo]);

  const kpis: KPIs = useMemo(() => calculateKPIs(filteredChildren), [filteredChildren]);
  const unitStats: UnitStats[] = useMemo(() => calculateUnitStats(filteredChildren, units), [filteredChildren, units]);
  const sortedByCompletion = [...unitStats].sort((a, b) => b.completion - a.completion);
  const topPerformers = sortedByCompletion.slice(0, 5);
  const bottomPerformers = [...sortedByCompletion].reverse().slice(0, 5).reverse();

  const statusDistribution = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    filteredChildren.forEach((child) => {
      const status = child.status || 'لم يتم التطعيم';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] || '#6b7280',
    }));
  }, [filteredChildren]);

  const unitCompletionChart = unitStats.slice(0, 10).map((stat) => ({
    name: stat.unit_name.length > 10 ? stat.unit_name.substring(0, 10) + '...' : stat.unit_name,
    الإنجاز: stat.completion,
    المطعمين: stat.vaccinated,
    المتبقي: stat.remaining,
  }));

  const monthlyTrend = useMemo(() => {
    const monthCounts: Record<string, { total: number; vaccinated: number }> = {};
    filteredChildren.forEach((child) => {
      if (child.created_at) {
        const date = new Date(child.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthCounts[monthKey]) monthCounts[monthKey] = { total: 0, vaccinated: 0 };
        monthCounts[monthKey].total++;
        if (child.status === 'تم التطعيم فى وحدة بتاريخ') monthCounts[monthKey].vaccinated++;
      }
    });
    return Object.entries(monthCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, counts]) => ({
        name: month,
        'إجمالي': counts.total,
        'المطعمين': counts.vaccinated,
        'نسبة الإنجاز': counts.total > 0 ? Math.round((counts.vaccinated / counts.total) * 100) : 0,
      }));
  }, [filteredChildren]);

  const clearFilters = () => {
    setUnitFilter('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">جاري تحميل التحليلات...</p>
        </div>
      </div>
    );
  }

  const chartTooltipStyle = { backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">التقارير والإحصائيات</h1>
        <button onClick={clearFilters} className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700">
          مسح الفلاتر
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4 transition-colors duration-300">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الوحدة</label>
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
            >
              <option value="">كل الوحدات</option>
              {units.map((u) => (<option key={u.id} value={u.unit_name}>{u.unit_name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحالة</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
            >
              <option value="">كل الحالات</option>
              <option value="تم التطعيم فى وحدة بتاريخ">تم التطعيم</option>
              <option value="لم يتم التطعيم">لم يتم التطعيم</option>
              <option value="رفض">رفض</option>
              <option value="مسافر">مسافر</option>
              <option value="مسافر موثق">مسافر موثق</option>
              <option value="مريض">مريض</option>
              <option value="متوفى">متوفى</option>
              <option value="تم التحويل الى اقرب وحدة">تم التحويل</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">من تاريخ</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">إلى تاريخ</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
        <KPICard title="إجمالي الأطفال" value={kpis.total} color="blue" icon={<Users className="w-5 h-5" />} />
        <KPICard title="تم التطعيم" value={kpis.vaccinated} color="emerald" icon={<CheckCircle className="w-5 h-5" />} />
        <KPICard title="لم يتم التطعيم" value={kpis.notVaccinated} color="orange" icon={<Clock className="w-5 h-5" />} />
        <KPICard title="نسبة الإنجاز" value={kpis.completion} suffix="٪" color={kpis.completion >= 70 ? 'emerald' : kpis.completion >= 40 ? 'orange' : 'red'} icon={<TrendingUp className="w-5 h-5" />} />
        <KPICard title="رفض" value={kpis.refused} color="red" icon={<XCircle className="w-5 h-5" />} />
        <KPICard title="مسافر" value={kpis.traveling} color="blue" icon={<Plane className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
        <KPICard title="مسافر موثق" value={kpis.documentedTravel} color="purple" icon={<Plane className="w-5 h-5" />} />
        <KPICard title="مريض" value={kpis.sick} color="yellow" icon={<Heart className="w-5 h-5" />} />
        <KPICard title="محول" value={kpis.transferred} color="teal" icon={<ArrowUpDown className="w-5 h-5" />} />
        <KPICard title="متوفى" value={kpis.deceased} color="gray" icon={<XCircle className="w-5 h-5" />} />
        <KPICard title="الهاتف غير متاح" value={kpis.phoneUnavailable} color="gray" icon={<PhoneOff className="w-5 h-5" />} />
        <KPICard title="الهاتف خطأ" value={kpis.phoneWrong} color="gray" icon={<PhoneOff className="w-5 h-5" />} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            نسبة الإنجاز لكل وحدة
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={unitCompletionChart} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend />
                <Bar dataKey="الإنجاز" fill="#059669" name="نسبة الإنجاز" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-emerald-600" />
            توزيع الحالات
          </h3>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}٪)`} labelLine={false}>
                  {statusDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {monthlyTrend.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              معدلات التطعيم مع الزمن
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <YAxis yAxisId="left" stroke="#9ca3af" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#9ca3af" />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="إجمالي" fill="#93c5fd" name="إجمالي الأطفال" />
                  <Bar yAxisId="left" dataKey="المطعمين" fill="#059669" name="المطعمين" />
                  <Line yAxisId="right" type="monotone" dataKey="نسبة الإنجاز" stroke="#f59e0b" strokeWidth={2} name="نسبة الإنجاز ٪" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            أفضل وأسوأ الوحدات
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...topPerformers.slice(0, 5), ...bottomPerformers.slice(0, 5)]} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" />
                <YAxis type="category" dataKey="unit_name" width={80} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="completion" name="نسبة الإنجاز">
                  {[...topPerformers.slice(0, 5), ...bottomPerformers.slice(0, 5)].map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index < 5 ? '#059669' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-600 rounded" />
              <span className="text-gray-600 dark:text-gray-400">أفضل 5</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span className="text-gray-600 dark:text-gray-400">أسوأ 5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Units Ranking Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">ترتيب الوحدات حسب الأداء</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 w-16">الترتيب</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">اسم الوحدة</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">إجمالي الأطفال</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">المطعمين</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">المتبقين</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">نسبة الإنجاز</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">تقييم الأداء</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {sortedByCompletion.map((unit, index) => {
                const performance = getPerformanceRating(unit.completion);
                return (
                  <tr key={unit.unit_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                        index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
                        index === 1 ? 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300' :
                        index === 2 ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300' :
                        'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{unit.unit_name}</td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{unit.total}</td>
                    <td className="px-4 py-3 text-center"><span className="text-emerald-600 font-medium">{unit.vaccinated}</span></td>
                    <td className="px-4 py-3 text-center"><span className="text-orange-600 font-medium">{unit.remaining}</span></td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${unit.completion >= 70 ? 'bg-emerald-500' : unit.completion >= 40 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${unit.completion}%` }} />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{unit.completion}٪</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${performance.color} bg-gray-100 dark:bg-gray-700`}>
                        <span>{performance.icon}</span>
                        <span>{performance.label}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Activity className="w-6 h-6" />ملخص الأداء العام</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div><p className="text-emerald-100 text-sm">إجمالي الوحدات</p><p className="text-3xl font-bold">{units.length}</p></div>
          <div><p className="text-emerald-100 text-sm">الوحدات المتميزة (≥80٪)</p><p className="text-3xl font-bold">{sortedByCompletion.filter((u) => u.completion >= 80).length}</p></div>
          <div><p className="text-emerald-100 text-sm">الوحدات التي تحتاج دعم (≤40٪)</p><p className="text-3xl font-bold">{sortedByCompletion.filter((u) => u.completion <= 40).length}</p></div>
        </div>
      </div>
    </div>
  );
}
