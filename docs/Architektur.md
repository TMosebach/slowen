# Architektur

## Überblick

Desktop-Applikation "Slowen" zur persönlichen Finanzverwaltung mit:
- Kontenverwaltung (Bestand & GuV)
- Transaktions- und Buchungsverwaltung
- Wertpapierverwaltung (Kauf, Verkauf, FIFO-Bestandsführung, Kurspflege)
- CSV-Import (Umsätze und Depot-Bestände externer Banken wie ING, Comdirect, Deutsche Bank)
- Reports und Auswertungen

**Plattform:** Desktop (Electron, macOS / Windows / Linux)  
**Sprache:** Deutsch (UI-Darstellung, Datums- und Zahlenformate)

## Tech Stack

| Komponente | Technologie |
|------------|-------------|
| Frontend | Angular 21 (Standalone Components, TypeScript) |
| Styling | Tailwind CSS v4, SCSS |
| Desktop-Container | Electron |
| Datenbank | SQLite via `better-sqlite3` (WAL-Modus, Foreign Keys aktiv) |
| Testing | Vitest (Frontend via `@angular/build`, Electron/DB via Node-Runtime) |
| Build & Packaging | Angular CLI (`ng build`), TypeScript Compiler (`tsc`), `electron-builder` |

## Projektstruktur

```
slowen/
├── src/                                  # Angular Frontend
│   └── app/
│       ├── components/                   # UI-Komponenten (Dashboard, Accounts, Bookings, Securities, Import)
│       ├── services/                     # Angular Services & Import-Parser
│       │   └── import/                   # CSV-Parsing & Bank-Parser (ING, Comdirect, Deutsche Bank)
│       ├── models/                       # TypeScript-Datenmodelle
│       ├── electron-api.d.ts             # IPC-API-Typdefinitionen
│       ├── app.routes.ts                 # Routing
│       └── app.html                      # Hauptlayout mit Navigation
├── electron/                             # Electron Backend (Main-Process)
│   ├── database/                         # SQLite-Zugriffsschicht (accounts, bookings, securities, prices, fifo)
│   ├── ipc/                              # IPC-Handler (accounts.ipc, bookings.ipc, securities.ipc, etc.)
│   └── preload/                          # Context-Bridge (window.electronAPI)
├── docs/                                 # Projektdokumentation
│   ├── Architektur.md                    # Diese Architekturdokumentation
│   └── use-cases/                        # Fachliche Use-Case-Spezifikationen
└── package.json
```

---

## Datums- und Zahlenformate (Architektur & Konventionen)

Slowen folgt dem Architekturprinzip einer **strikten Trennung zwischen internen Repräsentationen (Persistenz, Logik, IPC) und externen Repräsentationen (UI-Darstellung, Daten-Ingress)**.

### Übersicht der Formate

| Bereich | Format | Beispiel | Verantwortung / Details |
|---|---|---|---|
| **Datenbank (SQLite)** | ISO 8601 (`YYYY-MM-DD`) | `2026-08-03` | `TEXT NOT NULL`; lexikografisch sortierbar (`ORDER BY date DESC`) |
| **Timestamps (DB)** | ISO 8601 UTC | `2026-08-03T14:30:00.000Z` | `CURRENT_TIMESTAMP` bzw. ISO-String |
| **Domänenmodelle (TS)** | ISO 8601 (`YYYY-MM-DD`) | `'2026-08-03'` | `Booking.date`, `BookingPosition.valuta`, `SecurityPrice.date` |
| **UI-Präsentation** | Deutsches Datumsformat (`DD.MM.YYYY`) | `03.08.2026` | Tabellen, Übersichten, Detailkarten via Pipes/Formatierer |
| **UI-Formulareingabe** | ISO 8601 (`YYYY-MM-DD`) | `2026-08-03` | `<input type="date">` bindet intern ISO-Wert, Browser lokalisiert Darstellung |
| **CSV-Import (Ingress)** | Bankenspezifisch $\rightarrow$ ISO 8601 | `3.8.2026` $\rightarrow$ `2026-08-03` | Sofortige Normalisierung am Systemrand über `parseDateToIso()` |
| **Währungsbeträge (UI)** | Deutsches Währungsformat | `1.234,56 €` | Zwei Nachkommastellen, Tausendertrennpunkt, Komma als Dezimaltrenner |

### Schichtenmodell & Datenfluss

