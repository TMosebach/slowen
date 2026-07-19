# Datenbank + Konto anlegen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** SQLite Datenbank für Accounts einrichten und Use-Case "Konto anlegen" mit Angular Frontend implementieren

**Architecture:** better-sqlite3 im Electron Main Process, IPC Handler für CRUD, Angular Frontend mit Account List + Form

**Tech Stack:** better-sqlite3, Angular 19, TypeScript, Tailwind CSS v4

## Global Constraints

- Plattform: Mac OS
- Sprache: Deutsch (Datums-/Zahlenformat)
- Angular 19 mit Standalone Components
- Tailwind CSS v4
- better-sqlite3 für Datenbank
- IPC via contextBridge/preload

---

## Task 1: Account Model definieren

**Files:**
- Create: `src/app/models/account.model.ts`

**Interfaces:**
- Produces: Account Interface für Frontend und Backend

- [ ] **Schritt 1: Account Interface erstellen**

```typescript
// src/app/models/account.model.ts
export interface Account {
  id?: number;
  name: string;
  type: 'Bestand' | 'GuV';
  subtype: string;
  iban?: string;
  notes?: string;
  created_at?: string;
}

export const ACCOUNT_SUBTYPES = {
  'Bestand': ['Giro', 'Tagesgeld', 'Depot', 'Immobilie', 'Versicherung', 'Forderung', 'Verbindlichkeit'],
  'GuV': ['Kreditkarte']
} as const;

export type AccountSubtype = typeof ACCOUNT_SUBTYPES[keyof typeof ACCOUNT_SUBTYPES][number];
```

- [ ] **Schritt 2: Commit**

```bash
git add src/app/models/account.model.ts
git commit -m "feat: Account model definition"
```

---

## Task 2: Database Service erstellen

**Files:**
- Create: `electron/database/connection.ts`
- Modify: `electron/database/accounts.ts`

**Interfaces:**
- Consumes: Account Model aus Task 1
- Produces: Database Connection und Accounts CRUD

- [ ] **Schritt 1: Database Connection erstellen**

```typescript
// electron/database/connection.ts
import Database from 'better-sqlite3';
import * as path from 'path';
import { app } from 'electron';

let db: Database.Database;

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = path.join(app.getPath('userData'), 'slowen.db');
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
}
```

- [ ] **Schritt 2: Accounts Service implementieren**

```typescript
// electron/database/accounts.ts
import { getDatabase } from './connection';

interface Account {
  id?: number;
  name: string;
  type: 'Bestand' | 'GuV';
  subtype: string;
  iban?: string;
  notes?: string;
  created_at?: string;
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
```

- [ ] **Schritt 3: Commit**

```bash
git add electron/database/connection.ts electron/database/accounts.ts
git commit -m "feat: Database service with accounts CRUD"
```

---

## Task 3: IPC Handler aktualisieren

**Files:**
- Modify: `electron/ipc/accounts.ipc.ts`

**Interfaces:**
- Consumes: Database Service aus Task 2
- Produces: Funktionierende IPC Handler

- [ ] **Schritt 1: IPC Handler mit echter Datenbank-Implementierung aktualisieren**

```typescript
// electron/ipc/accounts.ipc.ts
import { ipcMain } from 'electron';
import { accounts } from '../database/accounts';

export function registerAccountsIPC() {
  ipcMain.handle('accounts:getAll', async () => {
    return accounts.getAll();
  });

  ipcMain.handle('accounts:getById', async (event, id) => {
    return accounts.getById(id);
  });

  ipcMain.handle('accounts:create', async (event, account) => {
    return accounts.create(account);
  });

  ipcMain.handle('accounts:update', async (event, id, account) => {
    return accounts.update(id, account);
  });

  ipcMain.handle('accounts:delete', async (event, id) => {
    return accounts.delete(id);
  });
}
```

- [ ] **Schritt 2: Commit**

```bash
git add electron/ipc/accounts.ipc.ts
git commit -m "feat: Update IPC handlers with real database"
```

---

## Task 4: Account Service für Angular erstellen

**Files:**
- Create: `src/app/services/account.service.ts`

**Interfaces:**
- Consumes: Electron API aus preload
- Produces: Angular Service für Account CRUD

- [ ] **Schritt 1: Account Service erstellen**

```typescript
// src/app/services/account.service.ts
import { Injectable } from '@angular/core';
import { Account } from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private get api() {
    return window.electronAPI.accounts;
  }

  getAll(): Promise<Account[]> {
    return this.api.getAll();
  }

  getById(id: number): Promise<Account | null> {
    return this.api.getById(id);
  }

  create(account: Account): Promise<Account> {
    return this.api.create(account);
  }

  update(id: number, account: Account): Promise<Account> {
    return this.api.update(id, account);
  }

  delete(id: number): Promise<void> {
    return this.api.delete(id);
  }
}
```

