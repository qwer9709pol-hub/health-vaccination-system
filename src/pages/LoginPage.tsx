import React, { useState } from 'react';
import { Shield, User, Building2, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

interface LoginPageProps { onLogin: () => void; }

const healthUnitsList = [
  'ميت غمر', 'دقادوس', 'كوم النور', 'دماص', 'سنفا', 'أتميدة', 'بشلا',
  'أوليلة', 'صهرجت الكبرى', 'كفر المقدام', 'ميت الفرماوي', 'ميت محسن',
  'ميت أبو خالد', 'دنديط', 'ميت القرشي', 'تفهنا الأشراف', 'سنتماي',
  'بشالوش', 'كفور البهايتة', 'سمبو مقام', 'البوها', 'كفر النعمان',
  'سرنجا', 'كفر سرنجا', 'كفر بهيدة', 'ميت ناجي', 'المعصرة', 'ميت العز',
  'كفر ميت العز', 'هلا', 'القيطون', 'كفر الشيخ هلال', 'جصفا', 'ميت يعيش',
  'الرحمانية', 'الدبونية', 'كفر الوزير', 'كفر الشراقوة', 'أبو نبهان',
  'بهيدة', 'كفر الهجرسي', 'كفر المحمدية', 'رعاية أول'
];

export default function LoginPage({ onLogin }: LoginPageProps) {
  const { login, adminLogin } = useAuth();
  const [loginType, setLoginType] = useState<'unit' | 'admin'>('unit');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUnitLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    const result = await login(selectedUnit, password);
    setLoading(false);
    if (result.success) onLogin();
    else setError(result.error || 'حدث خطأ');
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    const result = await adminLogin(username, adminPassword);
    setLoading(false);
    if (result.success) onLogin();
    else setError(result.error || 'حدث خطأ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">نظام متابعة التطعيمات</h1>
            <p className="text-emerald-100 text-sm">للأطفال المتخلفين عن التطعيم</p>
          </div>
          <div className="p-8">
            <div className="flex gap-2 mb-6">
              <button onClick={() => { setLoginType('unit'); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  loginType === 'unit' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                <Building2 className="w-5 h-5" />وحدة صحية
              </button>
              <button onClick={() => { setLoginType('admin'); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  loginType === 'admin' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                <User className="w-5 h-5" />المدير
              </button>
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" /><span className="text-sm">{error}</span>
              </div>
            )}
            {loginType === 'unit' ? (
              <form onSubmit={handleUnitLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اختر الوحدة الصحية</label>
                  <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-white" required>
                    <option value="">-- اختر الوحدة --</option>
                    {healthUnitsList.map((unitName, index) => (
                      <option key={index} value={unitName}>{unitName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      placeholder="أدخل كلمة المرور" required />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>تسجيل الدخول</span><ArrowLeft className="w-5 h-5" /></>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم المستخدم</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                      className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      placeholder="أدخل اسم المستخدم" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      placeholder="أدخل كلمة المرور" required />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>تسجيل الدخول</span><ArrowLeft className="w-5 h-5" /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
