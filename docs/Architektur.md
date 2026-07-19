# Architektur

## Überblick

Desktop-Applikation "Slowen" zur persönlichen Finanzverwaltung mit:
- Kontenverwaltung (Bestand & GuV)
- Transaktionsverwaltung
- Wertpapierverwaltung
- CSV-Import
- Reports mit Charts

**Plattform:** Mac OS
**Sprache:** Deutsch (Datums-/Zahlenformat)

## Tech Stack

| Komponente | Technologie |
|------------|-------------|
| Frontend | Angular 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Desktop | Electron |
| Datenbank | better-sqlite3 |
| Charts | Chart.js / ng2-charts |
| Build | electron-builder |
| Testing | Jasmine/Karma |

## Projektstruktur

```
slowen/                          # Angular Frontend
├── src/
│   └── app/
│       ├── components/
│       ├── services/
│       └── models/
├── electron/                    # Electron-spezifisch
│   ├── database/
│   │   ├── connection.ts
│   │   └── accounts.ts
│   ├── ipc/
│   │   └── accounts.ipc.ts
│   └── preload/
│       └── preload.ts
├── docs/                        # Dokumentation
│   └── Architektur.md
└── package.json
```

## Datenbank

### accounts

| Feld | Typ | Constraints | Beschreibung |
|------|-----|-------------|--------------|
| id | INTEGER | PK, AUTOINCREMENT | Eindeutige ID |
| name | TEXT | NOT NULL | Kontoname |
| type | TEXT | NOT NULL, IN ('Bestand', 'GuV') | Kontotyp |
| subtype | TEXT | NOT NULL | Subtyp (abhängig von Type) |
| iban | TEXT | OPTIONAL | IBAN (nur bei Giro/Tagesgeld/Depot) |
| notes | TEXT | OPTIONAL | Notizen |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Erstellungsdatum |

### Subtyp-Definitionen

**Bestand:**
- Giro
- Tagesgeld
- Depot
- Immobilie
- Versicherung
- Forderung
- Verbindlichkeit

**GuV:**
- Kreditkarte

## IPC Events

### Naming Convention

```
{ressource}:{aktion}
```

### Event-Übersicht

#### Accounts

| Event | Richtung | Beschreibung |
|-------|----------|--------------|
| accounts:getAll | Renderer → Main | Alle Konten abrufen |
| accounts:getById | Renderer → Main | Einzelnes Konto |
| accounts:create | Renderer → Main | Neues Konto anlegen |
| accounts:update | Renderer → Main | Konto aktualisieren |
| accounts:delete | Renderer → Main | Konto löschen |

## Build & Development

### Scripts

```bash
# Development
npm run start              # Electron + Angular dev server
npm run build              # Build Angular App
npm run electron:dev       # Electron im Dev-Modus

# Production
npm run build:prod         # Production Build
npm run dist               # Electron Package erstellen

# Testing
npm run test               # Jasmine/Karma Tests
npm run lint               # TypeScript Linting
```

## Testing

### Test-Arten

| Art | Werkzeug | Beschreibung |
|-----|----------|--------------|
| Unit Tests | Jasmine | Komponenten/Services testen |
| Integration | Karma | IPC-Handler testen |

### Test-Struktur

```
src/
├── electron/
│   └── database/
│       └── accounts.spec.ts
└── app/
    └── components/
        └── *.component.spec.ts
```

### Durchführung

- Vor jedem Commit: `npm run test`
- Vor Release: Vollständiger Testlauf + Build
