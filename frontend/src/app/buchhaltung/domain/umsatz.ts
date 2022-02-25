import { Asset } from "./asset";
import { Betrag } from "./betrag";
import { Konto } from "./konto";
import { Menge } from "./menge";

export interface Umsatz {
    konto: string;
    valuta: string;
    betrag: Betrag;
    asset?: string;
    menge?: Menge;
}
