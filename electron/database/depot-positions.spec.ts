import Database from 'better-sqlite3';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { initDatabaseSchema } from './connection';
import { depotPositions } from './depot-positions';

let db: Database.Database;
let bookingId: number;
let depotAccountId: number;
let securityId: number;

vi.mock('./connection', async () => {
  const actual = await vi.importActual<typeof import('./connection')>('./connection');

  return {
    ...actual,
    getDatabase: () => db,
  };
});

describe('depotPositions repository', () => {
  beforeEach(() => {
    db = new Database(':memory:');
    initDatabaseSchema(db);

    db.prepare(`INSERT INTO accounts (name, type, subtype) VALUES (?, ?, ?)`).run(
      'Verrechnungskonto',
      'Bestand',
      'Bankkonto'
    );
    depotAccountId = db
      .prepare(`INSERT INTO accounts (name, type, subtype) VALUES (?, ?, ?)`) 
      .run('Depotkonto', 'Bestand', 'Depot').lastInsertRowid as number;
    securityId = db
      .prepare(`INSERT INTO securities (name, type, isin, wkn) VALUES (?, ?, ?, ?)`) 
      .run('Test ETF', 'ETF', 'DE000TEST000', 'TEST00').lastInsertRowid as number;
    bookingId = db
      .prepare(`
      INSERT INTO bookings (vorgang, date, description, sender_receiver)
      VALUES (?, ?, ?, ?)
    `)
      .run('Kauf', '2026-08-01', 'Testkauf', 'Broker').lastInsertRowid as number;
  });

  it('stores and loads depot positions by booking and depot', async () => {
    const created = await depotPositions.create({
      booking_id: bookingId,
      depot_account_id: depotAccountId,
      security_id: securityId,
      quantity: 10,
      price_per_unit: 101.25,
      purchase_date: '2026-08-01'
    });

    expect(created.booking_id).toBe(bookingId);

    const byBooking = await depotPositions.getByBooking(bookingId);
    expect(byBooking?.security_id).toBe(securityId);

    const byDepot = await depotPositions.getByDepot(depotAccountId);
    expect(byDepot).toHaveLength(1);
  });
});
