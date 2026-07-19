# Buchung Erfassen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement booking management with dynamic positions in the Slowen Electron/Angular app.

**Architecture:** Follow existing patterns from account management. Create booking model, Angular service, IPC handlers, database operations, and UI components (list + form with dynamic positions).

**Tech Stack:** Electron, Angular 19, better-sqlite3, TypeScript, Tailwind CSS, Vitest

## Global Constraints

- Angular 19 with Standalone Components
- Tailwind CSS v4 with PostCSS
- better-sqlite3 for database
- IPC: specific handlers per resource, central API in preload
- German UI, dates in ISO 8601, currency EUR
- Tests: Vitest, unit tests for services and components

---

## File Structure

```
src/app/
├── models/
│   └── booking.model.ts              (NEU)
├── services/
│   └── booking.service.ts            (NEU)
│   └── booking.service.spec.ts       (NEU)
├── components/
│   └── bookings/
│       ├── booking-list/
│       │   ├── booking-list.component.ts      (NEU)
│       │   ├── booking-list.component.html    (NEU)
│       │   └── booking-list.component.spec.ts (NEU)
│       └── booking-form/
│           ├── booking-form.component.ts      (NEU)
│           ├── booking-form.component.html    (NEU)
│           └── booking-form.component.spec.ts (NEU)
├── app.routes.ts                     (MODIFY)
└── app.html                          (MODIFY)

electron/
├── database/
│   ├── connection.ts                 (MODIFY: add tables)
│   └── bookings.ts                   (NEU)
└── ipc/
    └── bookings.ipc.ts               (NEU)

electron/preload/preload.ts           (MODIFY: add bookings API)
src/app/electron-api.d.ts             (MODIFY: add bookings types)
```

---

### Task 1: Booking Model

**Files:**
- Create: `src/app/models/booking.model.ts`

**Interfaces:**
- Produces: `Booking`, `BookingPosition`, `VORGANG_OPTIONS`

- [ ] **Step 1: Create booking model**

```typescript
export interface Booking {
  id?: number;
  vorgang: string;
  date: string;
  description?: string;
  sender_receiver?: string;
  positions: BookingPosition[];
}

export interface BookingPosition {
  id?: number;
  booking_id?: number;
  account_id: number;
  valuta: string;
  amount: number;
}

export const VORGANG_OPTIONS = ['Buchung'] as const;
```

- [ ] **Step 2: Commit**

```bash
git add src/app/models/booking.model.ts
git commit -m "feat: Add booking model"
```

---

### Task 2: Database Tables

**Files:**
- Modify: `electron/database/connection.ts:17-29`

**Interfaces:**
- Consumes: None
- Produces: `bookings` and `booking_positions` tables

- [ ] **Step 1: Add bookings tables to initDatabase**

```typescript
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
}
```

- [ ] **Step 2: Commit**

```bash
git add electron/database/connection.ts
git commit -m "feat: Add bookings and booking_positions tables"
```

---

### Task 3: Database Bookings CRUD

**Files:**
- Create: `electron/database/bookings.ts`

**Interfaces:**
- Consumes: `getDatabase()` from `connection.ts`, `Booking`, `BookingPosition` from `booking.model.ts`
- Produces: `bookings.getAll()`, `bookings.getById()`, `bookings.create()`, `bookings.update()`, `bookings.delete()`

- [ ] **Step 1: Create bookings database module**

