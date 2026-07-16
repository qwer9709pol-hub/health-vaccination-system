import { supabase } from '../lib/supabase';
import { DelayedChild, Unit, KPIs, UnitStats, Notification, ChildStatus } from '../types';
export async function deleteChildrenByUnit(unitName: string) {
  const { error } = await supabase
    .from('delayed_children')
    .delete()
    .eq('unit_code', unitName);

  if (error) throw error;
}

export async function fetchChildren(unitId?: string): Promise<DelayedChild[]> {
  let query = supabase
    .from('delayed_children')
    .select('*, unit:units(*)')
    .order('created_at', { ascending: false });

  if (unitId) {
    query = query.eq('unit_id', unitId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function fetchUnits(): Promise<Unit[]> {
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .order('unit_name');
  if (error) throw error;
  return data || [];
}

export async function updateChild(
  id: string,
  updates: Partial<DelayedChild>,
  userId?: string
): Promise<void> {
  const updateData: Record<string, unknown> = {
    ...updates,
    updated_at: new Date().toISOString(),
    last_follow_up: new Date().toISOString(),
  };

 // if (userId) {
   // updateData.updated_by = userId;
//  }

 if (updates.status === 'تم التطعيم فى وحدة بتاريخ') {
  if (!updates.vaccination_date) {
    updateData.vaccination_date = new Date().toISOString().split('T')[0];
  }
}

  const { error } = await supabase
    .from('delayed_children')
    .update(updateData)
    .eq('id', id);
  if (error) throw error;
}

export function calculateKPIs(children: DelayedChild[]): KPIs {
  const total = children.length;

  const vaccinated = children.filter(
    c => c.status === 'تم التطعيم فى وحدة بتاريخ'
  ).length;

  const notVaccinated = children.filter(
    c => c.status === 'لم يتم التطعيم'
  ).length;

  const refused = children.filter(
    c => c.status === 'رفض'
  ).length;

  const traveling = children.filter(
    c => c.status === 'مسافر'
  ).length;

  const documentedTravel = children.filter(
    c => c.status === 'مسافر موثق'
  ).length;

  const sick = children.filter(
    c => c.status === 'مريض'
  ).length;

  const transferred = children.filter(
    c => c.status === 'تم التحويل الى اقرب وحدة'
  ).length;

  const deceased = children.filter(
    c => c.status === 'متوفى'
  ).length;

  const phoneUnavailable = children.filter(
    c => c.status === 'الهاتف غير متاح'
  ).length;

  const phoneWrong = children.filter(
    c => c.status === 'الهاتف خطأ'
  ).length;

  const completion =
    total > 0 ? Math.round((vaccinated / total) * 100) : 0;

  return {
    total,
    vaccinated,
    notVaccinated,
    refused,
    traveling,
    documentedTravel,
    sick,
    transferred,
    deceased,
    phoneUnavailable,
    phoneWrong,
    completion,
  };
}

export function calculateUnitStats(children: DelayedChild[], units: Unit[]): UnitStats[] {
  const statsMap = new Map<string, UnitStats>();

  units.forEach((unit) => {
    statsMap.set(unit.id, {
      unit_id: unit.id,
      unit_name: unit.unit_name,
      total: 0,
      vaccinated: 0,
      remaining: 0,
      completion: 0,
    });
  });

  children.forEach((child) => {
  const stats = statsMap.get(child.unit_id);

  if (stats) {
    stats.total++;

    if (child.status === 'تم التطعيم فى وحدة بتاريخ') {
      stats.vaccinated++;
    }
  }
});

  statsMap.forEach((stats) => {
    stats.remaining = stats.total - stats.vaccinated;
    stats.completion = stats.total > 0 ? Math.round((stats.vaccinated / stats.total) * 100) : 0;
  });

  return Array.from(statsMap.values()).sort((a, b) => b.total - a.total);
}

export async function fetchNotifications(unitId?: string): Promise<Notification[]> {
  let query = supabase
    .from('notifications')
    .select('*, unit:units(*), child:delayed_children(*)')
    .order('created_at', { ascending: false })
    .limit(50);

  if (unitId) {
    query = query.eq('unit_id', unitId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);
  if (error) throw error;
}

export async function generateNotifications(children: DelayedChild[]): Promise<void> {
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  for (const child of children) {
    if (child.status === 'لم يتم التطعيم') {
      const lastUpdate = child.updated_at ? new Date(child.updated_at) : new Date(child.created_at || today);

      if (lastUpdate < sevenDaysAgo) {
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('child_id', child.id)
          .gte('created_at', sevenDaysAgo.toISOString())
          .limit(1);

        if (!existing || existing.length === 0) {
          const daysSince = Math.floor((today.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
          await supabase.from('notifications').insert({
            child_id: child.id,
            unit_id: child.unit_id,
            message: `الطفل "${child.child_name}" لم يتم تطعيمه منذ ${daysSince} يوم`,
            type: 'warning',
          });
        }
      }
    }
  }
}

export function calculateRiskScore(stats: UnitStats): number {
  if (stats.total === 0) return 0;

  const delayedWeight = 40;
  const rateWeight = 30;
  const overdueWeight = 30;

  const delayedScore = (stats.remaining / Math.max(stats.total, 1)) * 100;
  const rateScore = 100 - stats.completion;
  const overdueScore = stats.remaining > 10 ? 100 : stats.remaining * 10;

  const riskScore =
    (delayedScore * delayedWeight +
      rateScore * rateWeight +
      overdueScore * overdueWeight) / 100;

  return Math.min(100, Math.max(0, Math.round(riskScore)));
}
export async function addFollowUpHistory(
  childId: string,
  status: string,
  notes: string,
  changedBy: string
) {
  const { error } = await supabase
    .from('follow_up_history')
    .insert([
      {
        child_id: childId,
        status,
        notes,
        changed_by: changedBy,
      },
    ]);

  if (error) throw error;
}

export async function deleteChild(id: string): Promise<void> {
  const { error } = await supabase
    .from('delayed_children')
    .delete()
    .eq('id', id);
  if (error) throw error;
}