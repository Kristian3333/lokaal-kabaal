import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaigns, retailers } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// ─── POST /api/campaigns ────────────────────────────────────────────────────
// Slaat een nieuwe campagne op in de database en maakt een Print.one template aan.
// Wordt aangeroepen vanuit de frontend na succesvolle Stripe betaling.
//
// Accepteert twee lookup-methoden voor de retailer:
// - stripeSessionId → haalt retailer op via Stripe customer email
// - retailerId → directe lookup

const PRINTONE_BASE = 'https://api.print.one/v2';
const PRINTONE_KEY = process.env.PRINTONE_API_KEY ?? '';

export async function POST(req: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'DATABASE_URL niet geconfigureerd' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const {
      // Retailer lookup
      email,                // email van de ingelogde gebruiker
      // Campagne data
      naam,
      branche,
      centrum,
      straalKm = 5,
      pc4Lijst,
      formaat = 'a6',
      dubbelzijdig = false,
      verwachtAantalPerMaand = 300,
      duurMaanden = 1,
      startMaand,
      stripeSessionId,
      // Flyer design data (voor Print.one template)
      flyerDesign,
    } = body;

    if (!email || !branche || !centrum || !startMaand) {
      return NextResponse.json(
        { error: 'Verplichte velden ontbreken: email, branche, centrum, startMaand' },
        { status: 400 },
      );
    }

    // Haal retailer op via email
    const retailerRows = await db
      .select()
      .from(retailers)
      .where(eq(retailers.email, email))
      .limit(1);
    const retailer = retailerRows[0];
    if (!retailer) {
      return NextResponse.json({ error: 'Retailer niet gevonden voor dit e-mailadres' }, { status: 404 });
    }

    // Bereken einddatum
    const start = new Date(startMaand);
    const eind = new Date(start);
    eind.setMonth(eind.getMonth() + (duurMaanden - 1));
    const eindMaand = eind.toISOString().slice(0, 10);

    // Print.one template aanmaken als flyer design meegegeven
    let flyerTemplateId: string | undefined;

    if (flyerDesign && PRINTONE_KEY) {
      flyerTemplateId = await createPrintoneTemplate({
        ...flyerDesign,
        bedrijfsnaam: flyerDesign.bedrijfsnaam || retailer.bedrijfsnaam,
        formaat,
      }) ?? undefined;
    }

    // Campagne in DB opslaan
    const [campagne] = await db.insert(campaigns).values({
      retailerId: retailer.id,
      naam: naam || `${branche} campagne`,
      branche,
      centrum,
      straalKm: String(straalKm),
      pc4Lijst: Array.isArray(pc4Lijst) ? pc4Lijst.join(',') : (pc4Lijst || ''),
      formaat,
      dubbelzijdig,
      flyerTemplateId,
      verwachtAantalPerMaand,
      duurMaanden,
      startMaand,
      eindMaand,
      status: 'actief',
    }).returning();

    console.log(`[campaigns] campagne aangemaakt: ${campagne.id} (template: ${flyerTemplateId ?? 'geen'})`);

    return NextResponse.json({
      id: campagne.id,
      flyerTemplateId: flyerTemplateId ?? null,
      status: campagne.status,
    });
  } catch (err) {
    console.error('[campaigns] fout:', err);
    return NextResponse.json({ error: 'Interne fout bij aanmaken campagne.' }, { status: 500 });
  }
}

// ─── Print.one template aanmaken (direct, zonder self-call) ─────────────────

