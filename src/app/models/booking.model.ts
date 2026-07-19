export interface Booking {
  id?: number;
  vorgang: string;
  date: string;
  description?: string;
  sender_receiver?: string;
  positions: BookingPosition[];
}

export interface BookingPosition {
  id?: number;
  booking_id?: number;
  account_id: number;
  valuta: string;
  amount: number;
}

export const VORGANG_OPTIONS = ['Buchung'] as const;
