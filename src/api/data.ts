import { supabase } from '../lib/supabase';
import type { Child, Unit, DelayedChild, Notification, KPIs, UnitStats, ChildStatus } from '../types';

export async function fetchChildren(): Promise<Child[]> {
  const { data, error } = await supabase.from('children').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchChildrenByUnit(unitId: string): Promise<Child[]> {
  const { data, error } = await supabase.from('children').select('*').eq('unit_id', unitId).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchUnits(): Promise<Unit[]> {
  const { data, error } = await supabase.from('units').select('*').order('unit_name', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function addUnit(unit_name: string, password: string = '2468'): Promise<Unit> {
  const { data, error } = await supabase.from('units').insert({ unit_name, password }).select().single();
  if (error) throw error;
  return data;
}

export async function updateUnit(id: string, updates: Partial<Unit>): Promise<Unit> {
  const { data, error } = await supabase.from('units').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteUnit(id: string): Promise<void> {
  const { error } = await supabase.from('units').delete().eq('id', id);
  if (error) throw error;
}

export async function addChild(child: Omit<Child, 'id' | 'created_at' | 'updated_at'>): Promise<Child> {
  const { data, error } = await supabase.from('children').insert(child).select().single();
  if (error) throw error;
  return data;
}

export async function updateChild(id: string, updates: Partial<Child>): Promise<Child> {
  const { data, error } = await supabase.from('children').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteChild(id: string): Promise<void> {
  const { error } = await supabase.from('children').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteChildrenByFilters(filters: {
  unit_id?: string;
  status?: ChildStatus;
  dose_number?: number;
}): Promise<number> {
  let query = supabase.from('children').delete();
  if (filters.unit_id) query = query.eq('unit_id', filters.unit_id);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.dose_number) query = query.eq('dose_number', filters.dose_number);
  const { data, error } = await query.select();
  if (error) throw error;
  return data?.length || 0;
}

export async function calculateKPIs(children: Child[]): Promise<KPIs> {
  const total = children.length;
  const vaccinated = children.filter(c => c.status === 'تم التطعيم فى وحدة بتاريخ').length;
  const notVaccinated = children.filter(c => c.status === 'لم يتم التطعيم').length;
  const delayed = children.filter(c =>
    c.status !== 'تم التطعيم فى وحدة بتاريخ' && c.status !== 'متوفى'
  ).length;
  const rate = total > 0 ? Math.round((vaccinated / total) * 100) : 0;
  return { total_children: total, vaccinated, not_vaccinated: notVaccinated, delayed, vaccination_rate: rate };
}

export async function calculateUnitStats(children: Child[], units: Unit[]): Promise<UnitStats[]> {
  return units.map(unit => {
    const unitChildren = children.filter(c => c.unit_id === unit.id);
    const total = unitChildren.length;
    const vaccinated = unitChildren.filter(c => c.status === 'تم التطعيم فى وحدة بتاريخ').length;
    const notVaccinated = unitChildren.filter(c => c.status === 'لم يتم التطعيم').length;
    const delayed = unitChildren.filter(c =>
      c.status !== 'تم التطعيم فى وحدة بتاريخ' && c.status !== 'متوفى'
    ).length;
    const rate = total > 0 ? Math.round((vaccinated / total) * 100) : 0;
    return { unit_name: unit.unit_name, total, vaccinated, not_vaccinated: notVaccinated, delayed, vaccination_rate: rate };
  });
}

export async function fetchDelayedChildren(): Promise<DelayedChild[]> {
  const { data, error } = await supabase.from('children').select('*').neq('status', 'تم التطعيم فى وحدة بتاريخ').neq('status', 'متوفى').order('created_at', { ascending: false });
  if (error) throw error;
  const now = new Date();
  return (data || []).map(child => {
    const created = new Date(child.created_at || now.toISOString());
    const diffMs = now.getTime() - created.getTime();
    const delayDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    return { ...child, delay_days: delayDays } as DelayedChild;
  });
}

export async function fetchNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  if (error) throw error;
}

export async function addFollowUpHistory(childId: string, note: string): Promise<void> {
  const { error } = await supabase.from('follow_up_history').insert({ child_id: childId, note, followed_at: new Date().toISOString() });
  if (error) throw error;
}