```typescript
import { getDatabase } from './connection';
import { Booking, BookingPosition } from '../../src/app/models/booking.model';

export const bookings = {
  getAll: async (): Promise<Booking[]> => {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM bookings').all() as Booking[];
    for (const row of rows) {
      row.positions = db.prepare(
        'SELECT * FROM booking_positions WHERE booking_id = ?'
      ).all(row.id!) as BookingPosition[];
    }
    return rows;
  },

  getById: async (id: number): Promise<Booking | null> => {
    const db = getDatabase();
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as Booking | null;
    if (booking) {
      booking.positions = db.prepare(
        'SELECT * FROM booking_positions WHERE booking_id = ?'
      ).all(id) as BookingPosition[];
    }
    return booking;
  },

  create: async (booking: Booking): Promise<Booking> => {
    const db = getDatabase();
    const insertBooking = db.prepare(
      'INSERT INTO bookings (vorgang, date, description, sender_receiver) VALUES (?, ?, ?, ?)'
    );
    const insertPosition = db.prepare(
      'INSERT INTO booking_positions (booking_id, account_id, valuta, amount) VALUES (?, ?, ?, ?)'
    );

    const transaction = db.transaction(() => {
      const result = insertBooking.run(
        booking.vorgang,
        booking.date,
        booking.description || null,
        booking.sender_receiver || null
      );
      const bookingId = result.lastInsertRowid as number;

      for (const pos of booking.positions) {
        insertPosition.run(bookingId, pos.account_id, pos.valuta, pos.amount);
      }

      return { id: bookingId, ...booking };
    });

    return transaction();
  },

  update: async (id: number, booking: Booking): Promise<Booking> => {
    const db = getDatabase();
    const updateBooking = db.prepare(
      'UPDATE bookings SET vorgang = ?, date = ?, description = ?, sender_receiver = ? WHERE id = ?'
    );
    const deletePositions = db.prepare('DELETE FROM booking_positions WHERE booking_id = ?');
    const insertPosition = db.prepare(
      'INSERT INTO booking_positions (booking_id, account_id, valuta, amount) VALUES (?, ?, ?, ?)'
    );

    const transaction = db.transaction(() => {
      updateBooking.run(
        booking.vorgang,
        booking.date,
        booking.description || null,
        booking.sender_receiver || null,
        id
      );
      deletePositions.run(id);
      for (const pos of booking.positions) {
        insertPosition.run(id, pos.account_id, pos.valuta, pos.amount);
      }
      return { id, ...booking };
    });

    return transaction();
  },

  delete: async (id: number): Promise<void> => {
    const db = getDatabase();
    db.prepare('DELETE FROM bookings WHERE id = ?').run(id);
  }
};
```

- [ ] **Step 2: Commit**

```bash
git add electron/database/bookings.ts
git commit -m "feat: Add bookings database CRUD with transactions"
```

---

### Task 4: IPC Handlers

**Files:**
- Create: `electron/ipc/bookings.ipc.ts`

**Interfaces:**
- Consumes: `bookings` from `../database/bookings`
- Produces: `registerBookingsIPC()` function

- [ ] **Step 1: Create bookings IPC handlers**

```typescript
import { ipcMain } from 'electron';
import { bookings } from '../database/bookings';

export function registerBookingsIPC() {
  ipcMain.handle('bookings:getAll', async () => {
    try {
      return await bookings.getAll();
    } catch (error) {
      console.error('IPC bookings:getAll failed:', error);
      throw error;
    }
  });

  ipcMain.handle('bookings:getById', async (_event, id) => {
    try {
      return await bookings.getById(id);
    } catch (error) {
      console.error('IPC bookings:getById failed:', error);
      throw error;
    }
  });

  ipcMain.handle('bookings:create', async (_event, booking) => {
    try {
      return await bookings.create(booking);
    } catch (error) {
      console.error('IPC bookings:create failed:', error);
      throw error;
    }
  });

  ipcMain.handle('bookings:update', async (_event, id, booking) => {
    try {
      return await bookings.update(id, booking);
    } catch (error) {
      console.error('IPC bookings:update failed:', error);
      throw error;
    }
  });

  ipcMain.handle('bookings:delete', async (_event, id) => {
    try {
      return await bookings.delete(id);
    } catch (error) {
      console.error('IPC bookings:delete failed:', error);
      throw error;
    }
  });
}
```

- [ ] **Step 2: Register IPC in main.ts**

Modify `electron/main.ts`:

```typescript
import { registerBookingsIPC } from './ipc/bookings.ipc';

app.whenReady().then(() => {
  registerAccountsIPC();
  registerBookingsIPC();
  createWindow();
});
```

- [ ] **Step 3: Commit**

```bash
git add electron/ipc/bookings.ipc.ts electron/main.ts
git commit -m "feat: Add bookings IPC handlers"
```

---