- [ ] **Schritt 2: Commit**

```bash
git add src/app/services/account.service.ts
git commit -m "feat: Account service for Angular"
```

---

## Task 5: Account List Komponente

**Files:**
- Create: `src/app/components/accounts/account-list/account-list.component.ts`
- Create: `src/app/components/accounts/account-list/account-list.component.html`

**Interfaces:**
- Consumes: Account Service aus Task 4
- Produces: Account List Ansicht

- [ ] **Schritt 1: Account List Komponente erstellen**

```typescript
// src/app/components/accounts/account-list/account-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccountService } from '../../../services/account.service';
import { Account } from '../../../models/account.model';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './account-list.component.html'
})
export class AccountListComponent implements OnInit {
  accounts: Account[] = [];
  loading = true;

  constructor(private accountService: AccountService) {}

  async ngOnInit() {
    await this.loadAccounts();
  }

  async loadAccounts() {
    this.loading = true;
    this.accounts = await this.accountService.getAll();
    this.loading = false;
  }

  async deleteAccount(id: number) {
    if (confirm('Konto wirklich löschen?')) {
      await this.accountService.delete(id);
      await this.loadAccounts();
    }
  }
}
```

- [ ] **Schritt 2: Account List Template erstellen**

```html
<!-- src/app/components/accounts/account-list/account-list.component.html -->
<div class="p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Konten</h1>
    <a routerLink="/accounts/new" 
       class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
      Neues Konto
    </a>
  </div>

  @if (loading) {
    <div class="text-center py-8">Laden...</div>
  } @else if (accounts.length === 0) {
    <div class="text-center py-8 text-gray-500">
      Noch keine Konten vorhanden.
    </div>
  } @else {
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Typ</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtyp</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IBAN</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aktionen</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          @for (account of accounts; track account.id) {
            <tr>
              <td class="px-6 py-4 whitespace-nowrap">{{ account.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ account.type }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ account.subtype }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ account.iban || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <button (click)="deleteAccount(account.id!)" 
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

- [ ] **Schritt 3: Commit**

```bash
git add src/app/components/accounts/account-list/
git commit -m "feat: Account list component"
```

---

## Task 6: Account Form Komponente

**Files:**
- Create: `src/app/components/accounts/account-form/account-form.component.ts`
- Create: `src/app/components/accounts/account-form/account-form.component.html`

**Interfaces:**
- Consumes: Account Service aus Task 4, Account Model aus Task 1
- Produces: Account Formular zum Anlegen/Bearbeiten

- [ ] **Schritt 1: Account Form Komponente erstellen**

```typescript
// src/app/components/accounts/account-form/account-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '../../../services/account.service';
import { Account, ACCOUNT_SUBTYPES } from '../../../models/account.model';

@Component({
  selector: 'app-account-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-form.component.html'
})
export class AccountFormComponent implements OnInit {
  account: Account = {
    name: '',
    type: 'Bestand',
    subtype: '',
    iban: '',
    notes: ''
  };

  subtypes: readonly string[] = ACCOUNT_SUBTYPES['Bestand'];
  isEditing = false;
  accountId: number | null = null;

  constructor(
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.accountId = parseInt(id, 10);
      this.loadAccount();
    }
  }

  async loadAccount() {
    if (this.accountId) {
      const account = await this.accountService.getById(this.accountId);
      if (account) {
        this.account = account;
        this.updateSubtypes();
      }
    }
  }

  updateSubtypes() {
    this.subtypes = ACCOUNT_SUBTYPES[this.account.type] || [];
    if (!this.subtypes.includes(this.account.subtype)) {
      this.account.subtype = '';
    }
  }

  showIbanField(): boolean {
    return this.account.type === 'Bestand' && 
           ['Giro', 'Tagesgeld', 'Depot'].includes(this.account.subtype);
  }

  async onSubmit() {
    if (!this.account.name || this.account.name.length < 3) {
      alert('Name muss mindestens 3 Zeichen lang sein.');
      return;
    }

    if (!this.account.subtype) {
      alert('Bitte wählen Sie einen Subtyp.');
      return;
    }

    if (this.isEditing && this.accountId) {
      await this.accountService.update(this.accountId, this.account);
    } else {
      await this.accountService.create(this.account);
    }
    this.router.navigate(['/accounts']);
  }
}
```

- [ ] **Schritt 2: Account Form Template erstellen**

```html
<!-- src/app/components/accounts/account-form/account-form.component.html -->
<div class="p-6 max-w-2xl mx-auto">
  <h1 class="text-2xl font-bold mb-6">
    {{ isEditing ? 'Konto bearbeiten' : 'Neues Konto' }}
  </h1>

  <form (ngSubmit)="onSubmit()" class="bg-white shadow rounded-lg p-6">
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Name *
      </label>
      <input type="text" 
             [(ngModel)]="account.name" 
             name="name"
             required
             minlength="3"
             class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Typ *
      </label>
      <select [(ngModel)]="account.type" 
              name="type"
              (change)="updateSubtypes()"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="Bestand">Bestand</option>
        <option value="GuV">GuV</option>
      </select>
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Subtyp *
      </label>
      <select [(ngModel)]="account.subtype" 
              name="subtype"
              required
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">Bitte wählen...</option>
        @for (subtype of subtypes; track subtype) {
          <option [value]="subtype">{{ subtype }}</option>
        }
      </select>
    </div>

    @if (showIbanField()) {
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          IBAN
        </label>
        <input type="text" 
               [(ngModel)]="account.iban" 
               name="iban"
               class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
      </div>
    }

    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Notizen
      </label>
      <textarea [(ngModel)]="account.notes" 
                name="notes"
                rows="3"
                class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
    </div>

    <div class="flex justify-end gap-4">
      <a routerLink="/accounts" 
         class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
        Abbrechen
      </a>
      <button type="submit" 
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        {{ isEditing ? 'Speichern' : 'Anlegen' }}
      </button>
    </div>
  </form>
