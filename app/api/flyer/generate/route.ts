import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { put } from '@vercel/blob';

export const maxDuration = 30;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// ─── Sub-functie A: scrapeSite ────────────────────────────────────────────────

async function scrapeSite(url: string) {
  const browserlessToken = process.env.BROWSERLESS_TOKEN;

  if (!browserlessToken) {
    // Fallback: plain HTML fetch when Browserless is not configured
    return scrapeBasic(url);
  }

  try {
    const res = await fetch(
      `https://chrome.browserless.io/function?token=${browserlessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: `export default async function({ page, context }) {
            await page.goto(context.url, { waitUntil: 'networkidle2', timeout: 15000 });
            return await page.evaluate(() => {
              // ── Kleuren uit CSS ──
              const bgSet = new Set();
              document.querySelectorAll('*').forEach(el => {
                const s = getComputedStyle(el);
                const bg = s.backgroundColor;
                if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') bgSet.add(bg);
              });

              // ── Logo: breed zoeken ──
              const logo =
                document.querySelector('img[alt*="logo" i]')?.src ||
                document.querySelector('img[src*="logo" i]')?.src ||
                document.querySelector('img[class*="logo" i]')?.src ||
                document.querySelector('header img')?.src ||
                document.querySelector('nav img')?.src ||
                document.querySelector('.logo img, .logo-img, #logo img')?.src ||
                document.querySelector('a[href="/"] img')?.src ||
                document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute('href') || null;

              // ── Foto's: gebruik naturalWidth ipv getBoundingClientRect ──
              const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || null;
              const imgFotos = [...document.querySelectorAll('img')]
                .filter(img => {
                  const w = img.naturalWidth || img.width || parseInt(img.getAttribute('width') || '0');
                  const h = img.naturalHeight || img.height || parseInt(img.getAttribute('height') || '0');
                  return w > 300 && h > 200;
                })
                .map(img => img.src)
                .filter(src =>
                  src && src.startsWith('http') &&
                  !src.includes('icon') &&
                  !src.includes('favicon') &&
                  !src.includes('avatar') &&
                  !src.includes('sprite') &&
                  !src.includes('pixel') &&
                  !src.includes('tracking')
                )
                .slice(0, 8);

              const fotos = ogImage
                ? [ogImage, ...imgFotos.filter(s => s !== ogImage)].slice(0, 8)
                : imgFotos;

              // ── Tekst ──
              const h1 = document.querySelector('h1')?.innerText?.trim() || '';
              const meta = document.querySelector('meta[name="description"]')?.content?.trim() || '';
              const ogDesc = document.querySelector('meta[property="og:description"]')?.content?.trim() || '';

              return {
                kleuren: [...bgSet].slice(0, 30),
                logo,
                fotos,
                h1,
                meta: meta || ogDesc
              };
            });
          }`,
          context: { url },
        }),
        signal: AbortSignal.timeout(18000),
      }
    );

    if (!res.ok) throw new Error(`Browserless HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Browserless scrape failed, falling back to basic:', err);
    return scrapeBasic(url);
  }
}

async function scrapeBasic(url: string) {
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
  let h1 = '', meta = '', logo: string | null = null;

  try {
    const res = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'nl-NL,nl;q=0.9',
      },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const html = await res.text();
      h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1]?.trim() || '';
      meta = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim()
        || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1]?.trim()
        || '';
      const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1]
        || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1]
        || null;
      logo = html.match(/<img[^>]+alt=["'][^"']*logo[^"']*["'][^>]+src=["']([^"']+)["']/i)?.[1] || null;

      const scrapedOk = !!(h1 || meta);
      return { kleuren: [], logo, fotos: ogImage ? [ogImage] : [], h1, meta, scrapedOk };
    }
    // Non-200 response (bijv. 403 Cloudflare, 429 rate limit)
    return { kleuren: [], logo: null, fotos: [], h1: '', meta: '', scrapedOk: false, httpStatus: res.status };
  } catch {
    // Timeout of netwerk fout
    return { kleuren: [], logo: null, fotos: [], h1: '', meta: '', scrapedOk: false, httpStatus: 0 };
  }
}

