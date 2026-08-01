import Database from 'better-sqlite3';
import { describe, expect, it } from 'vitest';

import { initDatabaseSchema } from './connection';

describe('database schema for securities purchases', () => {
  it('upgrades existing bookings table to allow Kauf without losing rows', () => {
    const db = new Database(':memory:');
    db.exec(`
      CREATE TABLE bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vorgang TEXT NOT NULL CHECK (vorgang IN ('Buchung')),
        date TEXT NOT NULL,
        description TEXT,
        sender_receiver TEXT
      )
    `);
    db.prepare(`
      INSERT INTO bookings (vorgang, date, description, sender_receiver)
      VALUES (?, ?, ?, ?)
    `).run('Buchung', '2026-07-31', 'Bestehende Buchung', 'Bestand');

    initDatabaseSchema(db);

    expect(db.prepare(`SELECT vorgang, date, description, sender_receiver FROM bookings`).all()).toEqual([
      {
        vorgang: 'Buchung',
        date: '2026-07-31',
        description: 'Bestehende Buchung',
        sender_receiver: 'Bestand',
      },
    ]);

    expect(() => {
      db.prepare(`
        INSERT INTO bookings (vorgang, date, description, sender_receiver)
        VALUES (?, ?, ?, ?)
      `).run('Kauf', '2026-08-01', 'Testkauf', null);
    }).not.toThrow();
  });

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
