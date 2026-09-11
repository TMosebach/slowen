import { describe, it, expect } from 'vitest';
import { ImportParserService } from './import-parser.service';
import { IngUmsatzParser } from './parsers/ing-umsatz.parser';
import { ComdirectUmsatzParser } from './parsers/comdirect-umsatz.parser';
import { DeutscheBankUmsatzParser } from './parsers/deutsche-bank-umsatz.parser';

describe('ImportParserService', () => {
  const service = new ImportParserService(
    new IngUmsatzParser(),
    new ComdirectUmsatzParser(),
    new DeutscheBankUmsatzParser()
  );

  it('resolves correct parser for ING Umsatz', () => {
    const parser = service.getParser({ importType: 'Umsatz', institution: 'ING', accountId: 1 });
    expect(parser).toBeInstanceOf(IngUmsatzParser);
  });

  it('resolves correct parser for Comdirect Umsatz', () => {
    const parser = service.getParser({ importType: 'Umsatz', institution: 'Comdirect', accountId: 1 });
    expect(parser).toBeInstanceOf(ComdirectUmsatzParser);
  });

  it('resolves correct parser for Deutsche Bank Umsatz', () => {
    const parser = service.getParser({ importType: 'Umsatz', institution: 'Deutsche Bank', accountId: 1 });
    expect(parser).toBeInstanceOf(DeutscheBankUmsatzParser);
  });

  it('throws error when no parser is found for combination', () => {
    expect(() =>
      service.parse('any content', {
        importType: 'Depot-Bestand',
        institution: 'ING',
        accountId: 1
      })
    ).toThrow('Kein Parser für die Kombination aus Art "Depot-Bestand" und Institut "ING" vorhanden.');
  });
});
