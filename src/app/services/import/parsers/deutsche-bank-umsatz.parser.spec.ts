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
        },
        {
          account_id: 0,
          valuta: '2026-09-05',
          amount: 110.00
        }
      ]
    });
  });

  it('parses real Deutsche Bank export dtbank-importtest-monat1.csv accurately', () => {
    const csv = `Umsätze
Konto;Filial-/Kontonummer;IBAN;Währung
AktivKonto;414 0467241 00;DE63380700240046724100;EUR

20.7.2026 - 3.8.2026
Letzter Kontostand;;;;2.014,08;EUR
Vorgemerkte und noch nicht gebuchte Umsätze sind nicht Bestandteil dieser Übersicht.
Buchungstag;Wert;Umsatzart;Begünstigter / Auftraggeber;Verwendungszweck;IBAN / Kontonummer;BIC;Kundenreferenz;Mandatsreferenz;Gläubiger ID;Fremde Gebühren;Betrag;Abweichender Empfänger;Anzahl der Aufträge;Anzahl der Schecks;Soll;Haben;Währung
3.8.2026;4.8.2026;Wertpapiere;;ZINSEN/DIVIDENDEN/ERTRAEGE STK/NOM: 400 ABRDNI-FRNT.MKTS BD AMIDL FUNDS;;;;;;;15,85;;;;;15,85;EUR
20.7.2026;20.7.2026;SEPA Überweisung;Thomas Mosebach;;DE53100123450824872511;;NOTPROVIDED;;;;-2.000;;;;-2.000;;EUR
Kontostand;3.8.2026;;;29,93;EUR`;

    const bookings = parser.parse(csv, {
      importType: 'Umsatz',
      institution: 'Deutsche Bank',
      accountId: 15
    });

    expect(bookings.length).toBe(2);

    // Row 1: Dividend / securities interest
    expect(bookings[0]).toEqual({
      vorgang: 'Buchung',
      date: '2026-08-03',
      sender_receiver: undefined,
      description: 'Wertpapiere - ZINSEN/DIVIDENDEN/ERTRAEGE STK/NOM: 400 ABRDNI-FRNT.MKTS BD AMIDL FUNDS',
      positions: [
        {
          account_id: 15,
          valuta: '2026-08-04',
          amount: 15.85
        },
        {
          account_id: 0,
          valuta: '2026-08-04',
          amount: -15.85
        }
      ]
    });

    // Row 2: SEPA Überweisung -2000 EUR
    expect(bookings[1]).toEqual({
      vorgang: 'Buchung',
      date: '2026-07-20',
      sender_receiver: 'Thomas Mosebach',
      description: 'SEPA Überweisung',
      positions: [
        {
          account_id: 15,
          valuta: '2026-07-20',
          amount: -2000.00
        },
        {
          account_id: 0,
          valuta: '2026-07-20',
          amount: 2000.00
        }
      ]
    });
  });
});
