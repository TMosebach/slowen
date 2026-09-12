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
        },
        {
          account_id: 0,
          valuta: '2026-09-02',
          amount: 45.90
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
        },
        {
          account_id: 0,
          valuta: '2026-09-04',
          amount: -150.00
        }
      ]
    });
  });

  it('parses real sample file comdirect-importtest-monat1.csv', () => {
    const csv = `"Umsätze Tagesgeld PLUS-Konto";"Zeitraum: 31.03.2026 - 13.04.2026";


"Buchungstag";"Wertstellung (Valuta)";"Vorgang";"Buchungstext";"Umsatz in EUR";
"13.04.2026";"13.04.2026";"Übertrag / Überweisung";"Empfänger: Thomas MosebachKto/IBAN: DE68200411110716629100 BLZ/BIC: COBADEHDXXX  Buchungstext: Uebertrag auf Girokonto Ref. 2W2C29190A2PIZIR/2481";"-5.000,00";
"31.03.2026";"31.03.2026";"Kontoabschluss";" Buchungstext: Abschluss Zinsen Kto 716629105EUR von 31.12.2025 bis 31.03.2026 Habenzinsen 2,000% ab 31.12. 23,43 EUR 0,750% ab 01.02. 4,55 EUR vom 31.12.2025 bis 31.03.2026 Kapitalertragsteuer 7,00- EUR Solidaritätszuschlag 0,38- EUR Abschlussrechnung 20,60 EUR Saldo nach Abschluss 10.048,98 EUR Ref. 5G5C28YZ4LWCH7J8/13893";"20,60";
`;

    const bookings = parser.parse(csv, {
      importType: 'Umsatz',
      institution: 'Comdirect',
      accountId: 5
    });

    expect(bookings.length).toBe(2);
    expect(bookings[0].date).toBe('2026-04-13');
    expect(bookings[0].positions.length).toBe(2);
    expect(bookings[0].positions[0].amount).toBe(-5000.00);
    expect(bookings[0].positions[1].amount).toBe(5000.00);
    expect(bookings[0].positions[1].account_id).toBe(0);

    expect(bookings[1].date).toBe('2026-03-31');
    expect(bookings[1].positions.length).toBe(2);
    expect(bookings[1].positions[0].amount).toBe(20.60);
    expect(bookings[1].positions[1].amount).toBe(-20.60);
  });
});
