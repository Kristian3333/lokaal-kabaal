import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// ─── POST /api/printone/template ────────────────────────────────────────────
// Neemt flyer design data van de builder en maakt een Print.one template aan
// met merge variable placeholders ({{qr_url}}, {{code}}, {{adres}}, etc.).
// Geeft templateId terug voor opslag in campaigns.flyerTemplateId.

const PRINTONE_BASE = 'https://api.print.one/v2';
const PRINTONE_KEY = process.env.PRINTONE_API_KEY ?? '';

const FORMAAT_MAP: Record<string, string> = {
  a6: 'POSTCARD_A6',
  a5: 'POSTCARD_A5',
  sq: 'POSTCARD_A5',
};

// Print-afmetingen per formaat (incl. 3mm bleed)
const PRINT_CONFIG: Record<string, {
  mmW: number; mmH: number;
  previewW: number; previewH: number;
  scale: number;
}> = {
  a6: { mmW: 111, mmH: 154, previewW: 167, previewH: 231, scale: 397 / 167 },
  a5: { mmW: 154, mmH: 216, previewW: 231, previewH: 324, scale: 559 / 231 },
  sq: { mmW: 154, mmH: 154, previewW: 231, previewH: 231, scale: 559 / 231 },
};

// ─── Flyer HTML met merge variable placeholders ─────────────────────────────

