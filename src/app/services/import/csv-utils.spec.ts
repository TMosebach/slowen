import { describe, it, expect } from 'vitest';
import { decodeCsvBuffer, detectDelimiter, isValidDateString, parseAmount, parseCsvRows, parseDateToIso, tokenizeCsvLine } from './csv-utils';

describe('csv-utils', () => {
  describe('decodeCsvBuffer', () => {
    it('decodes standard UTF-8 buffer', () => {
      const utf8Bytes = new TextEncoder().encode('Umsätze;Betrag\n01.09.2026;100,00');
      expect(decodeCsvBuffer(utf8Bytes)).toBe('Umsätze;Betrag\n01.09.2026;100,00');
    });

    it('decodes UTF-8 buffer with BOM and removes BOM', () => {
      const utf8WithBom = new Uint8Array([0xef, 0xbb, 0xbf, ...new TextEncoder().encode('Umsätze;Betrag')]);
      expect(decodeCsvBuffer(utf8WithBom)).toBe('Umsätze;Betrag');
    });

    it('decodes Windows-1252 / ISO-8859-1 buffer with German umlauts', () => {
      // "Umsätze: ä ö ü Ä Ö Ü ß" in Windows-1252:
      // ä = 0xe4, ö = 0xf6, ü = 0xfc, Ä = 0xc4, Ö = 0xd6, Ü = 0xdc, ß = 0xdf
      const win1252Bytes = new Uint8Array([
        0x55, 0x6d, 0x73, 0xe4, 0x74, 0x7a, 0x65, // Umsätze
        0x3b, // ;
        0xdc, 0x62, 0x65, 0x72, 0x74, 0x72, 0x61, 0x67 // Übertrag
      ]);

      const decoded = decodeCsvBuffer(win1252Bytes);
      expect(decoded).toBe('Umsätze;Übertrag');
      expect(decoded.includes('\ufffd')).toBe(false);
    });
  });

  describe('tokenizeCsvLine', () => {
    it('splits standard semicolon delimited line', () => {
      const line = 'a;b;c';
      expect(tokenizeCsvLine(line, ';')).toEqual(['a', 'b', 'c']);
    });

    it('handles quoted fields and inner commas/semicolons', () => {
      const line = '"Muster, Max";"1.234,56";Test';
      expect(tokenizeCsvLine(line, ';')).toEqual(['Muster, Max', '1.234,56', 'Test']);
    });

    it('handles escaped quotes inside quoted fields', () => {
      const line = '"Company ""Best"" Ltd";100';
      expect(tokenizeCsvLine(line, ';')).toEqual(['Company "Best" Ltd', '100']);
    });
  });

  describe('detectDelimiter', () => {
    it('detects semicolon when semicolons are present', () => {
      expect(detectDelimiter('Datum;Betrag;Text')).toBe(';');
    });

    it('detects comma when commas are present', () => {
      expect(detectDelimiter('Date,Amount,Text')).toBe(',');
    });

    it('detects tab when tabs are present', () => {
      expect(detectDelimiter('Date\tAmount\tText')).toBe('\t');
    });
  });

  describe('parseCsvRows', () => {
    it('parses multiple rows', () => {
      const content = 'H1;H2\nV1;V2\nV3;V4';
      const rows = parseCsvRows(content);
      expect(rows).toEqual([
        ['H1', 'H2'],
        ['V1', 'V2'],
        ['V3', 'V4']
      ]);
    });

    it('returns empty array for empty string', () => {
      expect(parseCsvRows('')).toEqual([]);
    });
  });

  describe('isValidDateString', () => {
    it('returns true for valid German and ISO dates', () => {
      expect(isValidDateString('05.09.2026')).toBe(true);
      expect(isValidDateString('3.8.2026')).toBe(true);
      expect(isValidDateString('20.7.2026')).toBe(true);
      expect(isValidDateString('2026-09-05')).toBe(true);
    });

    it('returns false for non-dates', () => {
      expect(isValidDateString('Kontostand')).toBe(false);
      expect(isValidDateString('')).toBe(false);
      expect(isValidDateString('15,85')).toBe(false);
    });
  });

  describe('parseDateToIso', () => {
    it('converts DD.MM.YYYY to YYYY-MM-DD', () => {
      expect(parseDateToIso('05.09.2026')).toBe('2026-09-05');
      expect(parseDateToIso('1.9.2026')).toBe('2026-09-01');
      expect(parseDateToIso('3.8.2026')).toBe('2026-08-03');
    });

    it('converts DD.MM.YY to YYYY-MM-DD', () => {
      expect(parseDateToIso('05.09.26')).toBe('2026-09-05');
    });

    it('preserves existing ISO format', () => {
      expect(parseDateToIso('2026-09-05')).toBe('2026-09-05');
    });
  });

  describe('parseAmount', () => {
    it('parses German currency numbers', () => {
      expect(parseAmount('1.234,56')).toBe(1234.56);
      expect(parseAmount('-49,90')).toBe(-49.9);
      expect(parseAmount('+1.500,00')).toBe(1500);
      expect(parseAmount('0,00')).toBe(0);
      expect(parseAmount('2.014,08')).toBe(2014.08);
      expect(parseAmount('15,85')).toBe(15.85);
    });

    it('parses German thousand notation without decimals', () => {
      expect(parseAmount('-2.000')).toBe(-2000);
      expect(parseAmount('2.000')).toBe(2000);
      expect(parseAmount('1.500.000')).toBe(1500000);
    });

    it('parses standard dot numbers', () => {
      expect(parseAmount('1234.56')).toBe(1234.56);
      expect(parseAmount('-49.90')).toBe(-49.9);
    });

    it('handles currency signs and spaces', () => {
      expect(parseAmount(' - 1.250,50 € ')).toBe(-1250.5);
    });
  });
});