### Task 5: Preload API

**Files:**
- Modify: `electron/preload/preload.ts`
- Modify: `src/app/electron-api.d.ts`

**Interfaces:**
- Consumes: IPC channel names from Task 4
- Produces: `window.electronAPI.bookings` API

- [ ] **Step 1: Add bookings to preload**

```typescript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  accounts: {
    getAll: () => ipcRenderer.invoke('accounts:getAll'),
    getById: (id: number) => ipcRenderer.invoke('accounts:getById', id),
    create: (account: any) => ipcRenderer.invoke('accounts:create', account),
    update: (id: number, account: any) => ipcRenderer.invoke('accounts:update', id, account),
    delete: (id: number) => ipcRenderer.invoke('accounts:delete', id)
  },
  bookings: {
    getAll: () => ipcRenderer.invoke('bookings:getAll'),
    getById: (id: number) => ipcRenderer.invoke('bookings:getById', id),
    create: (booking: any) => ipcRenderer.invoke('bookings:create', booking),
    update: (id: number, booking: any) => ipcRenderer.invoke('bookings:update', id, booking),
    delete: (id: number) => ipcRenderer.invoke('bookings:delete', id)
  }
});
```

- [ ] **Step 2: Add bookings to type declarations**

```typescript
interface ElectronAPI {
  accounts: {
    getAll: () => Promise<any[]>;
    getById: (id: number) => Promise<any>;
    create: (account: any) => Promise<any>;
    update: (id: number, account: any) => Promise<any>;
    delete: (id: number) => Promise<void>;
  };
  bookings: {
    getAll: () => Promise<any[]>;
    getById: (id: number) => Promise<any>;
    create: (booking: any) => Promise<any>;
    update: (id: number, booking: any) => Promise<any>;
    delete: (id: number) => Promise<void>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
```

- [ ] **Step 3: Commit**

```bash
git add electron/preload/preload.ts src/app/electron-api.d.ts
git commit -m "feat: Add bookings to preload API and type declarations"
```

---

### Task 6: Angular Booking Service

**Files:**
- Create: `src/app/services/booking.service.ts`
- Create: `src/app/services/booking.service.spec.ts`

**Interfaces:**
- Consumes: `window.electronAPI.bookings` from Task 5
- Produces: `BookingService` with `getAll()`, `getById()`, `create()`, `update()`, `delete()`

- [ ] **Step 1: Create booking service**

```typescript
import { Injectable } from '@angular/core';
import { Booking } from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private get api() {
    return window.electronAPI.bookings;
  }

  getAll(): Promise<Booking[]> {
    return this.api.getAll();
  }

  getById(id: number): Promise<Booking | null> {
    return this.api.getById(id);
  }

  create(booking: Booking): Promise<Booking> {
    return this.api.create(booking);
  }

  update(id: number, booking: Booking): Promise<Booking> {
    return this.api.update(id, booking);
  }

  delete(id: number): Promise<void> {
    return this.api.delete(id);
  }
}
```

- [ ] **Step 2: Create booking service tests**

```typescript
import { TestBed } from '@angular/core/testing';
import { BookingService } from './booking.service';

describe('BookingService', () => {
  let service: BookingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run tests**

Run: `npx ng test --watch=false`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/app/services/booking.service.ts src/app/services/booking.service.spec.ts
git commit -m "feat: Add Angular booking service"
```

---

### Task 7: Booking List Component

**Files:**
- Create: `src/app/components/bookings/booking-list/booking-list.component.ts`
- Create: `src/app/components/bookings/booking-list/booking-list.component.html`
- Create: `src/app/components/bookings/booking-list/booking-list.component.spec.ts`

**Interfaces:**
- Consumes: `BookingService` from Task 6
- Produces: `BookingListComponent` displayed at `/bookings`

- [ ] **Step 1: Create booking list component**

