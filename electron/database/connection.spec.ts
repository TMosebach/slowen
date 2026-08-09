import Database from 'better-sqlite3';
import { describe, expect, it } from 'vitest';

import { initDatabaseSchema } from './connection';

describe('database schema for securities purchases', () => {
  it('enables foreign key enforcement during normal schema initialization', () => {
    const db = new Database(':memory:');

    initDatabaseSchema(db);

    const foreignKeys = db.pragma('foreign_keys', { simple: true });
    expect(foreignKeys).toBe(1);
  });

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

  it('upgrades existing bookings table from Buchung and Kauf to include Verkauf', () => {
    const db = new Database(':memory:');
    db.exec(`
      CREATE TABLE bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vorgang TEXT NOT NULL CHECK (vorgang IN ('Buchung', 'Kauf')),
        date TEXT NOT NULL,
        description TEXT,
        sender_receiver TEXT
      )
    `);
    db.prepare(`
      INSERT INTO bookings (vorgang, date, description, sender_receiver)
      VALUES (?, ?, ?, ?), (?, ?, ?, ?)
    `).run(
      'Buchung',
      '2026-07-31',
      'Bestehende Buchung',
      'Bestand',
      'Kauf',
      '2026-08-01',
      'Bestehender Kauf',
      'Broker'
    );

    initDatabaseSchema(db);

    expect(db.prepare(`SELECT vorgang FROM bookings ORDER BY id`).all()).toEqual([
      { vorgang: 'Buchung' },
      { vorgang: 'Kauf' },
    ]);

    expect(() => {
      db.prepare(`
        INSERT INTO bookings (vorgang, date, description, sender_receiver)
        VALUES (?, ?, ?, ?)
      `).run('Verkauf', '2026-08-02', 'Testverkauf', 'Broker');
    }).not.toThrow();
  });

  it('preserves legacy booking_positions and depot_positions rows during bookings migration', () => {
    const db = new Database(':memory:');
    db.exec(`
      CREATE TABLE accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        subtype TEXT NOT NULL
      );

      CREATE TABLE securities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        isin TEXT NOT NULL UNIQUE,
        wkn TEXT NOT NULL UNIQUE
      );

      CREATE TABLE bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vorgang TEXT NOT NULL CHECK (vorgang IN ('Buchung')),
        date TEXT NOT NULL,
        description TEXT,
        sender_receiver TEXT
      );

      CREATE TABLE booking_positions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER NOT NULL,
        account_id INTEGER NOT NULL,
        valuta TEXT NOT NULL,
        amount REAL NOT NULL,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (account_id) REFERENCES accounts(id)
      );

      CREATE TABLE depot_positions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER NOT NULL UNIQUE,
        depot_account_id INTEGER NOT NULL,
        security_id INTEGER NOT NULL,
        quantity REAL NOT NULL,
        price_per_unit REAL NOT NULL,
        purchase_date TEXT NOT NULL,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (depot_account_id) REFERENCES accounts(id),
        FOREIGN KEY (security_id) REFERENCES securities(id)
      );
    `);

    const cashAccount = db
      .prepare(`INSERT INTO accounts (name, type, subtype) VALUES (?, ?, ?)`)
      .run('Verrechnung', 'Bestand', 'Bankkonto');
    const depotAccount = db
      .prepare(`INSERT INTO accounts (name, type, subtype) VALUES (?, ?, ?)`)
      .run('Depot', 'Bestand', 'Depot');
    const security = db
      .prepare(`INSERT INTO securities (name, type, isin, wkn) VALUES (?, ?, ?, ?)`)
      .run('Test ETF', 'ETF', 'DE000TEST000', 'TEST00');
    const booking = db
      .prepare(`
        INSERT INTO bookings (vorgang, date, description, sender_receiver)
        VALUES (?, ?, ?, ?)
      `)
      .run('Buchung', '2026-07-31', 'Bestehender Kauf', 'Broker');

    db.prepare(`
      INSERT INTO booking_positions (booking_id, account_id, valuta, amount)
      VALUES (?, ?, ?, ?)
    `).run(booking.lastInsertRowid, cashAccount.lastInsertRowid, '2026-07-31', -1234.56);

    db.prepare(`
      INSERT INTO depot_positions (
        booking_id,
        depot_account_id,
        security_id,
        quantity,
        price_per_unit,
        purchase_date
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(booking.lastInsertRowid, depotAccount.lastInsertRowid, security.lastInsertRowid, 10, 123.456, '2026-07-31');

    initDatabaseSchema(db);

    expect(db.prepare(`SELECT booking_id, account_id, valuta, amount FROM booking_positions`).all()).toEqual([
      {
        booking_id: booking.lastInsertRowid,
        account_id: cashAccount.lastInsertRowid,
        valuta: '2026-07-31',
        amount: -1234.56,
      },
    ]);

    expect(
      db.prepare(
        `SELECT booking_id, depot_account_id, security_id, quantity, price_per_unit, purchase_date FROM depot_positions`
      ).all()
    ).toEqual([
      {
        booking_id: booking.lastInsertRowid,
        depot_account_id: depotAccount.lastInsertRowid,
        security_id: security.lastInsertRowid,
        quantity: 10,
        price_per_unit: 123.456,
        purchase_date: '2026-07-31',
      },
    ]);
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

  it('creates sale system accounts in schema initialization', () => {
    const db = new Database(':memory:');
    initDatabaseSchema(db);

    const rows = db.prepare(`
      SELECT name, type, subtype
      FROM accounts
      WHERE name IN ('Kursgewinn', 'Kursverlust', 'Kapitalertragsteuer', 'Solidaritätszuschlag')
      ORDER BY name
    `).all();

    expect(rows).toEqual([
      { name: 'Kapitalertragsteuer', type: 'GuV', subtype: 'Aufwand' },
      { name: 'Kursgewinn', type: 'GuV', subtype: 'Ertrag' },
      { name: 'Kursverlust', type: 'GuV', subtype: 'Aufwand' },
      { name: 'Solidaritätszuschlag', type: 'GuV', subtype: 'Aufwand' },
    ]);
  });

  it('creates sale_details table with expected columns', () => {
    const db = new Database(':memory:');
    initDatabaseSchema(db);

    const columns = db.prepare(`PRAGMA table_info(sale_details)`).all() as Array<{ name: string }>;
    expect(columns.map((column) => column.name)).toEqual([
      'booking_id',
      'security_id',
      'depot_account_id',
      'settlement_account_id',
      'quantity',
      'price_per_unit',
      'fees',
      'capital_gains_tax',
      'solidarity_surcharge',
    ]);
  });
});
