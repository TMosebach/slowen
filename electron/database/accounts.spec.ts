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

  it('rejects deletion of Kursgewinn system account', async () => {
    const systemAccount = db
      .prepare(`SELECT id FROM accounts WHERE name = 'Kursgewinn'`)
      .get() as { id: number };

    await expect(accounts.delete(systemAccount.id)).rejects.toThrow(
      'Systemkonto darf nicht gelöscht werden: Kursgewinn'
    );
  });

  it('rejects deletion of Kursverlust system account', async () => {
    const systemAccount = db
      .prepare(`SELECT id FROM accounts WHERE name = 'Kursverlust'`)
      .get() as { id: number };

    await expect(accounts.delete(systemAccount.id)).rejects.toThrow(
      'Systemkonto darf nicht gelöscht werden: Kursverlust'
    );
  });

  it('rejects creating a new system account', async () => {
    await expect(
      accounts.create({
        name: 'Wertpapierprovision',
        type: 'GuV',
        subtype: 'Aufwand',
      })
    ).rejects.toThrow('Systemkonto darf nicht angelegt werden: Wertpapierprovision');
  });

  it('rejects creating a duplicate Kapitalertragsteuer system account', async () => {
    await expect(
      accounts.create({
        name: 'Kapitalertragsteuer',
        type: 'GuV',
        subtype: 'Aufwand',
      })
    ).rejects.toThrow('Systemkonto darf nicht angelegt werden: Kapitalertragsteuer');
  });

  it('rejects creating a duplicate Solidaritätszuschlag system account', async () => {
    await expect(
      accounts.create({
        name: 'Solidaritätszuschlag',
        type: 'GuV',
        subtype: 'Aufwand',
      })
    ).rejects.toThrow('Systemkonto darf nicht angelegt werden: Solidaritätszuschlag');
  });

  it('rejects renaming a normal account into a system account', async () => {
    const created = await accounts.create({
      name: 'Mein Girokonto',
      type: 'Bestand',
      subtype: 'Giro',
    });

    await expect(
      accounts.update(created.id!, {
        ...created,
        name: 'Stückzinsen',
        type: 'GuV',
        subtype: 'Aufwand',
      })
    ).rejects.toThrow('Systemkonto darf nicht angelegt werden: Stückzinsen');
  });

  it('rejects renaming a system account away from its identity', async () => {
    const systemAccount = db
      .prepare(`SELECT id, name, type, subtype FROM accounts WHERE name = 'Wertpapierprovision'`)
      .get() as { id: number; name: string; type: 'Bestand' | 'GuV'; subtype: string };

    await expect(
      accounts.update(systemAccount.id, {
        ...systemAccount,
        name: 'Andere Provision',
      })
    ).rejects.toThrow('Systemkonto darf nicht bearbeitet werden: Wertpapierprovision');
  });

  it('allows deleting a duplicate system account while protecting the canonical one', async () => {
    const canonical = db
      .prepare(`SELECT id FROM accounts WHERE name = 'Wertpapierprovision'`)
      .get() as { id: number };
    const duplicateId = db
      .prepare(`INSERT INTO accounts (name, type, subtype) VALUES (?, ?, ?)`)
      .run('Wertpapierprovision', 'GuV', 'Aufwand').lastInsertRowid as number;

    await expect(accounts.delete(canonical.id)).rejects.toThrow(
      'Systemkonto darf nicht gelöscht werden: Wertpapierprovision'
    );
    await expect(accounts.delete(duplicateId)).resolves.toBeUndefined();
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
