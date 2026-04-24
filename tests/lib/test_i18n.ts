import { describe, it, expect } from 'vitest';
import { t, resolveLocale } from '@/lib/i18n';

describe('t', () => {
  it('test_t_nl_returnsSourceString', () => {
    expect(t('nl', 'Claim jouw postcodes')).toBe('Claim jouw postcodes');
  });

  it('test_t_en_returnsTranslation', () => {
    expect(t('en', 'Claim jouw postcodes')).toBe('Claim your postcodes');
  });

  it('test_t_enUnknownKey_fallsBackToDutchSource', () => {
    expect(t('en', 'Een string die niet vertaald is')).toBe('Een string die niet vertaald is');
  });

  it('test_t_coreUiStrings_haveTranslations', () => {
    const core = [
      'Start nu jouw campagne',
      'Nieuwe campagne',
      'Mijn profiel',
      'Uitloggen',
      'Inloggen',
    ];
    for (const key of core) {
      expect(t('en', key)).not.toBe(key);
    }
  });
});

describe('resolveLocale', () => {
  it('test_resolveLocale_cookieWins_over_acceptLanguage', () => {
    expect(resolveLocale('en-US,en;q=0.9', 'nl')).toBe('nl');
    expect(resolveLocale('nl-NL,nl;q=0.9', 'en')).toBe('en');
  });

  it('test_resolveLocale_noCookie_dutchInHeader_returnsNl', () => {
    expect(resolveLocale('nl-NL,nl;q=0.9,en;q=0.5', null)).toBe('nl');
  });

  it('test_resolveLocale_noCookie_englishOnly_returnsEn', () => {
    expect(resolveLocale('en-US,en;q=0.9', null)).toBe('en');
  });

  it('test_resolveLocale_noCookie_noHeader_defaultsNl', () => {
    expect(resolveLocale(null, null)).toBe('nl');
    expect(resolveLocale(undefined, undefined)).toBe('nl');
  });

  it('test_resolveLocale_otherLanguage_defaultsNl', () => {
    // German visitor without NL/EN preference still gets the Dutch site
    expect(resolveLocale('de-DE,de;q=0.9', null)).toBe('nl');
  });
});
