# Wertpapiere-Verwaltung – Design-Dokument

**Datum:** 25.07.2026  
**Feature:** Wertpapier-Katalog mit Kurs-Historie Management  
**Status:** Design genehmigt, bereit zur Implementierung

---

## 1. Überblick

Die Wertpapiere-Verwaltung ist ein **Stammdaten-Katalog** (nicht gebunden an Depot-Konten) für die Verwaltung von Wertpapieren und deren Kurs-Historien.

**Hauptzweck:**
- Zentraler Katalog von Wertpapieren mit standardisierten Identifikatoren (ISIN, WKN)
- Verwaltung der Kurs-Geschichte (ein Kurs pro Wertpapier pro Tag)
- Foundation für spätere Position-Management (Bestand × Wertpapier)

---

## 2. Datenbank-Schema

### 2.1 Tabelle `securities`

```sql
CREATE TABLE securities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('Aktie', 'Anleihe', 'Fonds', 'ETF', 'Zertifikat')),
  isin TEXT NOT NULL UNIQUE,
  wkn TEXT NOT NULL UNIQUE,
  faelligkeit TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**Felder:**
- `id`: Eindeutige Identifier (PK, Auto-Increment)
- `name`: Wertpapier-Name (z.B. "Apple Inc.", "Bundesanleihe 2030")
- `type`: Enum aus {Aktie, Anleihe, Fonds, ETF, Zertifikat}
- `isin`: ISIN (International Securities Identification Number) – eindeutig, 12 alphanumerische Zeichen
- `wkn`: WKN (Wertpapierkennnummer) – eindeutig, 6 alphanumerische Zeichen
- `faelligkeit`: Optional; nur relevant für Anleihen und Zertifikate (Format: YYYY-MM-DD)
- `created_at`: Erstellungsdatum (ISO 8601)
- `updated_at`: Letzte Änderung (ISO 8601)

**Constraints & Besonderheiten:**
- ISIN und WKN sind eindeutig (UNIQUE), um Duplikate zu vermeiden
- Wertpapiere können **nicht gelöscht** werden, nur korrigiert
- `updated_at` wird bei Korrekturen aktualisiert (für Audit-Trail)

---

### 2.2 Tabelle `security_prices`

```sql
CREATE TABLE security_prices (
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

**Felder:**
- `id`: Eindeutige Identifier (PK, Auto-Increment)
- `security_id`: Fremdschlüssel zu `securities.id`
- `date`: Datum (ISO 8601, Format: YYYY-MM-DD)
- `price`: Kurs als Dezimalzahl (z.B. 123.45)
- `created_at`: Erstellungsdatum
- `updated_at`: Letzte Änderung

**Constraints & Besonderheiten:**
- `UNIQUE(security_id, date)` verhindert Duplikate pro Tag/Wertpapier
- Kurse können **nicht gelöscht** werden, nur korrigiert
- `updated_at` wird bei Korrektionen aktualisiert

---

## 3. Datenbank-Layer (Electron)

### 3.1 `electron/database/securities.ts`

**Verantwortung:** CRUD für Wertpapiere

```typescript
interface Security {
  id: number;
  name: string;
  type: 'Aktie' | 'Anleihe' | 'Fonds' | 'ETF' | 'Zertifikat';
  isin: string;
  wkn: string;
  faelligkeit?: string; // YYYY-MM-DD, optional
  created_at: string;
  updated_at: string;
}

// Funktionen:
- createSecurity(security: Omit<Security, 'id' | 'created_at' | 'updated_at'>): Security
  → Erstelle ein neues Wertpapier
  → Wirft Error, falls ISIN/WKN bereits existiert
  → Gibt das neu erstellte Wertpapier zurück (inkl. id)

- getAllSecurities(): Security[]
  → Alle Wertpapiere, sortiert nach name

- getSecurityById(id: number): Security | null
  → Ein Wertpapier per ID oder null

- updateSecurity(id: number, updates: Partial<Security>): Security
  → Aktualisiere einzelne Felder
  → Wirft Error bei ISIN/WKN-Duplikaten (außer dem aktuellen Wertpapier)
  → Setzt updated_at automatisch
```

---

### 3.2 `electron/database/security-prices.ts`

**Verantwortung:** CRUD für Kurse

```typescript
interface SecurityPrice {
  id: number;
  security_id: number;
  date: string; // YYYY-MM-DD
  price: number;
  created_at: string;
  updated_at: string;
}

// Funktionen:
- createPrice(security_id: number, date: string, price: number): SecurityPrice
  → Erstelle einen neuen Kurs
  → Wirft Error, falls security_id nicht existiert

- getPriceBySecurityAndDate(security_id: number, date: string): SecurityPrice | null
  → Hole Kurs für ein bestimmtes Wertpapier an einem Tag

- getPricesByDate(date: string): SecurityPrice[]
  → Alle Kurse für einen Tag

- updatePrice(security_id: number, date: string, price: number): SecurityPrice
  → Aktualisiere Kurs (eindeutig identifiziert durch security_id + date)
  → Setzt updated_at automatisch

- getLatestPriceBySecurityId(security_id: number): SecurityPrice | null
  → Neuester Kurs eines Wertpapiers (für Anzeige in Wertpapier-Liste)
```

---

## 4. IPC-Events (Electron Main Process)

### 4.1 `electron/ipc/securities.ipc.ts`

| Event | Parameter | Return | Beschreibung |
|-------|-----------|--------|-------------|
| `securities:create` | `{ name, type, isin, wkn, faelligkeit? }` | `Security` | Neues Wertpapier |
| `securities:getAll` | – | `Security[]` | Alle Wertpapiere |
| `securities:getById` | `{ id }` | `Security \| null` | Ein Wertpapier |
| `securities:update` | `{ id, updates: { name?, type?, ... } }` | `Security` | Aktualisiere Wertpapier |

---

### 4.2 `electron/ipc/security-prices.ipc.ts`

| Event | Parameter | Return | Beschreibung |
|-------|-----------|--------|-------------|
| `security-prices:create` | `{ security_id, date, price }` | `SecurityPrice` | Neuer Kurs |
| `security-prices:getBySecurityAndDate` | `{ security_id, date }` | `SecurityPrice \| null` | Kurs für Tag |
| `security-prices:getByDate` | `{ date }` | `SecurityPrice[]` | Alle Kurse an Tag |
| `security-prices:update` | `{ security_id, date, price }` | `SecurityPrice` | Aktualisiere Kurs |
| `security-prices:getLatest` | `{ security_id }` | `SecurityPrice \| null` | Neuester Kurs |

---

### 4.3 `electron/preload/preload.ts` – erweitert

```typescript
// Neue API-Namespaces
window.api.securities = {
  create(...),
  getAll(...),
  getById(...),
  update(...)
}

window.api.securityPrices = {
  create(...),
  getBySecurityAndDate(...),
  getByDate(...),
  update(...),
  getLatest(...)
}
```

---

## 5. Angular Services (Frontend)

### 5.1 `src/app/services/securities.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class SecuritiesService {
  // Nutzt window.api.securities (Preload-API)
  
  createSecurity(security: Omit<Security, 'id' | 'created_at' | 'updated_at'>): Promise<Security>
  getAllSecurities(): Promise<Security[]>
  getSecurityById(id: number): Promise<Security | null>
  updateSecurity(id: number, updates: Partial<Security>): Promise<Security>
}
```

---

### 5.2 `src/app/services/security-prices.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class SecurityPricesService {
  // Nutzt window.api.securityPrices (Preload-API)
  
  createPrice(security_id: number, date: string, price: number): Promise<SecurityPrice>
  getPriceBySecurityAndDate(security_id: number, date: string): Promise<SecurityPrice | null>
  getPricesByDate(date: string): Promise<SecurityPrice[]>
  updatePrice(security_id: number, date: string, price: number): Promise<SecurityPrice>
  getLatestPriceBySecurityId(security_id: number): Promise<SecurityPrice | null>
}
```

---

## 6. Angular Komponenten

### 6.1 Komponenten-Struktur

```
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
  ├── prices-input/
  │   ├── prices-input.component.ts
  │   ├── prices-input.component.html
  │   ├── prices-input.component.scss
  │   └── prices-input.component.spec.ts
  └── prices-input/
      └── (Komponente siehe 6.3)
