import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { generateVerificationCode, buildQRUrl, buildQRImageUrl } from '@/lib/verification';
import { db } from '@/lib/db';
import { flyerVerifications } from '@/lib/schema';
import { requireAuth } from '@/lib/auth';
import { generateFlyerCopy } from '@/lib/flyer-templates';
import { isValidExternalUrl } from '@/lib/validation';

export const maxDuration = 30;

// ---- Sub-function A: scrapeBasic ----
// Simple HTML extraction without Browserless or Anthropic

async function scrapeBasic(url: string): Promise<{
  kleuren: string[];
  logo: string | null;
  fotos: string[];
  h1: string;
  meta: string;
  scrapedOk: boolean;
  httpStatus?: number;
}> {
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

  try {
    const res = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'nl-NL,nl;q=0.9',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return { kleuren: [], logo: null, fotos: [], h1: '', meta: '', scrapedOk: false, httpStatus: res.status };
    }

    const html = await res.text();
    const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1]?.trim() || '';
    const meta =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim()
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1]?.trim()
      || '';

    // Extract OG image
    const ogImage =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1]
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1]
      || null;

    // Extract logo
    const logo =
      html.match(/<img[^>]+alt=["'][^"']*logo[^"']*["'][^>]+src=["']([^"']+)["']/i)?.[1]
      || html.match(/<img[^>]+src=["']([^"']+)["'][^>]+alt=["'][^"']*logo[^"']*["']/i)?.[1]
      || null;

    // Extract hex colors from HTML/CSS
    const hexMatches = html.match(/#[0-9a-fA-F]{6}\b/g) || [];
    const kleuren = hexMatches.map(hex => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgb(${r}, ${g}, ${b})`;
    });

    // Make relative URLs absolute
    const makeAbsolute = (urlStr: string | null): string | null => {
      if (!urlStr) return null;
      if (urlStr.startsWith('http')) return urlStr;
      try { return new URL(urlStr, normalizedUrl).href; } catch { return null; }
    };

    return {
      kleuren,
      logo: makeAbsolute(logo),
      fotos: ogImage ? [makeAbsolute(ogImage)].filter((u): u is string => u !== null) : [],
      h1,
      meta,
      scrapedOk: !!(h1 || meta),
    };
  } catch {
    return { kleuren: [], logo: null, fotos: [], h1: '', meta: '', scrapedOk: false, httpStatus: 0 };
  }
}

// ---- Color utilities ----

function cssRgbToRgb(css: string): [number, number, number] | null {
  const m = css.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s, l];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(n => Math.min(255, Math.max(0, n)).toString(16).padStart(2, '0')).join('');
}

const BROWSER_DEFAULTS = new Set([
  '0,0,240', '0,0,228', '0,0,252',
  '84,84,204', '84,0,168', '96,0,168',
  '0,0,0', '252,252,252', '240,240,240',
]);

function kleurenUitCSSArray(cssKleuren: string[]): { primair: string; accent: string } | null {
  if (!cssKleuren || cssKleuren.length === 0) return null;

  const uniek = new Map<string, { rgb: [number, number, number]; sat: number; lum: number; hue: number }>();
  for (const css of cssKleuren) {
    const rgb = cssRgbToRgb(css);
    if (!rgb) continue;
    const [r, g, b] = rgb;
    const key = `${Math.round(r / 12) * 12},${Math.round(g / 12) * 12},${Math.round(b / 12) * 12}`;
    if (uniek.has(key)) continue;
    if (BROWSER_DEFAULTS.has(key)) continue;
    const [hue, sat, lum] = rgbToHsl(r, g, b);
    uniek.set(key, { rgb, sat, lum, hue });
  }

  const merkKleuren = Array.from(uniek.values())
    .filter(c => {
      if (c.sat < 0.15 || c.lum <= 0.08 || c.lum >= 0.92) return false;
      if (c.hue > 225 && c.hue < 255 && c.sat > 0.85 && c.lum < 0.52) return false;
      if (c.hue > 265 && c.hue < 305 && c.sat > 0.75 && c.lum < 0.4) return false;
      return true;
    })
    .sort((a, b) => b.sat - a.sat);

  if (merkKleuren.length === 0) return null;

  const accentRgb = merkKleuren[0].rgb;
  const accent = rgbToHex(accentRgb[0], accentRgb[1], accentRgb[2]);

  const tweedeMerk = merkKleuren.find((c, i) => {
    if (i === 0) return false;
    const hueDiff = Math.abs(c.hue - merkKleuren[0].hue);
    const hueDistance = Math.min(hueDiff, 360 - hueDiff);
    return hueDistance > 30 || Math.abs(c.lum - merkKleuren[0].lum) > 0.25;
  });

  let primair: string;
  if (tweedeMerk) {
    const [r, g, b] = tweedeMerk.rgb;
    if (tweedeMerk.lum > 0.55) {
      primair = rgbToHex(Math.round(r * 0.45), Math.round(g * 0.45), Math.round(b * 0.45));
    } else {
      primair = rgbToHex(r, g, b);
    }
  } else {
    const [r, g, b] = accentRgb;
    primair = rgbToHex(Math.round(r * 0.18), Math.round(g * 0.18), Math.round(b * 0.18));
  }

  return { primair, accent };
}

// ---- Flyer HTML builder ----

function buildFlyerHTML(d: {
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
  qrUrl?: string;
  code?: string;
  adres?: string;
  postcode?: string;
  stad?: string;
  geldigTot?: Date;
}): string {
  const hex = (d.primairKleur || '#ffffff').replace('#', '');
  const rgb = hex.length === 6
    ? [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)]
    : [255, 255, 255];
  const luminantie = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  const tekstKleur = luminantie > 0.5 ? '#0A0A0A' : '#FFFFFF';
  const mutedKleur = luminantie > 0.5 ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{
    width:148mm;height:210mm;
    background:${d.primairKleur};
    font-family:'Manrope',sans-serif;
    overflow:hidden;
    position:relative;
  }
  .accent-bar{position:absolute;top:0;left:0;right:0;height:1.5mm;background:${d.accentKleur}}
  .flyer{width:100%;height:100%;display:flex;flex-direction:column;padding:9mm 9mm 7mm}
  .header{display:flex;align-items:center;gap:4mm;padding-bottom:5mm;border-bottom:0.4mm solid ${d.accentKleur}55;margin-bottom:5mm;overflow:hidden;min-width:0}
  .logo{max-height:14mm;max-width:36mm;height:auto;width:auto;object-fit:contain;display:block;flex-shrink:0}
  .bedrijfsnaam{font-size:15pt;font-weight:800;color:${tekstKleur};line-height:1.1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1}
  .branche-badge{
    display:inline-block;background:${d.accentKleur};color:#0A0A0A;
    font-size:6.5pt;font-weight:700;font-family:'DM Mono',monospace;
    letter-spacing:.08em;text-transform:uppercase;
    padding:1mm 2.5mm;border-radius:.3mm;margin-bottom:3.5mm
  }
  .hero{width:100%;height:48mm;object-fit:cover;border-radius:1mm;margin-bottom:4.5mm;display:block}
  .hero-placeholder{width:100%;height:48mm;background:${d.accentKleur}22;border-radius:1mm;margin-bottom:4.5mm}
  .headline{font-size:17pt;font-weight:800;color:${tekstKleur};line-height:1.2;margin-bottom:3mm;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;max-height:3.6em}
  .bodytekst{font-size:8.5pt;color:${mutedKleur};line-height:1.7;margin-bottom:4mm;flex:1;overflow:hidden;display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical}
  .usps{display:flex;flex-direction:column;gap:1.5mm;margin-bottom:5mm;overflow:hidden}
  .usp{display:flex;align-items:center;gap:2mm;font-size:8pt;color:${tekstKleur};font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .dot{width:1.8mm;height:1.8mm;background:${d.accentKleur};border-radius:50%;flex-shrink:0}
  .footer{border-top:.4mm solid ${d.accentKleur}33;padding-top:3mm;display:flex;justify-content:space-between;align-items:flex-end}
  .contact{font-size:7pt;color:${mutedKleur};line-height:1.8;font-family:'DM Mono',monospace;overflow:hidden;text-overflow:ellipsis;max-width:60mm}
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
  ${d.adres && d.code ? `
  <div class="adres-block">
    <div style="font-size:7pt;color:${tekstKleur};font-weight:700;margin-bottom:.5mm">Speciaal voor de nieuwe bewoners van</div>
    <div style="font-size:8pt;color:${tekstKleur};font-family:'DM Mono',monospace;font-weight:500">${d.adres}, ${d.postcode} ${d.stad}</div>
    <div style="font-size:6.5pt;color:${mutedKleur};margin-top:1mm">Geldig t/m ${d.geldigTot ? d.geldigTot.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }) : '30 dagen'} &middot; Eenmalig inwisselbaar</div>
  </div>` : ''}
  <div class="footer">
    <div class="contact">
      ${d.telefoon ? `${d.telefoon}<br/>` : ''}
      ${d.email ? `${d.email}<br/>` : ''}
      ${d.website ? `${d.website}` : ''}
    </div>
    <div class="watermark">lokaalkabaal.agency</div>
  </div>
</div>
${d.qrUrl && d.code ? `
<div class="qr-section">
  <img class="qr-code" src="${buildQRImageUrl(d.qrUrl)}" alt="Scan voor verificatie"/>
  <div class="qr-label">Scan bij kassa</div>
  <div class="qr-label" style="opacity:.5">${d.code}</div>
</div>` : ''}
</body>
</html>`;
}

// ---- PDF rendering via Browserless ----

async function renderPDF(html: string): Promise<Buffer | null> {
  const browserlessToken = process.env.BROWSERLESS_TOKEN;
  if (!browserlessToken) return null;

  try {
    const res = await fetch(
      `https://chrome.browserless.io/pdf?token=${browserlessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html,
          options: {
            format: 'A5',
            printBackground: true,
            margin: { top: '3mm', bottom: '3mm', left: '3mm', right: '3mm' },
          },
        }),
        signal: AbortSignal.timeout(15000),
      }
    );
    if (!res.ok) throw new Error(`Browserless PDF HTTP ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  } catch (err) {
    console.error('PDF rendering failed:', err);
    return null;
  }
}

// ---- Main handler ----

/**
 * POST /api/flyer/generate
 *
 * Simplified flyer generation pipeline:
 * 1. Scrape basic branding from URL (colors, logo, OG image) -- no AI
 * 2. Generate copy from branche-specific templates -- no AI
 * 3. Build HTML flyer
 * 4. Render PDF (if Browserless configured)
 * 5. Upload to Vercel Blob
 *
 * Optionally creates a verification code for real campaign sends.
 */
export async function POST(req: NextRequest) {
  const authResult = requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await req.json();
    const {
      url, branche, bedrijfsnaam, telefoon, email, website, slogan,
      // Verification fields (optional -- only for real campaign sends)
      adres, postcode, stad, retailerId, campagneId, overdrachtDatum,
    } = body;

    if (!url || !branche || !bedrijfsnaam) {
      return NextResponse.json(
        { error: 'url, branche en bedrijfsnaam zijn verplicht' },
        { status: 400 }
      );
    }

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

    // SSRF guard: reject internal/private hostnames so a logged-in retailer
    // can't force the server to fetch localhost, 169.254.* metadata endpoints, etc.
    if (!isValidExternalUrl(normalizedUrl)) {
      return NextResponse.json(
        { error: 'Ongeldige of niet-toegestane URL' },
        { status: 400 }
      );
    }

    // Step 1: scrape basic info (no AI)
    const scraped = await scrapeBasic(normalizedUrl);

    // Step 2: determine colors
    const kleuren = kleurenUitCSSArray(scraped.kleuren || [])
      ?? { primair: '#0A0A0A', accent: '#00E87A' };

    // Step 3: generate copy from templates (no AI)
    const copy = generateFlyerCopy(branche, bedrijfsnaam);
    const tekst = {
      headline: copy.headline,
      bodytekst: copy.tekst,
      usps: copy.usps,
      cta: copy.cta,
    };

    // Step 4: use first scraped photo (OG image), or null
    const besteFoto = scraped.fotos.length > 0 ? scraped.fotos[0] : null;

    // Step 5: verification code (optional)
    let verificationCode: string | undefined;
    let qrUrl: string | undefined;
    const geldigTot = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (adres && postcode && stad && retailerId && campagneId) {
      verificationCode = generateVerificationCode();
      qrUrl = buildQRUrl(verificationCode);

      if (db) {
        try {
          await db.insert(flyerVerifications).values({
            code: verificationCode,
            adres,
            postcode,
            stad,
            retailerId,
            campagneId: String(campagneId),
            overdrachtDatum: overdrachtDatum ?? new Date().toISOString().slice(0, 10),
            geldigTot,
          });
        } catch (err) {
          console.error('Verification code DB insert failed:', err);
        }
      }
    }

    // Step 6: build HTML
    const html = buildFlyerHTML({
      bedrijfsnaam,
      logoUrl: scraped.logo || null,
      heroImageUrl: besteFoto,
      primairKleur: kleuren.primair,
      accentKleur: kleuren.accent,
      telefoon,
      email,
      website: website || normalizedUrl,
      ...tekst,
      qrUrl,
      code: verificationCode,
      adres,
      postcode,
      stad,
      geldigTot: verificationCode ? geldigTot : undefined,
    });

    // Step 7: render PDF + upload
    const pdf = await renderPDF(html);

    let pdfUrl: string | null = null;
    if (pdf && process.env.BLOB_READ_WRITE_TOKEN) {
      const slug = bedrijfsnaam
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      const { url: blobUrl } = await put(
        `flyers/${slug}-${Date.now()}.pdf`,
        pdf,
        { access: 'public' }
      );
      pdfUrl = blobUrl;
    }

    return NextResponse.json({
      pdfUrl,
      kleuren,
      besteFotoUrl: besteFoto,
      logoUrl: scraped.logo || null,
      tekst,
      verificationCode: verificationCode ?? null,
      qrUrl: qrUrl ?? null,
      _debug: {
        rawKleurenCount: scraped.kleuren?.length ?? 0,
        scrapedOk: scraped.scrapedOk,
        httpStatus: scraped.httpStatus,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Onbekende fout';
    console.error('Flyer generate error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
