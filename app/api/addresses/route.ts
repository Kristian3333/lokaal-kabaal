import { NextRequest, NextResponse } from 'next/server';
import { isValidPc4List } from '@/lib/validation';
import { requireAuth } from '@/lib/auth';

const ALTUM_API_KEY = process.env.ALTUM_API_KEY;
const ALTUM_BASE_URL = 'https://api.altum.ai/v1';

interface AltumAddress {
  id: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  transactionDate?: string;
  propertyValue?: number;
}

function generateMockAddresses(count: number, postcodes: string[]): AltumAddress[] {
  const streets = ['Kerkstraat', 'Hoofdstraat', 'Dorpsstraat', 'Molenweg', 'Laan van Meerdervoort', 'Nieuwstraat', 'Marktstraat', 'Schoolstraat', 'Wilhelminastraat', 'Julianastraat'];
  const cities = ['Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag', 'Eindhoven', 'Haarlem', 'Leiden'];
  const n = Math.min(count, 500);
  const basePostcodes = postcodes.length > 0 ? postcodes : ['1012', '3512', '2511'];

  // One month ago
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  return Array.from({ length: n }, (_, i) => {
    const txDate = new Date(oneMonthAgo);
    txDate.setDate(1 + (i % 28));
    return {
      id: `mock-${i}`,
      street: streets[i % streets.length],
      houseNumber: String((i % 200) + 1),
      postalCode: basePostcodes[i % basePostcodes.length] + ' ' + String.fromCharCode(65 + (i % 26)) + String.fromCharCode(65 + ((i + 3) % 26)),
      city: cities[i % cities.length],
      transactionDate: txDate.toISOString().split('T')[0],
      propertyValue: 250000 + (i * 7777) % 500000,
    };
  });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  try {
    const body = await req.json();
    const { postcodes = [], maxAantal = 500, maand } = body;

    // Validate postcodes
    if (postcodes.length > 0 && !isValidPc4List(postcodes)) {
      return NextResponse.json({ error: 'Ongeldige postcodes (verwacht 4-cijferige postcodes)' }, { status: 400 });
    }

    // Determine date filter: use provided maand or last 60 days
    let afterDate: string;
    if (maand) {
      // maand is like "2026-04-01", we want transactions from that month onwards
      afterDate = maand;
    } else {
      const d = new Date();
      d.setDate(d.getDate() - 60);
      afterDate = d.toISOString().split('T')[0];
    }

    if (!ALTUM_API_KEY) {
      // No API key configured -- return mock data
      const mock = generateMockAddresses(maxAantal, postcodes);
      return NextResponse.json({ addresses: mock, count: mock.length, mock: true });
    }

    try {
      const response = await fetch(`${ALTUM_BASE_URL}/transactions/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ALTUM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postal_codes: postcodes,
          filters: {
            transaction_date: { after: afterDate },
          },
          limit: Math.min(maxAantal, 500),
        }),
        signal: AbortSignal.timeout(12000),
      });

      if (!response.ok) {
        throw new Error(`Altum API ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      const addresses: AltumAddress[] = (data.transactions || data.addresses || []).map((t: Record<string, unknown>) => ({
        id: String(t.id || t.transaction_id || Math.random()),
        street: String(t.street || t.straat || ''),
        houseNumber: String(t.house_number || t.huisnummer || ''),
        postalCode: String(t.postal_code || t.postcode || ''),
        city: String(t.city || t.stad || ''),
        transactionDate: String(t.transaction_date || t.datum || ''),
        propertyValue: Number(t.transaction_price || t.prijs || 0),
      }));

      return NextResponse.json({ addresses, count: addresses.length });
    } catch (apiError) {
      console.error('Altum API error, falling back to mock:', apiError);
      const mock = generateMockAddresses(maxAantal, postcodes);
      return NextResponse.json({ addresses: mock, count: mock.length, mock: true, error: String(apiError) });
    }
  } catch (error) {
    console.error('Addresses route error:', error);
    return NextResponse.json({ error: 'Adressen ophalen mislukt' }, { status: 500 });
  }
}
