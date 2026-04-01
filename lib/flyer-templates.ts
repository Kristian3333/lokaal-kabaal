/**
 * Branche-specific flyer copy templates.
 *
 * Replaces Anthropic AI generation with deterministic, pre-written
 * copy tailored to each industry. Each branche has multiple template
 * variants so retailers get variety without needing an LLM.
 *
 * Usage: call `generateFlyerCopy(branche, bedrijfsnaam)` to get a
 * randomly selected template with interpolated business name.
 */

export interface FlyerCopy {
  headline: string;
  tekst: string;
  usps: string[];
  cta: string;
}

interface TemplateSet {
  headlines: string[];
  teksten: string[];
  usps: string[][];
  ctas: string[];
}

// ---- Generic fallback templates ----

const GENERIC: TemplateSet = {
  headlines: [
    'Welkom in de buurt',
    'Nieuw in de wijk?',
    'Jouw nieuwe buurt, onze expertise',
    'Fijn dat je er bent',
  ],
  teksten: [
    'Net verhuisd? Wij heten je van harte welkom als nieuwe bewoner. Kom gerust eens langs bij {{naam}} en ontdek wat wij voor jou kunnen betekenen.',
    'Welkom in je nieuwe wijk! Bij {{naam}} staan we klaar om je te helpen. Kom kennismaken en ontdek ons aanbod.',
    'Gefeliciteerd met je nieuwe woning! {{naam}} is al jaren een vertrouwd adres in de buurt. We kijken ernaar uit je te ontmoeten.',
  ],
  usps: [
    ['Persoonlijke service', 'Al jaren in de buurt', 'Altijd welkom voor advies'],
    ['Lokaal en betrouwbaar', 'Gratis kennismakingsgesprek', 'Ervaren vakmensen'],
    ['Flexibele openingstijden', 'Eerlijk advies', 'Vlakbij je nieuwe huis'],
  ],
  ctas: [
    '10% welkomstkorting',
    'Kom kennismaken',
    'Plan een afspraak',
    'Bezoek ons vandaag',
  ],
};

// ---- Branche-specific templates ----

