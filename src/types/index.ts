export type ChildStatus =
  | 'لم يتم التطعيم'
  | 'تم التطعيم فى وحدة بتاريخ'
  | 'مسافر'
  | 'مسافر موثق'
  | 'مريض'
  | 'الهاتف خطأ'
  | 'الهاتف غير متاح'
  | 'الهاتف مغلق'
  | 'رفض'
  | 'منزل مغلق'
  | 'تم التحويل الى اقرب وحدة'
  | 'متوفى';

export const STATUS_OPTIONS: ChildStatus[] = [
  'لم يتم التطعيم',
  'تم التطعيم فى وحدة بتاريخ',
  'مسافر',
  'مسافر موثق',
  'مريض',
  'الهاتف خطأ',
  'الهاتف غير متاح',
  'الهاتف مغلق',
  'رفض',
  'منزل مغلق',
  'تم التحويل الى اقرب وحدة',
  'متوفى',
];

export const STATUS_CONFIG: Record<ChildStatus, { label: string; color: string; bgColor: string; textColor: string }> = {
  'لم يتم التطعيم': { label: 'لم يتم التطعيم', color: '#ef4444', bgColor: 'bg-red-50', textColor: 'text-red-700' },
  'تم التطعيم فى وحدة بتاريخ': { label: 'تم التطعيم فى وحدة بتاريخ', color: '#22c55e', bgColor: 'bg-green-50', textColor: 'text-green-700' },
  'مسافر': { label: 'مسافر', color: '#f59e0b', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
  'مسافر موثق': { label: 'مسافر موثق', color: '#f59e0b', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
  'مريض': { label: 'مريض', color: '#f97316', bgColor: 'bg-orange-50', textColor: 'text-orange-700' },
  'الهاتف خطأ': { label: 'الهاتف خطأ', color: '#64748b', bgColor: 'bg-slate-100', textColor: 'text-slate-600' },
  'الهاتف غير متاح': { label: 'الهاتف غير متاح', color: '#64748b', bgColor: 'bg-slate-100', textColor: 'text-slate-600' },
  'الهاتف مغلق': { label: 'الهاتف مغلق', color: '#64748b', bgColor: 'bg-slate-100', textColor: 'text-slate-600' },
  'رفض': { label: 'رفض', color: '#dc2626', bgColor: 'bg-red-50', textColor: 'text-red-700' },
  'منزل مغلق': { label: 'منزل مغلق', color: '#64748b', bgColor: 'bg-slate-100', textColor: 'text-slate-600' },
  'تم التحويل الى اقرب وحدة': { label: 'تم التحويل الى اقرب وحدة', color: '#3b82f6', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
  'متوفى': { label: 'متوفى', color: '#1e293b', bgColor: 'bg-slate-200', textColor: 'text-slate-800' },
};

export interface Unit {
  id: string;
  unit_name: string;
  password?: string;
  created_at?: string;
}

export interface Child {
  id: string;
  name: string;
  national_id: string;
  birth_date: string;
  phone: string;
  unit_id: string;
  unit_name?: string;
  status: ChildStatus;
  dose_number: number;
  vaccination_date?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DelayedChild {
  id: string;
  name: string;
  national_id: string;
  birth_date: string;
  phone: string;
  unit_id: string;
  unit_name?: string;
  status: ChildStatus;
  dose_number: number;
  vaccination_date?: string | null;
  notes?: string | null;
  delay_days: number;
  created_at?: string;
}

export interface Notification {
  id: string;
  child_id: string;
  child_name: string;
  unit_name: string;
  message: string;
  type: 'delayed_vaccination' | 'follow_up' | 'general';
  is_read: boolean;
  created_at: string;
}

export interface User {
  id: string;
  role: 'admin' | 'unit_user';
  unit_id?: string;
  unit_name?: string;
  username?: string;
}

export interface KPIs {
  total_children: number;
  vaccinated: number;
  not_vaccinated: number;
  delayed: number;
  vaccination_rate: number;
}

export interface UnitStats {
  unit_name: string;
  total: number;
  vaccinated: number;
  not_vaccinated: number;
  delayed: number;
  vaccination_rate: number;
}
