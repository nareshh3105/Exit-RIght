import type { CrowdData, ApiResponse } from '@/types';

export async function getCrowdLevels(stationId: string): Promise<ApiResponse<CrowdData>> {
  const res = await fetch(`/api/crowd/${stationId}`);
  if (!res.ok) return { data: null, error: 'Failed to fetch crowd data' };
  const json = await res.json();
  return {
    data: {
      stationId: json.station_id,
      gates: json.gates.map((g: { gate: number; level: number }) => ({
        gate: g.gate,
        level: Math.min(3, Math.round(g.level)) as 0 | 1 | 2 | 3,
      })),
      fetchedAt: new Date().toISOString(),
    },
    error: null,
  };
}
