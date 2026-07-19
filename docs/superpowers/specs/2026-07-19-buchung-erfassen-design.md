# Buchung Erfassen - Design Spec

## Beschreibung

Implementierung der Buchungserfassung für Slowen. Der Anwender kann Buchungen mit dynamischen Positionen anlegen, bearbeiten und löschen.

## Architektur

```
src/app/
├── models/
│   ├── account.model.ts          (bestehend)
│   └── booking.model.ts          (NEU)
├── services/
│   ├── account.service.ts        (bestehend)
│   └── booking.service.ts        (NEU)
├── components/
│   ├── accounts/                 (bestehend)
│   └── bookings/                 (NEU)
│       ├── booking-list/
│       └── booking-form/
├── app.routes.ts                 (ERWEITERT)
└── app.html                      (ERWEITERT)

electron/
├── database/
│   ├── connection.ts             (ERWEITERT)
│   ├── accounts.ts               (bestehend)
│   └── bookings.ts               (NEU)
└── ipc/
    ├── accounts.ipc.ts           (bestehend)
    └── bookings.ipc.ts           (NEU)
```

## Datenmodell

### SQL Tabellen

```sql
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vorgang TEXT NOT NULL CHECK (vorgang IN ('Buchung')),
  date TEXT NOT NULL,
  description TEXT,
  sender_receiver TEXT
);

CREATE TABLE booking_positions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  account_id INTEGER NOT NULL,
  valuta TEXT NOT NULL,
  amount REAL NOT NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);
```

### TypeScript Models

```typescript
// booking.model.ts
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

## IPC Handler

```
electron/ipc/bookings.ipc.ts
├── bookings:getAll        → Booking[] (mit Positionen)
├── bookings:getById       → Booking (mit Positionen)
├── bookings:create        → Booking (mit Positionen)
├── bookings:update        → Booking (mit Positionen)
└── bookings:delete        → void (CASCADE löscht Positionen)
```

- `create` und `update` atomar: Booking + alle Positionen in einer Transaktion
- `getAll` liefert Bookings mit zusammengefassten Positionen
- `delete` nutzt CASCADE für automatisches Löschen der Positionen

## Angular Komponenten

### BookingListComponent

- Tabelle mit Spalten: Vorgang, Datum, Beschreibung, Sender/Empfänger
- "Neue Buchung" Button oben rechts
- "Bearbeiten" + "Löschen" in Aktionen-Spalte
- Loading/Error/Empty States

### BookingFormComponent

- Felder: Vorgang (Dropdown), Datum (Date-Picker), Beschreibung (Text), Sender/Empfänger (Text)
- Positionen-Tabelle: Konto (Dropdown), Valuta (Date-Picker), Betrag (Number)
- Valuta wird mit Buchungsdatum vorbelegt (bei neuer Position und bei Änderung des Buchungsdatums)
- Plus-Button: Neue Position hinzufügen (Valuta = aktuelles Buchungsdatum)
- Löschen-Button pro Position
- Erste Position immer sichtbar (nicht löschbar)
- Buttons: "Buchen" (speichern) + "Abbrechen" (zurück zur Liste)
- Validierung: Alle Pflichtfelder prüfen, Fehlermeldungen anzeigen

## Routing

```
/bookings          → BookingListComponent
/bookings/new      → BookingFormComponent
/bookings/:id/edit → BookingFormComponent
```

## Navigation

```html
<nav>
  <a routerLink="/bookings">Buchungen</a>
  <a routerLink="/accounts">Konten</a>
</nav>
```

"Buchungen" erscheint oberhalb von "Konten" in der Sidebar.

## Fehlerbehandlung

### Frontend-Validierung

- Pflichtfelder: Vorgang, Datum, mindestens 1 Position
- Pro Position: Konto, Valuta, Betrag
- Fehlermeldungen direkt am Feld oder als Summary
- "Buchen"-Button deaktiviert solange Validierung fehlschlägt

### Backend-Validierung (SQLite)

- Foreign Key Constraints: account_id muss existieren
- NOT NULL Constraints auf Pflichtfelder
- Bei Fehler: Transaktion abbrechen, Fehler an Frontend

### Fehlermeldungen

- IPC-Fehler: "Fehler beim Speichern der Buchung"
- Lade-Fehler: "Buchungen konnten nicht geladen werden"
- Löschen-Fehler: "Buchung konnte nicht gelöscht werden"

## UI-Hinweise

- Vorgang: Dropdown mit Enum-Werten, derzeit mit "Buchung" vorbelegt
- Datum: Datumsfeld mit Kalender-Picker
- Beschreibung: Textfeld
- Sender/Empfänger: Textfeld
- Positionen: Tabelle mit Konto (Dropdown), Valuta (Datumsfeld), Betrag (Zahl)
- Plus-Button zum Hinzufügen einer neuen Position
- Löschen-Button pro Position zum Entfernen
- Abbrechen-Button: Verwirft Änderungen und kehrt zur Buchungsliste zurück

## Validierungsregeln

| Feld | Regel |
|------|-------|
| Vorgang | Pflichtfeld, Enum: Buchung |
| Datum | Pflichtfeld |
| Position: Konto | Pflichtfeld, muss als angelegtes Konto existieren |
| Position: Valuta | Pflichtfeld |
| Position: Betrag | Pflichtfeld, numerisch (positiv oder negativ) |

### Hinweise

- Mindestens eine Position ist erforderlich
- Die Summe der Positionen muss nicht 0 sein
- Das Datum der Buchung ist unabhängig von den Valuta-Daten der Positionen
- Valuta wird mit Buchungsdatum vorbelegt

## Testing

### Unit Tests

- `booking.service.spec.ts`: Tests für alle IPC-Aufrufe
- `booking-list.component.spec.ts`: Rendering, Loading-State, Error-State, Delete-Bestätigung
- `booking-form.component.spec.ts`: Form-Validierung, Hinzufügen/Löschen von Positionen, Submit

### Test-Abdeckung

- Wie bei Konten: Alle Services und Komponenten mit Unit Tests
- Vitest als Test-Framework