```typescript
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookingService } from '../../../services/booking.service';
import { Booking } from '../../../models/booking.model';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './booking-list.component.html'
})
export class BookingListComponent implements OnInit {
  bookings: Booking[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadBookings();
  }

  async loadBookings() {
    this.loading = true;
    this.error = null;
    try {
      this.bookings = await this.bookingService.getAll();
    } catch (err) {
      console.error('Failed to load bookings:', err);
      this.error = 'Buchungen konnten nicht geladen werden.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async deleteBooking(id: number) {
    if (confirm('Buchung wirklich löschen?')) {
      try {
        await this.bookingService.delete(id);
        await this.loadBookings();
      } catch (err) {
        console.error('Failed to delete booking:', err);
        alert('Buchung konnte nicht gelöscht werden.');
      }
    }
  }
}
```

- [ ] **Step 2: Create booking list template**

```html
<div class="p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Buchungen</h1>
    <a routerLink="/bookings/new"
       class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
      Neue Buchung
    </a>
  </div>

  @if (loading) {
    <div class="text-center py-8">Laden...</div>
  } @else if (error) {
    <div class="text-center py-8 text-red-600">{{ error }}</div>
  } @else if (bookings.length === 0) {
    <div class="text-center py-8 text-gray-500">
      Noch keine Buchungen vorhanden.
    </div>
  } @else {
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vorgang</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beschreibung</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sender/Empfänger</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aktionen</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          @for (booking of bookings; track booking.id) {
            <tr>
              <td class="px-6 py-4 whitespace-nowrap">{{ booking.vorgang }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ booking.date }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ booking.description || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ booking.sender_receiver || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <a [routerLink]="['/bookings', booking.id, 'edit']"
                   class="text-blue-600 hover:text-blue-900 mr-3">
                  Bearbeiten
                </a>
                <button (click)="deleteBooking(booking.id!)"
                        class="text-red-600 hover:text-red-900">
                  Löschen
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  }
</div>
```

- [ ] **Step 3: Create booking list tests**

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BookingListComponent } from './booking-list.component';
import { BookingService } from '../../../services/booking.service';

describe('BookingListComponent', () => {
  let component: BookingListComponent;
  let fixture: ComponentFixture<BookingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingListComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show loading state', () => {
    component.loading = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Laden...');
  });

  it('should show empty state', () => {
    component.loading = false;
    component.bookings = [];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Noch keine Buchungen vorhanden');
  });
});
```

- [ ] **Step 4: Run tests**

Run: `npx ng test --watch=false`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/components/bookings/booking-list/
git commit -m "feat: Add booking list component"
```

---

### Task 8: Booking Form Component

**Files:**
- Create: `src/app/components/bookings/booking-form/booking-form.component.ts`
- Create: `src/app/components/bookings/booking-form/booking-form.component.html`
- Create: `src/app/components/bookings/booking-form/booking-form.component.spec.ts`

**Interfaces:**
- Consumes: `BookingService` from Task 6, `AccountService` from existing code, `Booking`, `BookingPosition`, `VORGANG_OPTIONS` from Task 1
- Produces: `BookingFormComponent` displayed at `/bookings/new` and `/bookings/:id/edit`

- [ ] **Step 1: Create booking form component**

