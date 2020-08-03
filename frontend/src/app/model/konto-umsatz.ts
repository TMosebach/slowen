import { Konto } from './konto';

export interface KontoUmsatz {
    id?: string;
    valuta: Date;
    betrag: number;
    konto: Konto;
}
