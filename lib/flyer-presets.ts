/**
 * Curated flyer presets for the template marketplace.
 *
 * Each preset picks a FlyerDesigner design variant, a branche-specific
 * copy set, and a colour palette. Retailers can one-click apply a
 * preset to their active flyer and then tweak from there.
 */

import type { FlyerState } from '@/components/dashboard/FlyerPreview';

/** Subset of FlyerState that a preset overrides. Caller merges with
 *  the current flyer state so anything not set here (logo, bedrijfsnaam,
 *  telefoon, etc.) is preserved. */
export type FlyerPresetPatch = Partial<Pick<FlyerState,
  | 'design'
  | 'kleur'
  | 'accent'
  | 'headline'
  | 'tekst'
  | 'usp'
  | 'cta'
  | 'backTekst'
  | 'afmeting'
>>;

export interface FlyerPreset {
  id: string;
  /** Human label shown in the marketplace card */
  label: string;
  /** Branche this preset is tuned for ('generic' = works for everyone) */
  branche: 'kapper' | 'bakker' | 'restaurant' | 'installateur' | 'makelaar' | 'fysio' | 'generic';
  /** One-liner describing the vibe */
  tagline: string;
  /** Preview swatch (primary, accent) for the marketplace card */
  swatch: [string, string];
  /** Defaults applied when the retailer picks this preset */
  patch: FlyerPresetPatch;
}

