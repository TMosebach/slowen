import { getDatabase } from './connection';

export interface SecurityPrice {
  id: number;
  security_id: number;
  date: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export const securityPrices = {
  create: async (security_id: number, date: string, price: number): Promise<SecurityPrice> => {
    const db = getDatabase();
    try {
      const stmt = db.prepare(`
        INSERT INTO security_prices (security_id, date, price)
        VALUES (?, ?, ?)
      `);

      stmt.run(security_id, date, price);

      const created = db
        .prepare('SELECT * FROM security_prices WHERE id = last_insert_rowid()')
        .get() as SecurityPrice;

      return created;
    } catch (error: any) {
      if (error.message.includes('FOREIGN KEY constraint failed')) {
        throw new Error('Wertpapier nicht gefunden');
      }
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Kurs für diesen Tag bereits vorhanden');
      }
      throw error;
    }
  },

  getBySecurityAndDate: async (security_id: number, date: string): Promise<SecurityPrice | null> => {
    const db = getDatabase();
    const price = db
      .prepare('SELECT * FROM security_prices WHERE security_id = ? AND date = ?')
      .get(security_id, date) as SecurityPrice | undefined;
    return price || null;
  },

  getByDate: async (date: string): Promise<SecurityPrice[]> => {
    const db = getDatabase();
    const prices = db
      .prepare('SELECT * FROM security_prices WHERE date = ? ORDER BY security_id')
      .all(date) as SecurityPrice[];
    return prices;
  },

  update: async (security_id: number, date: string, price: number): Promise<SecurityPrice> => {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE security_prices 
      SET price = ?, updated_at = CURRENT_TIMESTAMP
      WHERE security_id = ? AND date = ?
    `);

    stmt.run(price, security_id, date);

    return (await securityPrices.getBySecurityAndDate(security_id, date))!;
  },

  getLatest: async (security_id: number): Promise<SecurityPrice | null> => {
    const db = getDatabase();
    const price = db
      .prepare(`
        SELECT * FROM security_prices 
        WHERE security_id = ? 
        ORDER BY date DESC 
        LIMIT 1
      `)
      .get(security_id) as SecurityPrice | undefined;
    return price || null;
  }
};
