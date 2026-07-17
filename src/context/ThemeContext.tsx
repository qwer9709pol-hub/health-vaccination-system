import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType { theme: 'light' | 'dark'; toggleTheme: () => void; }
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'));
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme((p) => (p === 'light' ? 'dark' : 'light'));
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
