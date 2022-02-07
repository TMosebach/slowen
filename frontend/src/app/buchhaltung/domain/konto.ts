import { Betrag } from "./betrag";

export interface Konto {
    name: string;
    saldo?: Betrag;
}
