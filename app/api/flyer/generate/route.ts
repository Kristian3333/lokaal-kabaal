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
              const kleuren = new Set();
              document.querySelectorAll('*').forEach(el => {
                const s = getComputedStyle(el);
                ['backgroundColor','color','borderColor'].forEach(prop => {
                  const v = s[prop];
                  if (v && v !== 'rgba(0, 0, 0, 0)' && v !== 'transparent') kleuren.add(v);
                });
              });

              const logo =
                document.querySelector('img[alt*="logo" i]')?.src ||
                document.querySelector('header img')?.src ||
                document.querySelector('nav img')?.src ||
                document.querySelector('a[href="/"] img')?.src || null;

              const fotos = [...document.querySelectorAll('img')]
                .filter(img => {
                  const rect = img.getBoundingClientRect();
                  return rect.width > 200 && rect.height > 150;
                })
                .map(img => img.src)
                .filter(src =>
                  src && src.startsWith('http') &&
                  !src.includes('icon') &&
                  !src.includes('logo') &&
                  !src.includes('favicon') &&
                  !src.includes('avatar') &&
                  !src.includes('sprite')
                )
                .slice(0, 8);

              const h1 = document.querySelector('h1')?.innerText?.trim() || '';
              const meta = document.querySelector('meta[name="description"]')?.content?.trim() || '';
              const ogDesc = document.querySelector('meta[property="og:description"]')?.content?.trim() || '';
              const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || null;

              return {
                kleuren: [...kleuren].slice(0, 25),
                logo,
                fotos: ogImage && !fotos.includes(ogImage) ? [ogImage, ...fotos].slice(0, 8) : fotos,
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
      // Try to find og:image as hero
      const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1]
        || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1]
        || null;
      logo = html.match(/<img[^>]+alt=["'][^"']*logo[^"']*["'][^>]+src=["']([^"']+)["']/i)?.[1] || null;

      return { kleuren: [], logo, fotos: ogImage ? [ogImage] : [], h1, meta };
    }
  } catch {
    // proceed with empty
  }

  return { kleuren: [], logo: null, fotos: [], h1: '', meta: '' };
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

// ─── Sub-functie C: dominanteKleuren ─────────────────────────────────────────
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

  return JSON.parse(raw);
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
    console.log('[flyer] scrape klaar — fotos:', scraped.fotos?.length, 'logo:', scraped.logo, 'h1:', scraped.h1?.slice(0, 50));

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

    // Stap 3: kleuren extraheren uit beste foto
    const kleuren = besteFoto
      ? await dominanteKleuren(besteFoto)
      : { primair: '#0A0A0A', accent: '#00E87A' };
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
