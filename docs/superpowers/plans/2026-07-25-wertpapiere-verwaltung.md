# Wertpapiere-Verwaltung – Implementierungs-Plan

**Datum:** 25.07.2026  
**Feature:** Wertpapier-Katalog mit Kurs-Historie Management  
**Design-Dokument:** [2026-07-25-wertpapiere-verwaltung-design.md](../specs/2026-07-25-wertpapiere-verwaltung-design.md)

---

## Überblick

Dieser Plan beschreibt die Implementierung eines Wertpapier-Management-Features für Slowen (Finanzverwaltungs-Desktop-App). Das Feature umfasst:
- Datenbank-Tabellen (securities, security_prices)
- IPC-Events für Electron
- Angular Services
- 3 UI-Komponenten (Liste, Formular, Kurse-Input)
- Routing & Navigation

---

## Datei-Struktur – Neue & Veränderte Dateien

### Backend (Electron)

**Neue Dateien:**
```
electron/database/
  ├── securities.ts              (CRUD für Wertpapiere)
  └── security-prices.ts         (CRUD für Kurse)

electron/ipc/
  ├── securities.ipc.ts          (IPC-Handler für Wertpapiere)
  └── security-prices.ipc.ts     (IPC-Handler für Kurse)
```

**Modifiziert:**
```
electron/database/connection.ts    (Tabellen-Initialisierung)
electron/main.ts                   (IPC-Events registrieren)
electron/preload/preload.ts        (API-Namespace erweitern)
```

### Frontend (Angular)

**Neue Dateien:**
```
src/app/models/
  ├── security.model.ts           (Type-Definitionen)
  └── security-price.model.ts     (Type-Definitionen)

src/app/services/
  ├── securities.service.ts       (Service für Wertpapiere)
  ├── securities.service.spec.ts  (Unit-Tests)
  ├── security-prices.service.ts  (Service für Kurse)
  └── security-prices.service.spec.ts (Unit-Tests)

src/app/components/securities/
  ├── securities-list/
  │   ├── securities-list.component.ts
  │   ├── securities-list.component.html
  │   ├── securities-list.component.scss
  │   └── securities-list.component.spec.ts
  ├── securities-form/
  │   ├── securities-form.component.ts
  │   ├── securities-form.component.html
  │   ├── securities-form.component.scss
  │   └── securities-form.component.spec.ts
  └── prices-input/
      ├── prices-input.component.ts
      ├── prices-input.component.html
      ├── prices-input.component.scss
      └── prices-input.component.spec.ts
```

**Modifiziert:**
```
src/app/app.routes.ts             (Neue Routes hinzufügen)
src/app/app.html                  (Sidebar-Navigation erweitern)
```

---

## Task-Breakdown (Bite-Sized Tasks)

### Phase 1: Datenbank-Layer & IPC-Events

#### Task 1.1: Datenbank-Schema initialisieren

**Beschreibung:** Erstelle die `securities` und `security_prices` Tabellen in better-sqlite3.

**Datei:** `electron/database/connection.ts`

**Schritte:**
1. Öffne `electron/database/connection.ts`
2. Füge zwei neue SQL-Migration-Statements hinzu:
   ```sql
   CREATE TABLE IF NOT EXISTS securities (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     type TEXT NOT NULL CHECK(type IN ('Aktie', 'Anleihe', 'Fonds', 'ETF', 'Zertifikat')),
     isin TEXT NOT NULL UNIQUE,
     wkn TEXT NOT NULL UNIQUE,
     faelligkeit TEXT,
     created_at TEXT DEFAULT CURRENT_TIMESTAMP,
     updated_at TEXT DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE IF NOT EXISTS security_prices (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     security_id INTEGER NOT NULL,
     date TEXT NOT NULL,
     price REAL NOT NULL,
     created_at TEXT DEFAULT CURRENT_TIMESTAMP,
     updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (security_id) REFERENCES securities(id),
     UNIQUE(security_id, date)
   );
   ```
3. Teste, dass die App noch startet und die Tabellen erstellt werden

---

#### Task 1.2: Securities CRUD Layer implementieren

**Beschreibung:** Schreibe `electron/database/securities.ts` mit allen CRUD-Funktionen.

**Datei:** `electron/database/securities.ts` (neu)