// ─── Sub-functie B: selecteerBesteFoto ───────────────────────────────────────

async function selecteerBesteFoto(fotos: string[], branche: string): Promise<string | null> {
  if (fotos.length === 0) return null;
  if (fotos.length === 1) return fotos[0];

  try {
    // Gebruik raw fetch omdat URL-source typing niet beschikbaar is in deze SDK versie
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 10,
        messages: [{
          role: 'user',
          content: [
            ...fotos.map(url => ({
              type: 'image',
              source: { type: 'url', url },
            })),
            {
              type: 'text',
              text: `Dit zijn foto's van de website van een ${branche}. Welke foto werkt het beste als hero image op een A5 direct mail flyer voor nieuwe bewoners? Kies op basis van: professioneel uitziend, herkenbaarheid als lokaal bedrijf, geen tekst in beeld, hoog contrast, warm gevoel. Antwoord ALLEEN met het getal van de beste foto (1 t/m ${fotos.length}). Niets anders.`,
            },
          ],
        }],
      }),
      signal: AbortSignal.timeout(10000),
    });
    const response = await res.json();

    const text = response.content?.[0]?.text?.trim() ?? '1';
    const index = parseInt(text) - 1;
    return fotos[Math.max(0, Math.min(index, fotos.length - 1))];
  } catch (err) {
    console.warn('Foto selectie mislukt, pak eerste:', err);
    return fotos[0];
  }
}

// ─── Sub-functie C: kleuren uit CSS array (meest betrouwbaar) ────────────────

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

function kleurenUitCSSArray(cssKleuren: string[]): { primair: string; accent: string } | null {
  if (!cssKleuren || cssKleuren.length === 0) return null;

  // Verzamel unieke kleuren met hun saturatie
  const uniek = new Map<string, { rgb: [number,number,number]; sat: number; lum: number }>();
  for (const css of cssKleuren) {
    const rgb = cssRgbToRgb(css);
    if (!rgb) continue;
    const [r, g, b] = rgb;
    const key = `${Math.round(r/12)*12},${Math.round(g/12)*12},${Math.round(b/12)*12}`;
    if (uniek.has(key)) continue;
    const [, sat, lum] = rgbToHsl(r, g, b);
    uniek.set(key, { rgb, sat, lum });
  }

  // Gesatureerde kleuren (echte merkkleuren) gesorteerd op saturatie
  const merkKleuren = Array.from(uniek.values())
    .filter(c => c.sat > 0.25 && c.lum > 0.1 && c.lum < 0.92)
    .sort((a, b) => b.sat - a.sat);

  // Donkere kleuren (voor achtergrond)
  const donkereKleuren = Array.from(uniek.values())
    .filter(c => c.lum < 0.25 && c.sat < 0.4)
    .sort((a, b) => a.lum - b.lum);

  if (merkKleuren.length === 0) return null;

  // De meest gesatureerde kleur = accent (de "pop" kleur van het merk)
  const accentRgb = merkKleuren[0].rgb;
  const accent = rgbToHex(accentRgb[0], accentRgb[1], accentRgb[2]);

  // Primair = donkere achtergrondkleur, of bijna-zwart als fallback
  let primair = '#0f0f0f';
  if (donkereKleuren.length > 0) {
    const p = donkereKleuren[0].rgb;
    primair = rgbToHex(p[0], p[1], p[2]);
  } else if (merkKleuren.length > 1) {
    // Tweede merk kleur als primair, mits donker genoeg
    const tweede = merkKleuren[1];
    if (tweede.lum < 0.5) {
      primair = rgbToHex(tweede.rgb[0], tweede.rgb[1], tweede.rgb[2]);
    }
  }

  return { primair, accent };
}

// ─── Sub-functie D-extra: dominanteKleuren uit foto (fallback) ────────────────
// Pure-JS JPEG pixel sampler — geen native binaries nodig