```
┌───────────────────────────────────────────────────────────────────────┐
│ UI-Präsentation (Frontend-Views)                                      │
│  - Tabellenanzeige: Deutsches Format DD.MM.YYYY (z. B. 03.08.2026)    │
│  - Formularfelder: <input type="date"> (Zwei-Wege-Bindung an ISO)     │
│  - Geldbeträge: Deutsches Zahlenformat (z. B. 1.250,50 €)            │
└───────────────────────────────────┬───────────────────────────────────┘
                                    │ (Angular DatePipe / Locale-Format)
┌───────────────────────────────────┴───────────────────────────────────┐
│ Anwendungslogik & TypeScript-Modelle (Frontend & Backend)             │
│  - Booking.date, BookingPosition.valuta, SecurityPrice.date           │
│  - String im ISO-Format: YYYY-MM-DD                                   │
│  - Datumsvergleiche: Direkt & lexikografisch (d1.localeCompare(d2))   │
│  - FIFO-Lot-Matching & Zeitreihenberechnungen                         │
└───────────────────────────────────┬───────────────────────────────────┘
                                    │
┌───────────────────────────────────┴───────────────────────────────────┐
│ Schnittstellen-Ingress (CSV-Import / Parser)                          │
│  - Erkennt: DD.MM.YYYY, D.M.YYYY, DD.MM.YY, YYYY-MM-DD                │
│  - Wandelt sofort in ISO 8601 (YYYY-MM-DD) um                         │
│  - Kein bankenspezifisches Datumsformat verlässt die Ingress-Schicht  │
└───────────────────────────────────┬───────────────────────────────────┘
                                    │
┌───────────────────────────────────┴───────────────────────────────────┐
│ Persistenzschicht (SQLite / better-sqlite3)                           │
│  - Datumsspalten: TEXT NOT NULL (YYYY-MM-DD)                          │
│  - Indexe & Sortierung: Direkte SQL-Sortierung ohne Type-Casting      │
└───────────────────────────────────────────────────────────────────────┘
```

### Richtlinien & Regeln

1. **Keine proprietären Datumsformate in internen Modellen:**
   Properties wie `date` oder `valuta` enthalten im Code ausnahmslos ISO 8601 Strings (`YYYY-MM-DD`).
2. **Sortierbarkeit:**
   Da ISO 8601 Strings im Format `YYYY-MM-DD` lexikografisch chronologisch sortierbar sind, können sie in SQL (`ORDER BY date ASC/DESC`) und TypeScript (`a.date.localeCompare(b.date)`) direkt verglichen werden.
3. **Konvertierung am Systemrand:**
   Alle externen Quellen (CSV-Dateien, API-Schnittstellen) werden unmittelbar beim Einlesen normalisiert.
4. **Präsentation für den Anwender:**
   In allen Listen, Tabellen und Vorschauansichten wird das für den deutschsprachigen Raum vertraute Format `DD.MM.YYYY` (bzw. `DD.MM.YYYY HH:mm` bei Zeitstempeln) angezeigt.

---

## Datenbankmodell

### accounts
| Feld | Typ | Constraints | Beschreibung |
|------|-----|-------------|--------------|
| id | INTEGER | PK, AUTOINCREMENT | Eindeutige ID |
| name | TEXT | NOT NULL | Kontoname |
| type | TEXT | NOT NULL, IN ('Bestand', 'GuV') | Kontotyp |
| subtype | TEXT | NOT NULL | Subtyp (abhängig von Type) |
| iban | TEXT | OPTIONAL | IBAN (nur bei Giro/Tagesgeld/Depot) |
| notes | TEXT | OPTIONAL | Notizen |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Erstellungszeitpunkt (ISO) |

### bookings
| Feld | Typ | Constraints | Beschreibung |
|------|-----|-------------|--------------|
| id | INTEGER | PK, AUTOINCREMENT | Eindeutige ID |
| vorgang | TEXT | NOT NULL, IN ('Buchung', 'Kauf', 'Verkauf') | Buchungsvorgang |
| date | TEXT | NOT NULL | Buchungsdatum (ISO 8601: YYYY-MM-DD) |
| description | TEXT | OPTIONAL | Verwendungszweck / Buchungstext |
| sender_receiver | TEXT | OPTIONAL | Beteiligte Gegenstelle |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Erstellungszeitpunkt (ISO) |

### booking_positions
| Feld | Typ | Constraints | Beschreibung |
|------|-----|-------------|--------------|
| id | INTEGER | PK, AUTOINCREMENT | Eindeutige ID |
| booking_id | INTEGER | FK -> bookings(id) ON DELETE CASCADE | Zugehörige Buchung |
| account_id | INTEGER | FK -> accounts(id) | Zugeordnetes Konto |
| valuta | TEXT | NOT NULL | Wertstellungsdatum (ISO 8601: YYYY-MM-DD) |
| amount | REAL | NOT NULL | Betrag (Fließkommazahl) |

---

## IPC Schnittstellen

### Naming Convention
```
{ressource}:{aktion}
```

### Wichtigste Handler
* `accounts:*` (`getAll`, `getById`, `create`, `update`, `delete`)
* `bookings:*` (`getAll`, `getById`, `create`, `update`, `delete`)
* `securities:*` (`getAll`, `getById`, `create`, `update`, `delete`)
* `security-prices:*` (`create`, `update`, `getBySecurityAndDate`, `getByDate`)
* `depot-positions:*` (`getAllByDepot`)

---

## Build & Testing

### Test-Ausführung
```bash
# Frontend Unit-Tests (Vitest via Angular CLI)
npm test

# Electron / SQLite Backend-Tests
npm run test:electron
```

### Build-Befehle
```bash
# Angular Frontend kompilieren
npm run build

# Electron TypeScript kompilieren
npm run build:electron

# Gesamtanwendung im Entwicklungsmodus starten
npm start
```
