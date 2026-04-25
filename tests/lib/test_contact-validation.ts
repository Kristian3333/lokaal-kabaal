import { describe, it, expect } from 'vitest';
import {
  validateContactInput,
  CONTACT_BERICHT_MAX,
  CONTACT_NAAM_MAX,
} from '@/lib/contact-validation';

describe('validateContactInput', () => {
  // ─── Happy path ────────────────────────────────────────────────────────────

  it('test_validate_validInput_returnsNormalized', () => {
    const r = validateContactInput({
      naam: '  Jane de Vries  ',
      email: '  jane@bedrijf.nl  ',
      bericht: '  Ik wil graag meer info.  ',
    });
    expect(r.ok).toBe(true);
    expect(r.normalized?.naam).toBe('Jane de Vries');
    expect(r.normalized?.email).toBe('jane@bedrijf.nl');
    expect(r.normalized?.bericht).toBe('Ik wil graag meer info.');
  });

  it('test_validate_validInputWithoutHoneypot_returnsOk', () => {
    const r = validateContactInput({
      naam: 'Jane',
      email: 'a@b.nl',
      bericht: 'Vraagje.',
    });
    expect(r.ok).toBe(true);
  });

  it('test_validate_validInputWithEmptyHoneypot_returnsOk', () => {
    const r = validateContactInput({
      naam: 'Jane',
      email: 'a@b.nl',
      bericht: 'Vraagje.',
      website: '',
    });
    expect(r.ok).toBe(true);
  });

  // ─── Honeypot (spam detection) ─────────────────────────────────────────────

  it('test_validate_honeypotFilled_rejectsAsSpam', () => {
    const r = validateContactInput({
      naam: 'Bot',
      email: 'bot@spam.ru',
      bericht: 'Buy now',
      website: 'https://spam.example',
    });
    expect(r.ok).toBe(false);
    expect(r.errors._spam).toBeDefined();
  });

  it('test_validate_honeypotWhitespace_rejectsAsSpam', () => {
    const r = validateContactInput({
      naam: 'Bot',
      email: 'bot@x.nl',
      bericht: 'hi',
      website: '   ',
    });
    expect(r.ok).toBe(false);
    expect(r.errors._spam).toBeDefined();
  });

  // ─── Email validation ──────────────────────────────────────────────────────

  it('test_validate_invalidEmail_errors', () => {
    const r = validateContactInput({
      naam: 'Jane',
      email: 'not-an-email',
      bericht: 'Vraagje.',
    });
    expect(r.ok).toBe(false);
    expect(r.errors.email).toBeDefined();
  });

  it('test_validate_emptyEmail_errors', () => {
    const r = validateContactInput({
      naam: 'Jane',
      email: '',
      bericht: 'Vraagje.',
    });
    expect(r.ok).toBe(false);
    expect(r.errors.email).toBeDefined();
  });

  // ─── Naam length boundaries ────────────────────────────────────────────────

  it('test_validate_emptyNaam_errors', () => {
    const r = validateContactInput({
      naam: '',
      email: 'a@b.nl',
      bericht: 'Vraagje.',
    });
    expect(r.ok).toBe(false);
    expect(r.errors.naam).toBeDefined();
  });

  it('test_validate_naamTooLong_errors', () => {
    const r = validateContactInput({
      naam: 'A'.repeat(CONTACT_NAAM_MAX + 1),
      email: 'a@b.nl',
      bericht: 'Vraagje.',
    });
    expect(r.ok).toBe(false);
    expect(r.errors.naam).toBeDefined();
  });

  it('test_validate_naamAtMaxLength_acceptsBoundary', () => {
    const r = validateContactInput({
      naam: 'A'.repeat(CONTACT_NAAM_MAX),
      email: 'a@b.nl',
      bericht: 'Vraagje.',
    });
    expect(r.ok).toBe(true);
  });

  // ─── Bericht length boundaries ─────────────────────────────────────────────

  it('test_validate_emptyBericht_errors', () => {
    const r = validateContactInput({
      naam: 'Jane',
      email: 'a@b.nl',
      bericht: '',
    });
    expect(r.ok).toBe(false);
    expect(r.errors.bericht).toBeDefined();
  });

  it('test_validate_berichtAtMaxLength_acceptsBoundary', () => {
    const r = validateContactInput({
      naam: 'Jane',
      email: 'a@b.nl',
      bericht: 'a'.repeat(CONTACT_BERICHT_MAX),
    });
    expect(r.ok).toBe(true);
  });

  it('test_validate_berichtOverMaxLength_errors', () => {
    const r = validateContactInput({
      naam: 'Jane',
      email: 'a@b.nl',
      bericht: 'a'.repeat(CONTACT_BERICHT_MAX + 1),
    });
    expect(r.ok).toBe(false);
    expect(r.errors.bericht).toBeDefined();
  });

  it('test_validate_berichtWhitespaceOnly_errors', () => {
    const r = validateContactInput({
      naam: 'Jane',
      email: 'a@b.nl',
      bericht: '     \n\t  ',
    });
    expect(r.ok).toBe(false);
    expect(r.errors.bericht).toBeDefined();
  });

  // ─── Failure modes / type coercion ─────────────────────────────────────────

  it('test_validate_undefinedInput_errorsGracefully', () => {
    const r = validateContactInput(undefined);
    expect(r.ok).toBe(false);
    expect(Object.keys(r.errors).length).toBeGreaterThan(0);
  });

  it('test_validate_nullInput_errorsGracefully', () => {
    const r = validateContactInput(null);
    expect(r.ok).toBe(false);
  });

  it('test_validate_nonStringFields_rejected', () => {
    const r = validateContactInput({
      naam: 42,
      email: [],
      bericht: {},
    });
    expect(r.ok).toBe(false);
    expect(r.errors.naam).toBeDefined();
    expect(r.errors.email).toBeDefined();
    expect(r.errors.bericht).toBeDefined();
  });

  it('test_validate_missingAllFields_errors', () => {
    const r = validateContactInput({});
    expect(r.ok).toBe(false);
    expect(r.errors.naam).toBeDefined();
    expect(r.errors.email).toBeDefined();
    expect(r.errors.bericht).toBeDefined();
  });

  // ─── Multiple errors aggregate ─────────────────────────────────────────────

  it('test_validate_multipleErrors_allReported', () => {
    const r = validateContactInput({
      naam: '',
      email: 'bad',
      bericht: '',
    });
    expect(r.ok).toBe(false);
    expect(r.errors.naam).toBeDefined();
    expect(r.errors.email).toBeDefined();
    expect(r.errors.bericht).toBeDefined();
  });
});
