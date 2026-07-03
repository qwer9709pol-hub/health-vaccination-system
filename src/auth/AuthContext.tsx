import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Unit } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  units: Unit[];
  loading: boolean;
  login: (unitName: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnits();
    checkSession();
  }, []);

  const fetchUnits = async () => {
    const { data } = await supabase.from('units').select('*').order('unit_name');
    if (data && data.length > 0) {
      setUnits(data);
    } else {
      const localUnits: Unit[] = healthUnitsList.map((name, index) => ({
        id: String(index + 1),
        unit_name: name,
        created_at: new Date().toISOString()
      }));
      setUnits(localUnits);
    }
  };

  const checkSession = () => {
    const stored = localStorage.getItem('vaccination_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('vaccination_user');
      }
    }
    setLoading(false);
  };

  // الخيار الثاني والممتاز: جلب الوحدة بالـ UUID الصحيح من قاعدة البيانات مباشرة
  const login = async (unitName: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (password !== '2468') {
      return { success: false, error: 'كلمة المرور غير صحيحة' };
    }

    const { data: unit, error: unitError } = await supabase
      .from('units')
      .select('*')
      .eq('unit_name', unitName)
      .maybeSingle();

    if (unitError || !unit) {
      return { success: false, error: 'الوحدة غير موجودة في قاعدة البيانات' };
    }

    const userData: User = {
      id: `unit_${unit.id}`,
      role: 'unit_user',
      unit_id: unit.id,
      unit_name: unit.unit_name,
    };

    setUser(userData);
    localStorage.setItem('vaccination_user', JSON.stringify(userData));
    return { success: true };
  };

  const adminLogin = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (username !== 'admin' || password !== 'Admin@2468') {
      return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    }

    const userData: User = {
      id: 'admin',
      role: 'admin',
    };

    setUser(userData);
    localStorage.setItem('vaccination_user', JSON.stringify(userData));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vaccination_user');
  };

  return (
    <AuthContext.Provider value={{ user, units, loading, login, adminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}