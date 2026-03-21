// Print.one tarieven — handmatig ingevoerd op basis van Print.one prijspagina
// ACTIE VEREIST: Verifieer deze prijzen op https://print.one/pricing vóór go-live
//
// Bulktarief (≥300 stuks): €0,69/stuk incl. druk + PostNL-bezorging
// Toeslagen zijn additief op de basisprijs

export const PRINTONE_BASE_A6 = 0.69;   // A6 enkelvoudig — basistartief

// Toeslagen per formaat (additief op PRINTONE_BASE_A6)
export const PRINTONE_TOESLAG: Record<'a6' | 'a5' | 'sq', number> = {
  a6: 0.00,   // standaard
  a5: 0.18,   // +€0,18/stuk
  sq: 0.19,   // +€0,19/stuk (148×148 mm)
};

// Dubbelzijdig toeslag per formaat
export const PRINTONE_DUBBELZIJDIG: Record<'a6' | 'a5' | 'sq', number> = {
  a6: 0.10,
  a5: 0.10,
  sq: 0.10,
};

export type FlyerFormaat = 'a6' | 'a5' | 'sq';

export interface FlyerPrijsOpties {
  formaat: FlyerFormaat;
  dubbelzijdig: boolean;
  aantalFlyers: number;
}

/** Geeft de prijs per stuk terug (incl. alle toeslagen) */
export function prijsPerStuk(formaat: FlyerFormaat, dubbelzijdig: boolean): number {
  return (
    PRINTONE_BASE_A6 +
    PRINTONE_TOESLAG[formaat] +
    (dubbelzijdig ? PRINTONE_DUBBELZIJDIG[formaat] : 0)
  );
}

/** Totale printkosten voor een batch */
export function totalePrintkosten({ formaat, dubbelzijdig, aantalFlyers }: FlyerPrijsOpties): number {
  return parseFloat((prijsPerStuk(formaat, dubbelzijdig) * aantalFlyers).toFixed(2));
}

/** Leesbare label voor de prijs per stuk */
export function prijsLabel(formaat: FlyerFormaat, dubbelzijdig: boolean): string {
  const p = prijsPerStuk(formaat, dubbelzijdig);
  return `€${p.toFixed(2).replace('.', ',')}/stuk`;
}

/** Omschrijving van toeslag t.o.v. A6 enkelvoudig (voor UI) */
export function toeslagLabel(formaat: FlyerFormaat, dubbelzijdig: boolean): string {
  const toeslag = PRINTONE_TOESLAG[formaat] + (dubbelzijdig ? PRINTONE_DUBBELZIJDIG[formaat] : 0);
  if (toeslag === 0) return 'Standaard · €0,69/stuk';
  return `+€${toeslag.toFixed(2).replace('.', ',')} /stuk`;
}
