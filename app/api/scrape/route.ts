import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { isValidExternalUrl } from '@/lib/validation';
import { generateFlyerCopy } from '@/lib/flyer-templates';

export const maxDuration = 15;

/**
 * Extract basic info from a page's HTML without any AI/LLM calls.
 */
function extractFromHtml(html: string): {
  title: string;
  description: string;
  brandName: string;
  primaryColor: string | null;
  accentColor: string | null;
  logoUrl: string | null;
} {
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || '';
  const description =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim()
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1]?.trim()
    || '';

  // Extract brand name from og:site_name or title
  const ogSiteName = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim();
  const brandName = ogSiteName || title.split(/[|\-\u2013]/)[0]?.trim() || '';

  // Extract hex colors from CSS (look for theme-color meta, inline styles, CSS custom properties)
  const themeColor = html.match(/<meta[^>]+name=["']theme-color["'][^>]+content=["'](#[0-9a-fA-F]{6})["']/i)?.[1];
  const hexMatches = html.match(/#[0-9a-fA-F]{6}\b/g) || [];

  // Filter out common non-brand colors (pure black, white, greys, browser defaults)
  const brandColors = hexMatches.filter(hex => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const isGreyscale = Math.abs(r - g) < 20 && Math.abs(g - b) < 20;
    const isExtreme = (r + g + b < 60) || (r + g + b > 700);
    return !isGreyscale && !isExtreme;
  });

  const primaryColor = themeColor || brandColors[0] || null;
  const accentColor = brandColors.find(c => c !== primaryColor) || null;

  // Extract logo URL
  const logoUrl =
    html.match(/<img[^>]+alt=["'][^"']*logo[^"']*["'][^>]+src=["']([^"']+)["']/i)?.[1]
    || html.match(/<img[^>]+src=["']([^"']+)["'][^>]+alt=["'][^"']*logo[^"']*["']/i)?.[1]
    || html.match(/<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i)?.[1]
    || null;

  return { title, description, brandName, primaryColor, accentColor, logoUrl };
}

/**
 * POST /api/scrape
 *
 * Extracts basic branding info from a URL (title, colors, logo) and
 * generates flyer copy using templates. No AI/LLM calls needed.
 */
export async function POST(req: NextRequest) {
  const authResult = requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { url, branche } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is verplicht' }, { status: 400 });
    }

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

    // SSRF protection
    if (!isValidExternalUrl(normalizedUrl)) {
      return NextResponse.json({ error: 'Ongeldige URL. Gebruik een publieke http/https URL.' }, { status: 400 });
    }

    // Attempt to fetch the website
    let extracted = {
      title: '', description: '', brandName: '',
      primaryColor: null as string | null,
      accentColor: null as string | null,
      logoUrl: null as string | null,
    };

    try {
      const resp = await fetch(normalizedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        signal: AbortSignal.timeout(5000),
        redirect: 'follow',
      });
      if (resp.ok) {
        const html = await resp.text();
        extracted = extractFromHtml(html);

        // Make relative logo URLs absolute
        if (extracted.logoUrl && !extracted.logoUrl.startsWith('http')) {
          try {
            extracted.logoUrl = new URL(extracted.logoUrl, normalizedUrl).href;
          } catch {
            extracted.logoUrl = null;
          }
        }
      }
    } catch {
      // Website fetch failed; continue with URL-based fallback
    }

    // Derive brand name from domain if extraction failed
    const hostname = new URL(normalizedUrl).hostname.replace('www.', '').split('.')[0];
    const brandName = extracted.brandName
      || hostname.charAt(0).toUpperCase() + hostname.slice(1);

    // Generate copy from templates
    const copy = generateFlyerCopy(branche || 'Lokaal bedrijf', brandName);

    return NextResponse.json({
      tekst: copy.tekst,
      usp: copy.usps.join('\n'),
      headline: copy.headline,
      cta: copy.cta,
      scan: {
        brandName,
        slogan: extracted.description.slice(0, 80) || '',
        primaryColor: extracted.primaryColor || '#0A0A0A',
        accentColor: extracted.accentColor || '#00E87A',
        logoUrl: extracted.logoUrl,
      },
    });
  } catch (error) {
    console.error('Scrape route error:', error);
    return NextResponse.json({ error: 'Website analyse mislukt. Controleer de URL en probeer opnieuw.' }, { status: 500 });
  }
}
