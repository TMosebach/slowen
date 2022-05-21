import { AssetRef } from "./asset-ref";
import { Betrag } from "./betrag";
import { KontoRef } from "./konto-ref";
import { Menge } from "./menge";

export interface Umsatz {
    konto: KontoRef;
    valuta: string;
    betrag: Betrag;
    asset?: AssetRef;
    menge?: Menge;
}
