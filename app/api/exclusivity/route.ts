import { NextResponse } from 'next/server';

// Exclusiviteit per postcode is verwijderd — juridisch te risicovol.
// Dit endpoint retourneert 410 Gone zodat eventuele externe calls duidelijk falen.

export async function GET() {
  return NextResponse.json({ error: 'Exclusiviteit is verwijderd uit LokaalKabaal.' }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({ error: 'Exclusiviteit is verwijderd uit LokaalKabaal.' }, { status: 410 });
}
