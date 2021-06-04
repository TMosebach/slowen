import { Konto } from './konto';

export interface Umsatz {
    id?: string;
    valuta: string;
    betrag: number;
    konto: Konto;
}
