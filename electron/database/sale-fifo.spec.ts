import { describe, expect, it } from 'vitest';

import { computeSaleCostBasis, FifoEvent } from './sale-fifo';

describe('computeSaleCostBasis', () => {
  it('consumes oldest purchase lots first', () => {
    const events: FifoEvent[] = [
      { booking_id: 1, date: '2026-08-01', type: 'buy', quantity: 2, price_per_unit: 100 },
      { booking_id: 2, date: '2026-08-02', type: 'buy', quantity: 3, price_per_unit: 120 },
    ];

    const result = computeSaleCostBasis(events, 4);
    expect(result.costBasis).toBe(440);
    expect(result.remainingQuantity).toBe(1);
  });

  it('throws when sale quantity exceeds available quantity', () => {
    const events: FifoEvent[] = [
      { booking_id: 1, date: '2026-08-01', type: 'buy', quantity: 1, price_per_unit: 100 },
    ];

    expect(() => computeSaleCostBasis(events, 2)).toThrow('Nicht genügend Bestand');
  });
});