**Pseudo-Code:**
```typescript
import Database from 'better-sqlite3';

export interface Security {
  id: number;
  name: string;
  type: 'Aktie' | 'Anleihe' | 'Fonds' | 'ETF' | 'Zertifikat';
  isin: string;
  wkn: string;
  faelligkeit?: string;
  created_at: string;
  updated_at: string;
}

export class SecuritiesDB {
  constructor(private db: Database.Database) {}

  createSecurity(security: Omit<Security, 'id' | 'created_at' | 'updated_at'>): Security {
    // INSERT und RETURN neu erstellte Security
    // Wirft Error bei ISIN/WKN-Duplikaten
  }

  getAllSecurities(): Security[] {
    // SELECT * ORDER BY name
  }

  getSecurityById(id: number): Security | null {
    // SELECT * WHERE id = ?
  }

  updateSecurity(id: number, updates: Partial<Security>): Security {
    // UPDATE einzelne Felder, setze updated_at
    // Wirft Error bei ISIN/WKN-Duplikaten (außer dem aktuellen)
  }
}
```

**Schritte:**
1. Erstelle `electron/database/securities.ts`
2. Implementiere alle 4 Funktionen
3. Teste lokal (manuell mit Node/TypeScript)

---

#### Task 1.3: SecurityPrices CRUD Layer implementieren

**Beschreibung:** Schreibe `electron/database/security-prices.ts` mit allen CRUD-Funktionen.

**Datei:** `electron/database/security-prices.ts` (neu)

**Pseudo-Code:**
```typescript
export interface SecurityPrice {
  id: number;
  security_id: number;
  date: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export class SecurityPricesDB {
  constructor(private db: Database.Database) {}

  createPrice(security_id: number, date: string, price: number): SecurityPrice {
    // INSERT, return neue Price
  }

  getPriceBySecurityAndDate(security_id: number, date: string): SecurityPrice | null {
    // SELECT WHERE security_id = ? AND date = ?
  }

  getPricesByDate(date: string): SecurityPrice[] {
    // SELECT WHERE date = ? ORDER BY security_id
  }

  updatePrice(security_id: number, date: string, price: number): SecurityPrice {
    // UPDATE by security_id + date, setze updated_at
  }

  getLatestPriceBySecurityId(security_id: number): SecurityPrice | null {
    // SELECT WHERE security_id = ? ORDER BY date DESC LIMIT 1
  }
}
```

**Schritte:**
1. Erstelle `electron/database/security-prices.ts`
2. Implementiere alle 5 Funktionen
3. Teste lokal

---

#### Task 1.4: Securities IPC-Handler implementieren

**Beschreibung:** Schreibe `electron/ipc/securities.ipc.ts` als IPC-Handler.

**Datei:** `electron/ipc/securities.ipc.ts` (neu)

**Pseudo-Code:**
```typescript
import { ipcMain } from 'electron';
import { SecuritiesDB } from '../database/securities';

export function registerSecuritiesIPC(db: SecuritiesDB) {
  ipcMain.handle('securities:create', async (_, security) => db.createSecurity(security));
  ipcMain.handle('securities:getAll', async () => db.getAllSecurities());
  ipcMain.handle('securities:getById', async (_, id) => db.getSecurityById(id));
  ipcMain.handle('securities:update', async (_, id, updates) => db.updateSecurity(id, updates));
}
```

**Schritte:**
1. Erstelle `electron/ipc/securities.ipc.ts`
2. Implementiere alle 4 IPC-Handler
3. Registriere in `electron/main.ts` (siehe Task 1.6)

---

#### Task 1.5: SecurityPrices IPC-Handler implementieren

**Beschreibung:** Schreibe `electron/ipc/security-prices.ipc.ts` als IPC-Handler.

**Datei:** `electron/ipc/security-prices.ipc.ts` (neu)

**Pseudo-Code:** (analog zu 1.4, mit 5 Handlern)

**Schritte:**
1. Erstelle `electron/ipc/security-prices.ipc.ts`
2. Implementiere alle 5 IPC-Handler
3. Registriere in `electron/main.ts` (siehe Task 1.6)

---

#### Task 1.6: IPC-Handler in main.ts registrieren

**Beschreibung:** Registriere die neuen IPC-Handler in `electron/main.ts`.

**Datei:** `electron/main.ts`

**Schritte:**
1. Öffne `electron/main.ts`
2. Importiere `registerSecuritiesIPC` und `registerSecurityPricesIPC`
3. Rufe beide Funktionen in der `createWindow()` oder `app.ready` auf
4. Teste, dass die App noch startet

