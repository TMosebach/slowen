export type SecurityType = 'Aktie' | 'Anleihe' | 'Fonds' | 'ETF' | 'Zertifikat';

export interface Security {
  id?: number;
  name: string;
  type: SecurityType;
  isin: string;
  wkn: string;
  faelligkeit?: string;
  created_at?: string;
  updated_at?: string;
}

export const SECURITY_TYPES: SecurityType[] = ['Aktie', 'Anleihe', 'Fonds', 'ETF', 'Zertifikat'];
export const FAELLIGKEIT_TYPES: SecurityType[] = ['Anleihe', 'Zertifikat'];
