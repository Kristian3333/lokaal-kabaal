// CBS-gebaseerde verhuisgraad per gemeente
// Bron: CBS StatLine tabel 60048NED – GevestigdInDeGemeenteRelatief_7 (2022-2023)
// = vestigingen tussen gemeenten per 1.000 inwoners per jaar
// In-memory cache per PC4 (overleeft meerdere requests op dezelfde Vercel instance)

const GEMEENTE_VERHUISGRAAD: Record<string, number> = {
  'GM0363': 0.088, // Amsterdam
  'GM0034': 0.072, // Almere
  'GM0362': 0.076, // Amstelveen
  'GM0479': 0.075, // Zaanstad
  'GM0439': 0.073, // Purmerend
  'GM0361': 0.068, // Alkmaar
  'GM0373': 0.065, // Beverwijk
  'GM0392': 0.079, // Haarlem
  'GM0537': 0.070, // Katwijk
  'GM0546': 0.087, // Leiden
  'GM0484': 0.068, // Alphen aan den Rijn
  'GM0518': 0.076, // Den Haag
  'GM0503': 0.085, // Delft
  'GM0637': 0.071, // Zoetermeer
  'GM0513': 0.075, // Gouda
  'GM0502': 0.073, // Capelle aan den IJssel
  'GM0599': 0.089, // Rotterdam
  'GM0606': 0.075, // Schiedam
  'GM0505': 0.074, // Dordrecht
  'GM0344': 0.093, // Utrecht
  'GM0356': 0.076, // Nieuwegein
  'GM0355': 0.069, // Zeist
  'GM0307': 0.077, // Amersfoort
  'GM0281': 0.064, // Tiel
  'GM0216': 0.066, // Culemborg
  'GM0512': 0.066, // Gorinchem
  'GM1655': 0.059, // Schouwen-Duiveland
  'GM0664': 0.062, // Goes
  'GM0715': 0.063, // Terneuzen
  'GM0748': 0.069, // Bergen op Zoom
  'GM1674': 0.069, // Roosendaal
  'GM0758': 0.075, // Breda
  'GM0855': 0.075, // Tilburg
  'GM0796': 0.076, // Den Bosch
  'GM0828': 0.069, // Oss
  'GM1948': 0.063, // Bernheze
  'GM0861': 0.073, // Veldhoven
  'GM0772': 0.082, // Eindhoven
  'GM0794': 0.072, // Helmond
  'GM1982': 0.062, // Land van Cuijk
  'GM0983': 0.069, // Venlo
  'GM0988': 0.064, // Weert
  'GM1711': 0.061, // Echt-Susteren
  'GM0935': 0.075, // Maastricht
  'GM0994': 0.060, // Valkenburg
  'GM0917': 0.065, // Heerlen
  'GM0268': 0.086, // Nijmegen
  'GM0296': 0.067, // Wijchen
  'GM0289': 0.079, // Wageningen
  'GM0202': 0.077, // Arnhem
  'GM0275': 0.063, // Rheden
  'GM1955': 0.063, // Zevenaar
  'GM0222': 0.064, // Doetinchem
  'GM0294': 0.060, // Winterswijk
  'GM0301': 0.069, // Zutphen
  'GM0200': 0.070, // Apeldoorn
  'GM0150': 0.075, // Deventer
  'GM0153': 0.077, // Enschede
  'GM0141': 0.068, // Almelo
  'GM0160': 0.062, // Hardenberg
  'GM0109': 0.059, // Coevorden
  'GM0114': 0.063, // Emmen
  'GM0193': 0.076, // Zwolle
  'GM0177': 0.063, // Raalte
  'GM0995': 0.074, // Lelystad
  'GM0171': 0.061, // Noordoostpolder
  'GM1900': 0.063, // Súdwest-Fryslân
  'GM0072': 0.060, // Harlingen
  'GM1949': 0.062, // Waadhoeke
  'GM0080': 0.079, // Leeuwarden
  'GM0106': 0.065, // Assen
  'GM0014': 0.100, // Groningen (studentenstad)
};

