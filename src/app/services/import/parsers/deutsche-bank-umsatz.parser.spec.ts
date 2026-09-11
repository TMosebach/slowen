import { describe, it, expect } from 'vitest';
import { DeutscheBankUmsatzParser } from './deutsche-bank-umsatz.parser';

describe('DeutscheBankUmsatzParser', () => {
  const parser = new DeutscheBankUmsatzParser();

  it('handles Deutsche Bank Umsatz context', () => {
    expect(parser.canHandle({ importType: 'Umsatz', institution: 'Deutsche Bank', accountId: 1 })).toBe(true);
    expect(parser.canHandle({ importType: 'Depot-Bestand', institution: 'Deutsche Bank', accountId: 1 })).toBe(false);
  });

  it('parses typical Deutsche Bank CSV export', () => {
    const csv = `Buchungstag;Wert;Umsatzart;Begünstigter / Auftraggeber;Verwendungszweck;Betrag;Währung\n05.09.2026;05.09.2026;SEPA-Überweisung;Stadtwerke;Stromabschlag September;-110,00;EUR`;

    const bookings = parser.parse(csv, {
      importType: 'Umsatz',
      institution: 'Deutsche Bank',
      accountId: 99
    });

    expect(bookings.length).toBe(1);
    expect(bookings[0]).toEqual({
      vorgang: 'Buchung',
      date: '2026-09-05',
      sender_receiver: 'Stadtwerke',
      description: 'SEPA-Überweisung - Stromabschlag September',
      positions: [
        {
          account_id: 99,
          valuta: '2026-09-05',
          amount: -110.00
        }
      ]
    });
  });
});