async function createPrintoneTemplate(design: {
  bedrijfsnaam: string;
  logoUrl?: string;
  heroImageUrl?: string;
  primairKleur?: string;
  accentKleur?: string;
  headline?: string;
  bodytekst?: string;
  usps?: string[];
  cta?: string;
  telefoon?: string;
  email?: string;
  website?: string;
  formaat?: string;
}): Promise<string | null> {
  try {
    const res = await fetch(`${PRINTONE_BASE}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': PRINTONE_KEY },
      body: JSON.stringify({
        name: `${design.bedrijfsnaam} — LokaalKabaal — ${new Date().toISOString().slice(0, 10)}`,
        format: design.formaat === 'a6' ? 'POSTCARD_A6' : 'POSTCARD_A5',
        labels: ['lokaalkabaal'],
        pages: [
          { content: buildTemplateHTML(design) },
          { content: buildBackHTML(design.bedrijfsnaam) },
        ],
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.warn('[campaigns] Print.one template mislukt:', data);
      return null;
    }

    const data = await res.json();
    return data.id ?? null;
  } catch (err) {
    console.warn('[campaigns] Print.one template call mislukt:', err);
    return null;
  }
}

// ─── Template HTML met merge variable placeholders ──────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = (hex || '#0A0A0A').replace('#', '');
  if (h.length === 6) return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  return [10, 10, 10];
}

function buildTemplateHTML(d: {
  bedrijfsnaam: string;
  logoUrl?: string;
  heroImageUrl?: string;
  primairKleur?: string;
  accentKleur?: string;
  headline?: string;
  bodytekst?: string;
  usps?: string[];
  cta?: string;
  telefoon?: string;
  email?: string;
  website?: string;
}): string {
  const pk = d.primairKleur || '#0A0A0A';
  const ak = d.accentKleur || '#00E87A';
  const rgb = hexToRgb(pk);
  const lum = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  const tk = lum > 0.5 ? '#0A0A0A' : '#FFFFFF';
  const mk = lum > 0.5 ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={{qr_url}}&bgcolor=ffffff&color=0a0a0a&margin=2`;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{width:148mm;height:210mm;background:${pk};font-family:'Manrope',sans-serif;overflow:hidden;position:relative}
.accent-bar{position:absolute;top:0;left:0;right:0;height:1.5mm;background:${ak}}
.flyer{width:100%;height:100%;display:flex;flex-direction:column;padding:9mm 9mm 7mm}
.header{display:flex;align-items:center;gap:4mm;padding-bottom:5mm;border-bottom:0.4mm solid ${ak}55;margin-bottom:5mm}
.logo{max-height:14mm;max-width:42mm;height:auto;width:auto;object-fit:contain}
.bedrijfsnaam{font-size:15pt;font-weight:800;color:${tk};line-height:1.1}
.badge{display:inline-block;background:${ak};color:#0A0A0A;font-size:6.5pt;font-weight:700;font-family:'DM Mono',monospace;letter-spacing:.08em;text-transform:uppercase;padding:1mm 2.5mm;border-radius:.3mm;margin-bottom:3.5mm}
.hero{width:100%;height:48mm;object-fit:cover;border-radius:1mm;margin-bottom:4.5mm}
.hero-ph{width:100%;height:48mm;background:${ak}22;border-radius:1mm;margin-bottom:4.5mm}
.headline{font-size:17pt;font-weight:800;color:${tk};line-height:1.2;margin-bottom:3mm}
.body{font-size:8.5pt;color:${mk};line-height:1.7;margin-bottom:4mm;flex:1}
.usps{display:flex;flex-direction:column;gap:1.5mm;margin-bottom:5mm}
.usp{display:flex;align-items:center;gap:2mm;font-size:8pt;color:${tk};font-weight:600}
.dot{width:1.8mm;height:1.8mm;background:${ak};border-radius:50%;flex-shrink:0}
.adr{margin-top:3mm;padding:2.5mm 3mm;background:${ak}18;border-left:1.5mm solid ${ak};border-radius:.5mm}
.footer{border-top:.4mm solid ${ak}33;padding-top:3mm;display:flex;justify-content:space-between;align-items:flex-end}
.contact{font-size:7pt;color:${mk};line-height:1.8;font-family:'DM Mono',monospace}
.wm{font-size:5.5pt;color:${mk};font-family:'DM Mono',monospace;opacity:.4}
.qr{position:absolute;bottom:8mm;right:8mm;display:flex;flex-direction:column;align-items:center;gap:1.5mm}
.qr img{width:18mm;height:18mm}
.qr span{font-size:5.5pt;color:${mk};font-family:'DM Mono',monospace;text-align:center;letter-spacing:.04em}
</style></head><body>
<div class="accent-bar"></div>
<div class="flyer">
  <div class="header">
    ${d.logoUrl ? `<img class="logo" src="${d.logoUrl}"/>` : ''}
    <div class="bedrijfsnaam">${d.bedrijfsnaam}</div>
  </div>
  <div class="badge">Welkom in uw nieuwe wijk</div>
  ${d.heroImageUrl ? `<img class="hero" src="${d.heroImageUrl}"/>` : '<div class="hero-ph"></div>'}
  <div class="headline">${d.headline || d.bedrijfsnaam}</div>
  <div class="body">${d.bodytekst || ''}</div>
  <div class="usps">${(d.usps || []).map(u => `<div class="usp"><div class="dot"></div>${u}</div>`).join('')}</div>
  <div class="adr">
    <div style="font-size:7pt;color:${tk};font-weight:700;margin-bottom:.5mm">Speciaal voor de nieuwe bewoners van</div>
    <div style="font-size:8pt;color:${tk};font-family:'DM Mono',monospace;font-weight:500">{{adres}}, {{postcode}} {{stad}}</div>
    <div style="font-size:6.5pt;color:${mk};margin-top:1mm">Eenmalig inwisselbaar</div>
  </div>
  <div class="footer">
    <div class="contact">${[d.telefoon, d.email, d.website].filter(Boolean).join('<br/>')}</div>
    <div class="wm">lokaalkabaal.agency</div>
  </div>
</div>
<div class="qr">
  <img src="${qrSrc}" alt="QR"/>
  <span>Scan bij kassa</span>
  <span style="opacity:.5">{{code}}</span>
</div>
</body></html>`;
}

function buildBackHTML(bedrijfsnaam: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>*{box-sizing:border-box;margin:0;padding:0}body{width:148mm;height:210mm;background:#fff;font-family:sans-serif;overflow:hidden}
.b{width:100%;height:100%;padding:24px;display:flex;flex-direction:column;justify-content:flex-end}</style></head>
<body><div class="b">
<p style="font-size:11px;color:#999;margin:0 0 8px;font-family:monospace;text-transform:uppercase;letter-spacing:.08em">Retouradres</p>
<p style="font-size:13px;font-weight:700;margin:0 0 4px;color:#333">${bedrijfsnaam}</p>
<p style="font-size:11px;margin:0;color:#666">Postbus 1000, 1000 AA Amsterdam</p>
</div></body></html>`;
}

// ─── GET /api/campaigns?email=xxx ───────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'DATABASE_URL niet geconfigureerd' }, { status: 503 });
  }

  const email = req.nextUrl.searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'email query param verplicht' }, { status: 400 });
  }

  // Retailer opzoeken via email
  const retailerRows = await db
    .select()
    .from(retailers)
    .where(eq(retailers.email, email))
    .limit(1);

  if (retailerRows.length === 0) {
    return NextResponse.json([]);
  }

  const rows = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.retailerId, retailerRows[0].id));

  return NextResponse.json(rows);
}
