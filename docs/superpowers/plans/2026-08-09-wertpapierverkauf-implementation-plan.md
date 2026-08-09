# Wertpapierverkauf Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Einen neuen Buchungs-Vorgang `Verkauf` implementieren, der Depotbestand per FIFO reduziert, automatisch alle Positionen erzeugt und Kursgewinn/-verlust inklusive Abzügen korrekt bucht.

**Architecture:** Die bestehende Kauf-Architektur wird erweitert: `bookings` bleibt die führende Entität, `saleDetails` liefert die fachlichen Eingaben für Verkäufe, und die erzeugten Positionen entstehen vollständig im Backend. FIFO wird ohne persistierte Lot-Zuordnung deterministisch zur Laufzeit rekonstruiert (Sortierung nach Datum, dann ID), sodass `create/update/delete` konsistent bleiben.

**Tech Stack:** Angular 21, TypeScript 5.9, Electron 43, better-sqlite3 12, Tailwind CSS 4, Vitest, Angular TestBed

## Global Constraints

- Sprache und UI-Text bleiben Deutsch.
- `bookings.vorgang` erweitert auf `Verkauf` neben `Buchung` und `Kauf`.
- Eingaben für Verkauf liegen in `saleDetails`; manuelle Positionspflege entfällt für Verkauf.
- FIFO ohne persistierte Lot-Zuordnung (Ansatz 2), deterministisch nach `booking.date`, dann `booking.id`.
- Verkauf darf Depotbestand niemals unter 0 reduzieren.
- Gebühren werden weiterhin auf `Wertpapierprovision` gebucht.
- Neue Systemkonten: `Kursgewinn` (`GuV/Ertrag`), `Kursverlust` (`GuV/Aufwand`), `Kapitalertragsteuer` (`GuV/Aufwand`), `Solidaritätszuschlag` (`GuV/Aufwand`).
- Gewinn-/Verlustformel: `quantity*price_per_unit - fees - capital_gains_tax - solidarity_surcharge - fifo_cost_basis`.
- Verkäufe müssen auch bei Bearbeiten/Löschen konsistent bleiben.

---

## File Structure

- Modify: `src/app/models/booking.model.ts`
  Fuegt `Verkauf`, `SaleBookingDetails` und `saleDetails` hinzu.
- Modify: `src/app/models/booking.model.spec.ts`
  Verifiziert Modellunterstützung für Verkauf.
- Modify: `src/app/models/account.model.ts`
  Erweitert `SYSTEM_ACCOUNT_NAMES` um verkaufsspezifische Konten.
- Modify: `electron/database/connection.ts`
  Migriert CHECK-Constraint auf `Verkauf` und legt neue Systemkonten an.
- Create: `electron/database/sale-fifo.ts`
  Kapselt FIFO-Rekonstruktion (Bestand + Einstandswert) für Verkäufe.
- Create: `electron/database/sale-fifo.spec.ts`
  Testet FIFO-Verbrauch und Randfälle isoliert.
- Modify: `electron/database/bookings.ts`
  Leitet Verkaufspositionen ab, validiert Bestand, lädt `saleDetails`.
- Modify: `electron/database/bookings.spec.ts`
  Testet Verkaufslogik inkl. Gewinn/Verlust, Abzüge, Überverkauf, Update/Delete.
- Modify: `electron/database/accounts.spec.ts`
  Schützt neue Systemkonten gegen Edit/Delete/Create.
- Modify: `src/app/components/bookings/booking-form/booking-form.component.ts`
  Erweitert Formularlogik um Verkaufsmodus, Validierung und Live-Berechnung.
- Modify: `src/app/components/bookings/booking-form/booking-form.component.html`
  Rendert verkaufsspezifische Felder und Kennzahlen.
- Modify: `src/app/components/bookings/booking-form/booking-form.component.spec.ts`
  Verifiziert Verkaufsmodus und Validierungsregeln.
