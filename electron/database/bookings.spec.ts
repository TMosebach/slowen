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
  db.prepare('DELETE FROM depot_positions').run();
  db.prepare('DELETE FROM booking_positions').run();
  db.prepare('DELETE FROM bookings').run();
  db.prepare('DELETE FROM securities').run();
  db.prepare('DELETE FROM accounts').run();
  db.prepare(`
    INSERT INTO accounts (id, name, type, subtype) VALUES
      (1, 'Verrechnungskonto', 'Bestand', 'Giro'),
      (2, 'Brokerkonto', 'Bestand', 'Giro'),
      (3, 'Depot A', 'Bestand', 'Depot')
  `).run();
  db.prepare(`INSERT INTO accounts (name, type, subtype) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?)`).run(
    'Wertpapierprovision',
    'GuV',
    'Aufwand',
    'Stückzinsen',
    'GuV',
    'Aufwand',
    'Kursgewinn',
    'GuV',
    'Ertrag',
    'Kursverlust',
    'GuV',
    'Aufwand',
    'Kapitalertragsteuer',
    'GuV',
    'Aufwand',
    'Solidaritätszuschlag',
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

  it('deletes derived purchase rows when a purchase booking is deleted', async () => {
    await seedPurchaseReferences();
    const created = await bookings.create({
      vorgang: 'Kauf',
      date: '2026-08-01',
      description: 'ETF Kauf',
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

    await bookings.delete(created.id!);

    expect(db.prepare('SELECT COUNT(*) AS count FROM bookings').get()).toEqual({ count: 0 });
    expect(db.prepare('SELECT COUNT(*) AS count FROM booking_positions').get()).toEqual({ count: 0 });
    expect(db.prepare('SELECT COUNT(*) AS count FROM depot_positions').get()).toEqual({ count: 0 });
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

  it('fails loudly when Wertpapierprovision exists more than once', async () => {
    await seedPurchaseReferences();
    db.prepare(`INSERT INTO accounts (name, type, subtype) VALUES (?, ?, ?)`).run(
      'Wertpapierprovision',
      'GuV',
      'Aufwand'
    );

    await expect(
      bookings.create({
        vorgang: 'Kauf',
        date: '2026-08-01',
        description: 'ETF Kauf',
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
      } satisfies Booking)
    ).rejects.toThrow('Systemkonto-Invariante verletzt: Wertpapierprovision');
  });

  it('fails loudly when Stueckzinsen is missing the required GuV Aufwand shape', async () => {
    await seedPurchaseReferences();
    db.prepare(`DELETE FROM accounts WHERE name = 'Stückzinsen'`).run();
    db.prepare(`INSERT INTO accounts (name, type, subtype) VALUES (?, ?, ?)`).run(
      'Stückzinsen',
      'Bestand',
      'Giro'
    );

    await expect(
      bookings.create({
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
          fees: 0,
          accrued_interest: 12,
        },
      } satisfies Booking)
    ).rejects.toThrow('Systemkonto-Invariante verletzt: Stückzinsen');
  });

  it('creates sale booking with Kursgewinn and deductions', async () => {
    await seedPurchaseReferences();

    await bookings.create({
      vorgang: 'Kauf',
      date: '2026-08-01',
      positions: [],
      purchaseDetails: {
        security_id: 7,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 5,
        price_per_unit: 100,
        fees: 0,
        accrued_interest: 0,
      },
    } satisfies Booking);

    const created = await bookings.create({
      vorgang: 'Verkauf',
      date: '2026-08-10',
      positions: [],
      saleDetails: {
        security_id: 7,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 2,
        price_per_unit: 130,
        fees: 2,
        capital_gains_tax: 5,
        solidarity_surcharge: 0.5,
      },
    } satisfies Booking);

    const reloaded = await bookings.getById(created.id!);
    const sum = reloaded?.positions.reduce((acc, position) => acc + position.amount, 0) ?? 0;

    expect(reloaded?.vorgang).toBe('Verkauf');
    expect(reloaded?.saleDetails?.quantity).toBe(2);
    expect(reloaded?.positions.some((position) => position.amount === 52.5)).toBe(true);
    expect(sum).toBeCloseTo(0, 8);
  });

  it('books Kursverlust when sale net is below fifo cost basis', async () => {
    await seedPurchaseReferences();

    await bookings.create({
      vorgang: 'Kauf',
      date: '2026-08-01',
      positions: [],
      purchaseDetails: {
        security_id: 7,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 1,
        price_per_unit: 100,
        fees: 0,
        accrued_interest: 0,
      },
    } satisfies Booking);

    const created = await bookings.create({
      vorgang: 'Verkauf',
      date: '2026-08-10',
      positions: [],
      saleDetails: {
        security_id: 7,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 1,
        price_per_unit: 90,
        fees: 0,
        capital_gains_tax: 0,
        solidarity_surcharge: 0,
      },
    } satisfies Booking);

    const reloaded = await bookings.getById(created.id!);
    const kursverlustAccount = db.prepare(`SELECT id FROM accounts WHERE name = 'Kursverlust'`).get() as { id: number };
    const kursgewinnAccount = db.prepare(`SELECT id FROM accounts WHERE name = 'Kursgewinn'`).get() as { id: number };

    expect(reloaded?.positions.find((position) => position.account_id === kursverlustAccount.id)?.amount).toBe(10);
    expect(reloaded?.positions.some((position) => position.account_id === kursgewinnAccount.id)).toBe(false);
  });

  it('rejects sale when quantity exceeds available holdings', async () => {
    await seedPurchaseReferences();

    await bookings.create({
      vorgang: 'Kauf',
      date: '2026-08-01',
      positions: [],
      purchaseDetails: {
        security_id: 7,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 5,
        price_per_unit: 100,
        fees: 0,
        accrued_interest: 0,
      },
    } satisfies Booking);

    await expect(
      bookings.create({
        vorgang: 'Verkauf',
        date: '2026-08-10',
        positions: [],
        saleDetails: {
          security_id: 7,
          depot_account_id: 3,
          settlement_account_id: 2,
          quantity: 999,
          price_per_unit: 130,
          fees: 0,
          capital_gains_tax: 0,
          solidarity_surcharge: 0,
        },
      } satisfies Booking)
    ).rejects.toThrow('Nicht genügend Bestand');
  });

  it('creates same-day sale using earlier same-day buy cost basis', async () => {
    await seedPurchaseReferences();

    await bookings.create({
      vorgang: 'Kauf',
      date: '2026-08-10',
      positions: [],
      purchaseDetails: {
        security_id: 7,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 5,
        price_per_unit: 100,
        fees: 0,
        accrued_interest: 0,
      },
    } satisfies Booking);

    const created = await bookings.create({
      vorgang: 'Verkauf',
      date: '2026-08-10',
      positions: [],
      saleDetails: {
        security_id: 7,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 2,
        price_per_unit: 130,
        fees: 2,
        capital_gains_tax: 5,
        solidarity_surcharge: 0.5,
      },
    } satisfies Booking);

    const reloaded = await bookings.getById(created.id!);

    expect(reloaded?.vorgang).toBe('Verkauf');
    expect(reloaded?.positions.find((position) => position.account_id === 3)?.amount).toBe(-200);
    expect(reloaded?.positions.some((position) => position.amount === 52.5)).toBe(true);
  });

  it('prices backdated sales from prior events only and recomputes later same-pair sales', async () => {
    await seedPurchaseReferences();

    await bookings.create({
      vorgang: 'Kauf',
      date: '2026-08-01',
      positions: [],
      purchaseDetails: {
        security_id: 7,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 5,
        price_per_unit: 100,
        fees: 0,
        accrued_interest: 0,
      },
    } satisfies Booking);

    await bookings.create({
      vorgang: 'Kauf',
      date: '2026-08-07',
      positions: [],
      purchaseDetails: {
        security_id: 7,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 5,
        price_per_unit: 200,
        fees: 0,
        accrued_interest: 0,
      },
    } satisfies Booking);

    const futureSale = await bookings.create({
      vorgang: 'Verkauf',
      date: '2026-08-10',
      positions: [],
      saleDetails: {
        security_id: 7,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 5,
        price_per_unit: 130,
        fees: 0,
        capital_gains_tax: 0,
        solidarity_surcharge: 0,
      },
    } satisfies Booking);

    const backdatedSale = await bookings.create({
      vorgang: 'Verkauf',
      date: '2026-08-05',
      positions: [],
      saleDetails: {
        security_id: 7,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 2,
        price_per_unit: 130,
        fees: 0,
        capital_gains_tax: 0,
        solidarity_surcharge: 0,
      },
    } satisfies Booking);

    const reloadedBackdated = await bookings.getById(backdatedSale.id!);
    const reloadedFuture = await bookings.getById(futureSale.id!);

    expect(reloadedBackdated?.positions.find((position) => position.account_id === 3)?.amount).toBe(-200);
    expect(reloadedFuture?.positions.find((position) => position.account_id === 3)?.amount).toBe(-700);
  });

  it('recomputes later dependent sales after update and delete', async () => {
    await seedPurchaseReferences();

    await bookings.create({
      vorgang: 'Kauf',
      date: '2026-08-01',
      positions: [],
      purchaseDetails: {
        security_id: 7,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 5,
        price_per_unit: 100,
        fees: 0,
        accrued_interest: 0,
      },
    } satisfies Booking);

    await bookings.create({
      vorgang: 'Kauf',
      date: '2026-08-02',
      positions: [],
      purchaseDetails: {
        security_id: 7,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 5,
        price_per_unit: 200,
        fees: 0,
        accrued_interest: 0,
      },
    } satisfies Booking);

    const firstSale = await bookings.create({
      vorgang: 'Verkauf',
      date: '2026-08-03',
      positions: [],
      saleDetails: {
        security_id: 7,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 6,
        price_per_unit: 130,
        fees: 0,
        capital_gains_tax: 0,
        solidarity_surcharge: 0,
      },
    } satisfies Booking);

    const laterSale = await bookings.create({
      vorgang: 'Verkauf',
      date: '2026-08-04',
      positions: [],
      saleDetails: {
        security_id: 7,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 2,
        price_per_unit: 130,
        fees: 0,
        capital_gains_tax: 0,
        solidarity_surcharge: 0,
      },
    } satisfies Booking);

    const beforeUpdate = await bookings.getById(laterSale.id!);
    expect(beforeUpdate?.positions.find((position) => position.account_id === 3)?.amount).toBe(-400);

    await bookings.update(firstSale.id!, {
      vorgang: 'Verkauf',
      date: '2026-08-03',
      positions: [],
      saleDetails: {
        security_id: 7,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 4,
        price_per_unit: 130,
        fees: 0,
        capital_gains_tax: 0,
        solidarity_surcharge: 0,
      },
    } satisfies Booking);

    const afterUpdate = await bookings.getById(laterSale.id!);
    expect(afterUpdate?.positions.find((position) => position.account_id === 3)?.amount).toBe(-300);

    await bookings.delete(firstSale.id!);

    const afterDelete = await bookings.getById(laterSale.id!);
    expect(afterDelete?.positions.find((position) => position.account_id === 3)?.amount).toBe(-200);
  });

  it('keeps consistency after updating sale quantity', async () => {
    await seedPurchaseReferences();

    await bookings.create({
      vorgang: 'Kauf',
      date: '2026-08-01',
      positions: [],
      purchaseDetails: {
        security_id: 7,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 5,
        price_per_unit: 100,
        fees: 0,
        accrued_interest: 0,
      },
    } satisfies Booking);

    const created = await bookings.create({
      vorgang: 'Verkauf',
      date: '2026-08-10',
      positions: [],
      saleDetails: {
        security_id: 7,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 2,
        price_per_unit: 130,
        fees: 2,
        capital_gains_tax: 5,
        solidarity_surcharge: 0.5,
      },
    } satisfies Booking);

    await bookings.update(created.id!, {
      vorgang: 'Verkauf',
      date: '2026-08-10',
      positions: [],
      saleDetails: {
        security_id: 7,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 3,
        price_per_unit: 130,
        fees: 2,
        capital_gains_tax: 5,
        solidarity_surcharge: 0.5,
      },
    } satisfies Booking);

    const reloaded = await bookings.getById(created.id!);
    const sum = reloaded?.positions.reduce((acc, position) => acc + position.amount, 0) ?? 0;

    expect(reloaded?.saleDetails?.quantity).toBe(3);
    expect(sum).toBeCloseTo(0, 8);
  });

  it('restores availability after deleting sale', async () => {
    await seedPurchaseReferences();

    await bookings.create({
      vorgang: 'Kauf',
      date: '2026-08-01',
      positions: [],
      purchaseDetails: {
        security_id: 7,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 1,
        price_per_unit: 100,
        fees: 0,
        accrued_interest: 0,
      },
    } satisfies Booking);

    const firstSale = await bookings.create({
      vorgang: 'Verkauf',
      date: '2026-08-10',
      positions: [],
      saleDetails: {
        security_id: 7,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 1,
        price_per_unit: 130,
        fees: 0,
        capital_gains_tax: 0,
        solidarity_surcharge: 0,
      },
    } satisfies Booking);

    await bookings.delete(firstSale.id!);

    const secondSale = await bookings.create({
      vorgang: 'Verkauf',
      date: '2026-08-11',
      positions: [],
      saleDetails: {
        security_id: 7,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 1,
        price_per_unit: 125,
        fees: 0,
        capital_gains_tax: 0,
        solidarity_surcharge: 0,
      },
    } satisfies Booking);

    expect(secondSale.id).toBeTruthy();
  });
});