```typescript
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { BookingService } from '../../../services/booking.service';
import { AccountService } from '../../../services/account.service';
import { Booking, BookingPosition, VORGANG_OPTIONS } from '../../../models/booking.model';
import { Account } from '../../../models/account.model';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './booking-form.component.html'
})
export class BookingFormComponent implements OnInit {
  booking: Booking = {
    vorgang: 'Buchung',
    date: new Date().toISOString().split('T')[0],
    description: '',
    sender_receiver: '',
    positions: [this.createEmptyPosition()]
  };

  accounts: Account[] = [];
  vorgangOptions = VORGANG_OPTIONS;
  isEditing = false;
  bookingId: number | null = null;
  saving = false;
  errorMessage: string | null = null;

  constructor(
    private bookingService: BookingService,
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAccounts();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.bookingId = parseInt(id, 10);
      this.loadBooking();
    }
  }

  async loadAccounts() {
    try {
      this.accounts = await this.accountService.getAll();
    } catch (err) {
      console.error('Failed to load accounts:', err);
    }
  }

  async loadBooking() {
    if (this.bookingId) {
      const booking = await this.bookingService.getById(this.bookingId);
      if (booking) {
        this.booking = booking;
      }
      this.cdr.detectChanges();
    }
  }

  createEmptyPosition(): BookingPosition {
    return {
      account_id: 0,
      valuta: this.booking?.date || new Date().toISOString().split('T')[0],
      amount: 0
    };
  }

  addPosition() {
    this.booking.positions.push(this.createEmptyPosition());
  }

  removePosition(index: number) {
    if (this.booking.positions.length > 1) {
      this.booking.positions.splice(index, 1);
    }
  }

  onDateChange() {
    for (const pos of this.booking.positions) {
      pos.valuta = this.booking.date;
    }
  }

  async onSubmit() {
    if (!this.booking.date) {
      alert('Datum ist ein Pflichtfeld.');
      return;
    }

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

    this.saving = true;
    this.errorMessage = null;
    try {
      if (this.isEditing && this.bookingId) {
        await this.bookingService.update(this.bookingId, this.booking);
      } else {
        await this.bookingService.create(this.booking);
      }
      this.router.navigate(['/bookings']);
    } catch (err) {
      console.error('Failed to save booking:', err);
      this.errorMessage = this.isEditing
        ? 'Buchung konnte nicht gespeichert werden.'
        : 'Buchung konnte nicht angelegt werden.';
      this.cdr.detectChanges();
    } finally {
      this.saving = false;
    }
  }
}
```

- [ ] **Step 2: Create booking form template**

```html
<div class="p-6 max-w-4xl mx-auto">
  <h1 class="text-2xl font-bold mb-6">
    {{ isEditing ? 'Buchung bearbeiten' : 'Neue Buchung' }}
  </h1>

  <form (ngSubmit)="onSubmit()" class="bg-white shadow rounded-lg p-6">
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Vorgang *</label>
        <select [(ngModel)]="booking.vorgang"
                name="vorgang"
                required
                class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          @for (option of vorgangOptions; track option) {
            <option [value]="option">{{ option }}</option>
          }
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Datum *</label>
        <input type="date"
               [(ngModel)]="booking.date"
               name="date"
               (change)="onDateChange()"
               required
               class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
        <input type="text"
               [(ngModel)]="booking.description"
               name="description"
               class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Sender/Empfänger</label>
        <input type="text"
               [(ngModel)]="booking.sender_receiver"
               name="sender_receiver"
               class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
      </div>
    </div>

    <div class="mb-6">
      <div class="flex justify-between items-center mb-3">
        <h2 class="text-lg font-medium">Positionen</h2>
        <button type="button"
                (click)="addPosition()"
                class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm">
          + Position
        </button>
      </div>

      <table class="min-w-full border">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border">Konto *</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border">Valuta *</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border">Betrag *</th>
            <th class="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase border">Aktion</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          @for (pos of booking.positions; track $index; let i = $index) {
            <tr>
              <td class="px-4 py-2 border">
                <select [(ngModel)]="pos.account_id"
                        [name]="'account_' + i"
                        required
                        class="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option [value]="0">Bitte wählen...</option>
                  @for (account of accounts; track account.id) {
                    <option [value]="account.id">{{ account.name }}</option>
                  }
                </select>
              </td>
              <td class="px-4 py-2 border">
                <input type="date"
                       [(ngModel)]="pos.valuta"
                       [name]="'valuta_' + i"
                       required
                       class="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
              </td>
              <td class="px-4 py-2 border">
                <input type="number"
                       [(ngModel)]="pos.amount"
                       [name]="'amount_' + i"
                       required
                       class="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
              </td>
              <td class="px-4 py-2 border text-center">
                @if (booking.positions.length > 1) {
                  <button type="button"
                          (click)="removePosition(i)"
                          class="text-red-600 hover:text-red-900">
                    Löschen
                  </button>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    @if (errorMessage) {
      <div class="mb-4 p-3 bg-red-100 text-red-700 rounded">{{ errorMessage }}</div>
    }

    <div class="flex justify-end gap-4">
      <a routerLink="/bookings"
         class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
        Abbrechen
      </a>
      <button type="submit"
              [disabled]="saving"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50">
        {{ saving ? 'Speichern...' : (isEditing ? 'Speichern' : 'Buchen') }}
      </button>
    </div>
  </form>
</div>
```