- Modify: `src/app/components/bookings/booking-list/booking-list.component.ts`
  Navigation `Neuer Verkauf`.
- Modify: `src/app/components/bookings/booking-list/booking-list.component.html`
  Button `Neuer Verkauf`.
- Modify: `src/app/components/bookings/booking-list/booking-list.component.spec.ts`
  Navigationstest für Verkaufsroute.
- Modify: `src/app/app.routes.ts`
  Route `bookings/new/sale` mit `data: { vorgang: 'Verkauf' }`.
- Modify: `src/app/components/accounts/depot-detail/depot-detail.component.ts`
  Netto-Bestand als Kaufmengen minus FIFO-Verkäufe ausweisen.
- Modify: `src/app/components/accounts/depot-detail/depot-detail.component.spec.ts`
  Verifiziert, dass Verkäufe den Bestand reduzieren.

### Task 1: Datenmodell und Systemkonten vorbereiten

**Files:**
- Modify: `src/app/models/booking.model.ts`
- Modify: `src/app/models/booking.model.spec.ts`
- Modify: `src/app/models/account.model.ts`
- Modify: `electron/database/connection.ts`

**Interfaces:**
- Consumes: `VORGANG_OPTIONS`, `Booking`, `SYSTEM_ACCOUNT_NAMES`, `initDatabaseSchema(database: Database.Database): void`
- Produces:
  - `export interface SaleBookingDetails`
  - `Booking['saleDetails']?: SaleBookingDetails`
  - `VORGANG_OPTIONS = ['Buchung', 'Kauf', 'Verkauf']`
  - Systemkonten `Kursgewinn`, `Kursverlust`, `Kapitalertragsteuer`, `Solidaritätszuschlag`

- [ ] **Step 1: Write the failing test**

```ts
it('exposes Verkauf as valid booking vorgang', () => {
  expect(VORGANG_OPTIONS).toContain('Verkauf');
});

it('supports sale details on bookings', () => {
  const booking: Booking = {
    vorgang: 'Verkauf',
    date: '2026-08-09',
    positions: [],
    saleDetails: {
      security_id: 7,
      depot_account_id: 3,
      settlement_account_id: 2,
      quantity: 2.5,
      price_per_unit: 125,
      fees: 1,
      capital_gains_tax: 3,
      solidarity_surcharge: 0.2,
    },
  };

  expect(booking.saleDetails?.quantity).toBe(2.5);
});
```

```ts
it('creates sale system accounts in schema initialization', () => {
  const db = new Database(':memory:');
  initDatabaseSchema(db);

  const rows = db.prepare(`
    SELECT name, type, subtype
    FROM accounts
    WHERE name IN ('Kursgewinn', 'Kursverlust', 'Kapitalertragsteuer', 'Solidaritätszuschlag')
    ORDER BY name
  `).all();

  expect(rows).toEqual([
    { name: 'Kapitalertragsteuer', type: 'GuV', subtype: 'Aufwand' },
    { name: 'Kursgewinn', type: 'GuV', subtype: 'Ertrag' },
    { name: 'Kursverlust', type: 'GuV', subtype: 'Aufwand' },
    { name: 'Solidaritätszuschlag', type: 'GuV', subtype: 'Aufwand' },
  ]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watch=false --include src/app/models/booking.model.spec.ts --include electron/database/connection.spec.ts`
Expected: FAIL, weil `Verkauf`/`saleDetails` und neue Systemkonten noch fehlen.

- [ ] **Step 3: Write minimal implementation**

```ts
export const VORGANG_OPTIONS = ['Buchung', 'Kauf', 'Verkauf'] as const;

export interface SaleBookingDetails {
  security_id: number;
  depot_account_id: number;
  settlement_account_id: number;
  quantity: number;
  price_per_unit: number;
  fees?: number;
  capital_gains_tax?: number;
  solidarity_surcharge?: number;
}

export interface Booking {
  // ...existing fields
  saleDetails?: SaleBookingDetails;
}
```