---

#### Task 1.7: Preload-API erweitern

**Beschreibung:** Erweitere `electron/preload/preload.ts` um neue API-Namespaces.

**Datei:** `electron/preload/preload.ts`

**Pseudo-Code:**
```typescript
contextBridge.exposeInMainWorld('api', {
  // bestehende APIs...
  securities: {
    create: (security) => ipcRenderer.invoke('securities:create', security),
    getAll: () => ipcRenderer.invoke('securities:getAll'),
    getById: (id) => ipcRenderer.invoke('securities:getById', id),
    update: (id, updates) => ipcRenderer.invoke('securities:update', id, updates),
  },
  securityPrices: {
    create: (security_id, date, price) => ipcRenderer.invoke('security-prices:create', { security_id, date, price }),
    getBySecurityAndDate: (security_id, date) => ipcRenderer.invoke('security-prices:getBySecurityAndDate', { security_id, date }),
    getByDate: (date) => ipcRenderer.invoke('security-prices:getByDate', { date }),
    update: (security_id, date, price) => ipcRenderer.invoke('security-prices:update', { security_id, date, price }),
    getLatest: (security_id) => ipcRenderer.invoke('security-prices:getLatest', { security_id }),
  }
});
```

**Schritte:**
1. Öffne `electron/preload/preload.ts`
2. Erweitere den `api` Namespace um `securities` und `securityPrices`
3. Teste, dass die App noch startet

---

### Phase 2: Angular Models & Services

#### Task 2.1: Type-Definitionen für Securities

**Beschreibung:** Schreibe `src/app/models/security.model.ts`.

**Datei:** `src/app/models/security.model.ts` (neu)

**Pseudo-Code:**
```typescript
export type SecurityType = 'Aktie' | 'Anleihe' | 'Fonds' | 'ETF' | 'Zertifikat';

export interface Security {
  id: number;
  name: string;
  type: SecurityType;
  isin: string;
  wkn: string;
  faelligkeit?: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

export const SECURITY_TYPES: SecurityType[] = ['Aktie', 'Anleihe', 'Fonds', 'ETF', 'Zertifikat'];
export const FAELLIGKEIT_TYPES: SecurityType[] = ['Anleihe', 'Zertifikat'];
```

**Schritte:**
1. Erstelle `src/app/models/security.model.ts`
2. Schreibe alle Type-Definitionen und Konstanten

---

#### Task 2.2: Type-Definitionen für SecurityPrices

**Beschreibung:** Schreibe `src/app/models/security-price.model.ts`.

**Datei:** `src/app/models/security-price.model.ts` (neu)

**Pseudo-Code:**
```typescript
export interface SecurityPrice {
  id: number;
  security_id: number;
  date: string; // YYYY-MM-DD
  price: number;
  created_at: string;
  updated_at: string;
}
```

**Schritte:**
1. Erstelle `src/app/models/security-price.model.ts`
2. Schreibe die Type-Definition

---

#### Task 2.3: Securities Service implementieren

**Beschreibung:** Schreibe `src/app/services/securities.service.ts` mit allen CRUD-Funktionen.

**Datei:** `src/app/services/securities.service.ts` (neu)

**Pseudo-Code:**
```typescript
import { Injectable } from '@angular/core';
import { Security } from '../models/security.model';

@Injectable({ providedIn: 'root' })
export class SecuritiesService {
  constructor() {}

  async createSecurity(security: Omit<Security, 'id' | 'created_at' | 'updated_at'>): Promise<Security> {
    return (window as any).api.securities.create(security);
  }

  async getAllSecurities(): Promise<Security[]> {
    return (window as any).api.securities.getAll();
  }

  async getSecurityById(id: number): Promise<Security | null> {
    return (window as any).api.securities.getById(id);
  }

  async updateSecurity(id: number, updates: Partial<Security>): Promise<Security> {
    return (window as any).api.securities.update(id, updates);
  }
}
```

**Schritte:**
1. Erstelle `src/app/services/securities.service.ts`
2. Implementiere alle 4 Funktionen
3. Schreibe eine kleine Unit-Test (siehe Task 2.5)

---

#### Task 2.4: SecurityPrices Service implementieren

**Beschreibung:** Schreibe `src/app/services/security-prices.service.ts`.

**Datei:** `src/app/services/security-prices.service.ts` (neu)

