import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { isValidBranche } from '@/lib/validation';
import { generateFlyerCopy } from '@/lib/flyer-templates';

/**
 * POST /api/ai
 *
 * Generate flyer copy using pre-written branche-specific templates.
 * No external API calls needed -- instant response, zero cost.
 */
export async function POST(req: NextRequest) {
  const authResult = requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { spec, bedrijfsnaam, slogan } = await req.json();

    // Input validation
    if (spec && !isValidBranche(spec)) {
      return NextResponse.json({ error: 'Branche/spec is ongeldig (max 100 tekens)' }, { status: 400 });
    }

    const MAX_TEXT_LENGTH = 5000;
    if (bedrijfsnaam && typeof bedrijfsnaam === 'string' && bedrijfsnaam.length > MAX_TEXT_LENGTH) {
      return NextResponse.json({ error: 'Bedrijfsnaam is te lang (max 5000 tekens)' }, { status: 400 });
    }
    if (slogan && typeof slogan === 'string' && slogan.length > MAX_TEXT_LENGTH) {
      return NextResponse.json({ error: 'Slogan is te lang (max 5000 tekens)' }, { status: 400 });
    }

    const copy = generateFlyerCopy(spec || 'Lokaal bedrijf', bedrijfsnaam || '');

    return NextResponse.json({
      tekst: copy.tekst,
      usp: copy.usps.join('\n'),
      headline: copy.headline,
      cta: copy.cta,
    });
  } catch (error) {
    console.error('AI route error:', error);
    return NextResponse.json({ error: 'Tekst generatie mislukt' }, { status: 500 });
  }
}
