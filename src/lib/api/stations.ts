import type { Station, ApiResponse } from '@/types';

// ── Get all stations (via backend proxy — bypasses RLS) ───────
export async function getStations(): Promise<ApiResponse<Station[]>> {
  try {
    const res = await fetch('/api/stations');
    if (!res.ok) return { data: null, error: 'Failed to load stations' };
    const data: Station[] = await res.json();
    return { data, error: null };
  } catch {
    return { data: null, error: 'Network error' };
  }
}

// ── Search stations (client-side filter after full fetch) ─────
export async function searchStations(query: string): Promise<ApiResponse<Station[]>> {
  const res = await getStations();
  if (!res.data) return res;
  const q = query.toLowerCase();
  return {
    data: res.data.filter(s => s.name.toLowerCase().includes(q)),
    error: null,
  };
}

// ── Get nearest station (via backend nearest_station RPC) ─────
export async function getNearestStation(
  lat: number,
  lng: number,
): Promise<ApiResponse<Station>> {
  try {
    const res = await fetch(`/api/stations/nearest?lat=${lat}&lng=${lng}`);
    if (!res.ok) return { data: null, error: 'Not found' };
    const data: Station = await res.json();
    return { data: { ...data, isNearest: true }, error: null };
  } catch {
    return { data: null, error: 'Network error' };
  }
}
