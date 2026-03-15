import { NextRequest, NextResponse } from 'next/server';

// Valideert een Nederlands adres via PDOK BAG (Basisregistraties Adressen en Gebouwen)
// Geeft een genormaliseerd adres terug of suggesties bij geen exacte match

const PDOK = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/free';

interface BagDoc {
  weergavenaam: string;
  postcode?: string;
  straatnaam?: string;
  huisnummer?: number;
  huisletter?: string;
  huisnummertoevoeging?: string;
  woonplaatsnaam?: string;
}

export async function GET(req: NextRequest) {
  const adres = req.nextUrl.searchParams.get('adres')?.trim();
  if (!adres || adres.length < 6) {
    return NextResponse.json({ valid: false, error: 'Adres te kort' });
  }

  try {
    const url = `${PDOK}?q=${encodeURIComponent(adres)}&fq=type:adres&rows=5&fl=weergavenaam,postcode,straatnaam,huisnummer,huisletter,huisnummertoevoeging,woonplaatsnaam`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    const data = await res.json();
    const docs: BagDoc[] = data?.response?.docs ?? [];

    if (docs.length === 0) {
      return NextResponse.json({ valid: false, error: 'Adres niet gevonden in BAG', suggesties: [] });
    }

    // Exacte match: eerste resultaat heeft hoge score
    const best = docs[0];
    const straat = best.straatnaam ?? '';
    const nr = best.huisnummer ? String(best.huisnummer) : '';
    const letter = best.huisletter ?? '';
    const toev = best.huisnummertoevoeging ?? '';
    const pc = best.postcode ?? '';
    const stad = best.woonplaatsnaam ?? '';

    const genormaliseerd = {
      adresRegel: `${straat} ${nr}${letter}${toev ? ' ' + toev : ''}`.trim(),
      postcode: pc.replace(/\s/g, ''),
      stad,
      volledig: best.weergavenaam,
    };

    // Check of het ingevoerde adres redelijk overeenkomt (postcode of straat in de query)
    const queryLower = adres.toLowerCase();
    const postcodeInQuery = pc && queryLower.includes(pc.replace(/\s/g, '').toLowerCase().slice(0, 4));
    const straatInQuery = straat && queryLower.includes(straat.toLowerCase().slice(0, 5));

    if (!postcodeInQuery && !straatInQuery) {
      return NextResponse.json({
        valid: false,
        error: 'Adres niet herkend',
        suggesties: docs.slice(0, 3).map(d => d.weergavenaam),
      });
    }

    return NextResponse.json({
      valid: true,
      genormaliseerd,
      suggesties: docs.slice(1, 4).map(d => d.weergavenaam),
    });

  } catch (err) {
    console.error('[validate]', err);
    return NextResponse.json({ valid: false, error: 'Validatie tijdelijk niet beschikbaar' });
  }
}
