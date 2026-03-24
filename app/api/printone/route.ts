import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// ─── Print.one API v2 integration ────────────────────────────────────────────
const PRINTONE_BASE = 'https://api.print.one/v2';
// Stel PRINTONE_API_KEY in als omgevingsvariabele in Vercel (Settings → Environment Variables)
const PRINTONE_KEY = process.env.PRINTONE_API_KEY ?? '';

const FORMAAT_MAP: Record<string, string> = {
  a6: 'POSTCARD_A6',
  a5: 'POSTCARD_A5',
  sq: 'POSTCARD_A5', // vierkant valt terug op A5 canvas
};

// ─── Print-afmetingen per formaat ────────────────────────────────────────────
//
// print.one rendert HTML bij 96dpi (1mm = 3.7795px).
// De LokaalKabaal preview gebruikt 1.5px/mm (SCREEN_SCALE).
// Preview-breedte incl. 3mm bleed:
//   a6: 111mm × 1.5 = 166.5 → 167px
//   a5: 154mm × 1.5 = 231px
//   sq: 154mm × 1.5 = 231px
// Print-canvas bij 96dpi (trim zonder bleed):
//   a6: 105mm × 3.7795 = 396.8 ≈ 397px
//   a5: 148mm × 3.7795 = 559.4 ≈ 559px
// Schaalfactor = print-breedte / preview-breedte

const PRINT_CONFIG: Record<string, {
  mmW: number; mmH: number;       // mm incl. bleed
  previewW: number; previewH: number; // screen preview px
  scale: number;                  // transform scale voor print.one
}> = {
  a6: { mmW: 111, mmH: 154, previewW: 167, previewH: 231, scale: 397 / 167 },  // ≈ 2.377
  a5: { mmW: 154, mmH: 216, previewW: 231, previewH: 324, scale: 559 / 231 },  // ≈ 2.420
  sq: { mmW: 154, mmH: 154, previewW: 231, previewH: 231, scale: 559 / 231 },  // ≈ 2.420
};

// ─── CSS variabelen & fonts -- zelfde als globals.css ─────────────────────────
const BASE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&family=Manrope:wght@400;600;700;800&display=swap');

:root {
  --ink: #0A0A0A;
  --paper: #F5F3EF;
  --paper2: #EDEBE6;
  --line: #D8D4CC;
  --muted: #8A8479;
  --green: #00E87A;
  --green-dim: #00B85F;
  --red: #FF3B3B;
  --white: #FFFFFF;
  --radius: 2px;
  --font-serif: 'Instrument Serif', Georgia, serif;
  --font-mono: 'DM Mono', monospace;
  --font-sans: 'Manrope', sans-serif;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
`;

// ─── Wrap flyer-HTML zodat hij correct schaalt op het print-canvas ────────────
//
// print.one rendert de HTML in een headless browser op het formaat-canvas (in mm).
// De preview-HTML is gesized in scherm-pixels. We wikkelen de content in een div
// met de preview-afmetingen en passen transform:scale() toe zodat hij de volledige
// print-pagina vult.

function sanitizeContent(html: string): string {
  // Verwijder <img> tags met lege, data:, of blob: src -- dit veroorzaakt
  // de "resource at data:, could not be loaded" fout in print.one
  return html
    .replace(/<img\b([^>]*?)\bsrc=(["'])(?:|data:,|blob:[^"']*)\2([^>]*?)>/gi, '')
    .replace(/<img\b([^>]*)src=["']\s*["']([^>]*)>/gi, '');
}

function wrapForPrint(rawHtml: string, formaat: string): string {
  const cfg = PRINT_CONFIG[formaat] ?? PRINT_CONFIG.a6;

  // Extraheer body-content als rawHtml een volledig document is
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let content = bodyMatch ? bodyMatch[1] : rawHtml;

  // Sanitize: verwijder lege afbeeldingsreferenties
  content = sanitizeContent(content);

  const scale = cfg.scale.toFixed(4);

  // Schaalstrategie:
  // 1. viewport meta width = previewW → Chromium rendert alsof canvas previewW px breed is
  // 2. html/body op previewW×previewH px zodat content exact past
  // 3. zoom op .lk-wrap als fallback voor renderers die viewport meta negeren
  // Print.one schaalt het resultaat dan naar de mm-afmeting van het formaat
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=${cfg.previewW}, initial-scale=1.0">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&family=Manrope:wght@400;600;700;800&display=swap">
  <style>
    :root {
      --ink: #0A0A0A; --paper: #F5F3EF; --paper2: #EDEBE6;
      --line: #D8D4CC; --muted: #8A8479;
      --green: #00E87A; --green-dim: #00B85F;
      --red: #FF3B3B; --white: #FFFFFF; --radius: 2px;
      --font-serif: 'Instrument Serif', Georgia, serif;
      --font-mono: 'DM Mono', monospace;
      --font-sans: 'Manrope', sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: ${cfg.previewW}px;
      height: ${cfg.previewH}px;
      overflow: hidden;
      font-family: var(--font-sans);
      -webkit-font-smoothing: antialiased;
    }
    /* zoom schaalt layout mee (anders dan transform:scale) */
    .lk-wrap {
      width: ${cfg.previewW}px;
      height: ${cfg.previewH}px;
      zoom: ${scale};
      transform-origin: top left;
    }
  </style>
</head>
<body>
  <div class="lk-wrap">
    ${content}
  </div>
</body>
</html>`;
}

