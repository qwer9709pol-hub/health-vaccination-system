import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (unitName: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('vaccination_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('vaccination_user'); }
    }
  }, []);

  const login = async (unitName: string, password: string) => {
    try {
      const { data, error } = await supabase.from('units').select('*').eq('unit_name', unitName).eq('password', password).single();
      if (error || !data) return { success: false, error: 'اسم الوحدة أو كلمة المرور غير صحيحة' };
      const user: User = { id: data.id, role: 'unit_user', unit_id: data.id, unit_name: data.unit_name };
      setUser(user); localStorage.setItem('vaccination_user', JSON.stringify(user));
      return { success: true };
    } catch { return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' }; }
  };

  const adminLogin = async (username: string, password: string) => {
    try {
      const { data, error } = await supabase.from('admins').select('*').eq('username', username).eq('password', password).single();
      if (error || !data) return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
      const user: User = { id: data.id, role: 'admin' };
      setUser(user); localStorage.setItem('vaccination_user', JSON.stringify(user));
      return { success: true };
    } catch { return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' }; }
  };

  const logout = () => { setUser(null); localStorage.removeItem('vaccination_user'); };

  return <AuthContext.Provider value={{ user, login, adminLogin, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
