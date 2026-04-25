import { describe, it, expect } from 'vitest';
import {
  buildMailto,
  CONTACT_SUPPORT_EMAIL,
  CONTACT_FORM_FROM_ADDRESS,
  CONTACT_FORM_FORWARD_TO,
} from '@/lib/contact-config';

describe('contact-config', () => {
  it('test_supportEmail_isVerbouwproSupport', () => {
    // Decision april 2026: every mailto routes to verbouwpro support.
    expect(CONTACT_SUPPORT_EMAIL).toBe('support@verbouwpro.nl');
    expect(CONTACT_FORM_FORWARD_TO).toBe(CONTACT_SUPPORT_EMAIL);
  });

  it('test_fromAddress_usesAgencyDomainForResend', () => {
    // Outbound (Resend) keeps the lokaalkabaal.agency domain so DKIM/DMARC
    // line up; only inbound routes elsewhere.
    expect(CONTACT_FORM_FROM_ADDRESS).toContain('@lokaalkabaal.agency');
  });

  it('test_buildMailto_partnersCategory_hasBracketedSubject', () => {
    const m = buildMailto('partners');
    expect(m).toContain('mailto:support@verbouwpro.nl');
    expect(m).toContain('subject=');
    // Subject is URL-encoded; the prefix must survive encoding.
    expect(decodeURIComponent(m)).toContain('[partners]');
  });

  it('test_buildMailto_eachCategory_uniqueSubject', () => {
    const cats = [
      'partners', 'design', 'data', 'integraties', 'gemeenten', 'overheid',
      'bureaus', 'retargeting', 'be-waitlist', 'de-waitlist', 'custom-pricing',
      'general',
    ] as const;
    const subjects = cats.map(c => decodeURIComponent(buildMailto(c).split('subject=')[1]));
    expect(new Set(subjects).size).toBe(cats.length);
  });

  it('test_buildMailto_subjectIsUrlEncoded', () => {
    // Spaces must not appear raw -- they break some mail clients.
    const m = buildMailto('design');
    const queryPart = m.split('?')[1];
    expect(queryPart).not.toMatch(/ /);
  });

  it('test_buildMailto_beWaitlist_hasBeBracketPrefix', () => {
    expect(decodeURIComponent(buildMailto('be-waitlist'))).toContain('[BE-waitlist]');
  });

  it('test_buildMailto_deWaitlist_hasDeBracketPrefix', () => {
    expect(decodeURIComponent(buildMailto('de-waitlist'))).toContain('[DE-waitlist]');
  });
});