const BRANCHE_TEMPLATES: Record<string, TemplateSet> = {
  'Kapper / Barbershop': {
    headlines: [
      'Jouw nieuwe kapper om de hoek',
      'Welkom, tijd voor een frisse coupe?',
      'Net verhuisd? Wij knippen je bij',
    ],
    teksten: [
      'Op zoek naar een goede kapper in je nieuwe buurt? Bij {{naam}} ben je aan het juiste adres. Boek je eerste afspraak en laat je verrassen.',
      'Welkom in de wijk! {{naam}} staat bekend om vakmanschap en persoonlijke aandacht. Kom langs voor een kennismakingsbehandeling.',
    ],
    usps: [
      ['Zonder afspraak welkom', 'Vakkundige stylisten', 'Gezellige sfeer'],
      ['Gratis adviesgesprek', 'Duurzame producten', 'Ervaren team'],
    ],
    ctas: ['Eerste knipbeurt -15%', 'Boek nu online', 'Welkomstkorting'],
  },

  'Restaurant': {
    headlines: [
      'Lekker eten om de hoek',
      'Welkom aan tafel',
      'Jouw nieuwe stamrestaurant',
    ],
    teksten: [
      'Net verhuisd en geen zin om te koken? Bij {{naam}} serveren we eerlijke gerechten met verse ingredienten. Kom proeven!',
      'Welkom in de buurt! {{naam}} is de plek voor een ontspannen lunch of een gezellig diner. Reserveer en ontvang een welkomstverrassing.',
    ],
    usps: [
      ['Verse, seizoensgebonden kaart', 'Gezellige sfeer', 'Kindvriendelijk'],
      ['Afhalen en bezorgen', 'Groepsdiners mogelijk', 'Terras in de zomer'],
    ],
    ctas: ['Welkomstdrankje gratis', 'Reserveer nu', '10% op eerste bezoek'],
  },

  'Cafe / Bar': {
    headlines: [
      'Jouw nieuwe stamkroeg',
      'Welkom, de eerste is van ons',
      'Buurtkroeg met karakter',
    ],
    teksten: [
      'Op zoek naar een gezellige plek in je nieuwe buurt? {{naam}} is de perfecte plek om je buren te leren kennen. Eerste drankje van het huis!',
      'Net verhuisd? Kom langs bij {{naam}} voor een welkomstdrankje. Wij zijn al jaren het gezelligste adres in de wijk.',
    ],
    usps: [
      ['Gezellige sfeer', 'Lokale biertjes', 'Elke week live muziek'],
      ['Groot terras', 'Borrelhapjes', 'Hartje buurt'],
    ],
    ctas: ['Eerste drankje gratis', 'Kom langs', 'Welkomstbiertje'],
  },

  'Bakkerij': {
    headlines: [
      'Vers gebak om de hoek',
      'De lekkerste bakker in je wijk',
      'Welkom, proef het verschil',
    ],
    teksten: [
      'Elke ochtend vers brood en gebak! {{naam}} bakt met liefde en vakmanschap. Kom proeven en word vaste klant.',
      'Welkom in de buurt! Bij {{naam}} vind je ambachtelijk brood, taart en koekjes. Proef onze welkomsttraktatie.',
    ],
    usps: [
      ['Dagelijks vers gebakken', 'Ambachtelijke recepten', 'Taarten op bestelling'],
      ['Glutenvrije opties', 'Lokale ingredienten', 'Al generaties in de buurt'],
    ],
    ctas: ['Gratis welkomsttaartje', 'Proef vandaag', 'Kom langs voor korting'],
  },

  'Sportschool / Fitness': {
    headlines: [
      'Train in je eigen buurt',
      'Welkom, jouw fitheid begint hier',
      'Nieuwe wijk, nieuw begin',
    ],
    teksten: [
      'Net verhuisd en op zoek naar een sportschool? {{naam}} biedt moderne apparatuur en deskundige begeleiding. Probeer ons gratis uit!',
      'Welkom in de wijk! Bij {{naam}} helpen we je om je fitnessdoelen te bereiken. Start met een gratis proefweek.',
    ],
    usps: [
      ['Gratis proefweek', 'Persoonlijke begeleiding', 'Ruime openingstijden'],
      ['Groepslessen inclusief', 'Moderne apparatuur', 'Geen inschrijfgeld'],
    ],
    ctas: ['Gratis proefles', 'Start vandaag', 'Welkomstactie -20%'],
  },

  'Bloemist': {
    headlines: [
      'Bloemen voor je nieuwe huis',
      'Welkom, een bloemetje erbij?',
      'Kleur in je nieuwe woning',
    ],
    teksten: [
      'Maak je nieuwe huis compleet met verse bloemen van {{naam}}. Wij maken de mooiste boeketten voor elke gelegenheid.',
      'Welkom in de buurt! {{naam}} helpt je graag met bloemen, planten en seizoensstukken. Kom gerust binnen voor inspiratie.',
    ],
    usps: [
      ['Dagelijks vers', 'Bezorging aan huis', 'Abonnementen mogelijk'],
      ['Seizoensbloemen', 'Kamerplanten', 'Rouwwerk en bruidswerk'],
    ],
    ctas: ['Welkomstboeket -15%', 'Bestel online', 'Kom snuiven'],
  },

  'Fysiotherapeut': {
    headlines: [
      'Jouw gezondheid, onze zorg',
      'Nieuw in de buurt? Wij staan klaar',
      'Vakkundige fysiotherapie dichtbij',
    ],
    teksten: [
      'Op zoek naar een goede fysiotherapeut in je nieuwe buurt? {{naam}} biedt persoonlijke behandelingen en deskundig advies.',
      'Welkom! {{naam}} helpt je met klachten aan spieren en gewrichten. Maak een afspraak en ervaar het verschil.',
    ],
    usps: [
      ['Alle zorgverzekeringen', 'Geen wachtlijst', 'Avondafspraken mogelijk'],
      ['Ervaren therapeuten', 'Moderne behandelmethodes', 'Gratis intake'],
    ],
    ctas: ['Gratis intake', 'Maak een afspraak', 'Bel ons vandaag'],
  },

  'Fietsenwinkel': {
    headlines: [
      'Op de fiets door je nieuwe wijk',
      'Welkom, wij houden je rijdend',
      'De fietsenmaker om de hoek',
    ],
    teksten: [
      'Net verhuisd en een nieuwe fiets nodig? Of moet je huidige fiets nagekeken worden? {{naam}} helpt je graag op weg.',
      'Welkom in de buurt! Bij {{naam}} vind je nieuwe en tweedehands fietsen, reparaties en accessoires. Rij gerust binnen.',
    ],
    usps: [
      ['Reparatie terwijl je wacht', 'E-bikes op voorraad', 'Gratis fietscheck'],
      ['Lease en financiering', 'Accessoires en onderdelen', 'Vakkundige monteurs'],
    ],
    ctas: ['Gratis fietscheck', 'Kom proefrijden', 'Welkomstkorting'],
  },

  'Boetiek / Kledingwinkel': {
    headlines: [
      'Stijlvol shoppen in de buurt',
      'Welkom, ontdek jouw stijl',
      'Mode om de hoek',
    ],
    teksten: [
      'Op zoek naar unieke kleding in je nieuwe wijk? {{naam}} biedt een zorgvuldig samengestelde collectie met persoonlijk advies.',
      'Welkom! Bij {{naam}} vind je kleding die bij je past. Kom gerust binnen voor een kop koffie en stijladvies.',
    ],
    usps: [
      ['Unieke collectie', 'Persoonlijk stijladvies', 'Cadeaubon beschikbaar'],
      ['Duurzame merken', 'Gezellige sfeer', 'Nieuwe collectie elke maand'],
    ],
    ctas: ['10% welkomstkorting', 'Kom passen', 'Ontvang een cadeautje'],
  },

  'Drogist': {
    headlines: [
      'Gezondheid dichtbij huis',
      'Welkom, wij zorgen voor je',
      'Jouw nieuwe drogist',
    ],
    teksten: [
      'Net verhuisd? Bij {{naam}} vind je alles voor je gezondheid, verzorging en huishouden. Persoonlijk advies inclusief!',
      'Welkom in de buurt! {{naam}} is jouw vertrouwde adres voor medicijnen, vitamines en verzorgingsproducten.',
    ],
    usps: [
      ['Deskundig advies', 'Ruim assortiment', 'Online bestellen, ophalen in de winkel'],
      ['Natuurlijke producten', 'Babyverzorging', 'Altijd in de buurt'],
    ],
    ctas: ['Welkomstpakket', 'Kom langs', 'Gratis adviesgesprek'],
  },

  'Pizzeria': {
    headlines: [
      'De beste pizza in je buurt',
      'Welkom, pizza erbij?',
      'Smaak van Italie om de hoek',
    ],
    teksten: [
      'Geen zin om te koken na het verhuizen? {{naam}} bakt de lekkerste pizza met verse ingredienten. Bestel en geniet!',
      'Welkom in de wijk! Bij {{naam}} draait alles om smaak, versheid en gezelligheid. Proef onze specialiteiten.',
    ],
    usps: [
      ['Verse deeg, dagelijks bereid', 'Afhalen en bezorgen', 'Glutenvrije opties'],
      ['Houtoven pizza', 'Ruime keuze pasta', 'Familiekortingen'],
    ],
    ctas: ['Welkomstpizza -20%', 'Bestel nu', 'Gratis bezorging'],
  },

  'Makelaar': {
    headlines: [
      'Welkom in je nieuwe huis',
      'Net gesetteld? Wij kennen de buurt',
      'De makelaar van je wijk',
    ],
    teksten: [
      'Gefeliciteerd met je nieuwe woning! Mocht je ooit willen verhuizen, verbouwen of verhuren: {{naam}} staat voor je klaar.',
      'Welkom in de buurt! {{naam}} kent elke straat en weet wat er speelt. Vragen over je nieuwe wijk? Wij helpen graag.',
    ],
    usps: [
      ['Gratis waardebepaling', 'Lokale marktkennis', 'Persoonlijke aanpak'],
      ['NVM-lid', 'Taxaties en verhuur', 'Transparante tarieven'],
    ],
    ctas: ['Gratis waardebepaling', 'Bel ons', 'Neem contact op'],
  },

  'Installateur': {
    headlines: [
      'Warmte en comfort in huis',
      'Nieuw huis, alles werkend?',
      'Jouw installateur om de hoek',
    ],
    teksten: [
      'Net verhuisd en problemen met de verwarming, waterleiding of elektra? {{naam}} helpt je snel en vakkundig.',
      'Welkom in je nieuwe woning! {{naam}} zorgt voor comfort: van cv-onderhoud tot badkamerrenovatie. Bel ons gerust.',
    ],
    usps: [
      ['24-uurs storingsdienst', 'Erkend installateur', 'Gratis offerte'],
      ['Duurzame oplossingen', 'Warmtepompen specialist', 'Snelle service'],
    ],
    ctas: ['Gratis inspectie', 'Bel voor offerte', 'Welkomstkorting -10%'],
  },

  'Stucadoor / Afbouwbedrijf': {
    headlines: [
      'Gladde muren, mooi resultaat',
      'Nieuw huis opknappen?',
      'Vakwerk voor je wanden',
    ],
    teksten: [
      'Wil je je nieuwe woning helemaal naar je smaak maken? {{naam}} verzorgt stucwerk, schilderwerk en afbouw. Vraag een offerte aan.',
      'Welkom! {{naam}} helpt je met het afwerken van je nieuwe huis. Van stucwerk tot sierpleister, wij leveren vakwerk.',
    ],
    usps: [
      ['Gratis offerte aan huis', 'Nette en snelle afwerking', 'Ervaren vakmensen'],
      ['Sierpleister en betonstuc', 'Schilderwerk', 'Referenties beschikbaar'],
    ],
    ctas: ['Gratis offerte', 'Bel vandaag', 'Welkomstkorting'],
  },

  'Rijschool': {
    headlines: [
      'Rijles in je nieuwe buurt',
      'Welkom, rij je mee?',
      'Snel je rijbewijs halen',
    ],
    teksten: [
      'Net verhuisd en nog geen rijbewijs? Of toe aan een opfriscursus? {{naam}} biedt persoonlijke rijlessen in je eigen wijk.',
      'Welkom! Bij {{naam}} leer je rijden in een ontspannen sfeer. Hoge slagingspercentages en flexibele lestijden.',
    ],
    usps: [
      ['Hoog slagingspercentage', 'Flexibele lestijden', 'Ophalen aan huis'],
      ['Spoedcursus mogelijk', 'Ervaren instructeurs', 'Moderne lesautos'],
    ],
    ctas: ['Gratis proefles', 'Boek nu', 'Welkomstpakket'],
  },

  'Nagelstudio': {
    headlines: [
      'Prachtige nagels in de buurt',
      'Welkom, verwenmomentje?',
      'Jouw nieuwe nagelstudio',
    ],
    teksten: [
      'Toe aan verzorgde nagels? {{naam}} biedt manicures, pedicures en nagelverlenging met oog voor detail. Boek je afspraak!',
      'Welkom in de wijk! Bij {{naam}} kun je terecht voor alle nagelbehandelingen. Ontspan en geniet van onze service.',
    ],
    usps: [
      ['Gellak en acryl', 'Hygieneprotocol', 'Zonder afspraak welkom'],
      ['Bruidsnagels', 'Pedicure beschikbaar', 'Gezellige sfeer'],
    ],
    ctas: ['Eerste behandeling -15%', 'Boek online', 'Welkomstkorting'],
  },

  'Huisdierenwinkel': {
    headlines: [
      'Alles voor je huisdier',
      'Welkom, ook voor je viervoeter',
      'De dierenwinkel om de hoek',
    ],
    teksten: [
      'Net verhuisd met je huisdier? Bij {{naam}} vind je het beste voer, speelgoed en verzorgingsproducten. Kom langs met je dier!',
      'Welkom! {{naam}} is de plek voor persoonlijk advies over voeding en verzorging van je huisdier.',
    ],
    usps: [
      ['Voedingsadvies op maat', 'Ruim assortiment', 'Trimservice beschikbaar'],
      ['Natuurlijke producten', 'Puppy- en kittenpakketten', 'Thuisbezorgd'],
    ],
    ctas: ['Gratis welkomstpakket', 'Kom snuffelen', 'Proefzakje gratis'],
  },

  'Opticieen': {
    headlines: [
      'Scherp zicht, stijlvolle bril',
      'Welkom, hoe is jouw zicht?',
      'De opticien in je wijk',
    ],
    teksten: [
      'Nieuwe buurt, nieuw perspectief! {{naam}} helpt je aan de perfecte bril of contactlenzen. Gratis oogmeting inbegrepen.',
      'Welkom! Bij {{naam}} combineren we vakmanschap met de nieuwste collecties. Kom langs voor een gratis adviesgesprek.',
    ],
    usps: [
      ['Gratis oogmeting', 'Ruime merkcollectie', 'Contactlenzen op maat'],
      ['Kinderbrillen', 'Reparatie terwijl je wacht', 'Zonnebrillen op sterkte'],
    ],
    ctas: ['Gratis oogmeting', 'Kom passen', 'Welkomstkorting'],
  },

  'Juwelier': {
    headlines: [
      'Schitterend cadeau voor jezelf',
      'Welkom, een sieraad erbij?',
      'Vakmanschap om de hoek',
    ],
    teksten: [
      'Verwen jezelf na de verhuizing! {{naam}} biedt een prachtige collectie sieraden, horloges en cadeaus. Kom gerust binnen.',
      'Welkom in de buurt! Bij {{naam}} vind je unieke sieraden en deskundig advies. Van reparatie tot gravure.',
    ],
    usps: [
      ['Reparatie en gravure', 'Unieke collectie', 'Cadeauverpakking gratis'],
      ['Trouwringen op maat', 'Horloge-onderhoud', 'Persoonlijk advies'],
    ],
    ctas: ['Welkomstcadeau', 'Kom binnen', 'Gratis gravure'],
  },

  'Koffietentje': {
    headlines: [
      'Jouw koffieplek om de hoek',
      'Welkom, kopje koffie?',
      'De lekkerste koffie in de wijk',
    ],
    teksten: [
      'Net verhuisd en op zoek naar een fijn koffieadres? Bij {{naam}} serveren we specialty koffie en huisgemaakt gebak.',
      'Welkom in de buurt! {{naam}} is de perfecte plek om even tot rust te komen. Kom proeven van onze verse koffie.',
    ],
    usps: [
      ['Specialty koffie', 'Huisgemaakt gebak', 'Gratis wifi'],
      ['Ontbijt en lunch', 'Gezellige sfeer', 'Meeneemkortingen'],
    ],
    ctas: ['Eerste koffie gratis', 'Kom proeven', 'Welkomstkorting'],
  },

  'Schoonheidsspecialist': {
    headlines: [
      'Verzorging dichtbij huis',
      'Welkom, tijd om te ontspannen',
      'Jouw schoonheidsspecialist',
    ],
    teksten: [
      'Verwen jezelf na de verhuizing! {{naam}} biedt gezichtsbehandelingen, massages en huidverzorging op maat.',
      'Welkom in de wijk! Bij {{naam}} draait alles om jouw welzijn. Boek een behandeling en ervaar het verschil.',
    ],
    usps: [
      ['Gratis huidanalyse', 'Professionele producten', 'Ontspannen sfeer'],
      ['Gezichtsbehandelingen', 'Massages', 'Op afspraak'],
    ],
    ctas: ['Eerste behandeling -20%', 'Boek nu', 'Gratis huidanalyse'],
  },

  'Yoga & Pilates studio': {
    headlines: [
      'Balans vinden in je nieuwe buurt',
      'Welkom, adem even mee',
      'Yoga en pilates om de hoek',
    ],
    teksten: [
      'Net verhuisd en toe aan ontspanning? Bij {{naam}} vind je rust en balans. Probeer een gratis proefles.',
      'Welkom! {{naam}} biedt yoga en pilates voor alle niveaus. Kom kennismaken met onze ervaren docenten.',
    ],
    usps: [
      ['Gratis proefles', 'Alle niveaus welkom', 'Kleine groepen'],
      ['Ervaren docenten', 'Flexibel rooster', 'Online lessen beschikbaar'],
    ],
    ctas: ['Gratis proefles', 'Probeer nu', 'Welkomstpakket'],
  },

  'Slagerij': {
    headlines: [
      'Vakmanschap op je bord',
      'Welkom, proef ons ambacht',
      'De slager om de hoek',
    ],
    teksten: [
      'Op zoek naar echt ambachtelijk vlees in je nieuwe buurt? Bij {{naam}} werken we met lokale boeren en verse producten.',
      'Welkom! {{naam}} levert al jaren kwaliteitsvlees aan de buurt. Kom proeven van onze specialiteiten.',
    ],
    usps: [
      ['Ambachtelijk bereid', 'Lokale leveranciers', 'Catering en BBQ'],
      ['Verse producten dagelijks', 'Wild en gevogelte', 'Op bestelling'],
    ],
    ctas: ['Welkomstpakket vlees', 'Kom proeven', 'Eerste bestelling -10%'],
  },

  'Doe-het-zelf & Bouwmarkt': {
    headlines: [
      'Alles voor je nieuwe huis',
      'Klussen in je nieuwe woning?',
      'De bouwmarkt om de hoek',
    ],
    teksten: [
      'Net verhuisd en meteen aan de slag? Bij {{naam}} vind je alles voor je klus: van verf tot gereedschap. Deskundig advies gratis!',
      'Welkom! {{naam}} helpt je graag met al je klus- en verbouwprojecten. Kom langs voor advies en materiaal.',
    ],
    usps: [
      ['Gratis klusadvies', 'Bezorging aan huis', 'Ruim assortiment'],
      ['Verf mengen op kleur', 'Gereedschap verhuur', 'Ervaren vakmensen'],
    ],
    ctas: ['10% welkomstkorting', 'Kom langs', 'Gratis advies'],
  },
};

