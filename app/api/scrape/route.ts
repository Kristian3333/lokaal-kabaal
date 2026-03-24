import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { isValidExternalUrl } from '@/lib/validation';

export const maxDuration = 30;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// Simple HTML text extractor (no Cheerio needed)
function extractText(html: string): { title: string; description: string; bodyText: string } {
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || '';
  const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim()
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1]?.trim()
    || '';

  // Strip scripts, styles, nav, footer
  const clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return { title, description, bodyText: clean.slice(0, 2000) };
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is verplicht' }, { status: 400 });
    }

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

    // SSRF protection: block internal/private IPs and non-http protocols
    if (!isValidExternalUrl(normalizedUrl)) {
      return NextResponse.json({ error: 'Ongeldige URL. Gebruik een publieke http/https URL.' }, { status: 400 });
    }

    let pageContent = { title: '', description: '', bodyText: '' };

    // Attempt to fetch the actual website
    try {
      const resp = await fetch(normalizedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        signal: AbortSignal.timeout(4000),
        redirect: 'follow',
      });
      if (resp.ok) {
        const html = await resp.text();
        pageContent = extractText(html);
      }
    } catch (err) {
      // If fetch fails, continue with URL-based analysis only
      // Website fetch failed; continue with URL-based analysis only
    }

    const hasContent = pageContent.title || pageContent.bodyText;
    const prompt = `Je bent een expert flyer copywriter voor lokale ondernemers in Nederland.

${hasContent
  ? `Analyseer de volgende website-informatie en maak op basis daarvan een wervende flyertekst voor nieuwe huishoudens in de buurt.\n\nURL: ${normalizedUrl}\n${pageContent.title ? `Paginatitel: ${pageContent.title}` : ''}\n${pageContent.description ? `Omschrijving: ${pageContent.description}` : ''}\n${pageContent.bodyText ? `Websitetekst (fragment): ${pageContent.bodyText.slice(0, 800)}` : ''}`
  : `De website kon niet worden bereikt, maar je kunt op basis van de domeinnaam een goede inschatting maken van het bedrijf.\n\nURL: ${normalizedUrl}\n\nLeid het bedrijfstype, de branche en merkstijl af uit de domeinnaam. Maak een professionele flyertekst voor nieuwe huishoudens in de buurt.`
}

Genereer ook een voorstel voor de merkstijl op basis van de bedrijfsnaam/type.

Return ALLEEN geldig JSON (geen markdown):
{
  "tekst": "De flyertekst hier (max 80 woorden, vriendelijk en uitnodigend voor nieuwe bewoners)",
  "usp": "USP 1 (max 6 woorden)\\nUSP 2\\nUSP 3",
  "bedrijfsnaam": "Korte bedrijfsnaam",
  "slogan": "Korte slogan (max 5 woorden)",
  "primaryColor": "#hex (donkere achtergrondkleur passend bij het merk)",
  "accentColor": "#hex (opvallende accentkleur passend bij het merk)"
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json({
          tekst: parsed.tekst || '',
          usp: parsed.usp || '',
          scan: {
            brandName: parsed.bedrijfsnaam || '',
            slogan: parsed.slogan || '',
            primaryColor: parsed.primaryColor || '#0A0A0A',
            accentColor: parsed.accentColor || '#00E87A',
          }
        });
      }
    } catch (e) {
      console.error('JSON parse fallback:', e);
    }

    // Fallback
    const hostname = new URL(normalizedUrl).hostname.replace('www.', '').split('.')[0];
    return NextResponse.json({
      tekst: '',
      usp: '',
      scan: {
        brandName: hostname.charAt(0).toUpperCase() + hostname.slice(1),
        slogan: '',
        primaryColor: '#0A0A0A',
        accentColor: '#00E87A',
      }
    });
  } catch (error) {
    console.error('Scrape route error:', error);
    return NextResponse.json({ error: 'Website analyse mislukt. Controleer de URL en probeer opnieuw.' }, { status: 500 });
  }
}
