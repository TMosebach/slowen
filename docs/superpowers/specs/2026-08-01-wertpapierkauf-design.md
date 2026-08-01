# Design: Wertpapierkauf & Depotbestand

**Datum:** 2026-08-01  
**Status:** Genehmigt

## Überblick

Ein neuer Buchungs-Vorgang "Kauf" ermöglicht den Erwerb von Wertpapieren. Ein Kauf erzeugt in einer atomaren Transaktion alle relevanten Buchungspositionen (Geldfluss) sowie einen Depotbestandseintrag. Der Depotbestand wird pro Depot-Konto in der Kontodetailansicht angezeigt.

## Ansatz

"Kauf" ist ein spezialisierter Buchungs-Vorgang innerhalb der bestehenden `bookings`-Struktur. Das Kauf-Formular generiert automatisch alle `booking_positions` sowie einen Eintrag in der neuen Tabelle `depot_positions`. Geldfluss und Bestand sind über `booking_id` atomar verknüpft.

---

## 1. Datenmodell

### Erweiterung: Tabelle `bookings`

Der CHECK-Constraint wird erweitert:

```sql
vorgang TEXT NOT NULL CHECK (vorgang IN ('Buchung', 'Kauf'))
```

### Neue Tabelle: `depot_positions`

```sql
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
);
```

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| id | INTEGER PK | auto | Primary Key |
| booking_id | INTEGER FK | ja | Verknüpfung mit `bookings.id` (1:1, CASCADE DELETE) |
| depot_account_id | INTEGER FK | ja | Depot-Konto (`accounts.id`, Subtyp "Depot") |
| security_id | INTEGER FK | ja | Wertpapier (`securities.id`) |
| quantity | REAL | ja | Stückzahl (REAL für Fondsanteile) |
| price_per_unit | REAL | ja | Kaufkurs pro Stück |
| purchase_date | TEXT | ja | Kaufdatum (ISO 8601) |

`quantity` ist REAL, um Fondsanteile mit Nachkommastellen zu unterstützen.

### Systemkonten

Beim Datenbankstart werden zwei Konten vom Typ `GuV` automatisch angelegt, sofern sie noch nicht existieren:

| Name | Typ | Subtyp |
|------|-----|--------|
| Wertpapierprovision | GuV | Provision |
| Stückzinsen | GuV | Stückzinsen |

Diese Konten werden vom Kauf-Formular automatisch verwendet. Der Nutzer wählt sie nicht manuell aus.

---

## 2. Buchungslogik

Ein Kauf erzeugt in einer einzigen Datenbanktransaktion:

### 2.1 Booking

| Feld | Wert |
|------|------|
| vorgang | "Kauf" |
| date | Kaufdatum |
| description | optional, Freitext |
| sender_receiver | optional |

### 2.2 Booking Positions (automatisch generiert)

| Position | Konto | Betrag | Bedingung |
|----------|-------|--------|-----------|
| Geldabgang | Verrechnungskonto | −(Kurswert + Gebühren + Stückzinsen) | immer |
| Depoteingang | Depot-Konto | +(Kurswert) | immer |
| Provision | Konto "Wertpapierprovision" | +(Gebühren) | nur wenn Gebühren > 0 |
| Stückzinsen | Konto "Stückzinsen" | +(Stückzinsen) | nur wenn Stückzinsen > 0 |

**Kurswert** = `quantity × price_per_unit`

Der Geldabgang vom Verrechnungskonto entspricht der Summe aller anderen Positionen — die Buchung ist intern ausgeglichen.

### 2.3 Depot Position

Gleichzeitig wird ein Eintrag in `depot_positions` angelegt mit Wertpapier, Depot-Konto, Stückzahl, Kurs und Kaufdatum.

### 2.4 Löschen

Wird eine Kauf-Buchung gelöscht, werden über CASCADE alle zugehörigen `booking_positions` und die `depot_position` mitgelöscht.

---

## 3. Kauf-Formular (UI)

### Einstieg

- **Button "Neuer Kauf"** in der Buchungsliste (neben "Neue Buchung") öffnet das Formular mit `vorgang = "Kauf"` vorausgewählt.
- **Dropdown-Auswahl "Kauf"** im Buchungsformular blendet die Kauf-spezifischen Felder ein.

### Felder

| Feld | Typ | Pflicht | Hinweis |
|------|-----|---------|---------|
| Vorgang | Dropdown | ja | "Kauf" vorausgewählt wenn über "Neuer Kauf" geöffnet |
| Datum | Datumsfeld | ja | Default: Tagesdatum |
| Beschreibung | Textfeld | nein | Freitext |
| Wertpapier | Dropdown | ja | Auswahl aus Securities-Katalog |
| Depot-Konto | Dropdown | ja | Nur Konten mit Subtyp "Depot" |
| Verrechnungskonto | Dropdown | ja | Alle Bestand-Konten außer Depot-Konten |
| Stückzahl | Zahlenfeld | ja | Positiv, Dezimalzahlen erlaubt |
| Kurs pro Stück | Zahlenfeld | ja | Positiv |
| Gebühren | Zahlenfeld | nein | Default leer, ≥ 0 |
| Stückzinsen | Zahlenfeld | nein | Default leer, ≥ 0 |

