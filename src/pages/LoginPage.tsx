import { useState } from 'react';
import { Shield, Building2, Lock, User, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

interface LoginPageProps { onLogin: () => void; }

export default function LoginPage({ onLogin }: LoginPageProps) {
  const { login, adminLogin } = useAuth();
  const [mode, setMode] = useState<'unit' | 'admin'>('unit');
  const [unitName, setUnitName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const result = mode === 'unit' ? await login(unitName, password) : await adminLogin(username, password);
      if (result.success) onLogin(); else setError(result.error || 'فشل تسجيل الدخول');
    } catch { setError('حدث خطأ أثناء تسجيل الدخول'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 transition-colors duration-300" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl shadow-lg mb-4"><Shield className="w-10 h-10 text-white" /></div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">نظام متابعة التطعيمات</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">للأطفال المتخلفين عن التطعيم</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border dark:border-gray-700 p-8 transition-colors duration-300">
          <div className="flex gap-2 mb-6">
            <button onClick={() => setMode('unit')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${mode === 'unit' ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}><Building2 className="w-5 h-5" />وحدة صحية</button>
            <button onClick={() => setMode('admin')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${mode === 'admin' ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}><ShieldCheck className="w-5 h-5" />مدير النظام</button>
          </div>
          {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm text-center">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'unit' ? <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اسم الوحدة</label><div className="relative"><Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" value={unitName} onChange={(e) => setUnitName(e.target.value)} required className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" placeholder="اسم الوحدة الصحية" /></div></div> : <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اسم المستخدم</label><div className="relative"><User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" placeholder="admin" /></div></div>}
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">كلمة المرور</label><div className="relative"><Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" placeholder="كلمة المرور" /></div></div>
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 shadow-lg">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>تسجيل الدخول</span>}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
