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

  it('exposes Verkauf as valid booking vorgang', () => {
    expect(VORGANG_OPTIONS).toContain('Verkauf');
  });

  it('exposes Tilgung as valid booking vorgang', () => {
    expect(VORGANG_OPTIONS).toContain('Tilgung');
  });

  it('exposes Ertrag as valid booking vorgang', () => {
    expect(VORGANG_OPTIONS).toContain('Ertrag');
  });

  it('supports income details on bookings', () => {
    const booking: Booking = {
      vorgang: 'Ertrag',
      date: '2026-08-15',
      positions: [],
      incomeDetails: {
        security_id: 1,
        depot_account_id: 3,
        settlement_account_id: 2,
        income_account_id: 10,
        gross_amount: 100,
        capital_gains_tax: 25,
        solidarity_surcharge: 1.37,
      },
    };

    expect(booking.incomeDetails?.gross_amount).toBe(100);
  });

  it('supports sale details on bookings', () => {
    const booking: Booking = {
      vorgang: 'Verkauf',
      date: '2026-08-09',
      positions: [],
      saleDetails: {
        security_id: 7,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 2.5,
        price_per_unit: 125,
        fees: 1,
        capital_gains_tax: 3,
        solidarity_surcharge: 0.2,
      },
    };

    expect(booking.saleDetails?.quantity).toBe(2.5);
  });
});
