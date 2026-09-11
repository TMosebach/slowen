import { Injectable } from '@angular/core';
import { Booking } from '../../../models/booking.model';
import { ImportContext, ImportParser, ImportType, Institution } from '../import-parser.types';
import { parseAmount, parseCsvRows, parseDateToIso } from '../csv-utils';

@Injectable({ providedIn: 'root' })
export class ComdirectUmsatzParser implements ImportParser {
  readonly importType: ImportType = 'Umsatz';
  readonly institution: Institution = 'Comdirect';

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
      const hasAmount = lower.some(c => c.includes('umsatz') || c.includes('betrag'));
      return hasDate && hasAmount;
    });

    if (headerRowIndex === -1) {
      throw new Error('Kopfzeile für Comdirect Umsatz-Export nicht gefunden.');
    }

    const header = rows[headerRowIndex].map(c => c.toLowerCase());
    const dateIdx = header.findIndex(c => c.startsWith('buchung'));
    const valutaIdx = header.findIndex(c => c.includes('wertstellung') || c.includes('valuta'));
    const senderReceiverIdx = header.findIndex(c =>
      c.includes('zahlungsempfänger') || c.includes('zahlungspflichtiger') || c.includes('empfänger')
    );
    const vorgangIdx = header.findIndex(c => c.includes('vorgang') || c.includes('buchungstext'));
    const purposeIdx = header.findIndex(c => c.includes('verwendungszweck'));
    const amountIdx = header.findIndex(c => c.includes('umsatz in eur') || c.startsWith('betrag') || c.includes('umsatz'));

    if (dateIdx === -1 || amountIdx === -1) {
      throw new Error('Erforderliche Spalten (Buchungstag, Betrag/Umsatz) im Comdirect-Export nicht gefunden.');
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
      if (vorgangIdx !== -1 && row[vorgangIdx]) {
        textParts.push(row[vorgangIdx]);
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
      throw new Error('Keine gültigen Buchungszeilen in der Comdirect-CSV gefunden.');
    }

    return bookings;
  }
}
