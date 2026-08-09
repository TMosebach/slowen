import { describe, expect, it } from 'vitest';

import { buildFifoState, computeSaleCostBasis, FifoEvent } from './sale-fifo';

describe('buildFifoState', () => {
  it('orders same-date events by booking_id for deterministic FIFO reconstruction', () => {
    const events: FifoEvent[] = [
      { booking_id: 30, date: '2026-08-01', type: 'buy', quantity: 1, price_per_unit: 300 },
      { booking_id: 10, date: '2026-08-01', type: 'buy', quantity: 2, price_per_unit: 100 },
      { booking_id: 20, date: '2026-08-01', type: 'sell', quantity: 1, price_per_unit: 0 },
    ];

    const state = buildFifoState(events);
    expect(state.lots).toEqual([
      { remaining: 1, price: 100 },
      { remaining: 1, price: 300 },
    ]);
    expect(state.remainingQuantity).toBe(2);
  });

  it('reconstructs remaining lots correctly across mixed buy and sell history', () => {
    const events: FifoEvent[] = [
      { booking_id: 1, date: '2026-08-01', type: 'buy', quantity: 5, price_per_unit: 10 },
      { booking_id: 2, date: '2026-08-02', type: 'buy', quantity: 3, price_per_unit: 20 },
      { booking_id: 3, date: '2026-08-03', type: 'sell', quantity: 6, price_per_unit: 0 },
      { booking_id: 4, date: '2026-08-04', type: 'buy', quantity: 4, price_per_unit: 30 },
      { booking_id: 5, date: '2026-08-05', type: 'sell', quantity: 1, price_per_unit: 0 },
    ];

    const state = buildFifoState(events);
    expect(state.lots).toEqual([
      { remaining: 0, price: 10 },
      { remaining: 1, price: 20 },
      { remaining: 4, price: 30 },
    ]);
    expect(state.remainingQuantity).toBe(5);
  });
});

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
