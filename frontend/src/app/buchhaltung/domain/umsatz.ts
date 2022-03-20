import { Asset } from "./asset";
import { Betrag } from "./betrag";
import { Konto } from "./konto";
import { KontoRef } from "./konto-ref";
import { Menge } from "./menge";

export interface Umsatz {
    konto: KontoRef;
    valuta: string;
    betrag: Betrag;
    asset?: string;
    menge?: Menge;
}
