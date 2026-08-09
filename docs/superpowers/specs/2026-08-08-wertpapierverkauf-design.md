# Design: Wertpapierverkauf mit FIFO-Bewertung

**Datum:** 2026-08-08  
**Status:** Genehmigt

## Überblick

Das Feature erweitert den Buchungsprozess um den neuen Vorgang `Verkauf`. Ein Verkauf reduziert einen vorhandenen Depotbestand für ein Wertpapier in einem Depotkonto, jedoch nie unter 0. Die Umsetzung erfolgt analog zum bestehenden `Kauf`-Vorgang mit einem spezialisierten Eingabeblock im Buchungsformular und automatisch erzeugten Buchungspositionen.

Die Gewinn-/Verlustermittlung erfolgt per FIFO, inklusive optionaler Verkaufsabzüge (Gebühren, Kapitalertragsteuer, Solidaritätszuschlag), die den ausgewiesenen Kursgewinn mindern bzw. einen Kursverlust erhöhen.

## Gewählter Ansatz

Es wird **Ansatz 2** umgesetzt: FIFO-Rekonstruktion zur Laufzeit ohne persistierte Lot-Zuordnung pro Verkauf.

- Keine zusätzliche Zuordnungstabelle (z. B. Verkauf-zu-Kauf-Tranchen)
- Deterministische Rekonstruktion des FIFO-Einstandswerts aus allen Kauf-/Verkaufsbuchungen je `(depot_account_id, security_id)`
- Vollständige fachliche Konsistenz auch bei Bearbeiten/Löschen von Verkäufen durch erneute Rekonstruktion

## 1. Datenmodell

### 1.1 Erweiterung `bookings.vorgang`

Der bestehende Enum-Constraint wird erweitert:

```sql
vorgang TEXT NOT NULL CHECK (vorgang IN ('Buchung', 'Kauf', 'Verkauf'))
```

### 1.2 Erweiterung Booking-Model: `saleDetails`

Analog zu `purchaseDetails` wird ein neuer fachlicher Eingabeblock eingeführt:

```ts
interface SaleBookingDetails {
  security_id: number;
  depot_account_id: number;
  settlement_account_id: number;
  quantity: number;
  price_per_unit: number;
  fees?: number;
  capital_gains_tax?: number;
  solidarity_surcharge?: number;
}
```

Semantik:

- `security_id`: verkauftes Wertpapier
- `depot_account_id`: Depotkonto, dessen Bestand reduziert wird
- `settlement_account_id`: Verrechnungskonto mit Geldzufluss
- `quantity`: Verkaufsmenge, `> 0`, Dezimalstellen erlaubt
- `price_per_unit`: Verkaufskurs, `> 0`
- `fees`: optional, default `0`, `>= 0`, Buchung auf `Wertpapierprovision`
- `capital_gains_tax`: optional, default `0`, `>= 0`, Buchung auf `Kapitalertragsteuer`
- `solidarity_surcharge`: optional, default `0`, `>= 0`, Buchung auf `Solidaritätszuschlag`

Wichtig: `saleDetails` speichert **nur Eingabewerte**. FIFO-Zuordnungen und Einstandswerte werden nicht persistiert.

### 1.3 Bestehende Tabelle `depot_positions`

`depot_positions` bleibt ein reines Kauf-Ledger (Kauftranchen). Verkaufsbewegungen werden dort nicht als neue Zeilen persistiert, sondern rechnerisch gegen das Kauf-Ledger bewertet.

### 1.4 Systemkonten

Gebühren bleiben auf dem bestehenden Systemkonto:

- `Wertpapierprovision` (`GuV`, `Aufwand`)

Neue automatisch anzulegende und zu schützende Systemkonten:

- `Kursgewinn` (`GuV`, `Ertrag`)
- `Kursverlust` (`GuV`, `Aufwand`)
- `Kapitalertragsteuer` (`GuV`, `Aufwand`)
- `Solidaritätszuschlag` (`GuV`, `Aufwand`)

Systemkonto-Invariante wie beim Kauf:

- Konto muss genau einmal in der korrekten Typ/Subtyp-Kombination existieren
- bei Verstoß harter fachlicher Fehler (`Systemkonto-Invariante verletzt: Kontoname`)

## 2. Buchungslogik Verkauf

Ein Verkauf erzeugt alle zugehörigen `booking_positions` atomar in einer Transaktion. Der Nutzer pflegt keine manuellen Positionen.

### 2.1 Berechnungsgrundlagen

- `sale_proceeds = quantity * price_per_unit`
- `deductions = fees + capital_gains_tax + solidarity_surcharge`
- `fifo_cost_basis = FIFO-Einstandswert der verkauften Menge`
- `pnl = sale_proceeds - deductions - fifo_cost_basis`

Diese Formel wurde explizit freigegeben.

### 2.2 Pflichtvalidierungen

- Pflichtfelder in `saleDetails` vorhanden
- `quantity > 0`, `price_per_unit > 0`
- `fees`, `capital_gains_tax`, `solidarity_surcharge` jeweils `>= 0`
- `depot_account_id !== settlement_account_id`
- Wertpapier/Depot/Verrechnungskonto existieren und passen fachlich
- verfügbarer Bestand (FIFO-basiert) deckt `quantity` vollständig
- Buchung darf Bestand nie unter 0 reduzieren

### 2.3 Automatisch erzeugte Positionen

Für `vorgang = Verkauf`:

