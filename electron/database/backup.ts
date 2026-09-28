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

export const backup = {
  export: async (): Promise<BackupData> => {
    const db = getDatabase();
    return exportDatabaseToJson(db);
  }
};
