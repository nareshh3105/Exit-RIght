import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.FASTAPI_BACKEND_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${BACKEND_URL}/api/v1/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.detail ?? 'Backend error' }, { status: res.status });
    }

    // Convert snake_case → camelCase for the frontend
    return NextResponse.json({
      id: data.id,
      fromStationId: data.from_station_id,
      fromStationName: data.from_station_name,
      toDestination: data.to_destination,
      toAddress: data.to_address,
      distanceKm: data.distance_km,
      gateRecommendation: {
        recommendedGate: data.gate_recommendation?.recommended_gate,
        reasons: data.gate_recommendation?.reasons ?? [],
        alternateGates: (data.gate_recommendation?.alternate_gates ?? []).map((g: Record<string, unknown>) => ({
          gate: g.gate,
          isRecommended: g.is_recommended,
          extraTime: g.extra_time,
          status: g.status,
          reason: g.reason,
        })),
      },
      transportOptions: (data.transport_options ?? []).map((o: Record<string, unknown>) => ({
        mode: o.mode,
        name: o.name,
        eta: o.eta,
        cost: o.cost,
        crowdLevel: o.crowd_level,
        safetyScore: o.safety_score,
        confidencePercent: o.confidence_percent,
        distanceKm: o.distance_km,
        isRecommended: o.is_recommended,
        isCheapest: o.is_cheapest,
        shouldAvoid: o.should_avoid,
        providerRoute: o.provider_route,
      })),
      weatherAlert: data.weather_alert ? {
        type: data.weather_alert.type,
        message: data.weather_alert.message,
        minutesAway: data.weather_alert.minutes_away,
      } : null,
      aiTake: data.ai_take,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to reach backend' }, { status: 502 });
  }
}
