import Database from 'better-sqlite3';
import * as path from 'path';
import { app } from 'electron';

let db: Database.Database;

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
  db.exec(`
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

  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vorgang TEXT NOT NULL CHECK (vorgang IN ('Buchung')),
      date TEXT NOT NULL,
      description TEXT,
      sender_receiver TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS booking_positions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      account_id INTEGER NOT NULL,
      valuta TEXT NOT NULL,
      amount REAL NOT NULL,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
      FOREIGN KEY (account_id) REFERENCES accounts(id)
    )
  `);

  db.exec(`
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

  db.exec(`
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
}
