export interface DepotBuchung {
    verwendung: string;
    valuta: Date;
    menge?: number;
    gebuehren?: number;
    betrag: number;
}