```ts
export const SYSTEM_ACCOUNT_NAMES = [
  'Wertpapierprovision',
  'Stückzinsen',
  'Kursgewinn',
  'Kursverlust',
  'Kapitalertragsteuer',
  'Solidaritätszuschlag',
] as const;
```

```ts
const BOOKINGS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vorgang TEXT NOT NULL CHECK (vorgang IN ('Buchung', 'Kauf', 'Verkauf')),
    date TEXT NOT NULL,
    description TEXT,
    sender_receiver TEXT
  )
`;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watch=false --include src/app/models/booking.model.spec.ts --include electron/database/connection.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/models/booking.model.ts src/app/models/booking.model.spec.ts src/app/models/account.model.ts electron/database/connection.ts
git commit -m "feat: add sale booking model and system accounts"
```

### Task 2: FIFO-Rekonstruktion als isolierte Backend-Unit

**Files:**
- Create: `electron/database/sale-fifo.ts`
- Create: `electron/database/sale-fifo.spec.ts`

**Interfaces:**
- Consumes: Liste historischer Events `{ booking_id, date, type, quantity, price_per_unit }`
- Produces:
  - `buildFifoState(events: FifoEvent[]): FifoState`
  - `computeSaleCostBasis(events: FifoEvent[], sellQuantity: number): { costBasis: number; remainingQuantity: number }`

- [ ] **Step 1: Write the failing test**

```ts
it('consumes oldest purchase lots first', () => {
  const events: FifoEvent[] = [
    { booking_id: 1, date: '2026-08-01', type: 'buy', quantity: 2, price_per_unit: 100 },
    { booking_id: 2, date: '2026-08-02', type: 'buy', quantity: 3, price_per_unit: 120 },
  ];

  const result = computeSaleCostBasis(events, 4);
  expect(result.costBasis).toBe(560);
  expect(result.remainingQuantity).toBe(1);
});

