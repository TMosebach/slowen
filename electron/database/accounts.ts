import { getDatabase } from './connection';
import { Account } from '../../src/app/models/account.model';

export const accounts = {
  getAll: async (): Promise<Account[]> => {
    const db = getDatabase();
    return db.prepare('SELECT * FROM accounts').all() as Account[];
  },

  getById: async (id: number): Promise<Account | null> => {
    const db = getDatabase();
    return db.prepare('SELECT * FROM accounts WHERE id = ?').get(id) as Account | null;
  },

  create: async (account: Account): Promise<Account> => {
    const db = getDatabase();
    const stmt = db.prepare(
      'INSERT INTO accounts (name, type, subtype, iban, notes) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(account.name, account.type, account.subtype, account.iban, account.notes);
    return { id: result.lastInsertRowid as number, ...account };
  },

  update: async (id: number, account: Account): Promise<Account> => {
    const db = getDatabase();
    const stmt = db.prepare(
      'UPDATE accounts SET name = ?, type = ?, subtype = ?, iban = ?, notes = ? WHERE id = ?'
    );
    stmt.run(account.name, account.type, account.subtype, account.iban, account.notes, id);
    return { id, ...account };
  },

  delete: async (id: number): Promise<void> => {
    const db = getDatabase();
    db.prepare('DELETE FROM accounts WHERE id = ?').run(id);
  }
};
