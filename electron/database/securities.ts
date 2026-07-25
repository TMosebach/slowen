import { getDatabase } from './connection';

export type SecurityType = 'Aktie' | 'Anleihe' | 'Fonds' | 'ETF' | 'Zertifikat';

export interface Security {
  id: number;
  name: string;
  type: SecurityType;
  isin: string;
  wkn: string;
  faelligkeit?: string;
  created_at: string;
  updated_at: string;
}

export const securities = {
  create: async (security: Omit<Security, 'id' | 'created_at' | 'updated_at'>): Promise<Security> => {
    const db = getDatabase();
    try {
      const stmt = db.prepare(`
        INSERT INTO securities (name, type, isin, wkn, faelligkeit)
        VALUES (?, ?, ?, ?, ?)
      `);

      stmt.run(security.name, security.type, security.isin, security.wkn, security.faelligkeit || null);

      const created = db
        .prepare('SELECT * FROM securities WHERE id = last_insert_rowid()')
        .get() as Security;

      return created;
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('ISIN oder WKN bereits vorhanden');
      }
      throw error;
    }
  },

  getAll: async (): Promise<Security[]> => {
    const db = getDatabase();
    const secList = db
      .prepare('SELECT * FROM securities ORDER BY name')
      .all() as Security[];
    return secList;
  },

  getById: async (id: number): Promise<Security | null> => {
    const db = getDatabase();
    const security = db
      .prepare('SELECT * FROM securities WHERE id = ?')
      .get(id) as Security | undefined;
    return security || null;
  },

  update: async (id: number, updates: Partial<Security>): Promise<Security> => {
    const db = getDatabase();
    try {
      const current = await securities.getById(id);
      if (!current) {
        throw new Error('Wertpapier nicht gefunden');
      }

      const fieldsToUpdate: string[] = [];
      const values: any[] = [];

      if (updates.name !== undefined) {
        fieldsToUpdate.push('name = ?');
        values.push(updates.name);
      }
      if (updates.type !== undefined) {
        fieldsToUpdate.push('type = ?');
        values.push(updates.type);
      }
      if (updates.isin !== undefined) {
        fieldsToUpdate.push('isin = ?');
        values.push(updates.isin);
      }
      if (updates.wkn !== undefined) {
        fieldsToUpdate.push('wkn = ?');
        values.push(updates.wkn);
      }
      if (updates.faelligkeit !== undefined) {
        fieldsToUpdate.push('faelligkeit = ?');
        values.push(updates.faelligkeit || null);
      }

      if (fieldsToUpdate.length === 0) {
        return current;
      }

      fieldsToUpdate.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const updateStmt = `UPDATE securities SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
      db.prepare(updateStmt).run(...values);

      return (await securities.getById(id))!;
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('ISIN oder WKN bereits vorhanden');
      }
      throw error;
    }
  }
};
