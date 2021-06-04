import { Umsatz } from './umsatz';

export interface Buchung {
    id?: string;
    verwendung?: string;
    empfaenger?: string;
    umsaetze: Umsatz[];
}