**Pseudo-Code:**
```typescript
import { Injectable } from '@angular/core';
import { SecurityPrice } from '../models/security-price.model';

@Injectable({ providedIn: 'root' })
export class SecurityPricesService {
  // 5 Funktionen analog zu SecuritysService
}
```

**Schritte:**
1. Erstelle `src/app/services/security-prices.service.ts`
2. Implementiere alle 5 Funktionen
3. Schreibe Unit-Test

---

#### Task 2.5: Unit-Tests für Securities Service

**Beschreibung:** Schreibe `src/app/services/securities.service.spec.ts`.

**Datei:** `src/app/services/securities.service.spec.ts` (neu)

**Test-Fälle:**
- Mock window.api.securities
- Test: `createSecurity()` ruft korrekt auf
- Test: `getAllSecurities()` gibt Liste zurück
- Test: `getSecurityById(id)` gibt Security oder null zurück
- Test: `updateSecurity()` ruft korrekt auf

**Schritte:**
1. Erstelle `src/app/services/securities.service.spec.ts`
2. Schreibe 4 Unit-Tests
3. Starte Tests: `npm test`

---

#### Task 2.6: Unit-Tests für SecurityPrices Service

**Beschreibung:** Schreibe `src/app/services/security-prices.service.spec.ts`.

**Schritte:** (analog zu 2.5)

---

### Phase 3: Angular Komponenten

#### Task 3.1: Securities-List Komponente (Template + TS)

**Beschreibung:** Schreibe `src/app/components/securities/securities-list/`.

**Dateien:**
- `securities-list.component.ts`
- `securities-list.component.html`
- `securities-list.component.scss`

**Funktionalität:**
- Init: Lade alle Wertpapiere + neueste Kurse
- Tabelle mit Spalten: name, typ, isin, wkn, faelligkeit, jüngster Kurs
- Buttons: "Neu" (→ Form), Edit-Icon pro Zeile (→ Form/:id), "Kurse" (→ prices)

**Pseudo-Code (TS):**
```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SecuritiesService } from '../../../services/securities.service';
import { SecurityPricesService } from '../../../services/security-prices.service';
import { Security } from '../../../models/security.model';

@Component({
  selector: 'app-securities-list',
  templateUrl: './securities-list.component.html',
  styleUrls: ['./securities-list.component.scss']
})
export class SecuritiesListComponent implements OnInit {
  securities: Security[] = [];
  latestPrices: Map<number, number | null> = new Map();
  isLoading = false;

  constructor(
    private securitiesService: SecuritiesService,
    private pricesService: SecurityPricesService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.isLoading = true;
    this.securities = await this.securitiesService.getAllSecurities();
    
    // Lade neueste Kurse für jedes Wertpapier
    for (const security of this.securities) {
      const price = await this.pricesService.getLatestPriceBySecurityId(security.id);
      this.latestPrices.set(security.id, price?.price ?? null);
    }
    
    this.isLoading = false;
  }

  editSecurity(id: number) {
    this.router.navigate(['/securities/form', id]);
  }

  createSecurity() {
    this.router.navigate(['/securities/form']);
  }

  goToPrices() {
    this.router.navigate(['/securities/prices']);
  }
}
```

**HTML-Template:** Tabelle mit Bootstrap/Tailwind (analog zu bestehenden Komponenten)

**Schritte:**
1. Erstelle Component mit ng generate
2. Schreibe TS-Code
3. Schreibe HTML-Template (Tabelle)
4. Schreibe SCSS (minimal)

---

#### Task 3.2: Securities-Form Komponente (TS)

**Beschreibung:** Schreibe `src/app/components/securities/securities-form/securities-form.component.ts`.

**Funktionalität:**
- Route: `/securities/form` (Create) oder `/securities/form/:id` (Edit)
- Form: name, typ, isin, wkn, faelligkeit (conditional)
- Validierung: ISIN/WKN Format, Duplikat-Check
- Speichern: create/update
- Abbrechen: zurück zu /securities

