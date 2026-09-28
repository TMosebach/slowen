import Database from 'better-sqlite3';
import { getDatabase } from './connection';

export interface BackupData {
  version: number;
  createdAt: string;
  tables: {
    accounts: any[];
    bookings: any[];
    booking_positions: any[];
    depot_positions: any[];
    securities: any[];
    security_prices: any[];
    sale_details: any[];
  };
}

export function exportDatabaseToJson(db: Database.Database): BackupData {
  const getTableData = (tableName: string) => {
    try {
      return db.prepare(`SELECT * FROM ${tableName}`).all();
    } catch {
      return [];
    }
  };

  return {
    version: 1,
    createdAt: new Date().toISOString(),
    tables: {
      accounts: getTableData('accounts'),
      bookings: getTableData('bookings'),
      booking_positions: getTableData('booking_positions'),
      depot_positions: getTableData('depot_positions'),
      securities: getTableData('securities'),
      security_prices: getTableData('security_prices'),
      sale_details: getTableData('sale_details')
    }
  };
}

export function validateBackupData(data: any): asserts data is BackupData {
  if (!data || typeof data !== 'object') {
    throw new Error('Ungültiges Backup-Format: Keine JSON-Struktur.');
  }
  if (typeof data.version !== 'number') {
    throw new Error('Ungültiges Backup-Format: Fehlende Versionsnummer.');
  }
  if (!data.tables || typeof data.tables !== 'object') {
    throw new Error('Ungültiges Backup-Format: Fehlendes "tables"-Objekt.');
  }
  const requiredTables = [
    'accounts',
    'bookings',
    'booking_positions',
    'depot_positions',
    'securities',
    'security_prices',
    'sale_details'
  ];
  for (const table of requiredTables) {
    if (!Array.isArray(data.tables[table])) {
      throw new Error(`Ungültiges Backup-Format: Tabelle "${table}" fehlt oder ist kein Array.`);
    }
  }
}

function insertRow(db: Database.Database, tableName: string, row: Record<string, any>): void {
  const keys = Object.keys(row);
  if (keys.length === 0) return;
  const cols = keys.map((k) => `"${k}"`).join(', ');
  const placeholders = keys.map(() => '?').join(', ');
  const stmt = db.prepare(`INSERT INTO "${tableName}" (${cols}) VALUES (${placeholders})`);
  stmt.run(...keys.map((k) => row[k]));
}

export function importDatabaseFromJson(db: Database.Database, data: any): void {
  validateBackupData(data);

  db.exec('PRAGMA foreign_keys = OFF');
  try {
    db.transaction(() => {
      db.exec('DELETE FROM sale_details');
      db.exec('DELETE FROM depot_positions');
      db.exec('DELETE FROM booking_positions');
      db.exec('DELETE FROM bookings');
      db.exec('DELETE FROM security_prices');
      db.exec('DELETE FROM securities');
      db.exec('DELETE FROM accounts');

      for (const row of data.tables.accounts) {
        insertRow(db, 'accounts', row);
      }
      for (const row of data.tables.securities) {
        insertRow(db, 'securities', row);
      }
      for (const row of data.tables.security_prices) {
        insertRow(db, 'security_prices', row);
      }
      for (const row of data.tables.bookings) {
        insertRow(db, 'bookings', row);
      }
      for (const row of data.tables.booking_positions) {
        insertRow(db, 'booking_positions', row);
      }
      for (const row of data.tables.depot_positions) {
        insertRow(db, 'depot_positions', row);
      }
      for (const row of data.tables.sale_details) {
        insertRow(db, 'sale_details', row);
      }
    })();
  } finally {
    db.exec('PRAGMA foreign_keys = ON');
  }
}

export const backup = {
  export: async (): Promise<BackupData> => {
    const db = getDatabase();
    return exportDatabaseToJson(db);
  },

  import: async (data: any): Promise<void> => {
    const db = getDatabase();
    importDatabaseFromJson(db, data);
  }
};
