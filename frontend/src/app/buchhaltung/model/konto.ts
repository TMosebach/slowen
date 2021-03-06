import { Bestand } from './bestand';

export interface Konto {
    id?: string;
    type?: string;
    name?: string;
    art?: string;
    saldo?: number;
    bestaende?: Bestand[];
}