**Pseudo-Code:**
```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SecuritiesService } from '../../../services/securities.service';
import { SECURITY_TYPES, FAELLIGKEIT_TYPES } from '../../../models/security.model';

@Component({
  selector: 'app-securities-form',
  templateUrl: './securities-form.component.html',
  styleUrls: ['./securities-form.component.scss']
})
export class SecuritiesFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  securityId: number | null = null;
  securityTypes = SECURITY_TYPES;
  showFaelligkeit = false;

  constructor(
    private fb: FormBuilder,
    private securitiesService: SecuritiesService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    this.initForm();
    
    this.securityId = +(this.route.snapshot.paramMap.get('id') ?? 0);
    if (this.securityId) {
      this.isEdit = true;
      const security = await this.securitiesService.getSecurityById(this.securityId);
      if (security) {
        this.form.patchValue(security);
        this.updateFaelligkeitVisibility();
      }
    }
  }

  initForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      isin: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(12)]],
      wkn: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      faelligkeit: ['']
    });
  }

  async save() {
    if (!this.form.valid) return;

    try {
      if (this.isEdit && this.securityId) {
        await this.securitiesService.updateSecurity(this.securityId, this.form.value);
        // Toast: "Wertpapier aktualisiert"
      } else {
        await this.securitiesService.createSecurity(this.form.value);
        // Toast: "Wertpapier erstellt"
      }
      this.router.navigate(['/securities']);
    } catch (error) {
      // Toast: Error-Meldung
    }
  }

  cancel() {
    this.router.navigate(['/securities']);
  }

  updateFaelligkeitVisibility() {
    const type = this.form.get('type')?.value;
    this.showFaelligkeit = FAELLIGKEIT_TYPES.includes(type);
  }
}
```

**Schritte:**
1. Erstelle Component
2. Schreibe TS-Code mit Formularlogik
3. Schreibe HTML-Template (Reactive Forms)
4. Implementiere Conditional-Visibility für Faelligkeit

---

#### Task 3.3: Securities-Form Komponente (HTML & SCSS)

**Dateien:**
- `securities-form.component.html`
- `securities-form.component.scss`

**Schritte:**
1. Schreibe HTML-Template mit Reactive Forms
2. Schreibe SCSS (minimal, Tailwind/Bootstrap)
3. Teste: Form-Validierung funktioniert

---

#### Task 3.4: Prices-Input Komponente (TS)

**Beschreibung:** Schreibe `src/app/components/securities/prices-input/prices-input.component.ts`.

**Funktionalität:**
- Datum-Picker (DD.MM.YYYY)
- Liste aller Wertpapiere mit Kurs-Input-Feldern
- Beim Datum-Wechsel: Lade Kurse neu
- Batch-Speichern: create/update
- Deutsche Zahlenformatierung (Komma als Dezimaltrennzeichen)

**Pseudo-Code:**
```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SecuritiesService } from '../../../services/securities.service';
import { SecurityPricesService } from '../../../services/security-prices.service';
import { Security } from '../../../models/security.model';
import { SecurityPrice } from '../../../models/security-price.model';

@Component({
  selector: 'app-prices-input',
  templateUrl: './prices-input.component.html',
  styleUrls: ['./prices-input.component.scss']
})
export class PricesInputComponent implements OnInit {
  selectedDate: string = this.getTodayISO(); // YYYY-MM-DD
  displayDate: string = this.getTodayDE();   // DD.MM.YYYY
  securities: Security[] = [];
  priceInputs: Map<number, string> = new Map(); // security_id → price (DE format)
  existingPrices: Map<number, SecurityPrice> = new Map();
  isLoading = false;

  constructor(
    private securitiesService: SecuritiesService,
    private pricesService: SecurityPricesService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadSecurities();
    await this.loadPricesForDate();
  }

  async loadSecurities() {
    this.securities = await this.securitiesService.getAllSecurities();
  }

  async loadPricesForDate() {
    this.existingPrices.clear();
    this.priceInputs.clear();

    const prices = await this.pricesService.getPricesByDate(this.selectedDate);
    for (const price of prices) {
      this.existingPrices.set(price.security_id, price);
      this.priceInputs.set(price.security_id, this.formatPrice(price.price)); // DE format
    }
  }

  async onDateChange(event: any) {
    // Konvertiere DD.MM.YYYY zu YYYY-MM-DD
    this.selectedDate = this.deToISO(event.target.value);
    await this.loadPricesForDate();
  }

  async save() {
    this.isLoading = true;

    try {
      for (const security of this.securities) {
        const priceStr = this.priceInputs.get(security.id);
        const existingPrice = this.existingPrices.get(security.id);

        if (!priceStr) {
          // Leer und kein bisheriger Kurs → Skip
          if (!existingPrice) continue;
        }

        const price = this.parsePrice(priceStr); // DE zu ISO
        if (price === null) {
          // Toast: Error
          continue;
        }

        if (existingPrice) {
          await this.pricesService.updatePrice(security.id, this.selectedDate, price);
        } else if (priceStr) {
          await this.pricesService.createPrice(security.id, this.selectedDate, price);
        }
      }

      // Toast: "Kurse gespeichert"
      this.router.navigate(['/securities']);
    } catch (error) {
      // Toast: Error
    }

    this.isLoading = false;
  }

  cancel() {
    this.router.navigate(['/securities']);
  }

  // Hilfsfunktionen
  getTodayISO(): string { /* YYYY-MM-DD */ }
  getTodayDE(): string { /* DD.MM.YYYY */ }
  deToISO(dateDE: string): string { /* DD.MM.YYYY → YYYY-MM-DD */ }
  formatPrice(price: number): string { /* 1234.56 → "1.234,56" */ }
  parsePrice(priceDE: string): number | null { /* "1.234,56" → 1234.56 */ }
}
```

