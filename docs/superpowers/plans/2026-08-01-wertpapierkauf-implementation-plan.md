# Wertpapierkauf Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Einen neuen Buchungs-Vorgang `Kauf` implementieren, der Wertpapierkäufe inklusive Geldfluss, optionaler Gebühren und Stückzinsen atomar bucht und den erworbenen Bestand pro Depot-Konto anzeigt.

**Architecture:** Die bestehende Buchungsarchitektur bleibt der Einstiegspunkt. `bookings` bleibt die führende Entität für Geldflüsse, während eine neue Tabelle `depot_positions` den erworbenen Bestand 1:1 mit Kauf-Buchungen verknüpft. Angular rendert Kauf-spezifische Formulareingaben innerhalb des vorhandenen Buchungsformulars und ergänzt eine neue Depot-Kontoansicht, die aggregierte Bestände und Kaufhistorie zeigt.

**Tech Stack:** Angular 21, TypeScript 5.9, Electron 43, better-sqlite3 12, Tailwind CSS 4, Vitest, Angular TestBed

## Global Constraints

- Desktop-Applikation "Slowen" zur persönlichen Finanzverwaltung auf Mac OS.
- Sprache und UI-Text bleiben Deutsch.
- "Kauf" ist ein spezialisierter Buchungs-Vorgang innerhalb der bestehenden `bookings`-Struktur.
- Ein Kauf erzeugt in einer atomaren Transaktion alle relevanten Buchungspositionen sowie genau einen Eintrag in `depot_positions`.
- Gebühren werden, falls vorhanden, auf das Konto `Wertpapierprovision` gebucht.
- Stückzinsen werden, falls vorhanden, auf das Konto `Stückzinsen` gebucht.
- Die Konten `Wertpapierprovision` und `Stückzinsen` sind beide vom Typ `GuV` und vom Subtype `Aufwand`; unterschieden werden sie ausschließlich über den Kontonamen.
- `quantity` bleibt `REAL`, um Fondsanteile mit Nachkommastellen zu unterstützen.
- Nicht im Scope: Verkauf von Wertpapieren, Bewertung zum aktuellen Kurswert, FIFO-Berechnung für Veräußerungsgewinne, CSV-Import von Käufen.

---

## File Structure

- Modify: `electron/database/connection.ts`
  Verantwortlich für Datenbankschema, Tabelleninitialisierung und Systemkonten.
- Modify: `electron/database/bookings.ts`
  Verantwortlich für Lesen, Erstellen, Aktualisieren und Löschen von Buchungen inklusive Kauf-Ableitung.
- Create: `electron/database/depot-positions.ts`
  Fokussierte Datenzugriffsschicht für `depot_positions`.
- Create: `electron/database/connection.spec.ts`
  Verifiziert Schema und automatische Systemkonten.
- Create: `electron/database/bookings.spec.ts`
  Verifiziert Kauf-Transaktionen und abgeleitete Positionen.
- Create: `electron/database/depot-positions.spec.ts`
  Verifiziert Repository-Verhalten für `depot_positions`.
- Create: `electron/ipc/depot-positions.ipc.ts`
  Registriert IPC-Handler für Depotpositionen.
- Create: `electron/ipc/depot-positions.ipc.spec.ts`
  Verifiziert Registrierung der IPC-Handler.
- Modify: `electron/main.ts`
  Registriert neuen IPC-Bereich beim App-Start.
- Modify: `electron/preload/preload.ts`
  Exponiert Depot-Positions-API im Renderer.
- Modify: `src/app/electron-api.d.ts`
  Typisiert neue Electron-API-Oberflächen.
- Modify: `src/app/models/booking.model.ts`
  Enthält `Kauf` als Vorgang und optionale Kaufdetails.
- Create: `src/app/models/depot-position.model.ts`
  Definiert `DepotPosition`, `DepotPositionSummary` und `DepotPurchaseHistoryItem`.
- Create: `src/app/models/booking.model.spec.ts`
  Verifiziert Kaufmodell-Typen.
- Create: `src/app/models/depot-position.model.spec.ts`
  Verifiziert neue Depotmodelle.
- Create: `src/app/services/depot-positions.service.ts`
  Angular-Service für Depotpositions-API.
- Create: `src/app/services/depot-positions.service.spec.ts`
  Verifiziert Service-Delegation an `window.electronAPI`.
- Modify: `src/app/services/booking.service.spec.ts`
  Verifiziert, dass Kaufdaten transparent an die API weitergereicht werden.
- Modify: `src/app/app.routes.ts`
  Ergänzt Routen für direkten Einstieg in neue Kauf- und Depotansicht.
- Modify: `src/app/components/bookings/booking-form/booking-form.component.ts`
  Verwaltet Formularmodus für `Buchung` vs. `Kauf` und erzeugt Request-Daten.
- Modify: `src/app/components/bookings/booking-form/booking-form.component.html`
  Rendert Kauf-spezifische Eingaben und berechnete Summen.
- Modify: `src/app/components/bookings/booking-form/booking-form.component.spec.ts`
  Verifiziert Kaufvalidierung und Formularmodi.
- Modify: `src/app/components/bookings/booking-list/booking-list.component.ts`
  Ergänzt Navigation für direkten Einstieg `Neuer Kauf`.
- Modify: `src/app/components/bookings/booking-list/booking-list.component.html`
  Rendert Button `Neuer Kauf`.
- Modify: `src/app/components/bookings/booking-list/booking-list.component.spec.ts`
  Verifiziert neue Navigation.
- Create: `src/app/components/accounts/depot-detail/depot-detail.component.ts`
  Lädt Depotkonto, aggregiert Bestände und Kaufhistorie.
- Create: `src/app/components/accounts/depot-detail/depot-detail.component.html`
  Rendert Kopfbereich, Bestandstabelle und Kaufhistorie.
- Create: `src/app/components/accounts/depot-detail/depot-detail.component.spec.ts`
  Verifiziert Aggregation und Darstellung.
- Modify: `src/app/components/accounts/account-list/account-list.component.html`
  Verlinkt Depotkonten in die neue Detailansicht.
- Modify: `src/app/components/accounts/account-list/account-list.component.spec.ts`
  Verifiziert Linkverhalten für Depotkonten.

### Task 1: Schema und Systemkonten

**Files:**
- Create: `electron/database/connection.spec.ts`
- Modify: `electron/database/connection.ts`

**Interfaces:**
- Consumes: `getDatabase(): Database.Database`
- Produces: `initDatabaseSchema(database: Database.Database): void` mit `bookings.vorgang IN ('Buchung', 'Kauf')`, Tabelle `depot_positions`, und den Konten `Wertpapierprovision`/`Stückzinsen`

