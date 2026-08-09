import Database from 'better-sqlite3';
import * as path from 'path';
import { app } from 'electron';

let db: Database.Database;

const BOOKINGS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vorgang TEXT NOT NULL CHECK (vorgang IN ('Buchung', 'Kauf', 'Verkauf')),
    date TEXT NOT NULL,
    description TEXT,
    sender_receiver TEXT
  )
`;

const BOOKING_POSITIONS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS booking_positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    valuta TEXT NOT NULL,
    amount REAL NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
  )
`;

const DEPOT_POSITIONS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS depot_positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL UNIQUE,
    depot_account_id INTEGER NOT NULL,
    security_id INTEGER NOT NULL,
    quantity REAL NOT NULL,
    price_per_unit REAL NOT NULL,
    purchase_date TEXT NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (depot_account_id) REFERENCES accounts(id),
    FOREIGN KEY (security_id) REFERENCES securities(id)
  )
`;

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = app.isPackaged
      ? path.join(app.getPath('userData'), 'slowen.db')
      : path.join(process.cwd(), 'slowen.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    initDatabase();
  }
  return db;
}

function initDatabase() {
  initDatabaseSchema(db);
}

export function initDatabaseSchema(database: Database.Database): void {
  database.pragma('foreign_keys = ON');

  database.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('Bestand', 'GuV')),
      subtype TEXT NOT NULL,
      iban TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  migrateBookingsSchema(database);
  database.exec(BOOKINGS_TABLE_SQL);

  database.exec(BOOKING_POSITIONS_TABLE_SQL);

  database.exec(DEPOT_POSITIONS_TABLE_SQL);

  database.exec(`
    CREATE TABLE IF NOT EXISTS securities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('Aktie', 'Anleihe', 'Fonds', 'ETF', 'Zertifikat')),
      isin TEXT NOT NULL UNIQUE,
      wkn TEXT NOT NULL UNIQUE,
      faelligkeit TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  database.exec(`
    CREATE TABLE IF NOT EXISTS security_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      security_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      price REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (security_id) REFERENCES securities(id),
      UNIQUE(security_id, date)
    )
  `);

  database.prepare(
    `INSERT INTO accounts (name, type, subtype)
     SELECT ?, ?, ?
     WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE name = ?)`
  ).run('Wertpapierprovision', 'GuV', 'Aufwand', 'Wertpapierprovision');

  database.prepare(
    `INSERT INTO accounts (name, type, subtype)
     SELECT ?, ?, ?
     WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE name = ?)`
  ).run('Stückzinsen', 'GuV', 'Aufwand', 'Stückzinsen');

  database.prepare(
    `INSERT INTO accounts (name, type, subtype)
     SELECT ?, ?, ?
     WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE name = ?)`
  ).run('Kursgewinn', 'GuV', 'Ertrag', 'Kursgewinn');

  database.prepare(
    `INSERT INTO accounts (name, type, subtype)
     SELECT ?, ?, ?
     WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE name = ?)`
  ).run('Kursverlust', 'GuV', 'Aufwand', 'Kursverlust');

  database.prepare(
    `INSERT INTO accounts (name, type, subtype)
     SELECT ?, ?, ?
     WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE name = ?)`
  ).run('Kapitalertragsteuer', 'GuV', 'Aufwand', 'Kapitalertragsteuer');

  database.prepare(
    `INSERT INTO accounts (name, type, subtype)
     SELECT ?, ?, ?
     WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE name = ?)`
  ).run('Solidaritätszuschlag', 'GuV', 'Aufwand', 'Solidaritätszuschlag');
}

function migrateBookingsSchema(database: Database.Database): void {
  const existingBookings = database
    .prepare(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'bookings'`)
    .get() as { sql: string } | undefined;

  if (!existingBookings?.sql?.includes(`CHECK (vorgang IN ('Buchung'))`)) {
    return;
  }

  const hasBookingPositions = Boolean(
    database.prepare(`SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'booking_positions'`).get()
  );

  const hasDepotPositions = Boolean(
    database.prepare(`SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'depot_positions'`).get()
  );

  database.exec('PRAGMA foreign_keys = OFF');

  try {
    database.transaction(() => {
      if (hasDepotPositions) {
        database.exec('ALTER TABLE depot_positions RENAME TO depot_positions_legacy');
      }

      if (hasBookingPositions) {
        database.exec('ALTER TABLE booking_positions RENAME TO booking_positions_legacy');
      }

      database.exec('ALTER TABLE bookings RENAME TO bookings_legacy');
      database.exec(BOOKINGS_TABLE_SQL.replace(' IF NOT EXISTS', ''));
      database.exec(BOOKING_POSITIONS_TABLE_SQL.replace(' IF NOT EXISTS', ''));
      database.exec(DEPOT_POSITIONS_TABLE_SQL.replace(' IF NOT EXISTS', ''));

      database.exec(`
        INSERT INTO bookings (id, vorgang, date, description, sender_receiver)
        SELECT id, vorgang, date, description, sender_receiver
        FROM bookings_legacy
      `);

      if (hasBookingPositions) {
        database.exec(`
          INSERT INTO booking_positions (id, booking_id, account_id, valuta, amount)
          SELECT id, booking_id, account_id, valuta, amount
          FROM booking_positions_legacy
        `);
      }

      if (hasDepotPositions) {
        database.exec(`
          INSERT INTO depot_positions (
            id,
            booking_id,
            depot_account_id,
            security_id,
            quantity,
            price_per_unit,
            purchase_date
          )
          SELECT id, booking_id, depot_account_id, security_id, quantity, price_per_unit, purchase_date
          FROM depot_positions_legacy
        `);
      }

      if (hasDepotPositions) {
        database.exec('DROP TABLE depot_positions_legacy');
      }

      if (hasBookingPositions) {
        database.exec('DROP TABLE booking_positions_legacy');
      }

      database.exec('DROP TABLE bookings_legacy');
    })();
  } finally {
    database.exec('PRAGMA foreign_keys = ON');
  }
}
