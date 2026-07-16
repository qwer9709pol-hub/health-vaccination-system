import { supabase } from '../lib/supabase';
import { DelayedChild, Unit, KPIs, UnitStats, Notification } from '../types';

export async function fetchChildren(unitId?: string): Promise<DelayedChild[]> {
  let query = supabase.from('delayed_children').select('*, unit:units(*)').order('created_at', { ascending: false });
  if (unitId) query = query.eq('unit_id', unitId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function fetchUnits(): Promise<Unit[]> {
  const { data, error } = await supabase.from('units').select('*').order('unit_name');
  if (error) throw error;
  return data || [];
}

export async function updateChild(id: string, updates: Partial<DelayedChild>, userId?: string): Promise<void> {
  const updateData: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString(), last_follow_up: new Date().toISOString() };
  if (updates.status === 'تم التطعيم فى وحدة بتاريخ' && !updates.vaccination_date) {
    updateData.vaccination_date = new Date().toISOString().split('T')[0];
  }
  const { error } = await supabase.from('delayed_children').update(updateData).eq('id', id);
  if (error) throw error;
}

export async function deleteChild(id: string): Promise<void> {
  const { error } = await supabase.from('delayed_children').delete().eq('id', id);
  if (error) throw error;
}

export interface BulkDeleteFilters {
  unitId?: string;
  status?: string;
  dose?: string;
}

export async function deleteChildrenByFilters(filters: BulkDeleteFilters): Promise<number> {
  let query = supabase.from('delayed_children').delete();
  if (filters.unitId) query = query.eq('unit_id', filters.unitId);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.dose) query = query.eq('dose', filters.dose);
  const { data, error } = await query.select('id');
  if (error) throw error;
  return data?.length || 0;
}

export function calculateKPIs(children: DelayedChild[]): KPIs {
  const total = children.length;
  const vaccinated = children.filter(c => c.status === 'تم التطعيم فى وحدة بتاريخ').length;
  const notVaccinated = children.filter(c => c.status === 'لم يتم التطعيم').length;
  const refused = children.filter(c => c.status === 'رفض').length;
  const traveling = children.filter(c => c.status === 'مسافر').length;
  const documentedTravel = children.filter(c => c.status === 'مسافر موثق').length;
  const sick = children.filter(c => c.status === 'مريض').length;
  const transferred = children.filter(c => c.status === 'تم التحويل الى اقرب وحدة').length;
  const deceased = children.filter(c => c.status === 'متوفى').length;
  const phoneUnavailable = children.filter(c => c.status === 'الهاتف غير متاح').length;
  const phoneWrong = children.filter(c => c.status === 'الهاتف خطأ').length;
  const completion = total > 0 ? Math.round((vaccinated / total) * 100) : 0;
  return { total, vaccinated, notVaccinated, refused, traveling, documentedTravel, sick, transferred, deceased, phoneUnavailable, phoneWrong, completion };
}

export function calculateUnitStats(children: DelayedChild[], units: Unit[]): UnitStats[] {
  return units.map(unit => {
    const unitChildren = children.filter(c => c.unit_id === unit.id);
    const total = unitChildren.length;
    const vaccinated = unitChildren.filter(c => c.status === 'تم التطعيم فى وحدة بتاريخ').length;
    const remaining = total - vaccinated;
    const completion = total > 0 ? Math.round((vaccinated / total) * 100) : 0;
    return { unit_id: unit.id, unit_name: unit.unit_name, total, vaccinated, remaining, completion };
  });
}

export async function fetchNotifications(unitId?: string): Promise<Notification[]> {
  let query = supabase.from('notifications').select('*, child:delayed_children(*), unit:units(*)').order('created_at', { ascending: false });
  if (unitId) query = query.eq('unit_id', unitId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  if (error) throw error;
}

export async function addFollowUpHistory(childId: string, status: string, notes: string, changedBy: string) {
  const { error } = await supabase.from('follow_up_history').insert([{ child_id: childId, status, notes, changed_by: changedBy }]);
  if (error) throw error;
}
