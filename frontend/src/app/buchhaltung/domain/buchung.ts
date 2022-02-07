import { Umsatz } from "./umsatz";

export interface Buchung {
    datum: string;
	beschreibung?: string;
	empfaenger?: string;
	umsaetze?: Umsatz[];
}
