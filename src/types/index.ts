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
  'لم يتم التطعيم', 'تم التطعيم فى وحدة بتاريخ', 'مسافر', 'مسافر موثق', 'مريض',
  'الهاتف خطأ', 'الهاتف غير متاح', 'الهاتف مغلق', 'رفض', 'منزل مغلق',
  'تم التحويل الى اقرب وحدة', 'متوفى',
];

export const STATUS_CONFIG: Record<ChildStatus, { label: string; color: string; bgColor: string }> = {
  'لم يتم التطعيم': { label: 'لم يتم التطعيم', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  'تم التطعيم فى وحدة بتاريخ': { label: 'تم التطعيم فى وحدة بتاريخ', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  'مسافر': { label: 'مسافر', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  'مسافر موثق': { label: 'مسافر موثق', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  'رفض': { label: 'رفض', color: 'text-red-700', bgColor: 'bg-red-100' },
  'متوفى': { label: 'متوفى', color: 'text-gray-700', bgColor: 'bg-gray-200' },
  'مريض': { label: 'مريض', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  'منزل مغلق': { label: 'منزل مغلق', color: 'text-amber-800', bgColor: 'bg-amber-100' },
  'الهاتف خطأ': { label: 'الهاتف خطأ', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  'الهاتف غير متاح': { label: 'الهاتف غير متاح', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  'الهاتف مغلق': { label: 'الهاتف مغلق', color: 'text-slate-700', bgColor: 'bg-slate-100' },
  'تم التحويل الى اقرب وحدة': { label: 'تم التحويل الى اقرب وحدة', color: 'text-teal-700', bgColor: 'bg-teal-100' },
};

export interface Unit { id: string; unit_name: string; unit_code?: number; password?: string; created_at?: string; }
export interface DelayedChild {
  id: string; unit_id: string; child_name: string; mother_name: string | null; birth_date: string | null;
  age: number | null; phone_number: string | null; reporter_phone?: string | null; address?: string | null;
  dose?: string | null; delayed_vaccine: string | null; last_vaccine: string | null; status: ChildStatus;
  vaccination_date: string | null; vaccination_place?: string | null; travel_country?: string | null;
  travel_date?: string | null; transfer_destination?: string | null; disease_name?: string | null;
  refusal_reason?: string | null; death_date?: string | null; follow_up_notes: string | null;
  follow_up_date: string | null; last_follow_up: string | null; updated_by: string | null;
  registration_number?: string | null; unit_code?: number | null; created_at?: string; updated_at?: string; unit?: Unit;
}
export interface Notification { id: string; child_id: string | null; unit_id: string | null; message: string; type: string; is_read: boolean; created_at: string; child?: DelayedChild; unit?: Unit; }
export interface User { id: string; role: 'admin' | 'unit_user'; unit_id?: string; unit_name?: string; }
export interface KPIs { total: number; vaccinated: number; notVaccinated: number; refused: number; traveling: number; documentedTravel: number; sick: number; transferred: number; deceased: number; phoneUnavailable: number; phoneWrong: number; completion: number; }
export interface UnitStats { unit_id: string; unit_name: string; total: number; vaccinated: number; remaining: number; completion: number; }