**Schritte:**
1. Erstelle Component
2. Schreibe TS-Code mit Datum-Logik und Zahlenformatierung
3. Implementiere Batch-Speichern-Logik

---

#### Task 3.5: Prices-Input Komponente (HTML & SCSS)

**Dateien:**
- `prices-input.component.html`
- `prices-input.component.scss`

**HTML-Template:**
- Datum-Picker (Input type="date" oder ng-Bootstrap Datepicker)
- Tabelle: Wertpapier-Name + Input-Feld für Kurs (DE-Format)
- Buttons: Speichern, Abbrechen

**Schritte:**
1. Schreibe HTML-Template
2. Schreibe SCSS
3. Teste: Datum-Wechsel lädt Kurse neu

---

#### Task 3.6: Unit-Tests für Securities-Form Komponente

**Beschreibung:** Schreibe `src/app/components/securities/securities-form/securities-form.component.spec.ts`.

**Test-Fälle:**
- Create-Modus: Form ist leer, speichern erstellt neues Wertpapier
- Edit-Modus: Form wird mit bestehenden Daten gefüllt, speichern aktualisiert
- Abbrechen: Navigation zu /securities ohne Speichern
- Validierung: ISIN/WKN Format
- Faelligkeit: Sichtbar bei Anleihe/Zertifikat, versteckt bei anderen

**Schritte:**
1. Erstelle spec.ts-Datei
2. Schreibe 5-6 Unit-Tests
3. Starte Tests: `npm test`

---

#### Task 3.7: Unit-Tests für Prices-Input Komponente

**Beschreibung:** Schreibe `src/app/components/securities/prices-input/prices-input.component.spec.ts`.

**Test-Fälle:**
- Init: Alle Wertpapiere werden geladen
- Datum-Wechsel: Kurse werden neu geladen
- Batch-Speichern: create + update + skip funktioniert korrekt
- Zahlenformatierung: DE-Format ↔ ISO-Format

**Schritte:**
1. Erstelle spec.ts-Datei
2. Schreibe 4-5 Unit-Tests
3. Starte Tests

---

### Phase 4: Routing & Navigation

#### Task 4.1: Routes registrieren

**Beschreibung:** Erweitere `src/app/app.routes.ts` um neue Routes.

**Datei:** `src/app/app.routes.ts`

**Code:**
```typescript
{
  path: 'securities',
  children: [
    { path: '', component: SecuritiesListComponent },
    { path: 'form', component: SecuritiesFormComponent },
    { path: 'form/:id', component: SecuritiesFormComponent },
    { path: 'prices', component: PricesInputComponent }
  ]
}
```

**Schritte:**
1. Öffne `src/app/app.routes.ts`
2. Füge neue Route hinzu
3. Teste: Router funktioniert (npm start)

---

#### Task 4.2: Navigation in Sidebar erweitern

**Beschreibung:** Erweitere die Navigations-Sidebar um "Wertpapiere"-Link.

**Datei:** `src/app/app.html` (oder Navigation-Komponente)

**Code:**
```html
<nav>
  <a routerLink="/accounts">Konten</a>
  <a routerLink="/bookings">Buchungen</a>
  <a routerLink="/securities">Wertpapiere</a>  <!-- NEU -->
</nav>
```

**Schritte:**
1. Öffne Navigation-Template
2. Füge "Wertpapiere"-Link hinzu
3. Teste: Navigation funktioniert

---

### Phase 5: Integrationstest & Cleanup

