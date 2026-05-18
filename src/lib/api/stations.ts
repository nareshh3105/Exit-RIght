import { supabase } from '@/lib/supabase';
import type { Station, ApiResponse } from '@/types';

// ── Get all stations ──────────────────────────────────────────
export async function getStations(): Promise<ApiResponse<Station[]>> {
  const { data, error } = await supabase
    .from('stations')
    .select('*')
    .order('name');

  if (error) return { data: null, error: error.message };

  return {
    data: data.map(s => ({
      id: s.id,
      name: s.name,
      line: s.line,
      lat: s.lat,
      lng: s.lng,
    })),
    error: null,
  };
}

// ── Search stations ───────────────────────────────────────────
export async function searchStations(query: string): Promise<ApiResponse<Station[]>> {
  const { data, error } = await supabase
    .from('stations')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('name');

  if (error) return { data: null, error: error.message };

  return {
    data: data.map(s => ({ id: s.id, name: s.name, line: s.line, lat: s.lat, lng: s.lng })),
    error: null,
  };
}

// ── Get nearest station (requires user lat/lng) ───────────────
export async function getNearestStation(
  lat: number,
  lng: number
): Promise<ApiResponse<Station>> {
  // Uses PostGIS earth_distance or a custom SQL function.
  // Ensure you have this RPC defined in Supabase:
  //   create function nearest_station(user_lat float, user_lng float)
  //   returns stations language sql as $$ ... $$;
  const { data, error } = await supabase.rpc('nearest_station', {
    user_lat: lat,
    user_lng: lng,
  });

  if (error || !data) return { data: null, error: error?.message ?? 'Not found' };

  return {
    data: { id: data.id, name: data.name, line: data.line, isNearest: true },
    error: null,
  };
}
