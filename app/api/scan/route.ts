import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { requireAuth } from '@/lib/auth';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL verplicht' }, { status: 400 });
    }

    // Normalize URL
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

    // Ask Claude to analyze what would be the brand colors based on the domain/URL
    // (Since we can't directly screenshot in serverless, we use Claude's knowledge)
    const prompt = `Je bent een expert merkanalyst. Analyseer de volgende website URL en geef een schatting van de merkkleuren en stijl op basis van de bedrijfsnaam/domain.

URL: ${normalizedUrl}

Probeer de bedrijfsnaam te herkennen en geef realistische merkkleurschattingen terug.

Return ALLEEN geldig JSON:
{
  "primaryColor": "#hex kleur (donker/neutraal - achtergrond)",
  "accentColor": "#hex kleur (opvallend accent/CTA kleur)",
  "brandName": "naam van het bedrijf (kort, zonder BV/Ltd etc)",
  "designStyle": "modern of classic of minimalist of bold"
}

Als je de website niet kent, geef dan standaard professionele kleuren terug die passen bij het type bedrijf in de URL.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ scan: parsed });
      }
    } catch {
      // fall through
    }

    // Default fallback
    return NextResponse.json({
      scan: {
        primaryColor: '#1a1a2e',
        accentColor: '#00E87A',
        brandName: new URL(normalizedUrl).hostname.replace('www.', '').split('.')[0],
        designStyle: 'modern',
      }
    });
  } catch (error) {
    console.error('Scan route error:', error);
    return NextResponse.json({ error: 'Scan mislukt' }, { status: 500 });
  }
}