function buildTemplateHTML(d: {
  bedrijfsnaam: string;
  logoUrl: string | null;
  heroImageUrl: string | null;
  primairKleur: string;
  accentKleur: string;
  headline: string;
  bodytekst: string;
  usps: string[];
  cta: string;
  telefoon?: string;
  email?: string;
  website?: string;
  formaat: string;
}): string {
  const rgb = hexToRgb(d.primairKleur);
  const luminantie = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  const tekstKleur = luminantie > 0.5 ? '#0A0A0A' : '#FFFFFF';
  const mutedKleur = luminantie > 0.5 ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';

  const cfg = PRINT_CONFIG[d.formaat] ?? PRINT_CONFIG.a6;

  // QR code URL met merge variable -- Print.one vervangt {{qr_url}} per order
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={{qr_url}}&bgcolor=ffffff&color=0a0a0a&margin=2`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{
    width:${cfg.mmW}mm;height:${cfg.mmH}mm;
    background:${d.primairKleur};
    font-family:'Manrope',sans-serif;
    overflow:hidden;
    position:relative;
  }
  .accent-bar{position:absolute;top:0;left:0;right:0;height:1.5mm;background:${d.accentKleur}}
  .flyer{width:100%;height:100%;display:flex;flex-direction:column;padding:9mm 9mm 7mm}
  .header{display:flex;align-items:center;gap:4mm;padding-bottom:5mm;border-bottom:0.4mm solid ${d.accentKleur}55;margin-bottom:5mm}
  .logo{max-height:14mm;max-width:42mm;height:auto;width:auto;object-fit:contain;display:block}
  .bedrijfsnaam{font-size:15pt;font-weight:800;color:${tekstKleur};line-height:1.1}
  .branche-badge{
    display:inline-block;background:${d.accentKleur};color:#0A0A0A;
    font-size:6.5pt;font-weight:700;font-family:'DM Mono',monospace;
    letter-spacing:.08em;text-transform:uppercase;
    padding:1mm 2.5mm;border-radius:.3mm;margin-bottom:3.5mm
  }
  .hero{width:100%;height:48mm;object-fit:cover;border-radius:1mm;margin-bottom:4.5mm;display:block}
  .hero-placeholder{width:100%;height:48mm;background:${d.accentKleur}22;border-radius:1mm;margin-bottom:4.5mm}
  .headline{font-size:17pt;font-weight:800;color:${tekstKleur};line-height:1.2;margin-bottom:3mm}
  .bodytekst{font-size:8.5pt;color:${mutedKleur};line-height:1.7;margin-bottom:4mm;flex:1}
  .usps{display:flex;flex-direction:column;gap:1.5mm;margin-bottom:5mm}
  .usp{display:flex;align-items:center;gap:2mm;font-size:8pt;color:${tekstKleur};font-weight:600}
  .dot{width:1.8mm;height:1.8mm;background:${d.accentKleur};border-radius:50%;flex-shrink:0}
  .footer{border-top:.4mm solid ${d.accentKleur}33;padding-top:3mm;display:flex;justify-content:space-between;align-items:flex-end}
  .contact{font-size:7pt;color:${mutedKleur};line-height:1.8;font-family:'DM Mono',monospace}
  .watermark{font-size:5.5pt;color:${mutedKleur};font-family:'DM Mono',monospace;opacity:.4}
  .qr-section{position:absolute;bottom:8mm;right:8mm;display:flex;flex-direction:column;align-items:center;gap:1.5mm}
  .qr-code{width:18mm;height:18mm}
  .qr-label{font-size:5.5pt;color:${mutedKleur};font-family:'DM Mono',monospace;text-align:center;letter-spacing:.04em}
  .adres-block{margin-top:3mm;padding:2.5mm 3mm;background:${d.accentKleur}18;border-left:1.5mm solid ${d.accentKleur};border-radius:.5mm}
</style>
<script>
(function(){
  var logo = document.querySelector('.logo');
  if(!logo) return;
  function adapt(){
    var w = logo.naturalWidth, h = logo.naturalHeight;
    if(!w || !h) return;
    if(w/h > 2.2){
      logo.style.height='10mm'; logo.style.width='auto'; logo.style.maxWidth='42mm'; logo.style.borderRadius='0';
    } else {
      logo.style.height='14mm'; logo.style.width='14mm'; logo.style.maxWidth='14mm'; logo.style.borderRadius='1.5mm';
    }
  }
  if(logo.complete && logo.naturalWidth){ adapt(); } else { logo.addEventListener('load', adapt); }
})();
</script>
</head>
<body>
<div class="accent-bar"></div>
<div class="flyer">
  <div class="header">
    ${d.logoUrl ? `<img class="logo" src="${d.logoUrl}"/>` : ''}
    <div class="bedrijfsnaam">${d.bedrijfsnaam}</div>
  </div>
  <div class="branche-badge">Welkom in uw nieuwe wijk</div>
  ${d.heroImageUrl
    ? `<img class="hero" src="${d.heroImageUrl}"/>`
    : `<div class="hero-placeholder"></div>`
  }
  <div class="headline">${d.headline}</div>
  <div class="bodytekst">${d.bodytekst}</div>
  <div class="usps">
    ${d.usps.map(u => `<div class="usp"><div class="dot"></div>${u}</div>`).join('')}
  </div>
  <div class="adres-block">
    <div style="font-size:7pt;color:${tekstKleur};font-weight:700;margin-bottom:.5mm">Speciaal voor de nieuwe bewoners van</div>
    <div style="font-size:8pt;color:${tekstKleur};font-family:'DM Mono',monospace;font-weight:500">{{adres}}, {{postcode}} {{stad}}</div>
    <div style="font-size:6.5pt;color:${mutedKleur};margin-top:1mm">Eenmalig inwisselbaar</div>
  </div>
  <div class="footer">
    <div class="contact">
      ${d.telefoon ? `${d.telefoon}<br/>` : ''}
      ${d.email ? `${d.email}<br/>` : ''}
      ${d.website ? `${d.website}` : ''}
    </div>
    <div class="watermark">lokaalkabaal.agency</div>
  </div>
</div>
<div class="qr-section">
  <img class="qr-code" src="${qrImageSrc}" alt="Scan voor verificatie"/>
  <div class="qr-label">Scan bij kassa</div>
  <div class="qr-label" style="opacity:.5">{{code}}</div>
</div>
</body>
</html>`;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  if (h.length === 6) {
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  return [255, 255, 255];
}

// ─── Achterkant met retouradres ─────────────────────────────────────────────

function buildBackHTML(sender: { name: string; address: string; postalCode: string; city: string; formaat: string }): string {
  const cfg = PRINT_CONFIG[sender.formaat] ?? PRINT_CONFIG.a6;
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&family=DM+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{width:${cfg.mmW}mm;height:${cfg.mmH}mm;background:#fff;font-family:'Manrope',sans-serif;overflow:hidden}
  .back{width:100%;height:100%;padding:24px;display:flex;flex-direction:column;justify-content:flex-end}
  .label{font-size:11px;color:#999;margin:0 0 8px;font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:0.08em}
  .name{font-size:13px;font-weight:700;margin:0 0 4px;color:#333}
  .addr{font-size:11px;margin:0;color:#666}
</style>
</head>
<body>
<div class="back">
  <p class="label">Retouradres</p>
  <p class="name">${sender.name}</p>
  <p class="addr">${sender.address}, ${sender.postalCode} ${sender.city}</p>
</div>
</body>
</html>`;
}

// ─── Wrap HTML voor Print.one rendering ─────────────────────────────────────

function wrapForPrint(rawHtml: string, formaat: string): string {
  const cfg = PRINT_CONFIG[formaat] ?? PRINT_CONFIG.a6;
  // Preserve original <head> contents (font @import, CSS rules) so the
  // wrapped document doesn't render unstyled. Earlier versions only
  // captured the body innerHTML and dropped every style rule, which made
  // PrintOne render the flyer as a tiny pile of unstyled text.
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const headContent = headMatch ? headMatch[1] : '';
  const bodyContent = bodyMatch ? bodyMatch[1] : rawHtml;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${headContent}
  <style>
    /* Print canvas: PrintOne renders the document at the postcard's
     * physical dimensions (incl. 3mm bleed). Using mm here -- not px --
     * means the rendered output matches the paper size regardless of the
     * rendering DPI on PrintOne's side. */
    html, body {
      width: ${cfg.mmW}mm;
      height: ${cfg.mmH}mm;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
  </style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;
}

// ─── Print.one API call ─────────────────────────────────────────────────────

async function po<T>(path: string, method = 'GET', body?: unknown): Promise<{ ok: boolean; status: number; data: T }> {
  const res = await fetch(`${PRINTONE_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-api-key': PRINTONE_KEY },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data: data as T };
}

// ─── Handler ────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const authResult = requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  if (!PRINTONE_KEY) {
    return NextResponse.json({ error: 'PRINTONE_API_KEY niet geconfigureerd' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const {
      bedrijfsnaam,
      logoUrl,
      heroImageUrl,
      primairKleur,
      accentKleur,
      headline,
      bodytekst,
      usps,
      cta,
      telefoon,
      email,
      website,
      formaat = 'a6',
      // Afzender
      senderName,
      senderAddress,
      senderPostalCode,
      senderCity,
    } = body;

    if (!bedrijfsnaam || !headline) {
      return NextResponse.json(
        { error: 'bedrijfsnaam en headline zijn verplicht' },
        { status: 400 },
      );
    }

    const format = FORMAAT_MAP[formaat] ?? 'POSTCARD_A6';

    // Bouw de template HTML met merge variable placeholders
    const voorkantHtml = buildTemplateHTML({
      bedrijfsnaam,
      logoUrl: logoUrl || null,
      heroImageUrl: heroImageUrl || null,
      primairKleur: primairKleur || '#0A0A0A',
      accentKleur: accentKleur || '#00E87A',
      headline,
      bodytekst: bodytekst || '',
      usps: usps || [],
      cta: cta || 'Kom langs',
      telefoon,
      email,
      website,
      formaat,
    });

    const achterkantHtml = buildBackHTML({
      name: senderName || bedrijfsnaam,
      address: senderAddress || 'Postbus 1000',
      postalCode: senderPostalCode || '1000 AA',
      city: senderCity || 'Amsterdam',
      formaat,
    });

    // Wrap voor Print.one rendering
    const voorkant = wrapForPrint(voorkantHtml, formaat);
    const achterkant = wrapForPrint(achterkantHtml, formaat);

    // Maak template aan bij Print.one
    const result = await po<{ id?: string; message?: string[] }>('/templates', 'POST', {
      name: `${bedrijfsnaam} - LokaalKabaal - ${new Date().toISOString().slice(0, 10)}`,
      format,
      labels: ['lokaalkabaal'],
      pages: [
        { content: voorkant },
        { content: achterkant },
      ],
    });

    if (!result.ok) {
      const msg = Array.isArray(result.data.message)
        ? result.data.message.join(', ')
        : String(result.data.message ?? 'template aanmaken mislukt');
      return NextResponse.json({ error: `Print.one fout: ${msg}` }, { status: 422 });
    }

    return NextResponse.json({
      templateId: result.data.id,
      mergeVariables: ['qr_url', 'code', 'adres', 'postcode', 'stad'],
    });
  } catch (err) {
    console.error('[printone/template] fout:', err);
    return NextResponse.json({ error: 'Interne fout bij aanmaken template.' }, { status: 500 });
  }
}