1. **Depotabgang (Buchwert):** Depotkonto mit `-fifo_cost_basis`
2. **Geldzufluss (Netto):** Verrechnungskonto mit `+(sale_proceeds - deductions)`
3. **Gebühr:** `Wertpapierprovision` mit `+fees` (nur wenn `fees > 0`)
4. **Kapitalertragsteuer:** `Kapitalertragsteuer` mit `+capital_gains_tax` (nur wenn `> 0`)
5. **Solidaritätszuschlag:** `Solidaritätszuschlag` mit `+solidarity_surcharge` (nur wenn `> 0`)
6. **Ergebnisposition:**
   - bei `pnl > 0`: `Kursgewinn` mit `+pnl`
   - bei `pnl < 0`: `Kursverlust` mit `+abs(pnl)`
   - bei `pnl = 0`: keine zusätzliche Ergebnisposition

Die Buchung bleibt damit intern ausgeglichen (`Summe(amount) = 0`).

## 3. FIFO-Rekonstruktion (Ansatz 2)

### 3.1 Grundidee

Für ein `(depot_account_id, security_id)` wird die Historie in stabiler Reihenfolge verarbeitet:

- Käufe erzeugen FIFO-Lots mit `remaining_quantity` und `price_per_unit`
- Verkäufe verbrauchen Lots vom Anfang der Queue
- Einstandswert eines Verkaufs = Summe der verbrauchten Teilmengen * jeweiligem Kaufkurs

### 3.2 Determinismus

Um bei wiederholter Berechnung identische Ergebnisse zu erhalten:

- primäre Sortierung nach `booking.date`
- sekundäre Sortierung nach `booking.id`

Diese Sortierung gilt konsistent für `create`, `update`, `delete` und Anzeige.

### 3.3 Verhalten bei Bearbeiten/Löschen

Da keine persistierte Zuordnung existiert, wird der relevante FIFO-Zustand für Prüfungen/Berechnung jeweils neu rekonstruiert. Damit bleiben auch nachträgliche Änderungen fachlich konsistent.

## 4. UI-Verhalten

### 4.1 Buchungsliste

- zusätzlicher Einstieg `Neuer Verkauf` analog `Neuer Kauf`
- neue Route mit vorausgewähltem `vorgang = Verkauf`

### 4.2 Buchungsformular Verkauf

Im Verkaufsmodus wird ein spezialisierter Eingabebereich gezeigt:

- Wertpapier
- Depot-Konto
- Verrechnungskonto
- Stückzahl
- Kurs pro Stück
- Gebühren (optional)
- Kapitalertragsteuer (optional)
- Solidaritätszuschlag (optional)

Die manuelle Positionstabelle wird für `Verkauf` nicht verwendet.

### 4.3 Live-Berechnungen

Read-only-Anzeigen im Formular:

- Brutto-Verkaufserlös
- Summe Abzüge
- Nettozufluss Verrechnungskonto
- berechneter Kursgewinn/-verlust (basierend auf aktueller FIFO-Rekonstruktion)

### 4.4 Benutzerfeedback

- klare Fehlermeldung bei nicht ausreichendem Bestand
- Feldvalidierungen wie beim Kauf-Flow
- Depot-/Verrechnungskonto müssen unterschiedlich sein

## 5. Fehlerbehandlung

- Fachfehler als verständliche Domain-Fehler (z. B. Überverkauf, ungültige Kontenkombination)
- technische Fehler (DB/IPC) separat behandeln und mit bestehendem Error-Handling anzeigen
- bei Fehlern in der Verkaufslogik kein Teilcommit (Transaktionsabbruch)

## 6. Betroffene Schichten/Dateien

Backend (Electron):

- `electron/database/connection.ts`: CHECK-Constraint-Migration für `Verkauf`, neue Systemkonten anlegen
- `electron/database/bookings.ts`: Verkaufsdetails laden/speichern, Positionsableitung, FIFO-Rekonstruktion
- `electron/database/accounts.ts` und Tests: Schutzlogik für neue Systemkonten

Frontend (Angular):

- `src/app/models/booking.model.ts`: `VORGANG_OPTIONS` erweitern, `SaleBookingDetails` + `saleDetails`
- `src/app/components/bookings/booking-form/*`: Verkaufsmodus, Felder, Validierung, Live-Berechnung
- `src/app/components/bookings/booking-list/*`: Button/Navigation `Neuer Verkauf`
- `src/app/app.routes.ts`: Route für neuen Verkauf

Tests:

- `electron/database/bookings.spec.ts`
- `electron/database/accounts.spec.ts`
- `src/app/components/bookings/booking-form/booking-form.component.spec.ts`
- `src/app/models/booking.model.spec.ts`

## 7. Teststrategie

Pfadabdeckung Verkauf:

1. erfolgreicher Verkauf mit Gewinn
2. erfolgreicher Verkauf mit Verlust
3. Verkauf mit jeder optionalen Abzugsart einzeln und kombiniert
4. Überverkauf wird verhindert
5. Bearbeiten eines Verkaufs (Menge/Kurs/Abzüge) bleibt konsistent
6. Löschen eines Verkaufs stellt verfügbare Menge korrekt wieder her
7. Systemkonto-Invarianten greifen auch für neue Verkaufskonten

Zusätzlich UI-seitig:

- Initialisierung des Verkaufsmodus
- korrekte Formularvalidierung
- Payload enthält `saleDetails`; Positionen werden serverseitig erzeugt

## 8. Nicht im Scope

- persistierte Lot-Zuordnung pro Verkauf (bewusst nicht Teil von Ansatz 2)
- Steuerreports/Exports
- weitergehende länderspezifische Steuerlogik außerhalb der drei Felder
- Marktwert-Bewertung zum aktuellen Kurs
