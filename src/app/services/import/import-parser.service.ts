import { Injectable } from '@angular/core';
import { Booking } from '../../models/booking.model';
import { ImportContext, ImportParser } from './import-parser.types';
import { IngUmsatzParser } from './parsers/ing-umsatz.parser';
import { ComdirectUmsatzParser } from './parsers/comdirect-umsatz.parser';
import { DeutscheBankUmsatzParser } from './parsers/deutsche-bank-umsatz.parser';

@Injectable({ providedIn: 'root' })
export class ImportParserService {
  private parsers: ImportParser[];

  constructor(
    ingUmsatzParser: IngUmsatzParser,
    comdirectUmsatzParser: ComdirectUmsatzParser,
    deutscheBankUmsatzParser: DeutscheBankUmsatzParser
  ) {
    this.parsers = [
      ingUmsatzParser,
      comdirectUmsatzParser,
      deutscheBankUmsatzParser
    ];
  }

  getParser(context: ImportContext): ImportParser | undefined {
    return this.parsers.find(parser => parser.canHandle(context));
  }

  parse(content: string, context: ImportContext): Booking[] {
    const parser = this.getParser(context);
    if (!parser) {
      throw new Error(
        `Kein Parser für die Kombination aus Art "${context.importType}" und Institut "${context.institution}" vorhanden.`
      );
    }
    return parser.parse(content, context);
  }
}
