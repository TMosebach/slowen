import { Asset } from './asset';

export interface Bestand {
    id: string;
    asset: Asset;
    menge: number;
    kaufPreis: number;
}
