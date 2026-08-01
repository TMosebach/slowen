import { getDatabase } from './connection';
import { Account } from '../../src/app/models/account.model';

function isProtectedSystemAccount(account: Pick<Account, 'name' | 'type' | 'subtype'>): boolean {
  return (
    (account.name === 'Wertpapierprovision' || account.name === 'Stückzinsen')
    && account.type === 'GuV'
    && account.subtype === 'Aufwand'
  );
}

function getProtectedSystemAccount(id: number): Pick<Account, 'name' | 'type' | 'subtype'> | null {
  const db = getDatabase();
  const account = db.prepare('SELECT name, type, subtype FROM accounts WHERE id = ?').get(id) as
    | Pick<Account, 'name' | 'type' | 'subtype'>
    | undefined;

  if (!account || !isProtectedSystemAccount(account)) {
    return null;
  }

  return account;
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
    const db = getDatabase();
    const stmt = db.prepare(
      'INSERT INTO accounts (name, type, subtype, iban, notes) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(account.name, account.type, account.subtype, account.iban, account.notes);
    return { id: result.lastInsertRowid as number, ...account };
  },

  update: async (id: number, account: Account): Promise<Account> => {
    const protectedAccount = getProtectedSystemAccount(id);
    if (protectedAccount) {
      throw new Error(`Systemkonto darf nicht bearbeitet werden: ${protectedAccount.name}`);
    }

    const db = getDatabase();
    const stmt = db.prepare(
      'UPDATE accounts SET name = ?, type = ?, subtype = ?, iban = ?, notes = ? WHERE id = ?'
    );
    stmt.run(account.name, account.type, account.subtype, account.iban, account.notes, id);
    return { id, ...account };
  },

  delete: async (id: number): Promise<void> => {
    const protectedAccount = getProtectedSystemAccount(id);
    if (protectedAccount) {
      throw new Error(`Systemkonto darf nicht gelöscht werden: ${protectedAccount.name}`);
    }

    const db = getDatabase();
    db.prepare('DELETE FROM accounts WHERE id = ?').run(id);
  }
};
