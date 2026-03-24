import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// Exclusiviteit per postcode is verwijderd -- juridisch te risicovol.
// Dit endpoint retourneert 410 Gone zodat eventuele externe calls duidelijk falen.

export async function GET(req: NextRequest) {
  const authResult = requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  return NextResponse.json({ error: 'Exclusiviteit is verwijderd uit LokaalKabaal.' }, { status: 410 });
}

export async function POST(req: NextRequest) {
  const authResult = requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  return NextResponse.json({ error: 'Exclusiviteit is verwijderd uit LokaalKabaal.' }, { status: 410 });
}
