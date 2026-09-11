import { describe, it, expect } from 'vitest';
import { ComdirectUmsatzParser } from './comdirect-umsatz.parser';

describe('ComdirectUmsatzParser', () => {
  const parser = new ComdirectUmsatzParser();

  it('handles Comdirect Umsatz context', () => {
    expect(parser.canHandle({ importType: 'Umsatz', institution: 'Comdirect', accountId: 1 })).toBe(true);
    expect(parser.canHandle({ importType: 'Depot-Bestand', institution: 'Comdirect', accountId: 1 })).toBe(false);
  });

  it('parses typical Comdirect CSV export', () => {
    const csv = `"Buchungstag";"Wertstellung";"Vorgang";"Zahlungsempfänger / Zahlungspflichtiger";"Verwendungszweck";"Umsatz in EUR"\n"02.09.2026";"02.09.2026";"Lastschrift";"Supermarkt AG";"Kartenzahlung EDEKA";"-45,90"\n"04.09.2026";"04.09.2026";"Überweisung";"Max Mustermann";"Rückzahlung";"150,00"`;

    const bookings = parser.parse(csv, {
      importType: 'Umsatz',
      institution: 'Comdirect',
      accountId: 10
    });

    expect(bookings.length).toBe(2);

    expect(bookings[0]).toEqual({
      vorgang: 'Buchung',
      date: '2026-09-02',
      sender_receiver: 'Supermarkt AG',
      description: 'Lastschrift - Kartenzahlung EDEKA',
      positions: [
        {
          account_id: 10,
          valuta: '2026-09-02',
          amount: -45.90
        }
      ]
    });

    expect(bookings[1]).toEqual({
      vorgang: 'Buchung',
      date: '2026-09-04',
      sender_receiver: 'Max Mustermann',
      description: 'Überweisung - Rückzahlung',
      positions: [
        {
          account_id: 10,
          valuta: '2026-09-04',
          amount: 150.00
        }
      ]
    });
  });
});