export const FLYER_PRESETS: FlyerPreset[] = [
  {
    id: 'kapper-editorial-warm',
    label: 'Welkom bij de buurtkapper',
    branche: 'kapper',
    tagline: 'Warme editorial stijl met welkomstkorting',
    swatch: ['#3A2E26', '#D4A574'],
    patch: {
      design: 'editorial',
      kleur: '#3A2E26',
      accent: '#D4A574',
      headline: 'Welkom in de buurt.',
      tekst: 'Nieuwe bewoner in de buurt? Kom langs voor een knipbeurt -- wij kennen deze wijk als geen ander.',
      usp: 'Vakmensen · flexibele tijden · trending stijlen',
      cta: '20% welkomstkorting op je eerste knipbeurt',
      backTekst: 'Boek online of loop gewoon binnen. We zijn open van di t/m za.',
    },
  },
  {
    id: 'bakker-warm-hand',
    label: 'Ambachtelijke welkom',
    branche: 'bakker',
    tagline: 'Warme palet + dagverse belofte',
    swatch: ['#5C3A21', '#E8C988'],
    patch: {
      design: 'warm',
      kleur: '#5C3A21',
      accent: '#E8C988',
      headline: 'Vers brood. Verse buurt.',
      tekst: 'Je bent net verhuisd -- en je nieuwe buurtbakker staat klaar. Iedere ochtend uit eigen oven.',
      usp: 'Ambachtelijk · dagelijks vers · beste boter van de stad',
      cta: 'Eerste brood bij ons: gratis kaneelbroodje erbij',
      backTekst: 'Dagelijks open vanaf 07:00. Scan voor de route.',
    },
  },
  {
    id: 'restaurant-bold-hero',
    label: 'Hero-photo restaurant',
    branche: 'restaurant',
    tagline: 'Groot beeld + welkomst-waardebon',
    swatch: ['#0F2A2E', '#E8985B'],
    patch: {
      design: 'bold',
      kleur: '#0F2A2E',
      accent: '#E8985B',
      headline: 'Kennismaken? Wij trakteren.',
      tekst: 'Nog niet ontdekt waar je vanavond kunt eten? Reserveer bij ons en we zorgen voor de rest.',
      usp: 'Lokale ingrediënten · ruime kaart · ook lunch',
      cta: '€15 welkomstbon op je eerste diner (2 personen)',
      backTekst: 'Reserveer via de QR of bel ons direct.',
      afmeting: 'a5',
    },
  },
  {
    id: 'installateur-corporate',
    label: 'Vertrouwde installateur',
    branche: 'installateur',
    tagline: 'Clean + betrouwbaar + offerte-CTA',
    swatch: ['#1B3A5C', '#4AA8FF'],
    patch: {
      design: 'corporate',
      kleur: '#1B3A5C',
      accent: '#4AA8FF',
      headline: 'Nieuwe woning? Begin goed.',
      tekst: 'Cv, elektra, warmtepomp, zonnepanelen. Laat ons eerst gratis meekijken voordat je tegenvallers tegenkomt.',
      usp: 'Gecertificeerd · 10 jaar ervaring · snelle offertes',
      cta: 'Gratis intake + vrijblijvende offerte',
      backTekst: 'Bel vandaag, morgen ingepland. Geen kleine lettertjes.',
    },
  },
  {
    id: 'makelaar-minimal',
    label: 'Rustige makelaar',
    branche: 'makelaar',
    tagline: 'Minimal met long-term relatie',
    swatch: ['#1A1A1A', '#B59665'],
    patch: {
      design: 'minimal',
      kleur: '#1A1A1A',
      accent: '#B59665',
      headline: 'Welkom in je nieuwe huis.',
      tekst: 'Wij kennen deze wijk -- verkochten hem vaak genoeg. Als je ooit verder wil, weet je ons te vinden.',
      usp: 'Transparante tarieven · local insight · geen verkooptrucs',
      cta: 'Gratis woningwaarde-check wanneer je er klaar voor bent',
      backTekst: 'Geen spam, geen maandelijkse emails. Alleen als je ons belt.',
    },
  },
  {
    id: 'fysio-playful',
    label: 'Welkom bij de fysio',
    branche: 'fysio',
    tagline: 'Vriendelijk + korting 1e intake',
    swatch: ['#205C4E', '#7FD4A3'],
    patch: {
      design: 'playful',
      kleur: '#205C4E',
      accent: '#7FD4A3',
      headline: 'Nieuw in de buurt, pijntje in je rug?',
      tekst: 'Wij behandelen al 15 jaar buurtbewoners. Geen wachtlijst, direct vergoed via je zorgverzekeraar.',
      usp: 'Geen wachtlijst · vergoed · avondafspraken',
      cta: '25% korting op je eerste intake',
      backTekst: 'Boek via de QR of loop binnen.',
    },
  },
  {
    id: 'generic-neon',
    label: 'Modern & opvallend',
    branche: 'generic',
    tagline: 'Neon stijl voor trending branches',
    swatch: ['#0A0A0A', '#00E87A'],
    patch: {
      design: 'neon',
      kleur: '#0A0A0A',
      accent: '#00E87A',
      headline: 'Welkom in de buurt!',
      tekst: 'Wij zijn je nieuwe lokale favoriet. Kom snel langs.',
      usp: 'Snel · lokaal · eerlijke prijzen',
      cta: '10% welkomstkorting op je eerste bezoek',
      backTekst: 'Scan voor route + openingstijden.',
    },
  },
  {
    id: 'generic-retro',
    label: 'Retro karakter',
    branche: 'generic',
    tagline: 'Vintage poster feel, warm en menselijk',
    swatch: ['#8B3E2F', '#F5D896'],
    patch: {
      design: 'retro',
      kleur: '#8B3E2F',
      accent: '#F5D896',
      headline: 'Verhuisd? Welkom.',
      tekst: 'Echte buurtwinkels verdwijnen -- wij staan er nog. Kom langs en maak kennis.',
      usp: 'Sinds 1998 · persoonlijk · trouwe klanten',
      cta: 'Welkom-cadeautje bij je eerste bezoek',
      backTekst: 'Open 6 dagen per week. Scan voor adres en tijden.',
    },
  },
];

/** All presets that match the retailer's branche, plus generic fallbacks. */
export function presetsForBranche(
  branche: FlyerPreset['branche'] | string,
): FlyerPreset[] {
  const exact = FLYER_PRESETS.filter(p => p.branche === branche);
  const generic = FLYER_PRESETS.filter(p => p.branche === 'generic');
  return [...exact, ...generic];
}
