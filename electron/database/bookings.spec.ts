import Database from 'better-sqlite3';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Booking } from '../../src/app/models/booking.model';
import { bookings } from './bookings';
import { initDatabaseSchema } from './connection';

let db: Database.Database;

vi.mock('./connection', async () => {
  const actual = await vi.importActual<typeof import('./connection')>('./connection');

  return {
    ...actual,
    getDatabase: () => db,
  };
});

async function seedPurchaseReferences() {
  db.prepare(`DELETE FROM accounts WHERE name IN ('Wertpapierprovision', 'Stückzinsen')`).run();
  db.prepare(`
    INSERT INTO accounts (id, name, type, subtype) VALUES
      (1, 'Verrechnungskonto', 'Bestand', 'Giro'),
      (2, 'Brokerkonto', 'Bestand', 'Giro'),
      (3, 'Depot A', 'Bestand', 'Depot')
  `).run();
  db.prepare(`INSERT INTO accounts (name, type, subtype) VALUES (?, ?, ?), (?, ?, ?)`).run(
    'Wertpapierprovision',
    'GuV',
    'Aufwand',
    'Stückzinsen',
    'GuV',
    'Aufwand'
  );
  db.prepare(`
    INSERT INTO securities (id, name, type, isin, wkn)
    VALUES
      (1, 'ETF World', 'ETF', 'IE00TEST0001', 'ETF001'),
      (7, 'ETF Europe', 'ETF', 'IE00TEST0007', 'ETF007'),
      (8, 'Bundesanleihe', 'Anleihe', 'DE000TEST0008', 'BOND08')
  `).run();
}

describe('purchase bookings', () => {
  beforeEach(() => {
    db = new Database(':memory:');
    initDatabaseSchema(db);
  });

  it('creates balanced booking positions and one depot position for Kauf', async () => {
    await seedPurchaseReferences();
    const created = await bookings.create({
      vorgang: 'Kauf',
      date: '2026-08-01',
      description: 'ETF Kauf',
      sender_receiver: 'Broker',
      positions: [],
      purchaseDetails: {
        security_id: 7,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 10,
        price_per_unit: 150,
        fees: 5,
        accrued_interest: 0,
      },
    } satisfies Booking);

    const reloaded = await bookings.getById(created.id!);
    expect(reloaded?.vorgang).toBe('Kauf');
    expect(reloaded?.positions).toHaveLength(3);
    expect(reloaded?.positions.map((pos) => pos.amount)).toEqual(expect.arrayContaining([-1505, 1500, 5]));
    expect(reloaded?.purchaseDetails?.security_id).toBe(7);
  });

  it('adds a Stueckzinsen position when accrued interest is present', async () => {
    await seedPurchaseReferences();
    const created = await bookings.create({
      vorgang: 'Kauf',
      date: '2026-08-01',
      description: 'Anleihe Kauf',
      positions: [],
      purchaseDetails: {
        security_id: 8,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 20,
        price_per_unit: 98,
        fees: 10,
        accrued_interest: 12,
      },
    } satisfies Booking);

    const reloaded = await bookings.getById(created.id!);
    expect(reloaded?.positions.map((pos) => pos.amount)).toEqual(expect.arrayContaining([-1982, 1960, 10, 12]));
    expect(reloaded?.purchaseDetails?.accrued_interest).toBe(12);
  });

  it('replaces derived positions and depot data on update', async () => {
    await seedPurchaseReferences();
    const created = await bookings.create({
      vorgang: 'Kauf',
      date: '2026-08-01',
      positions: [],
      purchaseDetails: {
        security_id: 1,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 5,
        price_per_unit: 100,
        fees: 0,
        accrued_interest: 0,
      },
    } satisfies Booking);

    await bookings.update(created.id!, {
      vorgang: 'Kauf',
      date: '2026-08-02',
      positions: [],
      purchaseDetails: {
        security_id: 1,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 6,
        price_per_unit: 100,
        fees: 3,
        accrued_interest: 2,
      },
    } satisfies Booking);

    const reloaded = await bookings.getById(created.id!);
    expect(reloaded?.positions.map((pos) => pos.amount)).toEqual(expect.arrayContaining([-605, 600, 3, 2]));
    expect(reloaded?.purchaseDetails?.quantity).toBe(6);
  });
});
