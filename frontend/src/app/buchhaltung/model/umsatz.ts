import { Asset } from './asset';
import { Konto } from './konto';

export interface Umsatz {
    id?: string;
    valuta: string;
    betrag: number;
    konto: Konto;
    asset?: Asset;
    menge?: number;
}
