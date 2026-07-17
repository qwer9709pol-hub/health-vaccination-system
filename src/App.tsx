import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import Layout from './pages/Layout';
import AdminDashboard from './pages/AdminDashboard';
import UnitDashboard from './pages/UnitDashboard';
import ExcelImportPage from './pages/ExcelImportPage';
import AnalyticsPage from './pages/AnalyticsPage';
import UnitsManagementPage from './pages/UnitsManagementPage';
import NotificationPanel from './components/NotificationPanel';
import { Notification } from './types';
import { fetchNotifications, markNotificationRead } from './api/data';

function DashboardContent({ onLogout }: { onLogout: () => void }) {
  const { user, logout } = useAuth();
  const handleLogout = () => { logout(); onLogout(); };
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const unitId = user?.role === 'unit_user' ? user.unit_id : undefined;

  useEffect(() => { loadNotifications(); }, [user]);
  const loadNotifications = async () => { if (!user) return; setNotificationsLoading(true); try { setNotifications(await fetchNotifications(unitId)); } catch (e) { console.error(e); } finally { setNotificationsLoading(false); } };
  const handleMarkRead = async (id: string) => { await markNotificationRead(id); setNotifications(p => p.map(n => n.id === id ? { ...n, is_read: true } : n)); };
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const renderContent = () => { if (user?.role === 'admin') { switch (activeTab) { case 'import': return <ExcelImportPage />; case 'analytics': return <AnalyticsPage />; case 'units': return <UnitsManagementPage />; default: return <AdminDashboard />; } } return <UnitDashboard />; };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} notificationCount={unreadCount} onNotificationClick={()=>setNotificationsOpen(true)} onLogout={handleLogout}>
      {renderContent()}
      <NotificationPanel isOpen={notificationsOpen} onClose={()=>setNotificationsOpen(false)} notifications={notifications} loading={notificationsLoading} onMarkRead={handleMarkRead} />
    </Layout>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => { if (localStorage.getItem('vaccination_user')) setIsAuthenticated(true); }, []);
  return (
    <ThemeProvider>
      <AuthProvider>
        {isAuthenticated ? <DashboardContent onLogout={()=>setIsAuthenticated(false)} /> : <LoginPage onLogin={()=>setIsAuthenticated(true)} />}
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