#### Task 5.1: Integrationstest – Ganzer Flow

**Beschreibung:** Teste den ganzen Flow manuell.

**Schritte:**
1. Starte die App: `npm start`
2. Navigiere zu "Wertpapiere"
3. Erstelle ein neues Wertpapier: "Apple Inc.", Aktie, ISIN=US0378331005, WKN=865985
4. Prüfe, dass es in der Liste angezeigt wird
5. Bearbeite das Wertpapier (z.B. Name ändern)
6. Gehe zu "Kurse", wähle heute als Datum
7. Gebe einen Kurs ein (z.B. 123,45), speichere
8. Prüfe, dass der Kurs in der Liste angezeigt wird
9. Gehe zurück zu "Kurse", ändere den Kurs, speichere
10. Prüfe, dass der neue Kurs angezeigt wird

---

#### Task 5.2: Fehlerfall-Tests

**Beschreibung:** Teste Fehler-Handling.

**Schritte:**
1. Erstelle zwei Wertpapiere mit gleicher ISIN → Error-Toast?
2. Gebe ungültiges Zahlenformat ein (z.B. "abc") → Error-Toast?
3. Gebe ungültige Datumsformate ein → Error-Toast?

---

#### Task 5.3: Build & Packagierung

**Beschreibung:** Packe die App für Distribution.

**Schritte:**
1. Starte Build: `npm run build`
2. Packe mit electron-builder: `npm run pack` oder `npm run dist`
3. Teste, dass die DMG/Executable läuft

---

#### Task 5.4: Cleanup & Dokumentation

**Beschreibung:** Räume auf und dokumentiere.

**Schritte:**
1. Entferne Debug-Logs
2. Formatiere Code (prettier, eslint)
3. Aktualisiere `docs/Architektur.md` um Securities-Modul
4. Committe: `git commit -m "feat: add securities management"`

---

## Implementierungs-Reihenfolge (Priorität)

**Kritischer Pfad (muss erst sein):**
1. Phase 1: DB & IPC (Tasks 1.1 - 1.7)
2. Phase 2: Models & Services (Tasks 2.1 - 2.4)
3. Phase 3: Komponenten (Tasks 3.1 - 3.5)
4. Phase 4: Routing (Tasks 4.1 - 4.2)

**Validierung & Finalisierung (parallel oder nach):**
5. Phase 2: Unit-Tests (Tasks 2.5 - 2.6)
6. Phase 3: Component-Tests (Tasks 3.6 - 3.7)
7. Phase 5: Integration (Tasks 5.1 - 5.4)

---

## Abhängigkeiten

```
Task 1.1 (DB-Schema)
  ↓
Task 1.2 (Securities DB)  →  Task 1.4 (Securities IPC)  →  Task 1.7 (Preload)
  ↓
Task 1.3 (Prices DB)      →  Task 1.5 (Prices IPC)      →  Task 1.7 (Preload)
                                     ↓
Task 1.6 (Register IPC in main.ts)

Task 2.1 (Security Model)  →  Task 2.3 (Securities Service)  →  Task 3.1 (List Component)
Task 2.2 (Price Model)     →  Task 2.4 (Prices Service)      →  Task 3.4 (Prices Component)

Task 3.1 (List)            →  Task 3.2 (Form)  →  Task 3.4 (Prices)

Task 3.1 + 3.2 + 3.4 (alle Components)  →  Task 4.1 (Routing) + Task 4.2 (Navigation)
```

---

## Testing-Strategie

**Unit-Tests:**
- Services (Tasks 2.5, 2.6)
- Components (Tasks 3.6, 3.7)
- Laufe mit: `npm test`

**Integration-Tests:**
- Ganz-Flow Test (Task 5.1)
- Fehler-Handling (Task 5.2)
- Manuell im Dev-Server

**Build-Validierung:**
- `npm run build`
- `npm run pack` / `npm run dist`
- Teste packaged App

---

## Commits nach jedem Task

```bash
# Nach Task 1.7
git commit -m "feat: add securities & prices database layer + IPC"

# Nach Task 2.4
git commit -m "feat: add securities & prices services"

# Nach Task 3.5
git commit -m "feat: add securities UI components"

# Nach Task 4.2
git commit -m "feat: add securities routing & navigation"

# Nach Task 5.3
git commit -m "feat: build & test securities feature"
```

---

**Status:** ✅ Plan bereit zur Ausführung
