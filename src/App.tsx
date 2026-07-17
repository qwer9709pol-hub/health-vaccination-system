import { useAuth } from './auth/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import UnitDashboard from './pages/UnitDashboard';

export default function App() {
  const { user } = useAuth();

  if (!user) return <LoginPage />;
  if (user.role === 'admin') return <AdminDashboard />;
  return <UnitDashboard />;
}
