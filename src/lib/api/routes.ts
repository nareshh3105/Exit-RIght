import { supabase } from '@/lib/supabase';
import type { RouteRecommendation, CabProvider, ApiResponse } from '@/types';

// ── Get route recommendation ──────────────────────────────────
// POST /api/recommend  (your own Next.js API route or Supabase Edge Function)
export async function getRecommendation(
  fromStationId: string,
  toDestination: string,
  toLat?: number,
  toLng?: number
): Promise<ApiResponse<RouteRecommendation>> {
  const res = await fetch('/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromStationId, toDestination, toLatLng: { lat: toLat, lng: toLng } }),
  });

  if (!res.ok) return { data: null, error: 'Failed to fetch recommendation' };
  const json = await res.json();
  return { data: json as RouteRecommendation, error: null };
}

// ── Get live cab providers ────────────────────────────────────
// This queries your own backend which aggregates cab provider APIs.
// Each provider's deep link opens their app with the pickup pre-filled.
export async function getCabProviders(
  pickupLat: number,
  pickupLng: number,
  dropLat: number,
  dropLng: number
): Promise<ApiResponse<CabProvider[]>> {
  const res = await fetch(
    `/api/cabs?pickupLat=${pickupLat}&pickupLng=${pickupLng}&dropLat=${dropLat}&dropLng=${dropLng}`
  );
  if (!res.ok) return { data: null, error: 'Failed to fetch cab providers' };
  const json = await res.json();
  return { data: json as CabProvider[], error: null };
}

// ── Build cab deep link (Uber example) ────────────────────────
export function buildCabDeepLink(
  provider: 'uber' | 'ola' | 'rapido' | 'namma_yatri',
  pickupLat: number,
  pickupLng: number,
  dropLat: number,
  dropLng: number
): string {
  switch (provider) {
    case 'uber':
      return `uber://?action=setPickup&pickup[latitude]=${pickupLat}&pickup[longitude]=${pickupLng}&dropoff[latitude]=${dropLat}&dropoff[longitude]=${dropLng}`;
    case 'ola':
      return `olacabs://app/launch?lat=${pickupLat}&lng=${pickupLng}&drop_lat=${dropLat}&drop_lng=${dropLng}`;
    case 'rapido':
      return `rapido://book?src_lat=${pickupLat}&src_lng=${pickupLng}&dst_lat=${dropLat}&dst_lng=${dropLng}`;
    case 'namma_yatri':
      return `nammayatri://book?pickup_lat=${pickupLat}&pickup_lng=${pickupLng}`;
    default:
      return '#';
  }
}
