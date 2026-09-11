import { describe, it, expect } from 'vitest';
import { IngUmsatzParser } from './ing-umsatz.parser';

describe('IngUmsatzParser', () => {
  const parser = new IngUmsatzParser();

  it('handles ING Umsatz context', () => {
    expect(parser.canHandle({ importType: 'Umsatz', institution: 'ING', accountId: 1 })).toBe(true);
    expect(parser.canHandle({ importType: 'Depot-Bestand', institution: 'ING', accountId: 1 })).toBe(false);
    expect(parser.canHandle({ importType: 'Umsatz', institution: 'Comdirect', accountId: 1 })).toBe(false);
  });

  it('parses typical ING CSV export into Bookings and positions', () => {
    const csv = `IBAN;DE1234567890\nZeitraum;01.09.2026 - 10.09.2026\n\nBuchung;Valuta;Auftraggeber/Empfänger;Buchungstext;Verwendungszweck;Saldo;Währung;Betrag;Währung\n01.09.2026;01.09.2026;Arbeitgeber GmbH;Gehalt;Monatsgehalt 08/2026;3000,00;EUR;2500,00;EUR\n03.09.2026;03.09.2026;Vermieter GbR;Dauerauftrag;Miete September;2200,00;EUR;-800,00;EUR`;

    const bookings = parser.parse(csv, {
      importType: 'Umsatz',
      institution: 'ING',
      accountId: 42
    });

    expect(bookings.length).toBe(2);

    expect(bookings[0]).toEqual({
      vorgang: 'Buchung',
      date: '2026-09-01',
      sender_receiver: 'Arbeitgeber GmbH',
      description: 'Gehalt - Monatsgehalt 08/2026',
      positions: [
        {
          account_id: 42,
          valuta: '2026-09-01',
          amount: 2500.00
        }
      ]
    });

    expect(bookings[1]).toEqual({
      vorgang: 'Buchung',
      date: '2026-09-03',
      sender_receiver: 'Vermieter GbR',
      description: 'Dauerauftrag - Miete September',
      positions: [
        {
          account_id: 42,
          valuta: '2026-09-03',
          amount: -800.00
        }
      ]
    });
  });

  it('throws error when header line is missing', () => {
    const csv = 'Some;Random;Text\n1;2;3';
    expect(() =>
      parser.parse(csv, { importType: 'Umsatz', institution: 'ING', accountId: 1 })
    ).toThrow('Kopfzeile für ING Umsatz-Export nicht gefunden.');
  });
});
