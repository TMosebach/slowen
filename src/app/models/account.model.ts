export interface Account {
  id?: number;
  name: string;
  type: 'Bestand' | 'GuV';
  subtype: string;
  iban?: string;
  notes?: string;
  created_at?: string;
}

export const ACCOUNT_SUBTYPES = {
  'Bestand': ['Giro', 'Tagesgeld', 'Depot', 'Immobilie', 'Versicherung', 'Forderung', 'Verbindlichkeit'],
  'GuV': ['Kreditkarte']
} as const;

export type AccountSubtype = typeof ACCOUNT_SUBTYPES[keyof typeof ACCOUNT_SUBTYPES][number];