- [ ] **Step 3: Create booking form tests**

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BookingFormComponent } from './booking-form.component';

describe('BookingFormComponent', () => {
  let component: BookingFormComponent;
  let fixture: ComponentFixture<BookingFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingFormComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.booking.vorgang).toBe('Buchung');
    expect(component.booking.positions.length).toBe(1);
  });

  it('should add position', () => {
    component.addPosition();
    expect(component.booking.positions.length).toBe(2);
  });

  it('should remove position', () => {
    component.addPosition();
    component.removePosition(0);
    expect(component.booking.positions.length).toBe(1);
  });

  it('should not remove last position', () => {
    component.removePosition(0);
    expect(component.booking.positions.length).toBe(1);
  });
});
```

- [ ] **Step 4: Run tests**

Run: `npx ng test --watch=false`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/components/bookings/booking-form/
git commit -m "feat: Add booking form component with dynamic positions"
```

---

### Task 9: Routing and Navigation

**Files:**
- Modify: `src/app/app.routes.ts`
- Modify: `src/app/app.html`

**Interfaces:**
- Consumes: `BookingListComponent` from Task 7, `BookingFormComponent` from Task 8
- Produces: Routes and navigation for bookings

- [ ] **Step 1: Add booking routes**

```typescript
import { Routes } from '@angular/router';
import { AccountListComponent } from './components/accounts/account-list/account-list.component';
import { AccountFormComponent } from './components/accounts/account-form/account-form.component';
import { BookingListComponent } from './components/bookings/booking-list/booking-list.component';
import { BookingFormComponent } from './components/bookings/booking-form/booking-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/bookings', pathMatch: 'full' },
  { path: 'bookings', component: BookingListComponent },
  { path: 'bookings/new', component: BookingFormComponent },
  { path: 'bookings/:id/edit', component: BookingFormComponent },
  { path: 'accounts', component: AccountListComponent },
  { path: 'accounts/new', component: AccountFormComponent },
  { path: 'accounts/:id/edit', component: AccountFormComponent }
];
```

- [ ] **Step 2: Update navigation in app.html**

```html
<div class="flex h-screen bg-gray-100">
  <!-- Sidebar -->
  <aside class="w-64 bg-white shadow-lg">
    <div class="p-4 border-b">
      <h1 class="text-xl font-bold text-gray-800">Slowen</h1>
    </div>
    <nav class="p-4">
      <a routerLink="/bookings"
         routerLinkActive="bg-blue-50 text-blue-600"
         class="block px-4 py-2 rounded hover:bg-gray-100">
        Buchungen
      </a>
      <a routerLink="/accounts"
         routerLinkActive="bg-blue-50 text-blue-600"
         class="block px-4 py-2 rounded hover:bg-gray-100">
        Konten
      </a>
    </nav>
  </aside>

  <!-- Content -->
  <main class="flex-1 overflow-auto">
    <router-outlet></router-outlet>
  </main>
</div>
```

- [ ] **Step 3: Run tests**

Run: `npx ng test --watch=false`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/app/app.routes.ts src/app/app.html
git commit -m "feat: Add booking routes and navigation"
```

---

### Task 10: Integration Test

**Files:**
- Modify: `electron/database/connection.ts` (verify tables created)

**Interfaces:**
- Consumes: All previous tasks
- Produces: Working booking feature

- [ ] **Step 1: Rebuild electron**

Run: `npm run rebuild`
Expected: SUCCESS

- [ ] **Step 2: Build electron**

Run: `npm run build:electron`
Expected: SUCCESS

- [ ] **Step 3: Run all tests**

Run: `npx ng test --watch=false`
Expected: All tests PASS

- [ ] **Step 4: Manual verification**

Start app: `npm start`
- Verify "Buchungen" appears in navigation above "Konten"
- Verify booking list shows empty state
- Click "Neue Buchung"
- Fill in booking form with positions
- Submit and verify booking appears in list
- Edit booking
- Delete booking

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: Complete booking management feature"
```
