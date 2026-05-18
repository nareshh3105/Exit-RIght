import { supabase } from '@/lib/supabase';
import type { TripHistory, ApiResponse, PaginatedResponse } from '@/types';

// ── Save trip ─────────────────────────────────────────────────
export async function saveTripHistory(
  userId: string,
  trip: Omit<TripHistory, 'id' | 'userId'>
): Promise<ApiResponse<TripHistory>> {
  const { data, error } = await supabase
    .from('trip_history')
    .insert({
      user_id: userId,
      from_station: trip.fromStation,
      to_destination: trip.toDestination,
      to_address: trip.toAddress,
      departed_at: trip.departedAt,
      arrived_at: trip.arrivedAt,
      gate_used: trip.gateUsed,
      mode_used: trip.modeUsed,
      actual_cost: trip.actualCost,
      safety_mode_active: trip.safetyModeActive,
      tag: trip.tag,
      tag_tone: trip.tagTone,
    })
    .select()
    .single();

  if (error || !data) return { data: null, error: error?.message ?? 'Failed to save trip' };
  return { data: mapTrip(data), error: null };
}

// ── Get trip history ──────────────────────────────────────────
export async function getTripHistory(
  userId: string,
  page = 1,
  pageSize = 20
): Promise<ApiResponse<PaginatedResponse<TripHistory>>> {
  const from = (page - 1) * pageSize;
  const to   = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('trip_history')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('departed_at', { ascending: false })
    .range(from, to);

  if (error) return { data: null, error: error.message };

  return {
    data: {
      data: (data ?? []).map(mapTrip),
      total: count ?? 0,
      page,
      pageSize,
    },
    error: null,
  };
}

// ── Get trip stats (for History screen header) ────────────────
export async function getTripStats(userId: string) {
  const { data, error } = await supabase
    .from('trip_history')
    .select('actual_cost, gate_used, departed_at')
    .eq('user_id', userId);

  if (error || !data) return null;

  const totalSaved = data.reduce((sum, t) => sum + (t.actual_cost ?? 0), 0);
  const gateCounts: Record<number, number> = {};
  data.forEach(t => {
    gateCounts[t.gate_used] = (gateCounts[t.gate_used] ?? 0) + 1;
  });
  const topGate = Object.entries(gateCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  return {
    totalTrips: data.length,
    totalSaved,
    topGate: topGate ? parseInt(topGate) : null,
  };
}

function mapTrip(d: Record<string, unknown>): TripHistory {
  return {
    id:               d.id as string,
    userId:           d.user_id as string,
    fromStation:      d.from_station as string,
    toDestination:    d.to_destination as string,
    toAddress:        (d.to_address as string) ?? '',
    departedAt:       d.departed_at as string,
    arrivedAt:        d.arrived_at as string | undefined,
    gateUsed:         d.gate_used as number,
    modeUsed:         d.mode_used as TripHistory['modeUsed'],
    actualCost:       d.actual_cost as number,
    safetyModeActive: d.safety_mode_active as boolean,
    tag:              d.tag as string | undefined,
    tagTone:          d.tag_tone as TripHistory['tagTone'],
  };
}
