export interface Account {
    id?: number;
    name: string;
    type: 'Bestand' | 'GuV';
    subtype: string;
    iban?: string;
    notes?: string;
    created_at?: string;
}
export declare const ACCOUNT_SUBTYPES: {
    readonly Bestand: readonly ["Giro", "Tagesgeld", "Depot", "Immobilie", "Versicherung", "Forderung", "Verbindlichkeit"];
    readonly GuV: readonly ["Kreditkarte", "Aufwand", "Ertrag"];
};
export type AccountSubtype = typeof ACCOUNT_SUBTYPES[keyof typeof ACCOUNT_SUBTYPES][number];
//# sourceMappingURL=account.model.d.ts.map