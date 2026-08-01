export interface Account {
  id?: number;
  name: string;
  type: 'Bestand' | 'GuV';
  subtype: string;
  iban?: string;
  notes?: string;
  created_at?: string;
}

export const SYSTEM_ACCOUNT_NAMES = ['Wertpapierprovision', 'Stückzinsen'] as const;

export const ACCOUNT_SUBTYPES = {
  'Bestand': ['Giro', 'Tagesgeld', 'Depot', 'Immobilie', 'Versicherung', 'Forderung', 'Verbindlichkeit'],
  'GuV': ['Kreditkarte', 'Aufwand', 'Ertrag']
} as const;

export type AccountSubtype = typeof ACCOUNT_SUBTYPES[keyof typeof ACCOUNT_SUBTYPES][number];

export function isSystemAccount(account: Pick<Account, 'name' | 'type' | 'subtype'>): boolean {
  return SYSTEM_ACCOUNT_NAMES.includes(account.name as (typeof SYSTEM_ACCOUNT_NAMES)[number])
    && account.type === 'GuV'
    && account.subtype === 'Aufwand';
}
