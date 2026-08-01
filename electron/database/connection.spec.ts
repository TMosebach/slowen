import Database from 'better-sqlite3';
import { describe, expect, it } from 'vitest';

import { initDatabaseSchema } from './connection';

describe('database schema for securities purchases', () => {
  it('allows bookings with vorgang Kauf', () => {
    const db = new Database(':memory:');
    initDatabaseSchema(db);

    expect(() => {
      db.prepare(`
        INSERT INTO bookings (vorgang, date, description, sender_receiver)
        VALUES (?, ?, ?, ?)
      `).run('Kauf', '2026-08-01', 'Testkauf', null);
    }).not.toThrow();
  });

  it('creates depot_positions with one row per booking', () => {
    const db = new Database(':memory:');
    initDatabaseSchema(db);

    const columns = db.prepare(`PRAGMA table_info(depot_positions)`).all() as Array<{ name: string }>;
    expect(columns.map((column) => column.name)).toEqual([
      'id',
      'booking_id',
      'depot_account_id',
      'security_id',
      'quantity',
      'price_per_unit',
      'purchase_date',
    ]);
  });

  it('ensures system accounts exist', () => {
    const db = new Database(':memory:');
    initDatabaseSchema(db);

    const accounts = db.prepare(`
      SELECT name, type, subtype
      FROM accounts
      WHERE name IN ('Wertpapierprovision', 'Stückzinsen')
      ORDER BY name
    `).all();

    expect(accounts).toEqual([
      { name: 'Stückzinsen', type: 'GuV', subtype: 'Aufwand' },
      { name: 'Wertpapierprovision', type: 'GuV', subtype: 'Aufwand' },
    ]);
  });
});
