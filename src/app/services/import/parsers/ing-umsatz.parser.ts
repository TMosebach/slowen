import { Injectable } from '@angular/core';
import { Booking } from '../../../models/booking.model';
import { ImportContext, ImportParser, ImportType, Institution } from '../import-parser.types';
import { parseAmount, parseCsvRows, parseDateToIso } from '../csv-utils';

@Injectable({ providedIn: 'root' })
export class IngUmsatzParser implements ImportParser {
  readonly importType: ImportType = 'Umsatz';
  readonly institution: Institution = 'ING';

  canHandle(context: ImportContext): boolean {
    return context.importType === this.importType && context.institution === this.institution;
  }

  parse(content: string, context: ImportContext): Booking[] {
    const rows = parseCsvRows(content);
    if (rows.length === 0) {
      throw new Error('Die Datei enthält keine Daten.');
    }

    // Find header line
    const headerRowIndex = rows.findIndex(row => {
      const lower = row.map(cell => cell.toLowerCase());
      const hasDate = lower.some(c => c.includes('buchung'));
      const hasAmount = lower.some(c => c.includes('betrag') || c.includes('umsatz') || c.includes('saldo'));
      return hasDate && hasAmount;
    });

    if (headerRowIndex === -1) {
      throw new Error('Kopfzeile für ING Umsatz-Export nicht gefunden.');
    }

    const header = rows[headerRowIndex].map(c => c.toLowerCase());
    const dateIdx = header.findIndex(c => c.startsWith('buchung'));
    const valutaIdx = header.findIndex(c => c.includes('valuta') || c.includes('wertstellung'));
    const senderReceiverIdx = header.findIndex(c =>
      c.includes('auftraggeber') || c.includes('empfänger') || c.includes('zahlungsbeteiligter')
    );
    const textIdx = header.findIndex(c => c.includes('buchungstext'));
    const purposeIdx = header.findIndex(c => c.includes('verwendungszweck'));
    const amountIdx = header.findIndex(c => c.startsWith('betrag') || c.includes('betrag (eur)'));

    if (dateIdx === -1 || amountIdx === -1) {
      throw new Error('Erforderliche Spalten (Buchung, Betrag) im ING-Export nicht gefunden.');
    }

    const bookings: Booking[] = [];
    const dataRows = rows.slice(headerRowIndex + 1);

    for (const row of dataRows) {
      if (row.length <= Math.max(dateIdx, amountIdx)) {
        continue;
      }

      const rawDate = row[dateIdx];
      const rawAmount = row[amountIdx];
      if (!rawDate || !rawAmount) {
        continue;
      }

      const date = parseDateToIso(rawDate);
      const valuta = valutaIdx !== -1 && row[valutaIdx] ? parseDateToIso(row[valutaIdx]) : date;
      const senderReceiver = senderReceiverIdx !== -1 ? row[senderReceiverIdx] : '';

      const textParts: string[] = [];
      if (textIdx !== -1 && row[textIdx]) {
        textParts.push(row[textIdx]);
      }
      if (purposeIdx !== -1 && row[purposeIdx]) {
        textParts.push(row[purposeIdx]);
      }
      const description = textParts.join(' - ');
      const amount = parseAmount(rawAmount);

      bookings.push({
        vorgang: 'Buchung',
        date,
        sender_receiver: senderReceiver || undefined,
        description: description || undefined,
        positions: [
          {
            account_id: context.accountId,
            valuta,
            amount
          }
        ]
      });
    }

    if (bookings.length === 0) {
      throw new Error('Keine gültigen Buchungszeilen in der ING-CSV gefunden.');
    }

    return bookings;
  }
}
