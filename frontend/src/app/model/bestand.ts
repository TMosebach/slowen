import { Asset } from './asset';

export interface Bestand {
    id: string;
    asset: Asset;
    stuecke: number;
    letzterKurs: number;
}
