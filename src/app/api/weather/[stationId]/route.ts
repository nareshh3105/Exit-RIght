import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.FASTAPI_BACKEND_URL || 'http://localhost:8000';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ stationId: string }> }
) {
  const { stationId } = await params;
  const res = await fetch(`${BACKEND_URL}/api/v1/weather/${stationId}`);

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
