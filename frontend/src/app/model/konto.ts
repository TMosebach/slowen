import { KontoArt } from './konto-art.enum';
import { KontoTyp } from './konto-typ.enum';

export interface Konto {
    id?: string;
    type?: KontoTyp;
    name: string;
    art?: KontoArt;
    saldo?: number;
}