```

---

### 6.2 `securities-list/` – Wertpapier-Katalog

**Funktionalität:**
- Zeige alle Wertpapiere in einer Tabelle an
- Spalten: `name`, `typ`, `isin`, `wkn`, `faelligkeit`, `jüngster Kurs`
- Drei Buttons:
  1. **"Neu"** → Navigate zu `/securities/form` (Create-Modus)
  2. **Edit-Icon pro Zeile** → Navigate zu `/securities/form/:id` (Edit-Modus)
  3. **"Kurse"** → Navigate zu `/securities/prices`

**Data Flow:**
- Beim Init: `SecuritiesService.getAllSecurities()` → Liste laden
- Für jeden Security: `SecurityPricesService.getLatestPriceBySecurityId(security_id)` → neuesten Kurs holen
- Tabelle mit allen Wertpapieren anzeigen

---

### 6.3 `securities-form/` – Erfassung & Bearbeitung

**Routes:**
- `/securities/form` → Create-Modus (neues Wertpapier)
- `/securities/form/:id` → Edit-Modus (bestehendes Wertpapier)

**Form-Felder:**
- `name` (Text, required)
- `typ` (Dropdown: Aktie, Anleihe, Fonds, ETF, Zertifikat; required)
- `isin` (Text, 12 Zeichen, alphanumerisch; required; Duplikat-Prüfung)
- `wkn` (Text, 6 Zeichen, alphanumerisch; required; Duplikat-Prüfung)
- `faelligkeit` (Datum DD.MM.YYYY; optional; nur sichtbar wenn typ ∈ {Anleihe, Zertifikat})

**Validierung:**
- ISIN: Format 12 alphanumerische Zeichen
- WKN: Format 6 alphanumerische Zeichen
- Duplikat-Prüfung: Server-seitig (DB werft Error) → Fehler-Toast
- Im Edit-Modus: Duplikat desselben Wertpapiers ist erlaubt (Update)

**Buttons:**
- **"Speichern"**
  - Create: `SecuritiesService.createSecurity()` → Toast "Wertpapier erstellt" → Navigate zu `/securities`
  - Edit: `SecuritiesService.updateSecurity()` → Toast "Wertpapier aktualisiert" → Navigate zu `/securities`
- **"Abbrechen"** → Navigate zu `/securities` (ohne Speichern)

---

### 6.4 `prices-input/` – Kurse für ein Datum erfassen

**Funktionalität:**
- Datum-Picker (DD.MM.YYYY Format)
- Liste aller Wertpapiere mit Input-Feld für Kurs
- Beim Datum-Wechsel: Lade Kurse neu für das neue Datum

**Logic:**
1. Benutzer wählt Datum
2. Lade alle Wertpapiere: `SecuritiesService.getAllSecurities()`
3. Für jeden Security: `SecurityPricesService.getPriceBySecurityAndDate(security_id, date)`
   - Falls Kurs existiert → Zeige ihn in Input-Feld (editierbar)
   - Falls kein Kurs → Input-Feld leer
4. Benutzer gibt Kurse ein oder bearbeitet bestehende

**Batch-Speichern:**
- Beim "Speichern"-Button:
  - Iteriere über alle Wertpapiere:
    - Input leer & kein bisheriger Kurs → Skip
    - Input gefüllt & kein bisheriger Kurs → `SecurityPricesService.createPrice()`
    - Input gefüllt & bisheriger Kurs → `SecurityPricesService.updatePrice()`
  - Nach Speicherung → Toast "Kurse gespeichert" → Navigate zu `/securities`

**Buttons:**
- **"Speichern"** → Batch-Update (siehe oben) → Navigate zu `/securities`
- **"Abbrechen"** → Navigate zu `/securities` (ohne Speichern)

**Formatierung:**
- Input: Deutsche Zahlenformat mit Komma (z.B. `1.234,56`)
- Intern: Umrechnung zu ISO-Format (Punkt als Dezimaltrennzeichen) für DB-Speicherung
- Fehlerbehandlung: Invalid-Format-Fehler → User-Meldung

---

## 7. Routing

**Neue Routes in `src/app/app.routes.ts`:**

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

**Navigation:**
- Sidebar: Neuer Link "Wertpapiere" → `/securities`

---

## 8. Formatierung & Lokalisierung

### 8.1 Datumsformat

- **UI (Benutzer-eingabe):** DD.MM.YYYY (z.B. `25.07.2026`)
- **Intern (DB & IPC):** YYYY-MM-DD (ISO 8601, z.B. `2026-07-25`)
- **Angular Pipe:** `DatePipe` mit `locale: 'de'`

### 8.2 Zahlenformat

- **UI (Anzeige & Eingabe):** Deutsche Konvention
  - Dezimaltrennzeichen: Komma (`,`)
  - Tausender-Trennzeichen: Punkt (`.`)
  - Beispiel: `1.234,56`
- **Intern (DB & IPC):** ISO-Format mit Punkt (`.`)
  - Beispiel: `1234.56`
- **Angular Pipe:** `DecimalPipe` mit `locale: 'de'`

---

## 9. Fehlerbehandlung

### 9.1 Validierungen

| Fehler | Ursache | Benutzer-Meldung |
|--------|--------|-----------------|
| ISIN-Duplikat | Wertpapier mit dieser ISIN existiert | "ISIN existiert bereits" |
| WKN-Duplikat | Wertpapier mit dieser WKN existiert | "WKN existiert bereits" |
| Ungültiges ISIN-Format | Nicht 12 alphanumerisch | "ISIN muss 12 Zeichen sein" |
| Ungültiges WKN-Format | Nicht 6 alphanumerisch | "WKN muss 6 Zeichen sein" |
| Ungültiges Zahlenformat | Kurs nicht als Dezimalzahl | "Ungültiges Zahlenformat" |
| Foreign Key Error | security_id nicht vorhanden | "Wertpapier nicht gefunden" |

### 9.2 Error Handling in Komponenten

- **IPC-Fehler:** Toast-Notification mit Fehlermeldung
- **Duplikat-Fehler:** Inline-Validierung unter dem Feld
- **Netzwerk-Fehler:** Retry-Logik (max. 3 Versuche), dann Toast-Fehler

---

## 10. Testing-Strategie

### 10.1 Unit Tests (Jasmine)

- **`securities.service.spec.ts`**
  - Mocking der Preload-API
  - CRUD-Funktionen testen

- **`security-prices.service.spec.ts`**
  - Mocking der Preload-API
  - Preis-Abfragen testen

- **`securities-form.component.spec.ts`**
  - Form-Validierung (ISIN, WKN, Duplikate)
  - Create- und Edit-Modus
  - Navigation nach Speichern/Abbrechen

- **`prices-input.component.spec.ts`**
  - Datum-Wechsel → Kurse neu laden
  - Batch-Speichern (Create + Update + Skip)
  - Zahlenformat-Konvertierung (DE ↔ ISO)

### 10.2 Integration Tests

- IPC-Communication testen (Electron-Main ↔ Preload ↔ Angular)
- DB-Operationen mit echtem better-sqlite3

---

## 11. Implementierungs-Reihenfolge

1. **DB-Layer** (securities.ts, security-prices.ts)
2. **IPC-Events** (securities.ipc.ts, security-prices.ipc.ts, preload.ts)
3. **Angular Services** (securities.service.ts, security-prices.service.ts)
4. **Komponenten** in dieser Reihenfolge:
   - `securities-form/` (einfach, keine Dependencies)
   - `securities-list/` (hängt ab von securities.service)
   - `prices-input/` (hängt ab von beiden Services)
5. **Routing & Navigation**
6. **Tests**

---

## 12. Zusammenfassung

**Feature-Scope:** Wertpapier-Katalog mit Kurs-Historie  
**Tech-Stack:** Angular 19, Electron, better-sqlite3, TypeScript  
**DB-Tabellen:** `securities`, `security_prices`  
**Komponenten:** 3 (Liste, Form, Preis-Input)  
**Services:** 2 (Securities, SecurityPrices)  
**Routes:** 4 (`/securities`, `/securities/form`, `/securities/form/:id`, `/securities/prices`)

---

**Status:** ✅ Design genehmigt – bereit zur Implementierung
