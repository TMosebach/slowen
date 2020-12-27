import { Konto } from './konto';
import { Bestand } from './bestand';

export interface Depot extends Konto {
    bestaende: Bestand[];
}
