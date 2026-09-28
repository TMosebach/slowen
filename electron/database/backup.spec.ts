import Database from 'better-sqlite3';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { backup, exportDatabaseToJson } from './backup';
import { initDatabaseSchema } from './connection';

let db: Database.Database;

vi.mock('./connection', async () => {
  const actual = await vi.importActual<typeof import('./connection')>('./connection');
  return {
    ...actual,
    getDatabase: () => db
  };
});

describe('backup database export', () => {
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
});