- [ ] **Step 1: Write the failing test**

```ts
import Database from 'better-sqlite3';
import { describe, expect, it } from 'vitest';
import { initDatabaseSchema } from './connection';

describe('database schema for securities purchases', () => {
  it('allows bookings with vorgang Kauf', () => {
    const db = new Database(':memory:');
    initDatabaseSchema(db);

    expect(() => {
      db.prepare(`
        INSERT INTO bookings (vorgang, date, description, sender_receiver)
        VALUES (?, ?, ?, ?)
      `).run('Kauf', '2026-08-01', 'Testkauf', null);
    }).not.toThrow();
  });

  it('creates depot_positions with one row per booking', () => {
    const db = new Database(':memory:');
    initDatabaseSchema(db);

    const columns = db.prepare(`PRAGMA table_info(depot_positions)`).all() as Array<{ name: string }>;
    expect(columns.map((column) => column.name)).toEqual([
      'id',
      'booking_id',
      'depot_account_id',
      'security_id',
      'quantity',
      'price_per_unit',
      'purchase_date'
    ]);
  });

  it('ensures system accounts exist', () => {
    const db = new Database(':memory:');
    initDatabaseSchema(db);

    const accounts = db.prepare(`
      SELECT name, type, subtype
      FROM accounts
      WHERE name IN ('Wertpapierprovision', 'Stückzinsen')
      ORDER BY name
    `).all();

    expect(accounts).toEqual([
      { name: 'Stückzinsen', type: 'GuV', subtype: 'Aufwand' },
      { name: 'Wertpapierprovision', type: 'GuV', subtype: 'Aufwand' }
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watch=false --include electron/database/connection.spec.ts`
Expected: FAIL, weil `connection.ts` das Schema noch nicht auf `Kauf` und `depot_positions` erweitert.

- [ ] **Step 3: Write minimal implementation**

```ts
export function initDatabaseSchema(database: Database.Database) {
  database.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vorgang TEXT NOT NULL CHECK (vorgang IN ('Buchung', 'Kauf')),
    date TEXT NOT NULL,
    description TEXT,
    sender_receiver TEXT
  )
  `);

  database.exec(`
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
  `);

  database.prepare(`
  INSERT OR IGNORE INTO accounts (name, type, subtype)
  VALUES (?, ?, ?), (?, ?, ?)
`).run(
  'Wertpapierprovision', 'GuV', 'Aufwand',
  'Stückzinsen', 'GuV', 'Aufwand'
);
}