function parseJpegPixels(buf: Buffer): Array<[number, number, number]> | null {
  // Zoek Start of Scan marker (0xFFDA) — pixels staan erna als compressed data
  // Simpelere aanpak: sample regelmatig bytes die eruitzien als RGB waarden
  const pixels: Array<[number, number, number]> = [];
  const step = Math.max(1, Math.floor(buf.length / 800));
  for (let i = 0; i < buf.length - 2; i += step) {
    const r = buf[i], g = buf[i + 1], b = buf[i + 2];
    if (r !== undefined && g !== undefined && b !== undefined) {
      pixels.push([r, g, b]);
    }
  }
  return pixels.length > 0 ? pixels : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(n => Math.min(255, Math.max(0, n)).toString(16).padStart(2, '0')).join('');
}

function kleurenUitPixels(pixels: Array<[number, number, number]>): { primair: string; accent: string } {
  const kleurenMap = new Map<string, { count: number; r: number; g: number; b: number }>();

  for (const [r, g, b] of pixels) {
    // Quantize naar blokken van 32
    const qr = Math.round(r / 32) * 32;
    const qg = Math.round(g / 32) * 32;
    const qb = Math.round(b / 32) * 32;

    const isWit = qr > 200 && qg > 200 && qb > 200;
    const isZwart = qr < 40 && qg < 40 && qb < 40;
    const isGrijs = Math.abs(qr - qg) < 20 && Math.abs(qg - qb) < 20;
    if (isWit || isZwart || isGrijs) continue;

    const key = `${qr},${qg},${qb}`;
    const entry = kleurenMap.get(key) || { count: 0, r: qr, g: qg, b: qb };
    entry.count++;
    kleurenMap.set(key, entry);
  }

  const gesorteerd = Array.from(kleurenMap.values()).sort((a, b) => b.count - a.count);
  if (gesorteerd.length === 0) return { primair: '#0A0A0A', accent: '#00E87A' };

  const p = gesorteerd[0];
  const primair = rgbToHex(p.r, p.g, p.b);

  // Kies accent met minimaal kleurverschil van 80
  let accent = '#00E87A';
  for (const c of gesorteerd.slice(1)) {
    const afstand = Math.sqrt(
      Math.pow(p.r - c.r, 2) + Math.pow(p.g - c.g, 2) + Math.pow(p.b - c.b, 2)
    );
    if (afstand > 80) {
      accent = rgbToHex(c.r, c.g, c.b);
      break;
    }
  }

  return { primair, accent };
}

