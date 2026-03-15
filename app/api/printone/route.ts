import { NextRequest, NextResponse } from 'next/server';

// ─── Print.one API v2 integration ────────────────────────────────────────────
const PRINTONE_BASE = 'https://api.print.one/v2';
const PRINTONE_KEY = 'test_ZNi3JfKJPmTr4zfuXLXnmXOIHknXtRma6bu4KLFcve5qooja';

const FORMAAT_MAP: Record<string, string> = {
  a6: 'POSTCARD_A6',
  a5: 'POSTCARD_A5',
  a4: 'POSTCARD_A5', // A4 niet beschikbaar, fallback naar A5
};

async function po<T>(path: string, method = 'GET', body?: unknown): Promise<{ ok: boolean; status: number; data: T }> {
  const res = await fetch(`${PRINTONE_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': PRINTONE_KEY,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data: data as T };
}

// ─── POST /api/printone — maak template + order aan ──────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      flyerHtml,          // HTML voorkant
      backHtml,           // HTML achterkant (altijd verplicht voor print.one)
      formaat = 'a5',
      finish = 'GLOSSY',
      recipient,          // { name, address, city, postalCode, country? }
      sender,             // { name, address, city, postalCode, country? }
      templateNaam,       // label voor het template
    } = body;

    if (!flyerHtml || !recipient || !sender) {
      return NextResponse.json(
        { error: 'Verplichte velden ontbreken: flyerHtml, recipient, sender' },
        { status: 400 }
      );
    }

    const format = FORMAAT_MAP[formaat] ?? 'POSTCARD_A5';

    // ── Stap 1: Maak een template aan met voor- en achterkant ──────────────
    const backContent = backHtml || `<html><body style="margin:0;background:#fff;font-family:sans-serif;padding:24px;color:#333">
      <p style="font-size:11px;color:#999;margin:0 0 8px;font-family:monospace">RETOURADRES</p>
      <p style="font-size:13px;font-weight:700;margin:0 0 4px">${sender.name}</p>
      <p style="font-size:11px;margin:0;color:#666">${sender.address}, ${sender.postalCode} ${sender.city}</p>
    </body></html>`;

    const tmplResult = await po<{ id: string; message?: string[] }>('/templates', 'POST', {
      name: templateNaam || `LokaalKabaal – ${new Date().toISOString().slice(0, 10)}`,
      format,
      labels: ['lokaalkabaal'],
      pages: [
        { content: flyerHtml },
        { content: backContent },
      ],
    });

    if (!tmplResult.ok) {
      const msg = Array.isArray(tmplResult.data.message)
        ? tmplResult.data.message.join(', ')
        : String(tmplResult.data.message ?? 'template aanmaken mislukt');
      return NextResponse.json({ error: `Print.one template fout: ${msg}` }, { status: 422 });
    }

    const templateId = tmplResult.data.id;

    // ── Stap 2: Plaats de order ────────────────────────────────────────────
    const orderResult = await po<{
      id?: string; status?: string; friendlyStatus?: string;
      sendDate?: string; isBillable?: boolean; errors?: string[];
      message?: string[];
    }>('/orders', 'POST', {
      templateId,
      finish,
      sender: {
        name: sender.name,
        address: sender.address,
        city: sender.city,
        postalCode: sender.postalCode,
        country: sender.country ?? 'NL',
      },
      recipient: {
        name: recipient.name,
        address: recipient.address,
        city: recipient.city,
        postalCode: recipient.postalCode,
        country: recipient.country ?? 'NL',
      },
    });

    if (!orderResult.ok) {
      const msg = Array.isArray(orderResult.data.message)
        ? orderResult.data.message.join(', ')
        : String(orderResult.data.message ?? 'order plaatsen mislukt');
      return NextResponse.json({ error: `Print.one order fout: ${msg}` }, { status: 422 });
    }

    return NextResponse.json({
      orderId: orderResult.data.id,
      templateId,
      status: orderResult.data.status,
      friendlyStatus: orderResult.data.friendlyStatus,
      sendDate: orderResult.data.sendDate,
      isBillable: orderResult.data.isBillable,
    });

  } catch (err) {
    console.error('[printone] fout:', err);
    return NextResponse.json({ error: 'Interne fout bij aanmaken printorder.' }, { status: 500 });
  }
}

// ─── GET /api/printone?orderId=xxx — check order status ───────────────────
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId');
  if (!orderId) return NextResponse.json({ error: 'orderId verplicht' }, { status: 400 });

  const result = await po<{
    id?: string; status?: string; friendlyStatus?: string;
    sendDate?: string; errors?: string[]; message?: string;
  }>(`/orders/${orderId}`);

  if (!result.ok) {
    return NextResponse.json(
      { error: `Order niet gevonden (HTTP ${result.status})` },
      { status: result.status }
    );
  }

  return NextResponse.json({
    orderId: result.data.id,
    status: result.data.status,
    friendlyStatus: result.data.friendlyStatus,
    sendDate: result.data.sendDate,
    errors: result.data.errors ?? [],
  });
}
