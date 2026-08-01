import Database from 'better-sqlite3';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Account } from '../../src/app/models/account.model';
import { accounts } from './accounts';
import { initDatabaseSchema } from './connection';

let db: Database.Database;

vi.mock('./connection', async () => {
  const actual = await vi.importActual<typeof import('./connection')>('./connection');

  return {
    ...actual,
    getDatabase: () => db,
  };
});

describe('accounts database protection', () => {
  beforeEach(() => {
    db = new Database(':memory:');
    initDatabaseSchema(db);
  });

  it('rejects updates to Wertpapierprovision system account', async () => {
    const systemAccount = db
      .prepare(`SELECT id, name, type, subtype FROM accounts WHERE name = 'Wertpapierprovision'`)
      .get() as Account & { id: number };

    await expect(
      accounts.update(systemAccount.id, {
        ...systemAccount,
        name: 'Andere Provision',
      })
    ).rejects.toThrow('Systemkonto darf nicht bearbeitet werden: Wertpapierprovision');
  });

  it('rejects deletion of Stueckzinsen system account', async () => {
    const systemAccount = db
      .prepare(`SELECT id FROM accounts WHERE name = 'Stückzinsen'`)
      .get() as { id: number };

    await expect(accounts.delete(systemAccount.id)).rejects.toThrow(
      'Systemkonto darf nicht gelöscht werden: Stückzinsen'
    );
  });

  it('still allows changes to normal accounts', async () => {
    const created = await accounts.create({
      name: 'Mein Girokonto',
      type: 'Bestand',
      subtype: 'Giro',
      iban: 'DE0012345678',
      notes: 'Test',
    });

    await expect(
      accounts.update(created.id!, {
        ...created,
        name: 'Mein neues Girokonto',
      })
    ).resolves.toMatchObject({ name: 'Mein neues Girokonto' });

    await expect(accounts.delete(created.id!)).resolves.toBeUndefined();
  });
});
