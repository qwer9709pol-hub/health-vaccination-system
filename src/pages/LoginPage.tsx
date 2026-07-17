import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { fetchUnits } from '../api/data';
import type { Unit } from '../types';
import { Shield, Syringe, LogIn, UserCog } from 'lucide-react';

export default function LoginPage() {
  const { login, adminLogin } = useAuth();
  const [mode, setMode] = useState<'unit' | 'admin'>('unit');
  const [unitName, setUnitName] = useState('');
  const [units, setUnits] = useState<Unit[]>([]);
  const [password, setPassword] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUnits().then(setUnits).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (mode === 'unit') {
      const res = await login(unitName, password);
      if (!res.success) setError(res.error || 'خطأ');
    } else {
      const res = await adminLogin(adminUsername, adminPassword);
      if (!res.success) setError(res.error || 'خطأ');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-600 rounded-2xl mb-4 shadow-lg">
            <Syringe className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">نظام متابعة التطعيمات</h1>
          <p className="text-slate-500 mt-2">تسجيل الدخول للنظام</p>
        </div>

        <div className="card">
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setMode('unit')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                mode === 'unit' ? 'bg-teal-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Syringe className="w-5 h-5" />
              دخول الوحدة
            </button>
            <button
              type="button"
              onClick={() => setMode('admin')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                mode === 'admin' ? 'bg-teal-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <UserCog className="w-5 h-5" />
              دخول الأدمن
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'unit' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">اسم الوحدة</label>
                  <select
                    value={unitName}
                    onChange={(e) => setUnitName(e.target.value)}
                    required
                    className="input-field"
                  >
                    <option value="">اختر الوحدة</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.unit_name}>{u.unit_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">كلمة المرور</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="كلمة المرور"
                    className="input-field"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">اسم المستخدم</label>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    required
                    placeholder="admin"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">كلمة المرور</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    placeholder="كلمة المرور"
                    className="input-field"
                  />
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50"
            >
              <LogIn className="w-5 h-5" />
              {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 text-sm mt-6">
          © 2026 نظام متابعة التطعيمات
        </p>
      </div>
    </div>
  );
}