// ─── Achterkant standaard (adresblok) ────────────────────────────────────────
function defaultBack(sender: { name: string; address: string; postalCode: string; city: string }, formaat: string): string {
  const cfg = PRINT_CONFIG[formaat] ?? PRINT_CONFIG.a6;
  const backContent = `
    <div style="width:${cfg.previewW}px;height:${cfg.previewH}px;background:#fff;font-family:sans-serif;padding:24px;color:#333;display:flex;flex-direction:column;justify-content:flex-end">
      <p style="font-size:11px;color:#999;margin:0 0 8px;font-family:monospace;text-transform:uppercase;letter-spacing:0.08em">Retouradres</p>
      <p style="font-size:13px;font-weight:700;margin:0 0 4px">${sender.name}</p>
      <p style="font-size:11px;margin:0;color:#666">${sender.address}, ${sender.postalCode} ${sender.city}</p>
    </div>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    ${BASE_CSS}
    html, body {
      width: ${cfg.mmW}mm;
      height: ${cfg.mmH}mm;
      overflow: hidden;
    }
    .lk-scale-wrap {
      width: ${cfg.previewW}px;
      height: ${cfg.previewH}px;
      transform-origin: top left;
      transform: scale(${cfg.scale.toFixed(4)});
      position: absolute;
      top: 0;
      left: 0;
    }
  </style>
</head>
<body>
  <div class="lk-scale-wrap">${backContent}</div>
</body>
</html>`;
}

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

// ─── POST /api/printone -- maak template + order aan ──────────────────────────
export async function POST(req: NextRequest) {
  const authResult = requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await req.json();
    const {
      flyerHtml,          // HTML voorkant (van LokaalKabaal preview)
      backHtml,           // HTML achterkant (optioneel)
      formaat = 'a6',
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

    const format = FORMAAT_MAP[formaat] ?? 'POSTCARD_A6';

    // Wrap HTML voor correcte schaling op het print-canvas
    const voorkant = wrapForPrint(flyerHtml, formaat);
    const achterkant = backHtml
      ? wrapForPrint(backHtml, formaat)
      : defaultBack(sender, formaat);

    // ── Stap 1: Maak een template aan ────────────────────────────────────────
    const tmplResult = await po<{ id: string; message?: string[] }>('/templates', 'POST', {
      name: templateNaam || `LokaalKabaal – ${new Date().toISOString().slice(0, 10)}`,
      format,
      labels: ['lokaalkabaal'],
      pages: [
        { content: voorkant },
        { content: achterkant },
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

// ─── GET /api/printone?orderId=xxx -- check order status ───────────────────
export async function GET(req: NextRequest) {
  const authResult = requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

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
