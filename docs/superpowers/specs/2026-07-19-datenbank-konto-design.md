# Datenbank + Konto anlegen Design

## Überblick

Implementierung des Datenbank-Schemas für Accounts und des Use-Case "Konto anlegen" mit:
- SQLite Datenbank mit better-sqlite3
- Angular Frontend mit Account List + Form
- Side Navigation Layout
- IPC Integration

## Datenbank-Schema

### accounts

```sql
CREATE TABLE accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Bestand', 'GuV')),
  subtype TEXT NOT NULL,
  iban TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Validierungsregeln

| Feld | Regel |
|------|-------|
| name | Pflichtfeld, Mindestlänge 3 Zeichen |
| type | Pflichtfeld, Enum: 'Bestand', 'GuV' |
| subtype | Pflichtfeld, abhängig von type |
| iban | Optional, nur bei type=Bestand + subtype=Giro/Tagesgeld/Depot |
| notes | Optional |

### Subtyp-Definitionen

**Bestand:** Giro, Tagesgeld, Depot, Immobilie, Versicherung, Forderung, Verbindlichkeit

**GuV:** Kreditkarte

## Angular Komponenten

```
src/app/
├── components/
│   ├── accounts/
│   │   ├── account-list/      # Konten-Liste
│   │   ├── account-form/      # Konto anlegen/bearbeiten
│   │   └── account.service.ts # IPC Bridge
├── models/
│   └── account.model.ts       # Account Interface
└── app.routes.ts              # Routing
```

## Layout & Routing

**Layout:**
```
┌─────────────────────────────────────────┐
│ Header (Slowen)                         │
├──────────┬──────────────────────────────┤
│ Sidebar  │ Content                      │
│          │                              │
│ Konten   │ (Account List / Form)        │
│          │                              │
└──────────┴──────────────────────────────┘
```

**Routes:**
- `/accounts` → Account List
- `/accounts/new` → Konto anlegen

## IPC Integration

**Preload API (bereits vorhanden):**
```typescript
window.electronAPI.accounts.getAll()
window.electronAPI.accounts.create(account)
window.electronAPI.accounts.getById(id)
window.electronAPI.accounts.update(id, account)
window.electronAPI.accounts.delete(id)
```

**Account Service (Angular):**
```typescript
@Injectable({ providedIn: 'root' })
export class AccountService {
  getAll() { return window.electronAPI.accounts.getAll(); }
  getById(id: number) { return window.electronAPI.accounts.getById(id); }
  create(account: Account) { return window.electronAPI.accounts.create(account); }
  update(id: number, account: Account) { return window.electronAPI.accounts.update(id, account); }
  delete(id: number) { return window.electronAPI.accounts.delete(id); }
}
```

## Testing

**Unit Tests:**
- Account Service: IPC-Aufrufe testen
- Account Form: Validierung testen
- Account List: Darstellung testen

**Integration:**
- IPC Handler mit Datenbank testen
