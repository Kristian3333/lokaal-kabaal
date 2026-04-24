import { describe, it, expect } from 'vitest';
import { validateProefFlyerInput } from '@/lib/proef-flyer';

describe('validateProefFlyerInput', () => {
  it('test_validate_validInput_returnsNormalized', () => {
    const r = validateProefFlyerInput({
      email: '  jane@bedrijf.nl  ',
      bedrijfsnaam: ' Jane B.V. ',
      adres: 'Kerkstraat 12, 3512 AB Utrecht',
      branche: 'Kapper / Barbershop',
    });
    expect(r.ok).toBe(true);
    expect(r.normalized?.email).toBe('jane@bedrijf.nl');
    expect(r.normalized?.bedrijfsnaam).toBe('Jane B.V.');
  });

  it('test_validate_invalidEmail_errors', () => {
    const r = validateProefFlyerInput({
      email: 'not-an-email',
      bedrijfsnaam: 'OK',
      adres: 'Kerkstraat 12, 3512 AB Utrecht',
      branche: 'Kapper',
    });
    expect(r.ok).toBe(false);
    expect(r.errors.email).toBeDefined();
  });

  it('test_validate_shortBedrijfsnaam_errors', () => {
    const r = validateProefFlyerInput({
      email: 'a@b.nl',
      bedrijfsnaam: 'X',
      adres: 'Kerkstraat 12, 3512 AB Utrecht',
      branche: 'Kapper',
    });
    expect(r.ok).toBe(false);
    expect(r.errors.bedrijfsnaam).toBeDefined();
  });

  it('test_validate_shortAddress_errors', () => {
    const r = validateProefFlyerInput({
      email: 'a@b.nl',
      bedrijfsnaam: 'Bedrijf',
      adres: 'kort',
      branche: 'Kapper',
    });
    expect(r.ok).toBe(false);
    expect(r.errors.adres).toBeDefined();
  });

  it('test_validate_emptyBranche_errors', () => {
    const r = validateProefFlyerInput({
      email: 'a@b.nl',
      bedrijfsnaam: 'Bedrijf',
      adres: 'Kerkstraat 12, 3512 AB Utrecht',
      branche: '',
    });
    expect(r.ok).toBe(false);
    expect(r.errors.branche).toBeDefined();
  });

  it('test_validate_undefinedInput_errorsGracefully', () => {
    const r = validateProefFlyerInput(undefined);
    expect(r.ok).toBe(false);
    expect(Object.keys(r.errors).length).toBeGreaterThan(0);
  });

  it('test_validate_nonStringInputs_rejected', () => {
    const r = validateProefFlyerInput({
      email: 42, bedrijfsnaam: [], adres: {}, branche: null,
    });
    expect(r.ok).toBe(false);
  });
});
