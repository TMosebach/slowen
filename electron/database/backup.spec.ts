import Database from 'better-sqlite3';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { backup, exportDatabaseToJson, importDatabaseFromJson } from './backup';
import { initDatabaseSchema } from './connection';

let db: Database.Database;

vi.mock('./connection', async () => {
  const actual = await vi.importActual<typeof import('./connection')>('./connection');
  return {
    ...actual,
    getDatabase: () => db
  };
});

describe('backup database export and import', () => {
  beforeEach(() => {
    db = new Database(':memory:');
    initDatabaseSchema(db);
  });

  it('exports initial database schema with seeded system accounts', async () => {
    const data = await backup.export();

    expect(data.version).toBe(1);
    expect(data.createdAt).toBeDefined();
    expect(data.tables.accounts.length).toBeGreaterThan(0);
    expect(data.tables.bookings).toEqual([]);
    expect(data.tables.booking_positions).toEqual([]);
    expect(data.tables.depot_positions).toEqual([]);
    expect(data.tables.securities).toEqual([]);
    expect(data.tables.security_prices).toEqual([]);
    expect(data.tables.sale_details).toEqual([]);
  });

  it('exports populated tables correctly', () => {
    db.prepare("INSERT INTO accounts (name, type, subtype) VALUES ('Giro', 'Bestand', 'Giro')").run();
    db.prepare("INSERT INTO securities (name, type, isin, wkn) VALUES ('Apple', 'Aktie', 'US0378331005', '865985')").run();

    const data = exportDatabaseToJson(db);

    const userAccount = data.tables.accounts.find((a: any) => a.name === 'Giro');
    expect(userAccount).toBeDefined();
    expect(userAccount.subtype).toBe('Giro');

    const security = data.tables.securities.find((s: any) => s.name === 'Apple');
    expect(security).toBeDefined();
    expect(security.isin).toBe('US0378331005');
  });

  it('imports database backup and overwrites existing data', async () => {
    db.prepare("INSERT INTO accounts (name, type, subtype) VALUES ('Alt-Konto', 'Bestand', 'Giro')").run();

    const backupContent = {
      version: 1,
      createdAt: '2026-09-28T10:00:00.000Z',
      tables: {
        accounts: [
          { id: 100, name: 'Neu-Konto', type: 'Bestand', subtype: 'Tagesgeld', iban: null, notes: null }
        ],
        bookings: [
          { id: 10, vorgang: 'Buchung', date: '2026-09-01', description: 'Test', sender_receiver: 'ABC' }
        ],
        booking_positions: [
          { id: 1, booking_id: 10, account_id: 100, valuta: '2026-09-01', amount: 250.0 }
        ],
        depot_positions: [],
        securities: [],
        security_prices: [],
        sale_details: []
      }
    };

    await backup.import(backupContent);

    const accounts = db.prepare('SELECT * FROM accounts').all() as any[];
    expect(accounts.length).toBe(1);
    expect(accounts[0].name).toBe('Neu-Konto');
    expect(accounts[0].id).toBe(100);

    const bookings = db.prepare('SELECT * FROM bookings').all() as any[];
    expect(bookings.length).toBe(1);
    expect(bookings[0].id).toBe(10);
    expect(bookings[0].description).toBe('Test');
  });

  it('throws validation error on invalid backup structure', () => {
    expect(() => importDatabaseFromJson(db, null)).toThrow('Ungültiges Backup-Format');
    expect(() => importDatabaseFromJson(db, { version: 1 })).toThrow('Ungültiges Backup-Format');
    expect(() => importDatabaseFromJson(db, { version: 1, tables: {} })).toThrow('Ungültiges Backup-Format');
  });
});
