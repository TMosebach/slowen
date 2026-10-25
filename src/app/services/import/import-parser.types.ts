import { Booking } from '../../models/booking.model';

export type ImportType = 'Umsatz' | 'Depot-Bestand';
export type Institution = 'ING' | 'Comdirect' | 'Deutsche Bank';

export interface ImportBookingMeta {
  detectedIsin?: string;
  detectedSecurityName?: string;
}

export interface ImportedBooking extends Booking {
  importMeta?: ImportBookingMeta;
}

export interface ImportContext {
  importType: ImportType;
  institution: Institution;
  accountId: number;
}

export interface ImportParser {
  readonly importType: ImportType;
  readonly institution: Institution;
  canHandle(context: ImportContext): boolean;
  parse(content: string, context: ImportContext): ImportedBooking[];
}
