import { Injectable } from '@angular/core';
import { Booking } from '../../../models/booking.model';
import { ImportContext, ImportParser, ImportType, Institution } from '../import-parser.types';
import { isValidDateString, parseAmount, parseCsvRows, parseDateToIso } from '../csv-utils';

@Injectable({ providedIn: 'root' })
export class DeutscheBankUmsatzParser implements ImportParser {
  readonly importType: ImportType = 'Umsatz';
  readonly institution: Institution = 'Deutsche Bank';

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
      if (row.length < 4) {
        return false;
      }
      const lower = row.map(cell => cell.toLowerCase());
      const hasDate = lower.some(c => c.startsWith('buchung'));
      const hasAmount = lower.some(c => c === 'betrag' || c.startsWith('betrag') || c === 'umsatz' || c.startsWith('umsatz in'));
      return hasDate && hasAmount;
    });

    if (headerRowIndex === -1) {
      throw new Error('Kopfzeile für Deutsche Bank Umsatz-Export nicht gefunden.');
    }

    const header = rows[headerRowIndex].map(c => c.toLowerCase());
    const dateIdx = header.findIndex(c => c.startsWith('buchung'));
    const valutaIdx = header.findIndex(c => c === 'wert' || c.includes('wertstellung') || c.includes('valuta'));
    const senderReceiverIdx = header.findIndex(c =>
      c.includes('begünstigter') || c.includes('auftraggeber') || c.includes('zahlungsempfänger')
    );
    const umsatzartIdx = header.findIndex(c => c.includes('umsatzart') || c.includes('buchungstext'));
    const purposeIdx = header.findIndex(c => c.includes('verwendungszweck'));
    const amountIdx = header.findIndex(c =>
      c === 'betrag' || c.startsWith('betrag') || c === 'umsatz' || c.startsWith('umsatz in')
    );

    if (dateIdx === -1 || amountIdx === -1) {
      throw new Error('Erforderliche Spalten (Buchungstag, Betrag) im Deutsche Bank Export nicht gefunden.');
    }

    const bookings: Booking[] = [];
    const dataRows = rows.slice(headerRowIndex + 1);

    for (const row of dataRows) {
      if (row.length <= Math.max(dateIdx, amountIdx)) {
        continue;
      }

      const rawDate = row[dateIdx];
      const rawAmount = row[amountIdx];
      if (!rawDate || !isValidDateString(rawDate) || !rawAmount) {
        continue;
      }

      // Skip summary / footer rows if any
      const firstCell = row[0]?.toLowerCase() || '';
      if (firstCell.startsWith('kontostand') || firstCell.startsWith('saldo')) {
        continue;
      }

      const date = parseDateToIso(rawDate);
      const valuta = valutaIdx !== -1 && row[valutaIdx] && isValidDateString(row[valutaIdx])
        ? parseDateToIso(row[valutaIdx])
        : date;
      const senderReceiver = senderReceiverIdx !== -1 ? row[senderReceiverIdx]?.trim() : '';

      const textParts: string[] = [];
      if (umsatzartIdx !== -1 && row[umsatzartIdx]?.trim()) {
        textParts.push(row[umsatzartIdx].trim());
      }
      if (purposeIdx !== -1 && row[purposeIdx]?.trim()) {
        textParts.push(row[purposeIdx].trim());
      }
      const description = textParts.join(' - ');
      const amount = parseAmount(rawAmount);
      const contraAmount = amount === 0 ? 0 : Math.round(-amount * 100) / 100;

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
          },
          {
            account_id: 0,
            valuta,
            amount: contraAmount
          }
        ]
      });
    }

    if (bookings.length === 0) {
      throw new Error('Keine gültigen Buchungszeilen in der Deutsche Bank CSV gefunden.');
    }

    return bookings;
  }
}