// PC4 eerste 2 cijfers → CBS gemeente code
const PC4_GM: Record<string, string> = {
  '10': 'GM0363', '11': 'GM0363', '12': 'GM0363',
  '13': 'GM0034',
  '14': 'GM0362',
  '15': 'GM0479',
  '16': 'GM0439',
  '17': 'GM0361', '18': 'GM0361',
  '19': 'GM0373',
  '20': 'GM0392', '21': 'GM0392',
  '22': 'GM0537',
  '23': 'GM0546',
  '24': 'GM0484',
  '25': 'GM0518',
  '26': 'GM0503',
  '27': 'GM0637',
  '28': 'GM0513',
  '29': 'GM0502',
  '30': 'GM0599', '31': 'GM0599', '32': 'GM0599',
  '33': 'GM0505', '34': 'GM0505',
  '35': 'GM0344', '36': 'GM0344',
  '37': 'GM0355',
  '38': 'GM0307', '39': 'GM0307',
  '40': 'GM0281',
  '41': 'GM0216',
  '42': 'GM0512',
  '43': 'GM1655',
  '44': 'GM0664',
  '45': 'GM0715',
  '46': 'GM0748',
  '47': 'GM1674',
  '48': 'GM0758', '49': 'GM0758',
  '50': 'GM0855', '51': 'GM0855',
  '52': 'GM0796',
  '53': 'GM0828',
  '54': 'GM1948',
  '55': 'GM0861',
  '56': 'GM0772',
  '57': 'GM0794',
  '58': 'GM1982',
  '59': 'GM0983',
  '60': 'GM0988',
  '61': 'GM1711',
  '62': 'GM0935',
  '63': 'GM0994',
  '64': 'GM0917',
  '65': 'GM0268',
  '66': 'GM0296',
  '67': 'GM0289',
  '68': 'GM0202',
  '69': 'GM1955', // Zevenaar/Rheden (niet Arnhem)
  '70': 'GM0222',
  '71': 'GM0294',
  '72': 'GM0301',
  '73': 'GM0200',
  '74': 'GM0150',
  '75': 'GM0153',
  '76': 'GM0141',
  '77': 'GM0160',
  '78': 'GM0114',
  '79': 'GM0109',
  '80': 'GM0193',
  '81': 'GM0177',
  '82': 'GM0995',
  '83': 'GM0171',
  '84': 'GM1900', '85': 'GM1900', '86': 'GM1900',
  '87': 'GM0072',
  '88': 'GM1949',
  '89': 'GM0080',
  '94': 'GM0106',
  '97': 'GM0014', '98': 'GM0014',
};

// CBS nationaal gemiddelde 2023
const NATIONAAL = 0.072;

// In-memory cache: PC4 → verhuisgraad + gemeente info
const PC4_CACHE = new Map<string, { rate: number; gm: string | null }>();

/**
 * Geeft de jaarlijkse verhuisgraad als fractie voor een PC4 (bijv. 0.088 = 8,8%).
 * Gebruikt CBS-gebaseerde statische data per gemeente, gecached per PC4.
 */
export function getVerhuisgraadVoorPc4(pc4: string): { rate: number; gm: string | null } {
  const trimmed = pc4.trim().slice(0, 4);
  if (PC4_CACHE.has(trimmed)) return PC4_CACHE.get(trimmed)!;

  const prefix = trimmed.slice(0, 2);
  const gm = PC4_GM[prefix] ?? null;
  const rate = (gm ? (GEMEENTE_VERHUISGRAAD[gm] ?? NATIONAAL) : NATIONAAL);

  const result = { rate, gm };
  PC4_CACHE.set(trimmed, result);
  return result;
}

// Backward-compat export
export function getGemeenteCodeVoorPc4(pc4: string): string | null {
  return getVerhuisgraadVoorPc4(pc4).gm;
}