// ---- Helper functions ----

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function interpolate(template: string, bedrijfsnaam: string): string {
  return template.replace(/\{\{naam\}\}/g, bedrijfsnaam);
}

/**
 * Find the best matching template set for a given branche.
 * Falls back to generic templates if no exact match is found.
 */
function findTemplateSet(branche: string): TemplateSet {
  // Exact match
  if (BRANCHE_TEMPLATES[branche]) return BRANCHE_TEMPLATES[branche];

  // Case-insensitive partial match
  const lower = branche.toLowerCase();
  for (const [key, templates] of Object.entries(BRANCHE_TEMPLATES)) {
    if (key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())) {
      return templates;
    }
  }

  // Keyword-based matching
  const keywords: Record<string, string[]> = {
    'Kapper / Barbershop': ['kapper', 'barbershop', 'barber', 'haar', 'coiffeur', 'kapsalon'],
    'Restaurant': ['restaurant', 'eetcafe', 'bistro', 'brasserie'],
    'Cafe / Bar': ['cafe', 'bar', 'kroeg', 'pub'],
    'Bakkerij': ['bakker', 'bakkerij', 'patisserie', 'brood'],
    'Sportschool / Fitness': ['sportschool', 'fitness', 'gym', 'crossfit'],
    'Bloemist': ['bloem', 'florist', 'bloemen'],
    'Fysiotherapeut': ['fysio', 'therapeut', 'osteopaat'],
    'Fietsenwinkel': ['fiets', 'bike', 'wielren'],
    'Boetiek / Kledingwinkel': ['kleding', 'mode', 'fashion', 'boetiek', 'boutique'],
    'Drogist': ['drogist', 'apotheek', 'pharmacy'],
    'Pizzeria': ['pizza', 'italiaans'],
    'Makelaar': ['makelaar', 'vastgoed', 'real estate', 'woning'],
    'Installateur': ['installat', 'loodgieter', 'elektric', 'cv', 'verwarming'],
    'Stucadoor / Afbouwbedrijf': ['stucadoor', 'stuc', 'afbouw', 'schilder'],
    'Rijschool': ['rijschool', 'rijles', 'rijbewijs'],
    'Nagelstudio': ['nagel', 'manicure', 'pedicure'],
    'Huisdierenwinkel': ['huisdier', 'dier', 'pet', 'hond', 'kat'],
    'Opticieen': ['optici', 'bril', 'optic', 'oog'],
    'Juwelier': ['juwel', 'sieraad', 'goud', 'zilver'],
    'Koffietentje': ['koffie', 'coffee', 'espresso', 'latte'],
    'Schoonheidsspecialist': ['schoonheid', 'beauty', 'gezicht', 'huid'],
    'Yoga & Pilates studio': ['yoga', 'pilates', 'meditatie'],
    'Slagerij': ['slager', 'vlees', 'butcher'],
    'Doe-het-zelf & Bouwmarkt': ['bouwmarkt', 'doe-het-zelf', 'diy', 'klus', 'gamma', 'praxis'],
  };

  for (const [brancheKey, words] of Object.entries(keywords)) {
    if (words.some(w => lower.includes(w))) {
      return BRANCHE_TEMPLATES[brancheKey];
    }
  }

  return GENERIC;
}

// ---- Public API ----

/**
 * Generate flyer copy from templates (no AI needed).
 *
 * @param branche - The business industry/category
 * @param bedrijfsnaam - The business name to interpolate
 * @returns A FlyerCopy object with headline, body text, USPs and CTA
 */
export function generateFlyerCopy(branche: string, bedrijfsnaam: string): FlyerCopy {
  const naam = bedrijfsnaam || 'ons bedrijf';
  const templates = findTemplateSet(branche);

  return {
    headline: pickRandom(templates.headlines),
    tekst: interpolate(pickRandom(templates.teksten), naam),
    usps: pickRandom(templates.usps),
    cta: pickRandom(templates.ctas),
  };
}

/**
 * Returns all available branche keys that have dedicated templates.
 */
export function getAvailableBranches(): string[] {
  return Object.keys(BRANCHE_TEMPLATES);
}