### Berechnete Anzeige (read-only, live)

- **Kurswert:** Stückzahl × Kurs pro Stück
- **Gesamtbetrag:** Kurswert + Gebühren + Stückzinsen

### Validierungsregeln

| Feld | Regel |
|------|-------|
| Vorgang | Pflichtfeld, Enum: Buchung, Kauf |
| Datum | Pflichtfeld |
| Wertpapier | Pflichtfeld, muss im Securities-Katalog existieren |
| Depot-Konto | Pflichtfeld, Subtyp muss "Depot" sein |
| Verrechnungskonto | Pflichtfeld, darf nicht gleich Depot-Konto sein |
| Stückzahl | Pflichtfeld, > 0 |
| Kurs pro Stück | Pflichtfeld, > 0 |
| Gebühren | Optional, ≥ 0 |
| Stückzinsen | Optional, ≥ 0 |

### Nach dem Speichern

Rückkehr zur Buchungsliste. Der neue Kauf ist dort sichtbar.

---

## 4. Depot-Kontoansicht (UI)

Die Kontodetailansicht für Konten mit Subtyp "Depot" wird neu erstellt.

### Kopfbereich

Kontoname, Subtyp, IBAN (falls vorhanden), Notizen.

### Bestandstabelle

Alle `depot_positions` dieses Depot-Kontos, nach Wertpapier aggregiert:

| Spalte | Beschreibung |
|--------|--------------|
| Wertpapier | Name + ISIN |
| Typ | Aktie, ETF, Anleihe, etc. |
| Stückzahl | Summe aller Käufe dieses Wertpapiers in diesem Depot |
| Ø Kaufkurs | Gewichteter Durchschnittskurs aller Käufe |
| Kaufwert | Summe (Stückzahl × Kaufkurs) aller Positionen |
| Erstkauf | Datum des frühesten Kaufs dieses Wertpapiers |

Mehrere Käufe desselben Wertpapiers werden in einer aggregierten Zeile angezeigt. Per Aufklappen (Expand) sind die Einzelkäufe sichtbar mit: Datum, Stückzahl, Kurs, Kurswert.

### Kaufhistorie

Unterhalb der Bestandstabelle: Liste aller Kauf-Buchungen dieses Depots, sortiert nach Datum absteigend.

| Spalte | Beschreibung |
|--------|--------------|
| Datum | Kaufdatum |
| Wertpapier | Name |
| Stückzahl | Gekaufte Stückzahl |
| Kurs | Kurs pro Stück |
| Gesamtbetrag | Kurswert + Gebühren + Stückzinsen |

Jede Zeile ist zur zugehörigen Buchung in der Buchungsliste verlinkt.

---

## 5. Buchungsliste

Käufe erscheinen in der bestehenden Buchungsliste mit `vorgang = "Kauf"`. Keine strukturellen Änderungen an der Buchungsliste nötig — der neue vorgang-Wert wird automatisch angezeigt.

---

## 6. Architektur & Schichten

### Electron (Backend)

| Datei | Aufgabe |
|-------|---------|
| `electron/database/connection.ts` | Migration: `depot_positions`-Tabelle, CHECK-Erweiterung, Systemkonten anlegen |
| `electron/database/depot-positions.ts` | CRUD für `depot_positions` |
| `electron/ipc/depot-positions.ipc.ts` | IPC-Handler für Depot-Positionen |
| `electron/database/bookings.ts` | Erweiterung: Kauf-Transaktion |

### Angular (Frontend)

| Datei | Aufgabe |
|-------|---------|
| `src/app/models/depot-position.model.ts` | Interface `DepotPosition`, `DepotPositionSummary` |
| `src/app/models/booking.model.ts` | `VORGANG_OPTIONS` um `'Kauf'` erweitern |
| `src/app/services/depot-positions.service.ts` | Service für Depot-Positionen |
| `src/app/components/bookings/booking-form/` | Kauf-spezifische Felder einblenden |
| `src/app/components/bookings/booking-list/` | Button "Neuer Kauf" ergänzen |
| `src/app/components/accounts/depot-detail/` | Neue Komponente: Depot-Kontoansicht |

### IPC-Events (Namenskonvention: `ressource:aktion`)

| Event | Richtung | Beschreibung |
|-------|----------|--------------|
| `depot-positions:getByDepot` | Renderer → Main | Alle Positionen eines Depot-Kontos |
| `depot-positions:getByBooking` | Renderer → Main | Position zu einer Buchung |

---

## 7. Nicht im Scope

- Verkauf von Wertpapieren
- Bewertung zum aktuellen Kurswert (Marktpreis)
- FIFO-Berechnung für Veräußerungsgewinne
- Import von Käufen per CSV
