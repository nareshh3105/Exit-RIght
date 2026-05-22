import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.FASTAPI_BACKEND_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get('lat');
  const lng = req.nextUrl.searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng required' }, { status: 400 });
  }

  try {
    // Get all stations and find nearest by haversine
    const res = await fetch(`${BACKEND_URL}/api/v1/stations`);
    if (!res.ok) return NextResponse.json({ error: 'Failed' }, { status: 502 });

    const stations = await res.json();
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    function dist(a: number, b: number, c: number, d: number) {
      const R = 6371;
      const dLat = (c - a) * Math.PI / 180;
      const dLng = (d - b) * Math.PI / 180;
      const x = Math.sin(dLat / 2) ** 2 + Math.cos(a * Math.PI / 180) * Math.cos(c * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    }

    const nearest = stations.reduce((best: Record<string, unknown>, s: Record<string, unknown>) => {
      const d = dist(userLat, userLng, s.lat as number, s.lng as number);
      const bd = dist(userLat, userLng, best.lat as number, best.lng as number);
      return d < bd ? s : best;
    });

    return NextResponse.json(nearest);
  } catch {
    return NextResponse.json({ error: 'Network error' }, { status: 502 });
  }
}
