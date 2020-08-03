import { KontoArt } from './konto-art.enum';

export interface Konto {
    id?: string;
    name: string;
    art?: KontoArt;
    saldo?: number;
}
