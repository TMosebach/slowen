import { describe, expect, it } from 'vitest';

import type {
  DepotPosition,
  DepotPositionSummary,
  DepotPurchaseHistoryItem,
} from './depot-position.model';

describe('depot position models', () => {
  it('defines depot position models with the expected fields', () => {
    const position: DepotPosition = {
      booking_id: 1,
      depot_account_id: 2,
      security_id: 3,
      quantity: 1.25,
      price_per_unit: 100.5,
      purchase_date: '2026-08-01',
    };

    const summary: DepotPositionSummary = {
      security_id: 3,
      security_name: 'Bundesanleihe',
      security_type: 'Anleihe',
      isin: 'DE000TEST000',
      total_quantity: 5,
      average_price_per_unit: 101,
      total_purchase_value: 505,
      first_purchase_date: '2026-08-01',
    };

    const historyItem: DepotPurchaseHistoryItem = {
      booking_id: 9,
      booking_date: '2026-08-02',
      security_name: 'Bundesanleihe',
      quantity: 2,
      price_per_unit: 102,
      total_amount: 204,
    };

    expect(position.quantity).toBe(1.25);
    expect(summary.average_price_per_unit).toBe(101);
    expect(historyItem.booking_id).toBe(9);
  });
});
