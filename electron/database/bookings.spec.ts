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
  db.prepare(`INSERT INTO accounts (name, type, subtype) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?)`).run(
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
    'Aufwand',
    'Dividende',
    'GuV',
    'Ertrag',
    'Zins',
    'GuV',
    'Ertrag',
    'Fondsertrag',
    'GuV',
    'Ertrag'
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
    const saleDetailRow = db
      .prepare('SELECT booking_id, security_id, depot_account_id, settlement_account_id, quantity FROM sale_details WHERE booking_id = ?')
      .get(created.id) as
      | {
          booking_id: number;
          security_id: number;
          depot_account_id: number;
          settlement_account_id: number;
          quantity: number;
        }
      | undefined;
    const saleDepotRowCount = db
      .prepare('SELECT COUNT(*) AS count FROM depot_positions WHERE booking_id = ?')
      .get(created.id) as { count: number };

    expect(reloaded?.vorgang).toBe('Verkauf');
    expect(reloaded?.saleDetails?.quantity).toBe(2);
    expect(reloaded?.positions.some((position) => position.amount === 52.5)).toBe(true);
    expect(saleDetailRow).toEqual({
      booking_id: created.id,
      security_id: 7,
      depot_account_id: 3,
      settlement_account_id: 2,
      quantity: 2,
    });
    expect(saleDepotRowCount.count).toBe(0);
    expect(sum).toBeCloseTo(0, 8);
  });

  it('rejects sale when deductions exceed gross proceeds', async () => {
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
          quantity: 1,
          price_per_unit: 10,
          fees: 15,
          capital_gains_tax: 0,
          solidarity_surcharge: 0,
        },
      } satisfies Booking)
    ).rejects.toThrow('Nettozufluss muss größer 0 sein.');
  });

  it('rejects sale when depot account is not a Depot account', async () => {
    await seedPurchaseReferences();

    await bookings.create({
      vorgang: 'Kauf',
      date: '2026-08-01',
      positions: [],
      purchaseDetails: {
        security_id: 7,
        depot_account_id: 2,
        settlement_account_id: 1,
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
          depot_account_id: 2,
          settlement_account_id: 1,
          quantity: 1,
          price_per_unit: 120,
          fees: 0,
          capital_gains_tax: 0,
          solidarity_surcharge: 0,
        },
      } satisfies Booking)
    ).rejects.toThrow('Das Depot-Konto muss ein bestehendes Konto vom Typ Bestand mit Untertyp Depot sein.');
  });

  it('rejects sale when settlement account is not a Bestand non-Depot account', async () => {
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

    const guvAccountId = db.prepare(`SELECT id FROM accounts WHERE name = 'Wertpapierprovision'`).get() as { id: number };

    await expect(
      bookings.create({
        vorgang: 'Verkauf',
        date: '2026-08-10',
        positions: [],
        saleDetails: {
          security_id: 7,
          depot_account_id: 3,
          settlement_account_id: guvAccountId.id,
          quantity: 1,
          price_per_unit: 120,
          fees: 0,
          capital_gains_tax: 0,
          solidarity_surcharge: 0,
        },
      } satisfies Booking)
    ).rejects.toThrow(
      'Das Verrechnungskonto muss ein bestehendes Konto vom Typ Bestand mit einem Untertyp ungleich Depot sein.'
    );
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

  describe('Tilgung bookings', () => {
    it('creates Tilgung with FIFO cost basis, positions and allows partial redemptions', async () => {
      await seedPurchaseReferences();

      // Purchase: 10 units @ 100 on 2026-08-01
      await bookings.create({
        vorgang: 'Kauf',
        date: '2026-08-01',
        positions: [],
        purchaseDetails: {
          security_id: 8, // Bundesanleihe
          depot_account_id: 3,
          settlement_account_id: 1,
          quantity: 10,
          price_per_unit: 100,
          fees: 0,
          accrued_interest: 0,
        },
      });

      // Partial redemption: 6 units @ 100 on 2026-08-15
      // Purchase cost for 6 units: 6 * 100 = 600
      // Redemption proceeds: 6 * 100 = 600
      const tilgung = await bookings.create({
        vorgang: 'Tilgung',
        date: '2026-08-15',
        positions: [],
        saleDetails: {
          security_id: 8,
          depot_account_id: 3,
          settlement_account_id: 1,
          quantity: 6,
          price_per_unit: 100,
          fees: 0,
          capital_gains_tax: 0,
          solidarity_surcharge: 0,
        },
      });

      expect(tilgung.id).toBeTruthy();
      expect(tilgung.vorgang).toBe('Tilgung');
      expect(tilgung.saleDetails?.quantity).toBe(6);

      // Check booking positions:
      const depotPos = tilgung.positions.find(p => p.account_id === 3);
      const settlementPos = tilgung.positions.find(p => p.account_id === 1);
      expect(depotPos?.amount).toBe(-600);
      expect(settlementPos?.amount).toBe(600);

      const reloaded = await bookings.getById(tilgung.id!);
      expect(reloaded?.vorgang).toBe('Tilgung');
      expect(reloaded?.saleDetails?.quantity).toBe(6);
    });

    it('rejects Tilgung if quantity exceeds available FIFO inventory', async () => {
      await seedPurchaseReferences();

      await bookings.create({
        vorgang: 'Kauf',
        date: '2026-08-01',
        positions: [],
        purchaseDetails: {
          security_id: 8,
          depot_account_id: 3,
          settlement_account_id: 1,
          quantity: 5,
          price_per_unit: 100,
        },
      });

      await expect(
        bookings.create({
          vorgang: 'Tilgung',
          date: '2026-08-10',
          positions: [],
          saleDetails: {
            security_id: 8,
            depot_account_id: 3,
            settlement_account_id: 1,
            quantity: 10, // Exceeds 5
            price_per_unit: 100,
          },
        })
      ).rejects.toThrow('Nicht genügend Bestand');
    });
  });

  describe('Ertrag bookings', () => {
    it('creates Ertrag booking with balanced positions and depot_position of quantity 0', async () => {
      await seedPurchaseReferences();

      const dividendeAcc = db.prepare(`SELECT id FROM accounts WHERE name = 'Dividende'`).get() as { id: number };

      const ertrag = await bookings.create({
        vorgang: 'Ertrag',
        date: '2026-08-20',
        description: 'Dividende ETF World',
        sender_receiver: 'Fondsgesellschaft',
        positions: [],
        incomeDetails: {
          security_id: 1, // ETF World
          depot_account_id: 3,
          settlement_account_id: 1,
          income_account_id: dividendeAcc.id,
          gross_amount: 150.0,
          capital_gains_tax: 25.0,
          solidarity_surcharge: 1.37,
        },
      });

      expect(ertrag.id).toBeTruthy();
      expect(ertrag.vorgang).toBe('Ertrag');

      // Net = 150 - 25 - 1.37 = 123.63
      const settlementPos = ertrag.positions.find((p) => p.account_id === 1);
      const incomePos = ertrag.positions.find((p) => p.account_id === dividendeAcc.id);
      const taxPos = ertrag.positions.find((p) => p.amount === 25.0);
      const soliPos = ertrag.positions.find((p) => p.amount === 1.37);

      expect(settlementPos?.amount).toBe(123.63);
      expect(incomePos?.amount).toBe(-150.0);
      expect(taxPos).toBeDefined();
      expect(soliPos).toBeDefined();

      const sum = ertrag.positions.reduce((acc, pos) => acc + pos.amount, 0);
      expect(Math.abs(sum)).toBeLessThan(1e-9);

      // Verify depot_position with quantity 0
      const depotPosRow = db
        .prepare('SELECT * FROM depot_positions WHERE booking_id = ?')
        .get(ertrag.id) as { quantity: number; price_per_unit: number; depot_account_id: number; security_id: number };

      expect(depotPosRow).toBeDefined();
      expect(depotPosRow.quantity).toBe(0);
      expect(depotPosRow.price_per_unit).toBe(0);
      expect(depotPosRow.depot_account_id).toBe(3);
      expect(depotPosRow.security_id).toBe(1);

      // Reload and verify incomeDetails
      const reloaded = await bookings.getById(ertrag.id!);
      expect(reloaded?.vorgang).toBe('Ertrag');
      expect(reloaded?.incomeDetails).toBeDefined();
      expect(reloaded?.incomeDetails?.security_id).toBe(1);
      expect(reloaded?.incomeDetails?.depot_account_id).toBe(3);
      expect(reloaded?.incomeDetails?.settlement_account_id).toBe(1);
      expect(reloaded?.incomeDetails?.income_account_id).toBe(dividendeAcc.id);
      expect(reloaded?.incomeDetails?.gross_amount).toBe(150.0);
      expect(reloaded?.incomeDetails?.capital_gains_tax).toBe(25.0);
      expect(reloaded?.incomeDetails?.solidarity_surcharge).toBe(1.37);
    });

    it('rejects Ertrag if gross amount <= 0 or taxes exceed gross amount', async () => {
      await seedPurchaseReferences();
      const dividendeAcc = db.prepare(`SELECT id FROM accounts WHERE name = 'Dividende'`).get() as { id: number };

      await expect(
        bookings.create({
          vorgang: 'Ertrag',
          date: '2026-08-20',
          positions: [],
          incomeDetails: {
            security_id: 1,
            depot_account_id: 3,
            settlement_account_id: 1,
            income_account_id: dividendeAcc.id,
            gross_amount: 0,
          },
        })
      ).rejects.toThrow('Bruttobetrag muss größer 0 sein');

      await expect(
        bookings.create({
          vorgang: 'Ertrag',
          date: '2026-08-20',
          positions: [],
          incomeDetails: {
            security_id: 1,
            depot_account_id: 3,
            settlement_account_id: 1,
            income_account_id: dividendeAcc.id,
            gross_amount: 50,
            capital_gains_tax: 60, // Exceeds 50
          },
        })
      ).rejects.toThrow('Nettozufluss muss größer 0 sein');
    });
  });

  describe('getByAccountAndPeriod', () => {
    it('returns bookings matching account and date or valuta within period', async () => {
      await seedPurchaseReferences();

      // Booking 1: date inside range, valuta inside range (account 1)
      const b1 = await bookings.create({
        vorgang: 'Buchung',
        date: '2026-09-05',
        sender_receiver: 'Test A',
        description: 'Inside',
        positions: [
          { account_id: 1, valuta: '2026-09-05', amount: 100 },
          { account_id: 2, valuta: '2026-09-05', amount: -100 },
        ],
      });

      // Booking 2: date outside range (2026-08-30), but valuta inside range (2026-09-02) (account 1)
      const b2 = await bookings.create({
        vorgang: 'Buchung',
        date: '2026-08-30',
        sender_receiver: 'Test B',
        description: 'Valuta inside',
        positions: [
          { account_id: 1, valuta: '2026-09-02', amount: 50 },
          { account_id: 2, valuta: '2026-09-02', amount: -50 },
        ],
      });

      // Booking 3: date inside range (2026-09-03), valuta outside (account 1)
      const b3 = await bookings.create({
        vorgang: 'Buchung',
        date: '2026-09-03',
        sender_receiver: 'Test C',
        description: 'Date inside',
        positions: [
          { account_id: 1, valuta: '2026-09-12', amount: 20 },
          { account_id: 2, valuta: '2026-09-12', amount: -20 },
        ],
      });

      // Booking 4: both outside range (account 1)
      await bookings.create({
        vorgang: 'Buchung',
        date: '2026-08-01',
        sender_receiver: 'Test D',
        description: 'Both outside',
        positions: [
          { account_id: 1, valuta: '2026-08-01', amount: 10 },
          { account_id: 2, valuta: '2026-08-01', amount: -10 },
        ],
      });

      // Booking 5: date inside range, but different account (only account 2)
      await bookings.create({
        vorgang: 'Buchung',
        date: '2026-09-04',
        sender_receiver: 'Test E',
        description: 'Other account',
        positions: [
          { account_id: 2, valuta: '2026-09-04', amount: 70 },
          { account_id: 3, valuta: '2026-09-04', amount: -70 },
        ],
      });

      const results = await bookings.getByAccountAndPeriod(1, '2026-09-01', '2026-09-10');
      expect(results.length).toBe(3);
      const ids = results.map(r => r.id);
      expect(ids).toContain(b1.id);
      expect(ids).toContain(b2.id);
      expect(ids).toContain(b3.id);
      expect(results[0].positions?.length).toBe(2);
    });
  });
});