function initDatabase() {
  initDatabaseSchema(db);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watch=false --include electron/database/connection.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add electron/database/connection.ts electron/database/connection.spec.ts
git commit -m "feat: extend schema for securities purchases"
```

### Task 2: Shared Modelle für Kauf und Depotbestand

**Files:**
- Create: `src/app/models/booking.model.spec.ts`
- Create: `src/app/models/depot-position.model.ts`
- Create: `src/app/models/depot-position.model.spec.ts`
- Modify: `src/app/models/booking.model.ts`

**Interfaces:**
- Consumes: `BookingPosition`
- Produces: `BookingVorgang`, `PurchaseBookingDetails`, `DepotPosition`, `DepotPositionSummary`, `DepotPurchaseHistoryItem`

- [ ] **Step 1: Write the failing test**

```ts
import type { Booking } from './booking.model';
import { VORGANG_OPTIONS } from './booking.model';
import type { DepotPosition, DepotPositionSummary, DepotPurchaseHistoryItem } from './depot-position.model';

describe('purchase related models', () => {
  it('exposes Kauf as valid booking vorgang', () => {
    expect(VORGANG_OPTIONS).toContain('Kauf');
  });

  it('supports purchase details on bookings', () => {
    const booking: Booking = {
      vorgang: 'Kauf',
      date: '2026-08-01',
      description: 'ETF-Kauf',
      positions: [],
      purchaseDetails: {
        security_id: 4,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 10.5,
        price_per_unit: 99.4,
        fees: 3,
        accrued_interest: 0
      }
    };

    expect(booking.purchaseDetails?.settlement_account_id).toBe(2);
  });

  it('defines depot position models with the expected fields', () => {
    const position: DepotPosition = {
      booking_id: 1,
      depot_account_id: 2,
      security_id: 3,
      quantity: 1.25,
      price_per_unit: 100.5,
      purchase_date: '2026-08-01'
    };

    const summary: DepotPositionSummary = {
      security_id: 3,
      security_name: 'Bundesanleihe',
      security_type: 'Anleihe',
      isin: 'DE000TEST000',
      total_quantity: 5,
      average_price_per_unit: 101,
      total_purchase_value: 505,
      first_purchase_date: '2026-08-01'
    };

    const historyItem: DepotPurchaseHistoryItem = {
      booking_id: 9,
      booking_date: '2026-08-02',
      security_name: 'Bundesanleihe',
      quantity: 2,
      price_per_unit: 102,
      total_amount: 204
    };

    expect(position.quantity).toBe(1.25);
    expect(summary.average_price_per_unit).toBe(101);
    expect(historyItem.booking_id).toBe(9);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watch=false --include src/app/models/booking.model.spec.ts --include src/app/models/depot-position.model.spec.ts`
Expected: FAIL, weil `Kauf`, `purchaseDetails` und `DepotPosition` noch fehlen.

- [ ] **Step 3: Write minimal implementation**

```ts
export const VORGANG_OPTIONS = ['Buchung', 'Kauf'] as const;
export type BookingVorgang = typeof VORGANG_OPTIONS[number];

export interface PurchaseBookingDetails {
  security_id: number;
  depot_account_id: number;
  settlement_account_id: number;
  quantity: number;
  price_per_unit: number;
  fees?: number;
  accrued_interest?: number;
}

export interface Booking {
  id?: number;
  vorgang: BookingVorgang;
  date: string;
  description?: string;
  sender_receiver?: string;
  positions: BookingPosition[];
  purchaseDetails?: PurchaseBookingDetails;
}
```

```ts
export interface DepotPosition {
  id?: number;
  booking_id: number;
  depot_account_id: number;
  security_id: number;
  quantity: number;
  price_per_unit: number;
  purchase_date: string;
}

export interface DepotPositionSummary {
  security_id: number;
  security_name: string;
  security_type: string;
  isin: string;
  total_quantity: number;
  average_price_per_unit: number;
  total_purchase_value: number;
  first_purchase_date: string;
}

export interface DepotPurchaseHistoryItem {
  booking_id: number;
  booking_date: string;
  security_name: string;
  quantity: number;
  price_per_unit: number;
  total_amount: number;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watch=false --include src/app/models/booking.model.spec.ts --include src/app/models/depot-position.model.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/models/booking.model.ts src/app/models/booking.model.spec.ts src/app/models/depot-position.model.ts src/app/models/depot-position.model.spec.ts
git commit -m "feat: add purchase and depot models"
```

### Task 3: Repository für Depotpositionen

**Files:**
- Create: `electron/database/depot-positions.ts`
- Create: `electron/database/depot-positions.spec.ts`

**Interfaces:**
- Consumes: `getDatabase(): Database.Database`, `DepotPosition`
- Produces: `depotPositions.create(position: Omit<DepotPosition, 'id'>): Promise<DepotPosition>`, `depotPositions.getByBooking(bookingId: number): Promise<DepotPosition | null>`, `depotPositions.getByDepot(depotAccountId: number): Promise<DepotPosition[]>`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { depotPositions } from './depot-positions';

describe('depotPositions repository', () => {
  it('stores and loads depot positions by booking and depot', async () => {
    const created = await depotPositions.create({
      booking_id: 1,
      depot_account_id: 2,
      security_id: 3,
      quantity: 10,
      price_per_unit: 101.25,
      purchase_date: '2026-08-01'
    });

    expect(created.booking_id).toBe(1);

    const byBooking = await depotPositions.getByBooking(1);
    expect(byBooking?.security_id).toBe(3);

    const byDepot = await depotPositions.getByDepot(2);
    expect(byDepot).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watch=false --include electron/database/depot-positions.spec.ts`
Expected: FAIL, weil Repository-Datei noch nicht existiert.

- [ ] **Step 3: Write minimal implementation**

```ts
import { getDatabase } from './connection';
import { DepotPosition } from '../../src/app/models/depot-position.model';

export const depotPositions = {
  create: async (position: Omit<DepotPosition, 'id'>): Promise<DepotPosition> => {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO depot_positions
        (booking_id, depot_account_id, security_id, quantity, price_per_unit, purchase_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      position.booking_id,
      position.depot_account_id,
      position.security_id,
      position.quantity,
      position.price_per_unit,
      position.purchase_date
    );

    return db.prepare('SELECT * FROM depot_positions WHERE id = last_insert_rowid()').get() as DepotPosition;
  },

  getByBooking: async (bookingId: number): Promise<DepotPosition | null> => {
    const db = getDatabase();
    return (db.prepare('SELECT * FROM depot_positions WHERE booking_id = ?').get(bookingId) as DepotPosition | undefined) || null;
  },

  getByDepot: async (depotAccountId: number): Promise<DepotPosition[]> => {
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM depot_positions
      WHERE depot_account_id = ?
      ORDER BY purchase_date DESC, id DESC
    `).all(depotAccountId) as DepotPosition[];
  }
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watch=false --include electron/database/depot-positions.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add electron/database/depot-positions.ts electron/database/depot-positions.spec.ts
git commit -m "feat: add depot positions repository"
```

### Task 4: Kauf-Transaktionen in der Buchungsdatenbank

**Files:**
- Create: `electron/database/bookings.spec.ts`
- Modify: `electron/database/bookings.ts`

**Interfaces:**
- Consumes: `Booking`, `PurchaseBookingDetails`, `BookingPosition`, `depotPositions.create(...)`
- Produces: `bookings.create(booking: Booking): Promise<Booking>`, `bookings.update(id: number, booking: Booking): Promise<Booking>`, `bookings.getById(id: number): Promise<Booking | null>` mit `purchaseDetails` für Käufe

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { bookings } from './bookings';

async function seedPurchaseReferences() {
  const db = getDatabase();
  db.prepare(`
    INSERT INTO accounts (id, name, type, subtype) VALUES
      (1, 'Verrechnungskonto', 'Bestand', 'Giro'),
      (2, 'Brokerkonto', 'Bestand', 'Giro'),
      (3, 'Depot A', 'Bestand', 'Depot')
  `).run();
  db.prepare(`
    INSERT INTO securities (id, name, type, isin, wkn)
    VALUES
      (1, 'ETF World', 'ETF', 'IE00TEST0001', 'ETF001'),
      (7, 'ETF Europe', 'ETF', 'IE00TEST0007', 'ETF007'),
      (8, 'Bundesanleihe', 'Anleihe', 'DE000TEST0008', 'BOND08')
  `).run();
}

describe('purchase bookings', () => {
  it('creates balanced booking positions and one depot position for Kauf', async () => {
    await seedPurchaseReferences();
    const created = await bookings.create({
      vorgang: 'Kauf',
      date: '2026-08-01',
      description: 'ETF Kauf',
      sender_receiver: 'Broker',
      positions: [],
      purchaseDetails: {
        security_id: 7,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 10,
        price_per_unit: 150,
        fees: 5,
        accrued_interest: 0
      }
    });

    const reloaded = await bookings.getById(created.id!);
    expect(reloaded?.vorgang).toBe('Kauf');
    expect(reloaded?.positions).toHaveLength(3);
    expect(reloaded?.positions.map((pos) => pos.amount)).toEqual(expect.arrayContaining([-1505, 1500, 5]));
    expect(reloaded?.purchaseDetails?.security_id).toBe(7);
  });

  it('adds a Stückzinsen position when accrued interest is present', async () => {
    await seedPurchaseReferences();
    const created = await bookings.create({
      vorgang: 'Kauf',
      date: '2026-08-01',
      description: 'Anleihe Kauf',
      positions: [],
      purchaseDetails: {
        security_id: 8,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 20,
        price_per_unit: 98,
        fees: 10,
        accrued_interest: 12
      }
    });

    const reloaded = await bookings.getById(created.id!);
    expect(reloaded?.positions.map((pos) => pos.amount)).toEqual(expect.arrayContaining([-1982, 1960, 10, 12]));
    expect(reloaded?.purchaseDetails?.accrued_interest).toBe(12);
  });

  it('replaces derived positions and depot data on update', async () => {
    await seedPurchaseReferences();
    const created = await bookings.create({
      vorgang: 'Kauf',
      date: '2026-08-01',
      positions: [],
      purchaseDetails: {
        security_id: 1,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 5,
        price_per_unit: 100,
        fees: 0,
        accrued_interest: 0
      }
    });

    await bookings.update(created.id!, {
      vorgang: 'Kauf',
      date: '2026-08-02',
      positions: [],
      purchaseDetails: {
        security_id: 1,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 6,
        price_per_unit: 100,
        fees: 3,
        accrued_interest: 2
      }
    });

    const reloaded = await bookings.getById(created.id!);
    expect(reloaded?.positions.map((pos) => pos.amount)).toEqual(expect.arrayContaining([-605, 600, 3, 2]));
    expect(reloaded?.purchaseDetails?.quantity).toBe(6);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watch=false --include electron/database/bookings.spec.ts`
Expected: FAIL, weil Kauf-Ableitung und `purchaseDetails` noch nicht implementiert sind.

- [ ] **Step 3: Write minimal implementation**

```ts
function requireSystemAccount(name: string): number {
  const db = getDatabase();
  const account = db.prepare('SELECT id FROM accounts WHERE name = ?').get(name) as { id: number } | undefined;

  if (!account) {
    throw new Error(`Systemkonto fehlt: ${name}`);
  }

  return account.id;
}

function buildPurchasePositions(booking: Booking): BookingPosition[] {
  if (!booking.purchaseDetails) {
    throw new Error('Kaufdetails fehlen.');
  }

  const {
    settlement_account_id,
    depot_account_id,
    quantity,
    price_per_unit,
    fees = 0,
    accrued_interest = 0
  } = booking.purchaseDetails;

  const purchaseValue = quantity * price_per_unit;
  const positions: BookingPosition[] = [
    {
      account_id: settlement_account_id,
      valuta: booking.date,
      amount: -(purchaseValue + fees + accrued_interest)
    },
    {
      account_id: depot_account_id,
      valuta: booking.date,
      amount: purchaseValue
    }
  ];

  if (fees > 0) {
    positions.push({
      account_id: requireSystemAccount('Wertpapierprovision'),
      valuta: booking.date,
      amount: fees
    });
  }

  if (accrued_interest > 0) {
    positions.push({
      account_id: requireSystemAccount('Stückzinsen'),
      valuta: booking.date,
      amount: accrued_interest
    });
  }

  return positions;
}
```

```ts
const effectivePositions = booking.vorgang === 'Kauf' ? buildPurchasePositions(booking) : booking.positions;
```

```ts
if (booking.vorgang === 'Kauf' && booking.purchaseDetails) {
  db.prepare(`
    INSERT INTO depot_positions
      (booking_id, depot_account_id, security_id, quantity, price_per_unit, purchase_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    bookingId,
    booking.purchaseDetails.depot_account_id,
    booking.purchaseDetails.security_id,
    booking.purchaseDetails.quantity,
    booking.purchaseDetails.price_per_unit,
    booking.date
  );
}
```

```ts
const depotPosition = db.prepare('SELECT * FROM depot_positions WHERE booking_id = ?').get(row.id!) as any;
if (row.vorgang === 'Kauf' && depotPosition) {
  const positions = row.positions;
  const feesAccountId = requireSystemAccount('Wertpapierprovision');
  const accruedInterestAccountId = requireSystemAccount('Stückzinsen');
  row.purchaseDetails = {
    security_id: depotPosition.security_id,
    depot_account_id: depotPosition.depot_account_id,
    settlement_account_id: positions.find((pos) => pos.amount < 0)?.account_id ?? 0,
    quantity: depotPosition.quantity,
    price_per_unit: depotPosition.price_per_unit,
    fees: positions.find((pos) => pos.account_id === feesAccountId)?.amount ?? 0,
    accrued_interest: positions.find((pos) => pos.account_id === accruedInterestAccountId)?.amount ?? 0
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watch=false --include electron/database/bookings.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add electron/database/bookings.ts electron/database/bookings.spec.ts
git commit -m "feat: add purchase booking transactions"
```

### Task 5: IPC, preload und Angular-Service für Depotpositionen

**Files:**
- Create: `electron/ipc/depot-positions.ipc.ts`
- Create: `electron/ipc/depot-positions.ipc.spec.ts`
- Modify: `electron/main.ts`
- Modify: `electron/preload/preload.ts`
- Modify: `src/app/electron-api.d.ts`
- Create: `src/app/services/depot-positions.service.ts`
- Create: `src/app/services/depot-positions.service.spec.ts`

**Interfaces:**
- Consumes: `depotPositions.getByBooking(bookingId: number): Promise<DepotPosition | null>`, `depotPositions.getByDepot(depotAccountId: number): Promise<DepotPosition[]>`
- Produces: `registerDepotPositionsIPC(): void`, `window.electronAPI.depotPositions.getByBooking(bookingId: number): Promise<DepotPosition | null>`, `window.electronAPI.depotPositions.getByDepot(depotAccountId: number): Promise<DepotPosition[]>`, `DepotPositionsService`

- [ ] **Step 1: Write the failing test**

```ts
import { ipcMain } from 'electron';
import { describe, expect, it, vi } from 'vitest';
import { registerDepotPositionsIPC } from './depot-positions.ipc';

describe('registerDepotPositionsIPC', () => {
  it('registers handler for depot-positions:getByDepot', () => {
    const handle = vi.spyOn(ipcMain, 'handle');
    registerDepotPositionsIPC();
    expect(handle).toHaveBeenCalledWith('depot-positions:getByDepot', expect.any(Function));
  });

  it('registers handler for depot-positions:getByBooking', () => {
    const handle = vi.spyOn(ipcMain, 'handle');
    registerDepotPositionsIPC();
    expect(handle).toHaveBeenCalledWith('depot-positions:getByBooking', expect.any(Function));
  });
});
```

```ts
import { TestBed } from '@angular/core/testing';
import { DepotPositionsService } from './depot-positions.service';

describe('DepotPositionsService', () => {
  let service: DepotPositionsService;
  let mockApi: any;

  beforeEach(() => {
    mockApi = {
      getByBooking: vi.fn().mockResolvedValue(null),
      getByDepot: vi.fn().mockResolvedValue([])
    };

    (window as any).electronAPI = { depotPositions: mockApi };
    TestBed.configureTestingModule({});
    service = TestBed.inject(DepotPositionsService);
  });

  it('calls getByBooking on the preload api', async () => {
    await service.getByBooking(3);
    expect(mockApi.getByBooking).toHaveBeenCalledWith(3);
  });

  it('calls getByDepot on the preload api', async () => {
    await service.getByDepot(9);
    expect(mockApi.getByDepot).toHaveBeenCalledWith(9);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watch=false --include electron/ipc/depot-positions.ipc.spec.ts --include src/app/services/depot-positions.service.spec.ts`
Expected: FAIL, weil IPC-Registrierung, Preload und Service noch fehlen.

- [ ] **Step 3: Write minimal implementation**

```ts
import { ipcMain } from 'electron';
import { depotPositions } from '../database/depot-positions';

export function registerDepotPositionsIPC() {
  ipcMain.handle('depot-positions:getByBooking', async (_event, bookingId) => {
    return await depotPositions.getByBooking(bookingId);
  });

  ipcMain.handle('depot-positions:getByDepot', async (_event, depotAccountId) => {
    return await depotPositions.getByDepot(depotAccountId);
  });
}
```

```ts
import { registerDepotPositionsIPC } from './ipc/depot-positions.ipc';
```

```ts
registerDepotPositionsIPC();
```

```ts
depotPositions: {
  getByBooking: (bookingId: number) => ipcRenderer.invoke('depot-positions:getByBooking', bookingId),
  getByDepot: (depotAccountId: number) => ipcRenderer.invoke('depot-positions:getByDepot', depotAccountId)
}
```

```ts
depotPositions: {
  getByBooking: (bookingId: number) => Promise<any>;
  getByDepot: (depotAccountId: number) => Promise<any[]>;
};
```

```ts
import { Injectable } from '@angular/core';
import { DepotPosition } from '../models/depot-position.model';

@Injectable({ providedIn: 'root' })
export class DepotPositionsService {
  private get api() {
    return window.electronAPI.depotPositions;
  }

  getByBooking(bookingId: number): Promise<DepotPosition | null> {
    return this.api.getByBooking(bookingId);
  }

  getByDepot(depotAccountId: number): Promise<DepotPosition[]> {
    return this.api.getByDepot(depotAccountId);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watch=false --include electron/ipc/depot-positions.ipc.spec.ts --include src/app/services/depot-positions.service.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add electron/ipc/depot-positions.ipc.ts electron/ipc/depot-positions.ipc.spec.ts electron/main.ts electron/preload/preload.ts src/app/electron-api.d.ts src/app/services/depot-positions.service.ts src/app/services/depot-positions.service.spec.ts
git commit -m "feat: expose depot positions to renderer"
```

### Task 6: Buchungsservice und Kauf-Formular vorbereiten

**Files:**
- Modify: `src/app/services/booking.service.spec.ts`
- Modify: `src/app/components/bookings/booking-form/booking-form.component.ts`
- Modify: `src/app/components/bookings/booking-form/booking-form.component.html`
- Modify: `src/app/components/bookings/booking-form/booking-form.component.spec.ts`

**Interfaces:**
- Consumes: `Booking`, `PurchaseBookingDetails`, `AccountService.getAll(): Promise<Account[]>`
- Produces: `BookingFormComponent.isPurchase(): boolean`, `BookingFormComponent.getPurchaseValue(): number`, `BookingFormComponent.getPurchaseTotal(): number`, `BookingFormComponent.onSubmit(): Promise<void>`

- [ ] **Step 1: Write the failing test**

```ts
it('switches into purchase mode when vorgang is Kauf', () => {
  component.booking.vorgang = 'Kauf';
  expect(component.isPurchase()).toBe(true);
});

it('calculates purchase totals from quantity, price, fees and accrued interest', () => {
  component.booking.vorgang = 'Kauf';
  component.booking.purchaseDetails = {
    security_id: 1,
    depot_account_id: 2,
    settlement_account_id: 3,
    quantity: 10,
    price_per_unit: 99,
    fees: 4,
    accrued_interest: 6
  };

  expect(component.getPurchaseValue()).toBe(990);
  expect(component.getPurchaseTotal()).toBe(1000);
});

it('submits purchase bookings without manual positions', async () => {
  component.booking = {
    vorgang: 'Kauf',
    date: '2026-08-01',
    description: 'ETF Kauf',
    positions: [],
    purchaseDetails: {
      security_id: 1,
      depot_account_id: 2,
      settlement_account_id: 3,
      quantity: 5,
      price_per_unit: 100,
      fees: 2,
      accrued_interest: 0
    }
  };

  await component.onSubmit();
  expect(mockBookingService.create).toHaveBeenCalledWith(component.booking);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watch=false --include src/app/components/bookings/booking-form/booking-form.component.spec.ts --include src/app/services/booking.service.spec.ts`
Expected: FAIL, weil Kaufmodus, Berechnungen und Formularlogik noch fehlen.

- [ ] **Step 3: Write minimal implementation**

```ts
purchaseDetails: {
  security_id: 0,
  depot_account_id: 0,
  settlement_account_id: 0,
  quantity: 0,
  price_per_unit: 0,
  fees: 0,
  accrued_interest: 0
}
```

```ts
isPurchase(): boolean {
  return this.booking.vorgang === 'Kauf';
}

getPurchaseValue(): number {
  const details = this.booking.purchaseDetails;
  if (!details) {
    return 0;
  }

  return details.quantity * details.price_per_unit;
}

getPurchaseTotal(): number {
  const details = this.booking.purchaseDetails;
  if (!details) {
    return 0;
  }

  return this.getPurchaseValue() + (details.fees ?? 0) + (details.accrued_interest ?? 0);
}
```

```ts
if (this.isPurchase()) {
  const details = this.booking.purchaseDetails;
  if (!details || !details.security_id || !details.depot_account_id || !details.settlement_account_id) {
    alert('Alle Pflichtfelder des Kaufs müssen ausgefüllt sein.');
    return;
  }

  if (details.depot_account_id === details.settlement_account_id) {
    alert('Depot-Konto und Verrechnungskonto müssen unterschiedlich sein.');
    return;
  }

  if (details.quantity <= 0 || details.price_per_unit <= 0 || (details.fees ?? 0) < 0 || (details.accrued_interest ?? 0) < 0) {
    alert('Stückzahl und Kurs müssen größer 0 sein. Gebühren und Stückzinsen dürfen nicht negativ sein.');
    return;
  }
} else {
  if (this.booking.positions.length === 0) {
    alert('Mindestens eine Position ist erforderlich.');
    return;
  }

  for (const pos of this.booking.positions) {
    if (!pos.account_id || !pos.valuta || pos.amount === null) {
      alert('Alle Positionen müssen ausgefüllt sein.');
      return;
    }
  }
}
```

```html
@if (isPurchase()) {
  <div class="grid grid-cols-2 gap-4 mb-6">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Wertpapier *</label>
      <select [(ngModel)]="booking.purchaseDetails!.security_id" name="security_id" required class="w-full border border-gray-300 rounded px-3 py-2">
        <option [value]="0">Bitte wählen...</option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Depot-Konto *</label>
      <select [(ngModel)]="booking.purchaseDetails!.depot_account_id" name="depot_account_id" required class="w-full border border-gray-300 rounded px-3 py-2"></select>
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Verrechnungskonto *</label>
      <select [(ngModel)]="booking.purchaseDetails!.settlement_account_id" name="settlement_account_id" required class="w-full border border-gray-300 rounded px-3 py-2"></select>
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Stückzahl *</label>
      <input type="number" [(ngModel)]="booking.purchaseDetails!.quantity" name="quantity" required class="w-full border border-gray-300 rounded px-3 py-2">
    </div>
  </div>

  <div class="grid grid-cols-2 gap-4 mb-6">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Kurs pro Stück *</label>
      <input type="number" [(ngModel)]="booking.purchaseDetails!.price_per_unit" name="price_per_unit" required class="w-full border border-gray-300 rounded px-3 py-2">
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Gebühren</label>
      <input type="number" [(ngModel)]="booking.purchaseDetails!.fees" name="fees" class="w-full border border-gray-300 rounded px-3 py-2">
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Stückzinsen</label>
      <input type="number" [(ngModel)]="booking.purchaseDetails!.accrued_interest" name="accrued_interest" class="w-full border border-gray-300 rounded px-3 py-2">
    </div>
    <div class="rounded bg-gray-50 p-3 text-sm text-gray-700">
      <div>Kurswert: {{ getPurchaseValue() | number:'1.2-2' }}</div>
      <div>Gesamtbetrag: {{ getPurchaseTotal() | number:'1.2-2' }}</div>
    </div>
  </div>
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watch=false --include src/app/components/bookings/booking-form/booking-form.component.spec.ts --include src/app/services/booking.service.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/components/bookings/booking-form/booking-form.component.ts src/app/components/bookings/booking-form/booking-form.component.html src/app/components/bookings/booking-form/booking-form.component.spec.ts src/app/services/booking.service.spec.ts
git commit -m "feat: add purchase mode to booking form"
```

### Task 7: Wertpapier- und Kontodaten im Kauf-Formular laden

**Files:**
- Modify: `src/app/components/bookings/booking-form/booking-form.component.ts`
- Modify: `src/app/components/bookings/booking-form/booking-form.component.spec.ts`

**Interfaces:**
- Consumes: `AccountService.getAll(): Promise<Account[]>`, `SecuritiesService.getAll(): Promise<Security[]>`
- Produces: `BookingFormComponent.depotAccounts: Account[]`, `BookingFormComponent.settlementAccounts: Account[]`, `BookingFormComponent.securities: Security[]`

- [ ] **Step 1: Write the failing test**

```ts
it('filters depot and settlement accounts for purchase mode', async () => {
  mockAccountService.getAll.mockResolvedValue([
    { id: 1, name: 'Depot A', type: 'Bestand', subtype: 'Depot' },
    { id: 2, name: 'Giro', type: 'Bestand', subtype: 'Giro' }
  ]);

  await component.loadAccounts();

  expect(component.depotAccounts.map((account) => account.id)).toEqual([1]);
  expect(component.settlementAccounts.map((account) => account.id)).toEqual([2]);
});

it('loads securities for the purchase dropdown', async () => {
  mockSecuritiesService.getAll.mockResolvedValue([
    { id: 7, name: 'ETF World', type: 'ETF', isin: 'IE00TEST0001', wkn: 'ETF001' }
  ]);

  await component.loadSecurities();

  expect(component.securities.map((security) => security.id)).toEqual([7]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watch=false --include src/app/components/bookings/booking-form/booking-form.component.spec.ts`
Expected: FAIL, weil gefilterte Listen und Security-Ladevorgang noch fehlen.

- [ ] **Step 3: Write minimal implementation**

```ts
accounts: Account[] = [];
depotAccounts: Account[] = [];
settlementAccounts: Account[] = [];
securities: Security[] = [];
```

```ts
this.accounts = await this.accountService.getAll();
this.depotAccounts = this.accounts.filter((account) => account.subtype === 'Depot');
this.settlementAccounts = this.accounts.filter((account) => account.type === 'Bestand' && account.subtype !== 'Depot');
```

```ts
this.securities = await this.securitiesService.getAll();
```

```ts
constructor(
  private bookingService: BookingService,
  private accountService: AccountService,
  private securitiesService: SecuritiesService,
  private router: Router,
  private route: ActivatedRoute,
  private cdr: ChangeDetectorRef
) {}
```

```html
@for (security of securities; track security.id) {
  <option [value]="security.id">{{ security.name }}</option>
}
```

```html
@for (account of depotAccounts; track account.id) {
  <option [value]="account.id">{{ account.name }}</option>
}
```

```html
@for (account of settlementAccounts; track account.id) {
  <option [value]="account.id">{{ account.name }}</option>
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watch=false --include src/app/components/bookings/booking-form/booking-form.component.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/components/bookings/booking-form/booking-form.component.ts src/app/components/bookings/booking-form/booking-form.component.html src/app/components/bookings/booking-form/booking-form.component.spec.ts
git commit -m "feat: load purchase reference data"
```

### Task 8: Einstiegspunkte für Neuer Kauf

**Files:**
- Modify: `src/app/app.routes.ts`
- Modify: `src/app/components/bookings/booking-list/booking-list.component.ts`
- Modify: `src/app/components/bookings/booking-list/booking-list.component.html`
- Modify: `src/app/components/bookings/booking-list/booking-list.component.spec.ts`

**Interfaces:**
- Consumes: `Router.navigate(commands: any[]): Promise<boolean>`
- Produces: Route `bookings/new/purchase`, `BookingListComponent.createPurchase(): void`

- [ ] **Step 1: Write the failing test**

```ts
it('navigates to the dedicated purchase entry point', () => {
  const router = TestBed.inject(Router);
  const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

  component.createPurchase();

  expect(navigate).toHaveBeenCalledWith(['/bookings/new/purchase']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watch=false --include src/app/components/bookings/booking-list/booking-list.component.spec.ts`
Expected: FAIL, weil Methode und Route noch fehlen.

- [ ] **Step 3: Write minimal implementation**

```ts
{ path: 'bookings/new/purchase', component: BookingFormComponent }
```

```ts
constructor(
  private bookingService: BookingService,
  private cdr: ChangeDetectorRef,
  private router: Router
) {}

createPurchase() {
  this.router.navigate(['/bookings/new/purchase']);
}
```

```html
<div class="space-x-3">
  <a routerLink="/bookings/new" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
    Neue Buchung
  </a>
  <button (click)="createPurchase()" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
    Neuer Kauf
  </button>
</div>
```

```ts
if (this.route.snapshot.routeConfig?.path === 'bookings/new/purchase') {
  this.booking.vorgang = 'Kauf';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watch=false --include src/app/components/bookings/booking-list/booking-list.component.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/app.routes.ts src/app/components/bookings/booking-list/booking-list.component.ts src/app/components/bookings/booking-list/booking-list.component.html src/app/components/bookings/booking-list/booking-list.component.spec.ts src/app/components/bookings/booking-form/booking-form.component.ts
git commit -m "feat: add direct navigation for purchase bookings"
```

### Task 9: Depot-Kontoansicht mit Aggregation und Historie

**Files:**
- Create: `src/app/components/accounts/depot-detail/depot-detail.component.ts`
- Create: `src/app/components/accounts/depot-detail/depot-detail.component.html`
- Create: `src/app/components/accounts/depot-detail/depot-detail.component.spec.ts`
- Modify: `src/app/app.routes.ts`
- Modify: `src/app/components/accounts/account-list/account-list.component.html`
- Modify: `src/app/components/accounts/account-list/account-list.component.spec.ts`

**Interfaces:**
- Consumes: `AccountService.getById(id: number): Promise<Account | null>`, `DepotPositionsService.getByDepot(depotAccountId: number): Promise<DepotPosition[]>`, `BookingService.getAll(): Promise<Booking[]>`, `SecuritiesService.getAll(): Promise<Security[]>`
- Produces: `DepotDetailComponent.summaryRows: Array<DepotPositionSummary & { purchases: DepotPosition[]; expanded: boolean }>`, `DepotDetailComponent.purchaseHistory: DepotPurchaseHistoryItem[]`, `DepotDetailComponent.toggleSecurityDetails(securityId: number): void`

- [ ] **Step 1: Write the failing test**

```ts
it('aggregates depot positions by security', async () => {
  mockDepotPositionsService.getByDepot.mockResolvedValue([
    { booking_id: 1, depot_account_id: 2, security_id: 7, quantity: 1, price_per_unit: 100, purchase_date: '2026-08-01' },
    { booking_id: 2, depot_account_id: 2, security_id: 7, quantity: 2, price_per_unit: 110, purchase_date: '2026-08-03' }
  ]);
  mockSecuritiesService.getAll.mockResolvedValue([
    { id: 7, name: 'ETF World', type: 'ETF', isin: 'IE00TEST0001', wkn: 'TEST01' }
  ]);

  await component.loadDepot();

  expect(component.summaryRows).toHaveLength(1);
  expect(component.summaryRows[0].total_quantity).toBe(3);
  expect(component.summaryRows[0].average_price_per_unit).toBe(106.66666666666667);
});

it('builds purchase history from purchase bookings of the depot', async () => {
  mockBookingService.getAll.mockResolvedValue([
    {
      id: 1,
      vorgang: 'Kauf',
      date: '2026-08-03',
      positions: [],
      purchaseDetails: {
        security_id: 7,
        depot_account_id: 2,
        settlement_account_id: 1,
        quantity: 2,
        price_per_unit: 110,
        fees: 3,
        accrued_interest: 0
      }
    }
  ]);

  await component.loadDepot();

  expect(component.purchaseHistory[0].total_amount).toBe(223);
});

it('toggles the inline purchase details for an aggregated row', async () => {
  mockDepotPositionsService.getByDepot.mockResolvedValue([
    { booking_id: 1, depot_account_id: 2, security_id: 7, quantity: 1, price_per_unit: 100, purchase_date: '2026-08-01' }
  ]);
  mockSecuritiesService.getAll.mockResolvedValue([
    { id: 7, name: 'ETF World', type: 'ETF', isin: 'IE00TEST0001', wkn: 'TEST01' }
  ]);

  await component.loadDepot();
  component.toggleSecurityDetails(7);

  expect(component.summaryRows[0].expanded).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watch=false --include src/app/components/accounts/depot-detail/depot-detail.component.spec.ts --include src/app/components/accounts/account-list/account-list.component.spec.ts`
Expected: FAIL, weil Komponente, Route und Depotlinks noch fehlen.

- [ ] **Step 3: Write minimal implementation**

```ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../../services/account.service';
import { BookingService } from '../../../services/booking.service';
import { DepotPositionsService } from '../../../services/depot-positions.service';
import { SecuritiesService } from '../../../services/securities.service';

@Component({
  selector: 'app-depot-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './depot-detail.component.html'
})
export class DepotDetailComponent implements OnInit {
  account: any = null;
  summaryRows: any[] = [];
  purchaseHistory: any[] = [];
  expandedSecurityIds = new Set<number>();

  async ngOnInit() {
    await this.loadDepot();
  }

  toggleSecurityDetails(securityId: number) {
    if (this.expandedSecurityIds.has(securityId)) {
      this.expandedSecurityIds.delete(securityId);
      return;
    }

    this.expandedSecurityIds.add(securityId);
  }
}
```

```ts
const grouped = new Map<number, DepotPosition[]>();
for (const position of positions) {
  const current = grouped.get(position.security_id) ?? [];
  current.push(position);
  grouped.set(position.security_id, current);
}

this.summaryRows = Array.from(grouped.entries()).map(([securityId, purchases]) => {
  const security = securityMap.get(securityId)!;
  const totalQuantity = purchases.reduce((sum, item) => sum + item.quantity, 0);
  const totalPurchaseValue = purchases.reduce((sum, item) => sum + item.quantity * item.price_per_unit, 0);

  return {
    security_id: securityId,
    security_name: security.name,
    security_type: security.type,
    isin: security.isin,
    total_quantity: totalQuantity,
    average_price_per_unit: totalPurchaseValue / totalQuantity,
    total_purchase_value: totalPurchaseValue,
    first_purchase_date: purchases.map((item) => item.purchase_date).sort()[0],
    purchases,
    expanded: this.expandedSecurityIds.has(securityId)
  };
});
```

```ts
this.purchaseHistory = bookings
  .filter((booking) => booking.vorgang === 'Kauf' && booking.purchaseDetails?.depot_account_id === accountId)
  .map((booking) => ({
    booking_id: booking.id!,
    booking_date: booking.date,
    security_name: securityMap.get(booking.purchaseDetails!.security_id)?.name ?? '-',
    quantity: booking.purchaseDetails!.quantity,
    price_per_unit: booking.purchaseDetails!.price_per_unit,
    total_amount:
      booking.purchaseDetails!.quantity * booking.purchaseDetails!.price_per_unit +
      (booking.purchaseDetails!.fees ?? 0) +
      (booking.purchaseDetails!.accrued_interest ?? 0)
  }))
  .sort((left, right) => right.booking_date.localeCompare(left.booking_date));
```

```html
<div class="p-6 max-w-6xl mx-auto" *ngIf="account">
  <h1 class="text-2xl font-bold mb-2">{{ account.name }}</h1>
  <div class="text-sm text-gray-600 mb-6">
    <div>Subtyp: {{ account.subtype }}</div>
    <div>IBAN: {{ account.iban || '-' }}</div>
    <div>Notizen: {{ account.notes || '-' }}</div>
  </div>

  <h2 class="text-xl font-semibold mb-3">Bestand</h2>
  <table class="min-w-full bg-white shadow rounded-lg overflow-hidden mb-8">
    <thead class="bg-gray-50">
      <tr>
        <th class="px-4 py-2 text-left">Wertpapier</th>
        <th class="px-4 py-2 text-left">Typ</th>
        <th class="px-4 py-2 text-right">Stückzahl</th>
        <th class="px-4 py-2 text-right">Ø Kaufkurs</th>
        <th class="px-4 py-2 text-right">Kaufwert</th>
        <th class="px-4 py-2 text-left">Erstkauf</th>
      </tr>
    </thead>
    <tbody>
      @for (row of summaryRows; track row.security_id) {
        <tr>
          <td class="px-4 py-2">
            <button type="button" (click)="toggleSecurityDetails(row.security_id)" class="text-left text-blue-600 hover:text-blue-900">
              {{ row.security_name }} ({{ row.isin }})
            </button>
          </td>
          <td class="px-4 py-2">{{ row.security_type }}</td>
          <td class="px-4 py-2 text-right">{{ row.total_quantity | number:'1.2-2' }}</td>
          <td class="px-4 py-2 text-right">{{ row.average_price_per_unit | number:'1.2-2' }}</td>
          <td class="px-4 py-2 text-right">{{ row.total_purchase_value | number:'1.2-2' }}</td>
          <td class="px-4 py-2">{{ row.first_purchase_date }}</td>
        </tr>
        @if (row.expanded) {
          @for (purchase of row.purchases; track purchase.booking_id) {
            <tr class="bg-gray-50 text-sm text-gray-700">
              <td class="px-4 py-2 pl-8">Kauf {{ purchase.purchase_date }}</td>
              <td class="px-4 py-2">Einzelkauf</td>
              <td class="px-4 py-2 text-right">{{ purchase.quantity | number:'1.2-2' }}</td>
              <td class="px-4 py-2 text-right">{{ purchase.price_per_unit | number:'1.2-2' }}</td>
              <td class="px-4 py-2 text-right">{{ purchase.quantity * purchase.price_per_unit | number:'1.2-2' }}</td>
              <td class="px-4 py-2">{{ purchase.purchase_date }}</td>
            </tr>
          }
        }
      }
    </tbody>
  </table>

  <h2 class="text-xl font-semibold mb-3">Kaufhistorie</h2>
  <table class="min-w-full bg-white shadow rounded-lg overflow-hidden">
    <thead class="bg-gray-50">
      <tr>
        <th class="px-4 py-2 text-left">Datum</th>
        <th class="px-4 py-2 text-left">Wertpapier</th>
        <th class="px-4 py-2 text-right">Stückzahl</th>
        <th class="px-4 py-2 text-right">Kurs</th>
        <th class="px-4 py-2 text-right">Gesamtbetrag</th>
        <th class="px-4 py-2 text-right">Buchung</th>
      </tr>
    </thead>
    <tbody>
      @for (item of purchaseHistory; track item.booking_id) {
        <tr>
          <td class="px-4 py-2">{{ item.booking_date }}</td>
          <td class="px-4 py-2">{{ item.security_name }}</td>
          <td class="px-4 py-2 text-right">{{ item.quantity | number:'1.2-2' }}</td>
          <td class="px-4 py-2 text-right">{{ item.price_per_unit | number:'1.2-2' }}</td>
          <td class="px-4 py-2 text-right">{{ item.total_amount | number:'1.2-2' }}</td>
          <td class="px-4 py-2 text-right">
            <a [routerLink]="['/bookings', item.booking_id, 'edit']" class="text-blue-600 hover:text-blue-900">Öffnen</a>
          </td>
        </tr>
      }
    </tbody>
  </table>
</div>
```

```ts
{ path: 'accounts/:id/depot', component: DepotDetailComponent }
```

```html
@if (account.subtype === 'Depot') {
  <a [routerLink]="['/accounts', account.id, 'depot']" class="text-green-600 hover:text-green-900 mr-3">
    Bestand
  </a>
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watch=false --include src/app/components/accounts/depot-detail/depot-detail.component.spec.ts --include src/app/components/accounts/account-list/account-list.component.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/components/accounts/depot-detail/depot-detail.component.ts src/app/components/accounts/depot-detail/depot-detail.component.html src/app/components/accounts/depot-detail/depot-detail.component.spec.ts src/app/app.routes.ts src/app/components/accounts/account-list/account-list.component.html src/app/components/accounts/account-list/account-list.component.spec.ts
git commit -m "feat: add depot detail view"
```

### Task 10: Vollständige Verifikation und Dokumentationsabgleich

**Files:**
- Modify: `docs/superpowers/specs/2026-08-01-wertpapierkauf-design.md` only if implementation decisions forced a spec correction

**Interfaces:**
- Consumes: alle vorherigen Tasks
- Produces: verifizierter Build- und Teststatus

- [ ] **Step 1: Run targeted backend and frontend tests**

Run: `npm test -- --watch=false --include electron/database/connection.spec.ts --include electron/database/depot-positions.spec.ts --include electron/database/bookings.spec.ts --include electron/ipc/depot-positions.ipc.spec.ts --include src/app/models/booking.model.spec.ts --include src/app/models/depot-position.model.spec.ts --include src/app/services/depot-positions.service.spec.ts --include src/app/components/bookings/booking-form/booking-form.component.spec.ts --include src/app/components/bookings/booking-list/booking-list.component.spec.ts --include src/app/components/accounts/depot-detail/depot-detail.component.spec.ts --include src/app/components/accounts/account-list/account-list.component.spec.ts`
Expected: PASS

- [ ] **Step 2: Run full Angular test suite**

Run: `npm test -- --watch=false`
Expected: PASS

- [ ] **Step 3: Run build checks**

Run: `npm run build && npm run build:electron`
Expected: PASS with generated browser build and Electron TypeScript output.

- [ ] **Step 4: Confirm spec alignment**

```md
- Käufe erscheinen in der Buchungsliste mit `vorgang = "Kauf"`.
- Geldabgang = Kurswert + Gebühren + Stückzinsen vom Verrechnungskonto.
- Depotansicht zeigt aggregierten Bestand und Kaufhistorie je Depot-Konto.
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "test: verify securities purchase workflow"
```
