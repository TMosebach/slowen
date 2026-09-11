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

  it('parses real sample file ing-importtest-monat1.csv', () => {
    const csv = `Umsatzanzeige;Datei erstellt am: 01.02.2026 15:45

IBAN;DE77 5001 0517 XXXX XXXX XX
Kontoname;Girokonto
Bank;ING
Kunde;Vorname Zuname
Zeitraum;02.09.2026 - 02.09.2026
Saldo;625,09;EUR

Sortierung;Datum absteigend

In der CSV-Datei finden Sie alle bereits gebuchten Umsätze. Die vorgemerkten Umsätze werden nicht aufgenommen, auch wenn sie in Ihrem Internetbanking angezeigt werden.

Buchung;Wertstellungsdatum;Auftraggeber/Empfänger;Buchungstext;Verwendungszweck;Saldo;Währung;Betrag;Währung
01.02.2026;02.02.2026;VISA REWE;Lastschrift;Refernznummer Apple Pay 4711;1.446,10;EUR;-8,79;EUR
01.02.2026;02.02.2026;Aktion Mensch e.V.;Gutschrift;Herzlichen Glueckwunsch. Das Los 0815 hat gewonnen.;1.454,89;EUR;7,50;EUR`;

    const bookings = parser.parse(csv, {
      importType: 'Umsatz',
      institution: 'ING',
      accountId: 1
    });

    expect(bookings.length).toBe(2);
    expect(bookings[0].sender_receiver).toBe('VISA REWE');
    expect(bookings[0].positions[0].amount).toBe(-8.79);
    expect(bookings[0].positions[0].valuta).toBe('2026-02-02');

    expect(bookings[1].sender_receiver).toBe('Aktion Mensch e.V.');
    expect(bookings[1].positions[0].amount).toBe(7.50);
  });

  it('throws error when header line is missing', () => {
    const csv = 'Some;Random;Text\n1;2;3';
    expect(() =>
      parser.parse(csv, { importType: 'Umsatz', institution: 'ING', accountId: 1 })
    ).toThrow('Kopfzeile für ING Umsatz-Export nicht gefunden.');
  });
});
