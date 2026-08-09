export type FifoEvent = {
  booking_id: number;
  date: string;
  type: 'buy' | 'sell';
  quantity: number;
  price_per_unit: number;
};

type Lot = {
  remaining: number;
  price: number;
};

export type FifoState = {
  lots: Lot[];
  remainingQuantity: number;
};

function consumeLots(lots: Lot[], quantity: number): number {
  let needed = quantity;
  let cost = 0;

  for (const lot of lots) {
    if (needed <= 0) {
      break;
    }

    const consume = Math.min(lot.remaining, needed);
    lot.remaining -= consume;
    needed -= consume;
    cost += consume * lot.price;
  }

  if (needed > 0) {
    throw new Error('Nicht genügend Bestand');
  }

  return cost;
}

export function buildFifoState(events: FifoEvent[]): FifoState {
  const ordered = [...events].sort((a, b) => a.date.localeCompare(b.date) || a.booking_id - b.booking_id);
  const lots: Lot[] = [];

  for (const event of ordered) {
    if (event.type === 'buy') {
      lots.push({ remaining: event.quantity, price: event.price_per_unit });
      continue;
    }

    consumeLots(lots, event.quantity);
  }

  const remainingQuantity = lots.reduce((sum, lot) => sum + lot.remaining, 0);
  return { lots, remainingQuantity };
}

export function computeSaleCostBasis(events: FifoEvent[], sellQuantity: number): { costBasis: number; remainingQuantity: number } {
  const state = buildFifoState(events);
  const costBasis = consumeLots(state.lots, sellQuantity);
  const remainingQuantity = state.lots.reduce((sum, lot) => sum + lot.remaining, 0);

  return { costBasis, remainingQuantity };
}
