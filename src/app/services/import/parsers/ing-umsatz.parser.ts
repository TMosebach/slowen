import { Injectable } from '@angular/core';
import { ImportedBooking, ImportContext, ImportParser, ImportType, Institution } from '../import-parser.types';
import { isValidDateString, parseAmount, parseCsvRows, parseDateToIso } from '../csv-utils';

@Injectable({ providedIn: 'root' })
export class IngUmsatzParser implements ImportParser {
  readonly importType: ImportType = 'Umsatz';
  readonly institution: Institution = 'ING';

  canHandle(context: ImportContext): boolean {
    return context.importType === this.importType && context.institution === this.institution;
  }

  parse(content: string, context: ImportContext): ImportedBooking[] {
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
      const hasAmount = lower.some(c => c.startsWith('betrag'));
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

    const bookings: ImportedBooking[] = [];
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

      const date = parseDateToIso(rawDate);
      const valuta = valutaIdx !== -1 && row[valutaIdx] && isValidDateString(row[valutaIdx])
        ? parseDateToIso(row[valutaIdx])
        : date;
      const senderReceiver = senderReceiverIdx !== -1 ? row[senderReceiverIdx]?.trim() : '';
      const rawBuchungstext = textIdx !== -1 ? row[textIdx]?.trim() || '' : '';
      const rawPurpose = purposeIdx !== -1 ? row[purposeIdx]?.trim() || '' : '';

      const textParts: string[] = [];
      if (rawBuchungstext) {
        textParts.push(rawBuchungstext);
      }
      if (rawPurpose) {
        textParts.push(rawPurpose);
      }
      const description = textParts.join(' - ');
      const amount = parseAmount(rawAmount);
      const contraAmount = amount === 0 ? 0 : Math.round(-amount * 100) / 100;

      // Detection for Wertpapierkauf:
      // Either Buchungstext or Auftraggeber/Empfänger contains "Wertpapierkauf"
      const isWertpapierkauf =
        rawBuchungstext.toLowerCase().includes('wertpapierkauf') ||
        senderReceiver.toLowerCase().includes('wertpapierkauf');

      // Detection for Tilgung:
      // Buchungstext contains "wertpapiergutschrift" and Verwendungszweck starts with "tilgung" (trimmed)
      const isTilgung =
        rawBuchungstext.toLowerCase().includes('wertpapiergutschrift') &&
        rawPurpose.trim().toLowerCase().startsWith('tilgung');

      if (isWertpapierkauf) {
        // Extract ISIN from Verwendungszweck via Regex (e.g. "Kauf ISIN LU2611732475 AIS AMUNDI...")
        const isinMatch = rawPurpose.match(/ISIN\s+([A-Z]{2}[A-Z0-9]{9}[0-9])/i);
        const detectedIsin = isinMatch ? isinMatch[1].toUpperCase() : undefined;

        // Try extracting security name suffix if present behind ISIN
        let detectedSecurityName: string | undefined;
        if (isinMatch && isinMatch.index !== undefined) {
          const afterIsin = rawPurpose.slice(isinMatch.index + isinMatch[0].length).trim();
          if (afterIsin) {
            detectedSecurityName = afterIsin;
          }
        }

        bookings.push({
          vorgang: 'Kauf',
          date,
          sender_receiver: senderReceiver || 'Wertpapierkauf',
          description: description || undefined,
          purchaseDetails: {
            settlement_account_id: context.accountId,
            depot_account_id: 0,
            security_id: 0,
            quantity: 0,
            price_per_unit: 0,
            fees: 0,
            accrued_interest: 0
          },
          importMeta: {
            detectedIsin,
            detectedSecurityName
          },
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
      } else if (isTilgung) {
        // Extract ISIN from Verwendungszweck via Regex (e.g. "Tilgung ISIN XS2630524986 GRENKE FI...")
        const isinMatch = rawPurpose.match(/ISIN\s+([A-Z]{2}[A-Z0-9]{9}[0-9])/i);
        const detectedIsin = isinMatch ? isinMatch[1].toUpperCase() : undefined;

        let detectedSecurityName: string | undefined;
        if (isinMatch && isinMatch.index !== undefined) {
          const afterIsin = rawPurpose.slice(isinMatch.index + isinMatch[0].length).trim();
          if (afterIsin) {
            detectedSecurityName = afterIsin;
          }
        }

        // Suggested quantity based on amount and default price 100
        const defaultPrice = 100;
        const suggestedQuantity = amount > 0 ? Math.round((amount / defaultPrice) * 10000) / 10000 : 0;

        bookings.push({
          vorgang: 'Tilgung',
          date,
          sender_receiver: 'Tilgung',
          description: description || undefined,
          saleDetails: {
            settlement_account_id: context.accountId,
            depot_account_id: 0,
            security_id: 0,
            quantity: suggestedQuantity,
            price_per_unit: defaultPrice,
            fees: 0,
            capital_gains_tax: 0,
            solidarity_surcharge: 0
          },
          importMeta: {
            detectedIsin,
            detectedSecurityName
          },
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
      } else {
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
    }

    if (bookings.length === 0) {
      throw new Error('Keine gültigen Buchungszeilen in der ING-CSV gefunden.');
    }

    return bookings;
  }
}
