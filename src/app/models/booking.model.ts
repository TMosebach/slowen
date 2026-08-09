export const VORGANG_OPTIONS = ['Buchung', 'Kauf', 'Verkauf'] as const;

export type BookingVorgang = (typeof VORGANG_OPTIONS)[number];

export interface PurchaseBookingDetails {
  security_id: number;
  depot_account_id: number;
  settlement_account_id: number;
  quantity: number;
  price_per_unit: number;
  fees?: number;
  accrued_interest?: number;
}

export interface SaleBookingDetails {
  security_id: number;
  depot_account_id: number;
  settlement_account_id: number;
  quantity: number;
  price_per_unit: number;
  fees?: number;
  capital_gains_tax?: number;
  solidarity_surcharge?: number;
}

export interface Booking {
  id?: number;
  vorgang: BookingVorgang;
  date: string;
  description?: string;
  sender_receiver?: string;
  positions: BookingPosition[];
  purchaseDetails?: PurchaseBookingDetails;
  saleDetails?: SaleBookingDetails;
}

export interface BookingPosition {
  id?: number;
  booking_id?: number;
  account_id: number;
  valuta: string;
  amount: number;
}