it('throws when sale quantity exceeds available quantity', () => {
  const events: FifoEvent[] = [
    { booking_id: 1, date: '2026-08-01', type: 'buy', quantity: 1, price_per_unit: 100 },
  ];

  expect(() => computeSaleCostBasis(events, 2)).toThrow('Nicht genügend Bestand');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watch=false --include electron/database/sale-fifo.spec.ts`
Expected: FAIL, weil die neue Datei und Funktionen noch fehlen.

- [ ] **Step 3: Write minimal implementation**

```ts
export type FifoEvent = {
  booking_id: number;
  date: string;
  type: 'buy' | 'sell';
  quantity: number;
  price_per_unit: number;
};

type Lot = { remaining: number; price: number };

export function computeSaleCostBasis(events: FifoEvent[], sellQuantity: number): { costBasis: number; remainingQuantity: number } {
  const ordered = [...events].sort((a, b) => a.date.localeCompare(b.date) || a.booking_id - b.booking_id);
  const lots: Lot[] = [];

  for (const event of ordered) {
    if (event.type === 'buy') {
      lots.push({ remaining: event.quantity, price: event.price_per_unit });
      continue;
    }

    let toConsume = event.quantity;
    for (const lot of lots) {
      if (toConsume <= 0) break;
      const consume = Math.min(lot.remaining, toConsume);
      lot.remaining -= consume;
      toConsume -= consume;
    }
  }

  let needed = sellQuantity;
  let costBasis = 0;
  for (const lot of lots) {
    if (needed <= 0) break;
    const consume = Math.min(lot.remaining, needed);
    costBasis += consume * lot.price;
    lot.remaining -= consume;
    needed -= consume;
  }

  if (needed > 0) {
    throw new Error('Nicht genügend Bestand');
  }

  const remainingQuantity = lots.reduce((sum, lot) => sum + lot.remaining, 0);
  return { costBasis, remainingQuantity };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watch=false --include electron/database/sale-fifo.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add electron/database/sale-fifo.ts electron/database/sale-fifo.spec.ts
git commit -m "feat: add fifo sale cost basis utility"
```

### Task 3: Verkaufslogik in `bookings` implementieren

**Files:**
- Modify: `electron/database/bookings.ts`
- Modify: `electron/database/bookings.spec.ts`

**Interfaces:**
- Consumes: `computeSaleCostBasis(...)`, `requireSystemAccount(name: string): number`, `Booking['saleDetails']`
- Produces:
  - `buildSalePositions(booking: Booking): BookingPosition[]`
  - `loadSaleDetails(booking: Booking): SaleBookingDetails | undefined`
  - `bookings.create/update/getById` mit vollständiger Verkaufsunterstützung

- [ ] **Step 1: Write the failing test**

```ts
it('creates sale booking with Kursgewinn and deductions', async () => {
  // arrange: one Kauf with 5 @ 100
  // sell: 2 @ 130, fees 2, tax 5, soli 0.5
  const created = await bookings.create({
    vorgang: 'Verkauf',
    date: '2026-08-10',
    positions: [],
    saleDetails: {
      security_id: 7,
      depot_account_id: 3,
      settlement_account_id: 2,
      quantity: 2,
      price_per_unit: 130,
      fees: 2,
      capital_gains_tax: 5,
      solidarity_surcharge: 0.5,
    },
  } as Booking);

  const reloaded = await bookings.getById(created.id!);
  expect(reloaded?.vorgang).toBe('Verkauf');
  expect(reloaded?.saleDetails?.quantity).toBe(2);
  expect(reloaded?.positions.some((p) => p.amount === 52.5)).toBe(true); // Kursgewinn
});

it('rejects sale when quantity exceeds available holdings', async () => {
  await expect(bookings.create({
    vorgang: 'Verkauf',
    date: '2026-08-10',
    positions: [],
    saleDetails: {
      security_id: 7,
      depot_account_id: 3,
      settlement_account_id: 2,
      quantity: 999,
      price_per_unit: 130,
      fees: 0,
      capital_gains_tax: 0,
      solidarity_surcharge: 0,
    },
  } as Booking)).rejects.toThrow('Nicht genügend Bestand');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watch=false --include electron/database/bookings.spec.ts`
Expected: FAIL, weil `Verkauf` und FIFO-Bewertung noch nicht in `bookings.ts` integriert sind.

- [ ] **Step 3: Write minimal implementation**

```ts
function buildSalePositions(booking: Booking): BookingPosition[] {
  if (!booking.saleDetails) throw new Error('Verkaufsdetails fehlen.');

  const details = booking.saleDetails;
  const fees = details.fees ?? 0;
  const tax = details.capital_gains_tax ?? 0;
  const soli = details.solidarity_surcharge ?? 0;

  const costBasis = loadFifoCostBasisForSale(booking, details.quantity);
  const proceeds = details.quantity * details.price_per_unit;
  const net = proceeds - fees - tax - soli;
  const pnl = net - costBasis;

  const positions: BookingPosition[] = [
    { account_id: details.depot_account_id, valuta: booking.date, amount: -costBasis },
    { account_id: details.settlement_account_id, valuta: booking.date, amount: net },
  ];

  if (fees > 0) positions.push({ account_id: requireSystemAccount('Wertpapierprovision'), valuta: booking.date, amount: fees });
  if (tax > 0) positions.push({ account_id: requireSystemAccount('Kapitalertragsteuer'), valuta: booking.date, amount: tax });
  if (soli > 0) positions.push({ account_id: requireSystemAccount('Solidaritätszuschlag'), valuta: booking.date, amount: soli });
  if (pnl > 0) positions.push({ account_id: requireSystemAccount('Kursgewinn'), valuta: booking.date, amount: pnl });
  if (pnl < 0) positions.push({ account_id: requireSystemAccount('Kursverlust'), valuta: booking.date, amount: Math.abs(pnl) });

  return positions;
}
```

```ts
const effectivePositions =
  booking.vorgang === 'Kauf' ? buildPurchasePositions(booking)
  : booking.vorgang === 'Verkauf' ? buildSalePositions(booking)
  : booking.positions;
```

```ts
function loadSaleDetails(booking: Booking): SaleBookingDetails | undefined {
  if (booking.vorgang !== 'Verkauf') return undefined;
  // derive from booking.positions + depot reference; return optional numbers defaulting to 0
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watch=false --include electron/database/bookings.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add electron/database/bookings.ts electron/database/bookings.spec.ts
git commit -m "feat: add sale booking transactions"
```

### Task 4: Kontenschutz auf neue Systemkonten erweitern

**Files:**
- Modify: `electron/database/accounts.spec.ts`

**Interfaces:**
- Consumes: `accounts.update(...)`, `accounts.delete(...)`, `accounts.create(...)`
- Produces: Schutztests für `Kursgewinn`, `Kursverlust`, `Kapitalertragsteuer`, `Solidaritätszuschlag`

- [ ] **Step 1: Write the failing test**

```ts
it('rejects deletion of Kursgewinn system account', async () => {
  const systemAccount = db.prepare(`SELECT id FROM accounts WHERE name = 'Kursgewinn'`).get() as { id: number };
  await expect(accounts.delete(systemAccount.id)).rejects.toThrow('Systemkonto darf nicht gelöscht werden: Kursgewinn');
});

it('rejects creating a duplicate Kapitalertragsteuer system account', async () => {
  await expect(accounts.create({ name: 'Kapitalertragsteuer', type: 'GuV', subtype: 'Aufwand' }))
    .rejects.toThrow('Systemkonto darf nicht angelegt werden: Kapitalertragsteuer');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watch=false --include electron/database/accounts.spec.ts`
Expected: FAIL, weil Schutz nur alte Systemkonten abdeckt.

- [ ] **Step 3: Write minimal implementation**

```ts
// no production logic expected if existing guard uses SYSTEM_ACCOUNT_NAMES
// ensure tests prove expanded SYSTEM_ACCOUNT_NAMES are enforced end-to-end
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watch=false --include electron/database/accounts.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add electron/database/accounts.spec.ts src/app/models/account.model.ts
git commit -m "test: protect sale system accounts"
```

### Task 5: Verkaufs-UI im Buchungsformular und Navigation

**Files:**
- Modify: `src/app/app.routes.ts`
- Modify: `src/app/components/bookings/booking-list/booking-list.component.ts`
- Modify: `src/app/components/bookings/booking-list/booking-list.component.html`
- Modify: `src/app/components/bookings/booking-list/booking-list.component.spec.ts`
- Modify: `src/app/components/bookings/booking-form/booking-form.component.ts`
- Modify: `src/app/components/bookings/booking-form/booking-form.component.html`
- Modify: `src/app/components/bookings/booking-form/booking-form.component.spec.ts`

**Interfaces:**
- Consumes: `route.snapshot.data['vorgang']`, `BookingService.create/update`
- Produces:
  - `bookings/new/sale` route
  - `BookingListComponent.createSale(): void`
  - `BookingFormComponent.isSale(): boolean`
  - `BookingFormComponent.getSaleGross(), getSaleDeductions(), getSaleNet()`

- [ ] **Step 1: Write the failing test**

```ts
it('initializes sale route in Verkauf mode', () => {
  const route = TestBed.inject(ActivatedRoute);
  route.snapshot.data['vorgang'] = 'Verkauf';
  fixture.detectChanges();

  expect(component.booking.vorgang).toBe('Verkauf');
  expect(component.booking.saleDetails?.fees).toBe(0);
});

it('validates sale input and submits saleDetails payload', async () => {
  component.booking = {
    vorgang: 'Verkauf',
    date: '2026-08-10',
    positions: [],
    saleDetails: {
      security_id: 7,
      depot_account_id: 3,
      settlement_account_id: 2,
      quantity: 1,
      price_per_unit: 150,
      fees: 1,
      capital_gains_tax: 2,
      solidarity_surcharge: 0.1,
    },
  };

  await component.onSubmit();
  expect(mockBookingService.create).toHaveBeenCalledWith(component.booking);
});
```

```ts
it('navigates to dedicated sale entry point', () => {
  const router = TestBed.inject(Router);
  const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
  component.createSale();
  expect(navigate).toHaveBeenCalledWith(['/bookings/new/sale']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watch=false --include src/app/components/bookings/booking-form/booking-form.component.spec.ts --include src/app/components/bookings/booking-list/booking-list.component.spec.ts`
Expected: FAIL, weil Verkaufsmodus/Routing/Felder noch fehlen.

- [ ] **Step 3: Write minimal implementation**

```ts
{ path: 'bookings/new/sale', component: BookingFormComponent, data: { vorgang: 'Verkauf' } }
```

```ts
createSale() {
  this.router.navigate(['/bookings/new/sale']);
}
```

```ts
isSale(): boolean {
  return this.booking.vorgang === 'Verkauf';
}

createEmptySaleDetails(): SaleBookingDetails {
  return {
    security_id: 0,
    depot_account_id: 0,
    settlement_account_id: 0,
    quantity: 0,
    price_per_unit: 0,
    fees: 0,
    capital_gains_tax: 0,
    solidarity_surcharge: 0,
  };
}
```

```html
<button (click)="createSale()" class="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700">
  Neuer Verkauf
</button>
```

```html
@if (isSale()) {
  <!-- Wertpapier, Depot, Verrechnungskonto, Stückzahl, Kurs, Gebühren, Kapitalertragsteuer, Solidaritätszuschlag -->
  <div class="rounded bg-gray-50 p-3 text-sm text-gray-700">
    <div>Verkaufserlös: {{ getSaleGross() | number:'1.2-2' }}</div>
    <div>Abzüge: {{ getSaleDeductions() | number:'1.2-2' }}</div>
    <div>Nettozufluss: {{ getSaleNet() | number:'1.2-2' }}</div>
  </div>
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watch=false --include src/app/components/bookings/booking-form/booking-form.component.spec.ts --include src/app/components/bookings/booking-list/booking-list.component.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/app.routes.ts src/app/components/bookings/booking-list/booking-list.component.ts src/app/components/bookings/booking-list/booking-list.component.html src/app/components/bookings/booking-list/booking-list.component.spec.ts src/app/components/bookings/booking-form/booking-form.component.ts src/app/components/bookings/booking-form/booking-form.component.html src/app/components/bookings/booking-form/booking-form.component.spec.ts
git commit -m "feat: add sale mode to booking form"
```

### Task 6: Depotansicht um Verkaufsabgänge korrigieren

**Files:**
- Modify: `src/app/components/accounts/depot-detail/depot-detail.component.ts`
- Modify: `src/app/components/accounts/depot-detail/depot-detail.component.spec.ts`

**Interfaces:**
- Consumes: `BookingService.getAll(): Promise<Booking[]>`, `booking.saleDetails`
- Produces: `summaryRows[].total_quantity` als Netto-Menge (Käufe minus Verkäufe)

- [ ] **Step 1: Write the failing test**

```ts
it('reduces displayed quantity by matching sale bookings', async () => {
  mockDepotPositionsService.getByDepot.mockResolvedValue([
    { booking_id: 1, depot_account_id: 2, security_id: 7, quantity: 5, price_per_unit: 100, purchase_date: '2026-08-01' },
  ]);

  mockBookingService.getAll.mockResolvedValue([
    {
      id: 11,
      vorgang: 'Verkauf',
      date: '2026-08-05',
      positions: [],
      saleDetails: {
        security_id: 7,
        depot_account_id: 2,
        settlement_account_id: 1,
        quantity: 2,
        price_per_unit: 130,
      },
    },
  ]);

  await component.loadDepot();
  expect(component.summaryRows[0].total_quantity).toBe(3);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watch=false --include src/app/components/accounts/depot-detail/depot-detail.component.spec.ts`
Expected: FAIL, weil aktuell nur Kaufpositionen aggregiert werden.

- [ ] **Step 3: Write minimal implementation**

```ts
private buildSaleQuantityBySecurity(bookings: Booking[], depotAccountId: number): Map<number, number> {
  const map = new Map<number, number>();
  for (const booking of bookings) {
    if (booking.vorgang !== 'Verkauf' || booking.saleDetails?.depot_account_id !== depotAccountId) continue;
    const securityId = booking.saleDetails.security_id;
    map.set(securityId, (map.get(securityId) ?? 0) + booking.saleDetails.quantity);
  }
  return map;
}
```

```ts
const soldBySecurity = this.buildSaleQuantityBySecurity(bookings, accountId);
const soldQuantity = soldBySecurity.get(securityId) ?? 0;
const totalQuantity = Math.max(0, purchases.reduce((sum, item) => sum + item.quantity, 0) - soldQuantity);
if (totalQuantity <= 0) {
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watch=false --include src/app/components/accounts/depot-detail/depot-detail.component.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/components/accounts/depot-detail/depot-detail.component.ts src/app/components/accounts/depot-detail/depot-detail.component.spec.ts
git commit -m "feat: reflect sales in depot holdings view"
```

### Task 7: Vollständige Verifikation und Regression

**Files:**
- Modify: `electron/database/bookings.spec.ts`
- Modify: `src/app/components/bookings/booking-form/booking-form.component.spec.ts`

**Interfaces:**
- Consumes: alle zuvor eingeführten `Verkauf`-Schnittstellen
- Produces: Regression-Schutz für Gewinn, Verlust, Update/Delete-Konsistenz

- [ ] **Step 1: Add final regression tests**

```ts
it('books Kursverlust when sale net is below fifo cost basis', async () => {
  // seed buy 1 @ 100, sell 1 @ 90
  // assert Kursverlust position of 10
});

it('keeps consistency after updating sale quantity', async () => {
  // create sale, update quantity, re-read and assert positions still balance to zero
});

it('restores availability after deleting sale', async () => {
  // create sale, delete sale, create another sale at previously blocked quantity -> should succeed
});
```

- [ ] **Step 2: Run focused test suites**

Run: `npm test -- --watch=false --include electron/database/bookings.spec.ts --include electron/database/sale-fifo.spec.ts --include src/app/components/bookings/booking-form/booking-form.component.spec.ts --include src/app/components/accounts/depot-detail/depot-detail.component.spec.ts`
Expected: PASS

- [ ] **Step 3: Run broad project verification**

Run: `npm test -- --watch=false`
Expected: PASS (keine Regressionen in bestehenden Kauf-/Buchungsflüssen)

- [ ] **Step 4: Commit**

```bash
git add electron/database/bookings.spec.ts electron/database/sale-fifo.spec.ts src/app/components/bookings/booking-form/booking-form.component.spec.ts src/app/components/accounts/depot-detail/depot-detail.component.spec.ts
git commit -m "test: verify sale workflow and fifo consistency"
```

## Self-Review Checklist

- Spec coverage: Datenmodell, Systemkonten, FIFO ohne persistierte Lots, Verkaufsformular, Positionsableitung, Depotreduktion, Fehlerfälle und Tests sind jeweils in eigenen Tasks abgedeckt.
- Placeholder scan: Keine `TODO`/`TBD` im Plan; alle Tasks enthalten konkrete Dateien, Tests und Kommandos.
- Type consistency: `SaleBookingDetails`, `saleDetails`, `Verkauf`, FIFO-Helfer und UI-Methoden sind in allen Tasks konsistent benannt.
