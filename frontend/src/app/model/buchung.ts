import { KontoUmsatz } from './konto-umsatz';

export interface Buchung {
    id?: string;
    empfaenger?: string;
    verwendung?: string;
    umsaetze: KontoUmsatz[];
}
