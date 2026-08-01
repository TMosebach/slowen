import { getDatabase } from './connection';
import { Account, isSystemAccount } from '../../src/app/models/account.model';

function getCanonicalSystemAccountId(account: Pick<Account, 'name' | 'type' | 'subtype'>): number | null {
  if (!isSystemAccount(account)) {
    return null;
  }

  const db = getDatabase();
  const row = db
    .prepare('SELECT id FROM accounts WHERE name = ? AND type = ? AND subtype = ? ORDER BY id ASC LIMIT 1')
    .get(account.name, account.type, account.subtype) as { id: number } | undefined;

  return row?.id ?? null;
}

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
    if (isSystemAccount(account)) {
      throw new Error(`Systemkonto darf nicht angelegt werden: ${account.name}`);
    }

    const db = getDatabase();
    const stmt = db.prepare(
      'INSERT INTO accounts (name, type, subtype, iban, notes) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(account.name, account.type, account.subtype, account.iban, account.notes);
    return { id: result.lastInsertRowid as number, ...account };
  },

  update: async (id: number, account: Account): Promise<Account> => {
    const db = getDatabase();
    const current = db
      .prepare('SELECT name, type, subtype FROM accounts WHERE id = ?')
      .get(id) as Pick<Account, 'name' | 'type' | 'subtype'> | undefined;

    if (current && getCanonicalSystemAccountId(current) === id) {
      throw new Error(`Systemkonto darf nicht bearbeitet werden: ${current.name}`);
    }

    if (isSystemAccount(account)) {
      throw new Error(`Systemkonto darf nicht angelegt werden: ${account.name}`);
    }

    const stmt = db.prepare(
      'UPDATE accounts SET name = ?, type = ?, subtype = ?, iban = ?, notes = ? WHERE id = ?'
    );
    stmt.run(account.name, account.type, account.subtype, account.iban, account.notes, id);
    return { id, ...account };
  },

  delete: async (id: number): Promise<void> => {
    const db = getDatabase();
    const current = db
      .prepare('SELECT name, type, subtype FROM accounts WHERE id = ?')
      .get(id) as Pick<Account, 'name' | 'type' | 'subtype'> | undefined;

    if (current && getCanonicalSystemAccountId(current) === id) {
      throw new Error(`Systemkonto darf nicht gelöscht werden: ${current.name}`);
    }

    db.prepare('DELETE FROM accounts WHERE id = ?').run(id);
  }
};
