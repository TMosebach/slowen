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
        },
        {
          account_id: 0,
          valuta: '2026-09-01',
          amount: -2500.00
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
        },
        {
          account_id: 0,
          valuta: '2026-09-03',
          amount: 800.00
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
    expect(bookings[0].positions.length).toBe(2);
    expect(bookings[0].positions[0].amount).toBe(-8.79);
    expect(bookings[0].positions[1].amount).toBe(8.79);
    expect(bookings[0].positions[1].account_id).toBe(0);
    expect(bookings[0].positions[0].valuta).toBe('2026-02-02');

    expect(bookings[1].sender_receiver).toBe('Aktion Mensch e.V.');
    expect(bookings[1].positions.length).toBe(2);
    expect(bookings[1].positions[0].amount).toBe(7.50);
    expect(bookings[1].positions[1].amount).toBe(-7.50);
  });

  it('throws error when header line is missing', () => {
    const csv = 'Some;Random;Text\n1;2;3';
    expect(() =>
      parser.parse(csv, { importType: 'Umsatz', institution: 'ING', accountId: 1 })
    ).toThrow('Kopfzeile für ING Umsatz-Export nicht gefunden.');
  });

  it('detects Wertpapierkauf and extracts ISIN and metadata', () => {
    const csv = `Umsatzanzeige;Datei erstellt am: 18.10.2026 16:20

IBAN;DE77 5001 0517 XXXX XXXX XX
Kontoname;Girokonto
Bank;ING
Kunde;Vorname Zuname
Zeitraum;02.10.2026 - 02.10.2026
Saldo;625,09;EUR

Sortierung;Datum absteigend

In der CSV-Datei finden Sie alle bereits gebuchten Umsätze.

Buchung;Wertstellungsdatum;Auftraggeber/Empfänger;Buchungstext;Verwendungszweck;Referenz;Saldo;Währung;Betrag;Währung
02.01.2026;06.01.2026;;Wertpapierkauf;WP-ABRECHNUNG 0438527477001 Kauf ISIN LU2611732475 AIS AMUNDI SDAX ETF D;;5.204,00;EUR;-50,00;EUR`;

    const bookings = parser.parse(csv, {
      importType: 'Umsatz',
      institution: 'ING',
      accountId: 1
    });

    expect(bookings.length).toBe(1);
    const kauf = bookings[0];
    expect(kauf.vorgang).toBe('Kauf');
    expect(kauf.date).toBe('2026-01-02');
    expect(kauf.positions[0].valuta).toBe('2026-01-06');
    expect(kauf.positions[0].amount).toBe(-50.00);
    expect(kauf.purchaseDetails).toBeDefined();
    expect(kauf.purchaseDetails?.settlement_account_id).toBe(1);
    expect(kauf.importMeta?.detectedIsin).toBe('LU2611732475');
    expect(kauf.importMeta?.detectedSecurityName).toBe('AIS AMUNDI SDAX ETF D');
  });

  it('detects Tilgung, extracts ISIN and metadata, pre-fills price 100, suggests quantity and sets sender_receiver to Tilgung', () => {
    const csv = `Umsatzanzeige;Datei erstellt am: 18.10.2026 16:20

IBAN;DE77 5001 0517 XXXX XXXX XX
Kontoname;Girokonto
Bank;ING
Kunde;Vorname Zuname
Zeitraum;02.10.2026 - 02.10.2026
Saldo;625,09;EUR

Sortierung;Datum absteigend

In der CSV-Datei finden Sie alle bereits gebuchten Umsätze.

Buchung;Wertstellungsdatum;Auftraggeber/Empfänger;Buchungstext;Verwendungszweck;Referenz;Saldo;Währung;Betrag;Währung
07.01.2026;07.01.2026;;Wertpapiergutschrift;Tilgung ISIN XS2630524986 GRENKE FI;;7.244,50;EUR;2.000,00;EUR`;

    const bookings = parser.parse(csv, {
      importType: 'Umsatz',
      institution: 'ING',
      accountId: 1
    });

    expect(bookings.length).toBe(1);
    const tilgung = bookings[0];
    expect(tilgung.vorgang).toBe('Tilgung');
    expect(tilgung.date).toBe('2026-01-07');
    expect(tilgung.sender_receiver).toBe('Tilgung');
    expect(tilgung.positions[0].amount).toBe(2000.00);
    expect(tilgung.positions[0].valuta).toBe('2026-01-07');
    expect(tilgung.saleDetails).toBeDefined();
    expect(tilgung.saleDetails?.settlement_account_id).toBe(1);
    expect(tilgung.saleDetails?.price_per_unit).toBe(100);
    expect(tilgung.saleDetails?.quantity).toBe(20); // 2000 / 100
    expect(tilgung.importMeta?.detectedIsin).toBe('XS2630524986');
    expect(tilgung.importMeta?.detectedSecurityName).toBe('GRENKE FI');
  });

  it('treats Wertpapiergutschrift without Tilgung in Verwendungszweck as standard Buchung', () => {
    const csv = `Buchung;Wertstellungsdatum;Auftraggeber/Empfänger;Buchungstext;Verwendungszweck;Saldo;Währung;Betrag;Währung
07.01.2026;07.01.2026;;Wertpapiergutschrift;Zinsen 2025;;1.000,00;EUR;50,00;EUR`;

    const bookings = parser.parse(csv, {
      importType: 'Umsatz',
      institution: 'ING',
      accountId: 1
    });

    expect(bookings.length).toBe(1);
    expect(bookings[0].vorgang).toBe('Buchung');
  });
});
