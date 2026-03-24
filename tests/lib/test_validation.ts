import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPc4,
  isValidPc4List,
  isValidExternalUrl,
  isValidHexColor,
  isInRange,
  isValidFormaat,
  isValidDuration,
  isValidPincode,
  isValidBranche,
  validationError,
} from '@/lib/validation';

// ─── isValidEmail ────────────────────────────────────────────────────────────

describe('isValidEmail', () => {
  it('test_isValidEmail_validBasic_returnsTrue', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('test_isValidEmail_validWithSubdomain_returnsTrue', () => {
    expect(isValidEmail('user@mail.example.com')).toBe(true);
  });

  it('test_isValidEmail_validWithPlus_returnsTrue', () => {
    expect(isValidEmail('user+tag@example.com')).toBe(true);
  });

  it('test_isValidEmail_missingAt_returnsFalse', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });

  it('test_isValidEmail_missingDomain_returnsFalse', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  it('test_isValidEmail_missingLocal_returnsFalse', () => {
    expect(isValidEmail('@example.com')).toBe(false);
  });

  it('test_isValidEmail_empty_returnsFalse', () => {
    expect(isValidEmail('')).toBe(false);
  });

  it('test_isValidEmail_tooLong_returnsFalse', () => {
    // 255 chars total, exceeds the 254-char limit
    const longEmail = 'a'.repeat(244) + '@example.com'; // 244 + 1 + 11 = 256
    expect(longEmail.length).toBeGreaterThan(254);
    expect(isValidEmail(longEmail)).toBe(false);
  });

  it('test_isValidEmail_exactlyMaxLength_returnsTrue', () => {
    // 254 total: local@domain
    const local = 'a'.repeat(243);
    const email = `${local}@example.com`;
    expect(email.length).toBe(254 + 1); // Actually 243 + 1 + 11 = 255, so adjust
    // Let's be precise: 254 chars total
    const email254 = 'a'.repeat(242) + '@example.com'; // 242 + 1 + 11 = 254
    expect(email254.length).toBe(254);
    expect(isValidEmail(email254)).toBe(true);
  });

  it('test_isValidEmail_null_returnsFalse', () => {
    expect(isValidEmail(null)).toBe(false);
  });

  it('test_isValidEmail_undefined_returnsFalse', () => {
    expect(isValidEmail(undefined)).toBe(false);
  });

  it('test_isValidEmail_number_returnsFalse', () => {
    expect(isValidEmail(123)).toBe(false);
  });

  it('test_isValidEmail_withSpaces_returnsFalse', () => {
    expect(isValidEmail('user @example.com')).toBe(false);
  });
});

// ─── isValidPc4 ──────────────────────────────────────────────────────────────

describe('isValidPc4', () => {
  it('test_isValidPc4_valid4Digits_returnsTrue', () => {
    expect(isValidPc4('1234')).toBe(true);
  });

  it('test_isValidPc4_valid0000_returnsTrue', () => {
    expect(isValidPc4('0000')).toBe(true);
  });

  it('test_isValidPc4_valid9999_returnsTrue', () => {
    expect(isValidPc4('9999')).toBe(true);
  });

  it('test_isValidPc4_threeDigits_returnsFalse', () => {
    expect(isValidPc4('123')).toBe(false);
  });

  it('test_isValidPc4_fiveDigits_returnsFalse', () => {
    expect(isValidPc4('12345')).toBe(false);
  });

  it('test_isValidPc4_letters_returnsFalse', () => {
    expect(isValidPc4('abcd')).toBe(false);
  });

  it('test_isValidPc4_empty_returnsFalse', () => {
    expect(isValidPc4('')).toBe(false);
  });

  it('test_isValidPc4_withLetterSuffix_returnsFalse', () => {
    expect(isValidPc4('1234AB')).toBe(false);
  });

  it('test_isValidPc4_null_returnsFalse', () => {
    expect(isValidPc4(null)).toBe(false);
  });

  it('test_isValidPc4_number_returnsFalse', () => {
    expect(isValidPc4(1234)).toBe(false);
  });
});

// ─── isValidPc4List ──────────────────────────────────────────────────────────

describe('isValidPc4List', () => {
  it('test_isValidPc4List_validArray_returnsTrue', () => {
    expect(isValidPc4List(['1234', '5678', '9012'])).toBe(true);
  });

  it('test_isValidPc4List_emptyArray_returnsTrue', () => {
    expect(isValidPc4List([])).toBe(true);
  });

  it('test_isValidPc4List_singleValid_returnsTrue', () => {
    expect(isValidPc4List(['1234'])).toBe(true);
  });

  it('test_isValidPc4List_mixedValidInvalid_returnsFalse', () => {
    expect(isValidPc4List(['1234', 'abcd', '5678'])).toBe(false);
  });

  it('test_isValidPc4List_allInvalid_returnsFalse', () => {
    expect(isValidPc4List(['abc', '12345'])).toBe(false);
  });

  it('test_isValidPc4List_notArray_returnsFalse', () => {
    expect(isValidPc4List('1234')).toBe(false);
  });

  it('test_isValidPc4List_null_returnsFalse', () => {
    expect(isValidPc4List(null)).toBe(false);
  });

  it('test_isValidPc4List_arrayWithNumbers_returnsFalse', () => {
    expect(isValidPc4List([1234, 5678])).toBe(false);
  });
});

// ─── isValidExternalUrl ──────────────────────────────────────────────────────

describe('isValidExternalUrl', () => {
  it('test_isValidExternalUrl_validHttp_returnsTrue', () => {
    expect(isValidExternalUrl('http://example.com')).toBe(true);
  });

  it('test_isValidExternalUrl_validHttps_returnsTrue', () => {
    expect(isValidExternalUrl('https://example.com')).toBe(true);
  });

  it('test_isValidExternalUrl_validWithPath_returnsTrue', () => {
    expect(isValidExternalUrl('https://example.com/path?q=1')).toBe(true);
  });

  it('test_isValidExternalUrl_fileProtocol_returnsFalse', () => {
    expect(isValidExternalUrl('file:///etc/passwd')).toBe(false);
  });

  it('test_isValidExternalUrl_ftpProtocol_returnsFalse', () => {
    expect(isValidExternalUrl('ftp://example.com')).toBe(false);
  });

  it('test_isValidExternalUrl_localhost_returnsFalse', () => {
    expect(isValidExternalUrl('http://localhost')).toBe(false);
  });

  it('test_isValidExternalUrl_localhostWithPort_returnsFalse', () => {
    expect(isValidExternalUrl('http://localhost:3000')).toBe(false);
  });

  it('test_isValidExternalUrl_127001_returnsFalse', () => {
    expect(isValidExternalUrl('http://127.0.0.1')).toBe(false);
  });

  it('test_isValidExternalUrl_0000_returnsFalse', () => {
    expect(isValidExternalUrl('http://0.0.0.0')).toBe(false);
  });

  it('test_isValidExternalUrl_10x_returnsFalse', () => {
    expect(isValidExternalUrl('http://10.0.0.1')).toBe(false);
  });

  it('test_isValidExternalUrl_192168x_returnsFalse', () => {
    expect(isValidExternalUrl('http://192.168.1.1')).toBe(false);
  });

  it('test_isValidExternalUrl_172Private_returnsFalse', () => {
    expect(isValidExternalUrl('http://172.16.0.1')).toBe(false);
    expect(isValidExternalUrl('http://172.31.255.255')).toBe(false);
  });

  it('test_isValidExternalUrl_172Public_returnsTrue', () => {
    expect(isValidExternalUrl('http://172.15.0.1')).toBe(true);
    expect(isValidExternalUrl('http://172.32.0.1')).toBe(true);
  });

  it('test_isValidExternalUrl_ipv6Loopback_returnsFalse', () => {
    expect(isValidExternalUrl('http://[::1]')).toBe(false);
  });

  it('test_isValidExternalUrl_invalidString_returnsFalse', () => {
    expect(isValidExternalUrl('not-a-url')).toBe(false);
  });

  it('test_isValidExternalUrl_empty_returnsFalse', () => {
    expect(isValidExternalUrl('')).toBe(false);
  });

  it('test_isValidExternalUrl_null_returnsFalse', () => {
    expect(isValidExternalUrl(null)).toBe(false);
  });

  it('test_isValidExternalUrl_number_returnsFalse', () => {
    expect(isValidExternalUrl(123)).toBe(false);
  });
});

// ─── isValidHexColor ─────────────────────────────────────────────────────────

describe('isValidHexColor', () => {
  it('test_isValidHexColor_validUppercase_returnsTrue', () => {
    expect(isValidHexColor('#FF0000')).toBe(true);
  });

  it('test_isValidHexColor_validLowercase_returnsTrue', () => {
    expect(isValidHexColor('#ff0000')).toBe(true);
  });

  it('test_isValidHexColor_validMixed_returnsTrue', () => {
    expect(isValidHexColor('#0A0a0A')).toBe(true);
  });

  it('test_isValidHexColor_validBlack_returnsTrue', () => {
    expect(isValidHexColor('#000000')).toBe(true);
  });

  it('test_isValidHexColor_validWhite_returnsTrue', () => {
    expect(isValidHexColor('#FFFFFF')).toBe(true);
  });

  it('test_isValidHexColor_missingHash_returnsFalse', () => {
    expect(isValidHexColor('FF0000')).toBe(false);
  });

  it('test_isValidHexColor_shorthand_returnsFalse', () => {
    expect(isValidHexColor('#FFF')).toBe(false);
  });

  it('test_isValidHexColor_invalidChars_returnsFalse', () => {
    expect(isValidHexColor('#GGGGGG')).toBe(false);
  });

  it('test_isValidHexColor_tooLong_returnsFalse', () => {
    expect(isValidHexColor('#FF00001')).toBe(false);
  });

  it('test_isValidHexColor_empty_returnsFalse', () => {
    expect(isValidHexColor('')).toBe(false);
  });

  it('test_isValidHexColor_null_returnsFalse', () => {
    expect(isValidHexColor(null)).toBe(false);
  });

  it('test_isValidHexColor_withAlpha_returnsFalse', () => {
    expect(isValidHexColor('#FF000080')).toBe(false);
  });
});

// ─── isInRange ───────────────────────────────────────────────────────────────

describe('isInRange', () => {
  it('test_isInRange_withinRange_returnsTrue', () => {
    expect(isInRange(5, 1, 10)).toBe(true);
  });

  it('test_isInRange_atMin_returnsTrue', () => {
    expect(isInRange(1, 1, 10)).toBe(true);
  });

  it('test_isInRange_atMax_returnsTrue', () => {
    expect(isInRange(10, 1, 10)).toBe(true);
  });

  it('test_isInRange_belowMin_returnsFalse', () => {
    expect(isInRange(0, 1, 10)).toBe(false);
  });

  it('test_isInRange_aboveMax_returnsFalse', () => {
    expect(isInRange(11, 1, 10)).toBe(false);
  });

  it('test_isInRange_NaN_returnsFalse', () => {
    expect(isInRange(NaN, 1, 10)).toBe(false);
  });

  it('test_isInRange_string_returnsFalse', () => {
    expect(isInRange('5', 1, 10)).toBe(false);
  });

  it('test_isInRange_null_returnsFalse', () => {
    expect(isInRange(null, 1, 10)).toBe(false);
  });

  it('test_isInRange_undefined_returnsFalse', () => {
    expect(isInRange(undefined, 1, 10)).toBe(false);
  });

  it('test_isInRange_negative_returnsTrue', () => {
    expect(isInRange(-5, -10, 0)).toBe(true);
  });

  it('test_isInRange_float_returnsTrue', () => {
    expect(isInRange(5.5, 1, 10)).toBe(true);
  });

  it('test_isInRange_infinity_returnsFalse', () => {
    expect(isInRange(Infinity, 1, 10)).toBe(false);
  });
});

// ─── isValidFormaat ──────────────────────────────────────────────────────────

describe('isValidFormaat', () => {
  it('test_isValidFormaat_a6_returnsTrue', () => {
    expect(isValidFormaat('a6')).toBe(true);
  });

  it('test_isValidFormaat_a5_returnsTrue', () => {
    expect(isValidFormaat('a5')).toBe(true);
  });

  it('test_isValidFormaat_sq_returnsTrue', () => {
    expect(isValidFormaat('sq')).toBe(true);
  });

  it('test_isValidFormaat_a4_returnsFalse', () => {
    expect(isValidFormaat('a4')).toBe(false);
  });

  it('test_isValidFormaat_uppercase_returnsFalse', () => {
    expect(isValidFormaat('A6')).toBe(false);
  });

  it('test_isValidFormaat_empty_returnsFalse', () => {
    expect(isValidFormaat('')).toBe(false);
  });

  it('test_isValidFormaat_null_returnsFalse', () => {
    expect(isValidFormaat(null)).toBe(false);
  });

  it('test_isValidFormaat_undefined_returnsFalse', () => {
    expect(isValidFormaat(undefined)).toBe(false);
  });
});

// ─── isValidDuration ─────────────────────────────────────────────────────────

describe('isValidDuration', () => {
  it('test_isValidDuration_1_returnsTrue', () => {
    expect(isValidDuration(1)).toBe(true);
  });

  it('test_isValidDuration_12_returnsTrue', () => {
    expect(isValidDuration(12)).toBe(true);
  });

  it('test_isValidDuration_24_returnsTrue', () => {
    expect(isValidDuration(24)).toBe(true);
  });

  it('test_isValidDuration_0_returnsFalse', () => {
    expect(isValidDuration(0)).toBe(false);
  });

  it('test_isValidDuration_25_returnsFalse', () => {
    expect(isValidDuration(25)).toBe(false);
  });

  it('test_isValidDuration_negative_returnsFalse', () => {
    expect(isValidDuration(-1)).toBe(false);
  });

  it('test_isValidDuration_string_returnsFalse', () => {
    expect(isValidDuration('12')).toBe(false);
  });

  it('test_isValidDuration_null_returnsFalse', () => {
    expect(isValidDuration(null)).toBe(false);
  });

  it('test_isValidDuration_NaN_returnsFalse', () => {
    expect(isValidDuration(NaN)).toBe(false);
  });
});

// ─── isValidPincode ──────────────────────────────────────────────────────────

describe('isValidPincode', () => {
  it('test_isValidPincode_4digits_returnsTrue', () => {
    expect(isValidPincode('1234')).toBe(true);
  });

  it('test_isValidPincode_5digits_returnsTrue', () => {
    expect(isValidPincode('12345')).toBe(true);
  });

  it('test_isValidPincode_6digits_returnsTrue', () => {
    expect(isValidPincode('123456')).toBe(true);
  });

  it('test_isValidPincode_3digits_returnsFalse', () => {
    expect(isValidPincode('123')).toBe(false);
  });

  it('test_isValidPincode_7digits_returnsFalse', () => {
    expect(isValidPincode('1234567')).toBe(false);
  });

  it('test_isValidPincode_letters_returnsFalse', () => {
    expect(isValidPincode('abcd')).toBe(false);
  });

  it('test_isValidPincode_mixed_returnsFalse', () => {
    expect(isValidPincode('12ab')).toBe(false);
  });

  it('test_isValidPincode_empty_returnsFalse', () => {
    expect(isValidPincode('')).toBe(false);
  });

  it('test_isValidPincode_null_returnsFalse', () => {
    expect(isValidPincode(null)).toBe(false);
  });

  it('test_isValidPincode_number_returnsFalse', () => {
    expect(isValidPincode(1234)).toBe(false);
  });
});

// ─── isValidBranche ──────────────────────────────────────────────────────────

describe('isValidBranche', () => {
  it('test_isValidBranche_validString_returnsTrue', () => {
    expect(isValidBranche('bakkerij')).toBe(true);
  });

  it('test_isValidBranche_validWithSpaces_returnsTrue', () => {
    expect(isValidBranche('kapper & barbier')).toBe(true);
  });

  it('test_isValidBranche_maxLength_returnsTrue', () => {
    expect(isValidBranche('a'.repeat(100))).toBe(true);
  });

  it('test_isValidBranche_empty_returnsFalse', () => {
    expect(isValidBranche('')).toBe(false);
  });

  it('test_isValidBranche_tooLong_returnsFalse', () => {
    expect(isValidBranche('a'.repeat(101))).toBe(false);
  });

  it('test_isValidBranche_null_returnsFalse', () => {
    expect(isValidBranche(null)).toBe(false);
  });

  it('test_isValidBranche_number_returnsFalse', () => {
    expect(isValidBranche(42)).toBe(false);
  });

  it('test_isValidBranche_undefined_returnsFalse', () => {
    expect(isValidBranche(undefined)).toBe(false);
  });
});

// ─── validationError ─────────────────────────────────────────────────────────

describe('validationError', () => {
  it('test_validationError_returns400Status', async () => {
    const response = validationError('test error');
    expect(response.status).toBe(400);
  });

  it('test_validationError_returnsJsonWithMessage', async () => {
    const response = validationError('Ongeldig veld');
    const body = await response.json();
    expect(body).toEqual({ error: 'Ongeldig veld' });
  });
});