async function dominanteKleuren(imageUrl: string): Promise<{ primair: string; accent: string }> {
  try {
    const res = await fetch(imageUrl, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error(`Image fetch ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const pixels = parseJpegPixels(buffer);
    if (!pixels || pixels.length < 10) throw new Error('Te weinig pixels');
    return kleurenUitPixels(pixels);
  } catch (err) {
    console.warn('Kleurextractie mislukt:', err);
    return { primair: '#0A0A0A', accent: '#00E87A' };
  }
}

// ─── Sub-functie D: genereerTekst ────────────────────────────────────────────

async function genereerTekst(data: {
  branche: string;
  bedrijfsnaam: string;
  h1: string;
  meta: string;
  slogan?: string;
}) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    system: `Je schrijft direct mail copy voor Nederlandse lokale retailers. Doelgroep: mensen die net verhuisd zijn naar een nieuw adres. Toon: warm, concreet, lokaal vertrouwd. Nooit salesy. Output: alleen JSON, geen uitleg, geen markdown backticks.`,
    messages: [{
      role: 'user',
      content: `Bedrijf: ${data.bedrijfsnaam}
Branche: ${data.branche}
Website H1: ${data.h1}
Website beschrijving: ${data.meta}
${data.slogan ? `Slogan: ${data.slogan}` : ''}

Schrijf flyer copy voor nieuwe bewoners in hun wijk.
Geef terug als JSON met exact deze velden:
{
  "headline": "max 8 woorden, pakkend, geen uitroepteken",
  "bodytekst": "max 50 woorden, warm en uitnodigend",
  "usps": ["max 6 woorden", "max 6 woorden", "max 6 woorden"],
  "cta": "max 5 woorden, actiegericht"
}`,
    }],
  });

  const raw = response.content[0].type === 'text'
    ? response.content[0].text.replace(/```json|```/g, '').trim()
    : '{}';

  // Probeer direct te parsen; extraheer anders het JSON-blok uit de response
  try {
    return JSON.parse(raw);
  } catch {
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
    } catch { /* val door naar fallback */ }
  }

  // Fallback: lege structuur zodat de pipeline niet crasht
  return { headline: data.bedrijfsnaam, bodytekst: '', usps: [], cta: 'Kom langs' };
}

// ─── Sub-functie E: buildFlyerHTML ────────────────────────────────────────────

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
}): string {
  const rgb = d.primairKleur.match(/\d+/g)?.map(Number) || [255, 255, 255];
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
  .header{display:flex;align-items:center;gap:4mm;padding-bottom:5mm;border-bottom:0.4mm solid ${d.accentKleur}55;margin-bottom:5mm}
  .logo{max-height:11mm;max-width:38mm;object-fit:contain}
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
</style>
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
  <div class="footer">
    <div class="contact">
      ${d.telefoon ? `${d.telefoon}<br/>` : ''}
      ${d.email ? `${d.email}<br/>` : ''}
      ${d.website ? `${d.website}` : ''}
    </div>
    <div class="watermark">lokaalkabaal.agency</div>
  </div>
</div>
</body>
</html>`;
}

// ─── Sub-functie F: renderPDF ─────────────────────────────────────────────────

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
    console.warn('PDF render mislukt:', err);
    return null;
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, branche, bedrijfsnaam, telefoon, email, website, slogan } = body;

    if (!url || !branche || !bedrijfsnaam) {
      return NextResponse.json(
        { error: 'url, branche en bedrijfsnaam zijn verplicht' },
        { status: 400 }
      );
    }

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    console.log('[flyer] start pipeline voor:', normalizedUrl);

    // Stap 1: scrape
    const scraped = await scrapeSite(normalizedUrl);
    console.log('[flyer] scrape klaar — ok:', scraped.scrapedOk, 'status:', scraped.httpStatus, 'fotos:', scraped.fotos?.length);

    if (!scraped.scrapedOk) {
      const status = scraped.httpStatus;
      let uitleg = 'Deze website kon niet worden uitgelezen.';
      if (status === 403 || status === 429 || status === 503) {
        uitleg = `De website blokkeert automatische verzoeken (HTTP ${status}). Dit is gebruikelijk bij grote webshops en retailers.`;
      } else if (status === 0) {
        uitleg = 'De website was niet bereikbaar — controleer of de URL klopt en de site online is.';
      }
      return NextResponse.json(
        { error: `${uitleg} Vul je bedrijfsnaam en branche handmatig in en gebruik de AI-knop om alsnog een flyertekst te genereren.` },
        { status: 422 }
      );
    }

    // Stap 2: foto + tekst parallel
    const [besteFoto, tekst] = await Promise.all([
      selecteerBesteFoto(scraped.fotos || [], branche),
      genereerTekst({
        branche,
        bedrijfsnaam,
        h1: scraped.h1 || '',
        meta: scraped.meta || '',
        slogan,
      }),
    ]);
    console.log('[flyer] besteFoto:', besteFoto, '| tekst headline:', tekst?.headline);

    // Stap 3: kleuren — CSS kleuren zijn de meest betrouwbare bron
    const kleuren = kleurenUitCSSArray(scraped.kleuren || [])
      ?? (besteFoto ? await dominanteKleuren(besteFoto) : { primair: '#0A0A0A', accent: '#00E87A' });
    console.log('[flyer] kleuren:', kleuren);

    // Stap 4: flyer HTML bouwen
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
    });

    // Stap 5: PDF renderen + opslaan in Blob (parallel waar mogelijk)
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
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Onbekende fout';
    console.error('Flyer generate error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
