import type { SafetyData, ApiResponse } from '@/types';

export async function getSafetyScore(params: {
  stationId: string;
  gateNumber: number;
  mode: string;
  destinationLat: number;
  destinationLng: number;
}): Promise<ApiResponse<SafetyData>> {
  const res = await fetch('/api/safety', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      station_id: params.stationId,
      gate_number: params.gateNumber,
      mode: params.mode,
      destination_lat: params.destinationLat,
      destination_lng: params.destinationLng,
    }),
  });

  if (!res.ok) return { data: null, error: 'Failed to get safety score' };
  const json = await res.json();

  return {
    data: {
      overallScore: json.overall_score,
      tone: json.tone,
      factors: json.factors.map((f: Record<string, unknown>) => ({
        label: f.label,
        score: f.score,
        tone: f.tone,
        icon: f.icon,
      })),
    },
    error: null,
  };
}
