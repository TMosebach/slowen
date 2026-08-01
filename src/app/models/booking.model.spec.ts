import { describe, expect, it } from 'vitest';

import type { Booking } from './booking.model';
import { VORGANG_OPTIONS } from './booking.model';

describe('purchase related booking models', () => {
  it('exposes Kauf as valid booking vorgang', () => {
    expect(VORGANG_OPTIONS).toContain('Kauf');
  });

  it('supports purchase details on bookings', () => {
    const booking: Booking = {
      vorgang: 'Kauf',
      date: '2026-08-01',
      description: 'ETF-Kauf',
      positions: [],
      purchaseDetails: {
        security_id: 4,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 10.5,
        price_per_unit: 99.4,
        fees: 3,
        accrued_interest: 0,
      },
    };

    expect(booking.purchaseDetails?.settlement_account_id).toBe(2);
  });
});
