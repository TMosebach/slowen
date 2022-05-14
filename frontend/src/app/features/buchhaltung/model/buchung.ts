import { BuchungArt } from "./buchung-art";
import { Umsatz } from "./umsatz";

export interface Buchung {
	art: BuchungArt | string;
    datum: string;
	beschreibung?: string;
	empfaenger?: string;
	umsaetze?: Umsatz[];
}
