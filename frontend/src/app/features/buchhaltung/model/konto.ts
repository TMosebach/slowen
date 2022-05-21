import { Bestand } from "./bestand";
import { Betrag } from "./betrag";
import { KontoRef } from "./konto-ref";

export interface Konto extends KontoRef {
    id: string;
    name: string;
    saldo?: Betrag;
    bestaende?: Bestand[];
}
