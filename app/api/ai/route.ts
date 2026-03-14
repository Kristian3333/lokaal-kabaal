import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { spec, bedrijfsnaam, slogan, brandguideNaam } = await req.json();

    const brandContext = [
      bedrijfsnaam && `Bedrijfsnaam: ${bedrijfsnaam}`,
      slogan && `Slogan: ${slogan}`,
      brandguideNaam && `Merkstijl: ${brandguideNaam}`,
    ].filter(Boolean).join('\n');

    const prompt = `Je bent een expert copywriter voor lokale retailers in Nederland.

Schrijf een korte, wervende flyertekst voor een ${spec || 'lokaal bedrijf'} die wordt bezorgd aan nieuwe bewoners in de buurt.

${brandContext ? `Bedrijfsinformatie:\n${brandContext}\n` : ''}

De tekst moet:
- Vriendelijk en uitnodigend zijn
- Inspelen op het feit dat de ontvanger net is verhuisd
- Max 80 woorden
- Een welkomstgevoel geven

Geef ook 3 korte USP's terug (elk max 6 woorden).

Return ALLEEN geldig JSON:
{
  "tekst": "de flyertekst hier",
  "usp": "USP 1\nUSP 2\nUSP 3"
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json(parsed);
      }
    } catch {
      // fall through
    }

    return NextResponse.json({ tekst: text, usp: '' });
  } catch (error) {
    console.error('AI route error:', error);
    return NextResponse.json({ error: 'AI generatie mislukt' }, { status: 500 });
  }
}
