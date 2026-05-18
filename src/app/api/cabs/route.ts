import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.FASTAPI_BACKEND_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams.toString();
  const res = await fetch(`${BACKEND_URL}/api/v1/cabs?${params}`);

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch cab providers' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
