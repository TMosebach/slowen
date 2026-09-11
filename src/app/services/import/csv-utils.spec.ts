import { describe, it, expect } from 'vitest';
import { detectDelimiter, isValidDateString, parseAmount, parseCsvRows, parseDateToIso, tokenizeCsvLine } from './csv-utils';

describe('csv-utils', () => {
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
