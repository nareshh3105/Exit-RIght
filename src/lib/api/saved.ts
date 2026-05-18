import { supabase } from '@/lib/supabase';
import type { SavedRoute, ApiResponse } from '@/types';

// ── Get saved routes ──────────────────────────────────────────
export async function getSavedRoutes(userId: string): Promise<ApiResponse<SavedRoute[]>> {
  const { data, error } = await supabase
    .from('saved_routes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at');

  if (error) return { data: null, error: error.message };

  return {
    data: (data ?? []).map(r => ({
      id: r.id,
      userId: r.user_id,
      name: r.name,
      address: r.address,
      icon: r.icon,
      color: r.color,
      destinationLat: r.destination_lat,
      destinationLng: r.destination_lng,
      preferredGate: r.preferred_gate,
      preferredMode: r.preferred_mode,
      estimatedEta: r.estimated_eta,
      estimatedCost: r.estimated_cost,
      createdAt: r.created_at,
    })),
    error: null,
  };
}

// ── Add saved route ───────────────────────────────────────────
export async function addSavedRoute(
  userId: string,
  route: Omit<SavedRoute, 'id' | 'userId' | 'createdAt'>
): Promise<ApiResponse<SavedRoute>> {
  const { data, error } = await supabase
    .from('saved_routes')
    .insert({
      user_id: userId,
      name: route.name,
      address: route.address,
      icon: route.icon,
      color: route.color,
      destination_lat: route.destinationLat,
      destination_lng: route.destinationLng,
      preferred_gate: route.preferredGate,
      preferred_mode: route.preferredMode,
      estimated_eta: route.estimatedEta,
      estimated_cost: route.estimatedCost,
    })
    .select()
    .single();

  if (error || !data) return { data: null, error: error?.message ?? 'Failed to save route' };

  return {
    data: { ...route, id: data.id, userId, createdAt: data.created_at },
    error: null,
  };
}

// ── Delete saved route ────────────────────────────────────────
export async function deleteSavedRoute(
  routeId: string,
  userId: string
): Promise<ApiResponse<null>> {
  const { error } = await supabase
    .from('saved_routes')
    .delete()
    .eq('id', routeId)
    .eq('user_id', userId);

  return { data: null, error: error?.message ?? null };
}
