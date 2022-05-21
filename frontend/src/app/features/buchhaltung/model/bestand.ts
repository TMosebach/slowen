import { AssetRef } from "./asset-ref";
import { Betrag } from "./betrag";
import { Menge } from "./menge";

export interface Bestand {
    asset: AssetRef;
    menge: Menge;
    einstandsWert: Betrag;
}
