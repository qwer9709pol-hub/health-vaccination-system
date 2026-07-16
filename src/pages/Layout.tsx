import React from 'react';
import { LogOut, Bell, Shield, User, Building2, BarChart3, FileSpreadsheet, LayoutDashboard, Moon, Sun } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  notificationCount: number;
  onNotificationClick: () => void;
  onLogout: () => void;
}

export default function Layout({ children, activeTab, onTabChange, notificationCount, onNotificationClick, onLogout }: LayoutProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const adminTabs = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'analytics', label: 'التحليلات', icon: BarChart3 },
    { id: 'import', label: 'رفع ملف', icon: FileSpreadsheet },
    { id: 'units', label: 'الوحدات', icon: Building2 },
  ];
  const unitTabs = [{ id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard }];
  const tabs = user?.role === 'admin' ? adminTabs : unitTabs;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300" dir="rtl">
      <header className="bg-gradient-to-r from-emerald-700 to-teal-600 dark:from-emerald-800 dark:to-teal-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg"><Shield className="w-6 h-6" /></div>
              <div>
                <h1 className="font-bold text-lg">نظام متابعة التطعيمات</h1>
                <p className="text-emerald-100 text-xs">للأطفال المتخلفين عن التطعيم</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={toggleTheme} className="p-2 hover:bg-white/20 rounded-lg transition-colors" title={theme === 'light' ? 'الوضع الداكن' : 'الوضع الفاتح'}>
                {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
              </button>
              <button onClick={onNotificationClick} className="relative p-2 hover:bg-white/20 rounded-lg transition-colors">
                <Bell className="w-6 h-6" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                {user?.role === 'admin' ? <User className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                <span className="text-sm font-medium">{user?.role === 'admin' ? 'المدير' : user?.unit_name}</span>
              </div>
              <button onClick={onLogout} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">
                <LogOut className="w-5 h-5" /><span className="text-sm">خروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <nav className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-3">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}>
                <tab.icon className="w-5 h-5" />{tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
    </div>
  );
}
