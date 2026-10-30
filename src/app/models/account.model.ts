export interface Account {
  id?: number;
  name: string;
  type: 'Bestand' | 'GuV';
  subtype: string;
  iban?: string;
  notes?: string;
  created_at?: string;
}

export const SYSTEM_ACCOUNT_NAMES = [
  'Wertpapierprovision',
  'Stückzinsen',
  'Kursgewinn',
  'Kursverlust',
  'Kapitalertragsteuer',
  'Solidaritätszuschlag',
  'Dividende',
  'Zins',
  'Fondsertrag',
] as const;

export const ACCOUNT_SUBTYPES = {
  'Bestand': ['Giro', 'Tagesgeld', 'Depot', 'Immobilie', 'Versicherung', 'Forderung', 'Verbindlichkeit'],
  'GuV': ['Kreditkarte', 'Aufwand', 'Ertrag']
} as const;

export type AccountSubtype = typeof ACCOUNT_SUBTYPES[keyof typeof ACCOUNT_SUBTYPES][number];

export function isSystemAccount(account: Pick<Account, 'name' | 'type' | 'subtype'>): boolean {
  if (!SYSTEM_ACCOUNT_NAMES.includes(account.name as (typeof SYSTEM_ACCOUNT_NAMES)[number])) {
    return false;
  }

  if (account.type !== 'GuV') {
    return false;
  }

  if (['Kursgewinn', 'Dividende', 'Zins', 'Fondsertrag'].includes(account.name)) {
    return account.subtype === 'Ertrag';
  }

  return account.subtype === 'Aufwand';
}