</div>
```

- [ ] **Schritt 3: Commit**

```bash
git add src/app/components/accounts/account-form/
git commit -m "feat: Account form component"
```

---

## Task 7: Routing konfigurieren

**Files:**
- Modify: `src/app/app.routes.ts`
- Modify: `src/app/app.component.ts`

**Interfaces:**
- Consumes: Account List und Form Komponenten aus Tasks 5-6
- Produces: Funktionierendes Routing

- [ ] **Schritt 1: Routes konfigurieren**

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AccountListComponent } from './components/accounts/account-list/account-list.component';
import { AccountFormComponent } from './components/accounts/account-form/account-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/accounts', pathMatch: 'full' },
  { path: 'accounts', component: AccountListComponent },
  { path: 'accounts/new', component: AccountFormComponent },
  { path: 'accounts/:id/edit', component: AccountFormComponent }
];
```

- [ ] **Schritt 2: App Component mit Layout aktualisieren**

```typescript
// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen bg-gray-100">
      <!-- Sidebar -->
      <aside class="w-64 bg-white shadow-lg">
        <div class="p-4 border-b">
          <h1 class="text-xl font-bold text-gray-800">Slowen</h1>
        </div>
        <nav class="p-4">
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
  `
})
export class AppComponent {}
```

- [ ] **Schritt 3: Commit**

```bash
git add src/app/app.routes.ts src/app/app.component.ts
git commit -m "feat: Configure routing with sidebar layout"
```

---

## Task 8: Tests schreiben

**Files:**
- Create: `src/app/services/account.service.spec.ts`
- Create: `src/app/components/accounts/account-list/account-list.component.spec.ts`
- Create: `src/app/components/accounts/account-form/account-form.component.spec.ts`

**Interfaces:**
- Consumes: Alle vorherigen Tasks
- Produces: Unit Tests für Components und Services

- [ ] **Schritt 1: Account Service Test erstellen**

```typescript
// src/app/services/account.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { AccountService } from './account.service';

describe('AccountService', () => {
  let service: AccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

- [ ] **Schritt 2: Account List Component Test erstellen**

```typescript
// src/app/components/accounts/account-list/account-list.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountListComponent } from './account-list.component';

describe('AccountListComponent', () => {
  let component: AccountListComponent;
  let fixture: ComponentFixture<AccountListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

- [ ] **Schritt 3: Account Form Component Test erstellen**

```typescript
// src/app/components/accounts/account-form/account-form.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountFormComponent } from './account-form.component';

describe('AccountFormComponent', () => {
  let component: AccountFormComponent;
  let fixture: ComponentFixture<AccountFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

- [ ] **Schritt 4: Tests ausführen**

```bash
npm test -- --watch=false
```

- [ ] **Schritt 5: Commit**

```bash
git add src/app/services/account.service.spec.ts src/app/components/accounts/
git commit -m "test: Add unit tests for account components"
```

---

## Zusammenfassung

**8 Tasks** für Datenbank + Konto anlegen:
1. ✅ Account Model
2. ✅ Database Service
3. ✅ IPC Handler
4. ✅ Angular Account Service
5. ✅ Account List Component
6. ✅ Account Form Component
7. ✅ Routing
8. ✅ Tests

**Testbar nach Task 8:** `npm start` startet App mit Account List + Form
