/**
 * Minimal i18n dictionary for the expat-SMB-in-NL English toggle.
 *
 * We don't want a full i18n framework dependency yet; that can come
 * with next-intl when we expand to BE/DE. For now a typed dictionary
 * covers the handful of UI strings we actually translate (landing
 * CTAs + wizard headers). Anything not in the dictionary falls back
 * to the Dutch source string.
 */

export type Locale = 'nl' | 'en';

/** All UI strings that have an English translation. Keys match the
 *  Dutch source exactly so call sites read: t(locale, 'Start nu jouw campagne'). */
export const EN: Record<string, string> = {
  'Claim jouw postcodes':          'Claim your postcodes',
  'Start nu jouw campagne':        'Start your campaign',
  'Hoe het werkt':                 'How it works',
  'Start jouw campagne':           'Start your campaign',
  'Bekijk pricing':                'See pricing',
  'Flyers naar nieuwe bewoners':   'Flyers for new residents',
  'Elke maand automatisch':        'Every month, automated',
  'Nieuwe campagne':               'New campagne',
  'Nieuwe campagne starten':       'Start new campaign',
  'Naar dashboard':                'Go to dashboard',
  'Mijn flyer':                    'My flyer',
  'Conversies':                    'Conversions',
  'Abonnement':                    'Subscription',
  'Mijn profiel':                  'My profile',
  'Uitloggen':                     'Sign out',
  'Inloggen':                      'Sign in',
  'Registreren':                   'Register',
  'Maandelijks':                   'Monthly',
  'Jaarlijks':                     'Yearly',
  'Bezorgd tussen 28-30e':         'Delivered 28-30th',
};

/** Translate: returns the English string if known, else the Dutch source. */
export function t(locale: Locale, key: string): string {
  if (locale === 'en' && key in EN) return EN[key];
  return key;
}

/** Parse `Accept-Language` header or a cookie value into a Locale. */
export function resolveLocale(acceptLanguage?: string | null, cookieLocale?: string | null): Locale {
  if (cookieLocale === 'en' || cookieLocale === 'nl') return cookieLocale;
  if (!acceptLanguage) return 'nl';
  // Very loose: pick 'en' only if Dutch isn't in the header at all
  const langs = acceptLanguage.toLowerCase().split(',').map(s => s.trim().split(';')[0]);
  if (langs.some(l => l.startsWith('nl'))) return 'nl';
  if (langs.some(l => l.startsWith('en'))) return 'en';
  return 'nl';
}
