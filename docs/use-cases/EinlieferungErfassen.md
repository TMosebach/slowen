# Einlieferung erfassen

# Beschreibung

Der Anwender erfasst die Einlieferung (z. B. Depotübertrag von einer Fremdbank oder Ersteinbuchung von Altbeständen) eines Wertpapiers in ein Depot-Konto ohne Gegenbuchung auf einem Verrechnungskonto. Das System bucht die Wertpapiere in den Depotbestand ein und hinterlegt optional den Einstandswert / Einstandspreis. Der Einstandswert wird analog zu einem Kauf behandelt (Depot-Bestandswert in den Buchungspositionen und FIFO-Einstand für spätere Verkäufe).

# Beteiligte:

* Anwender
* Slowen, das System

# Vorbedingung

Der Anwender hat den Use Case „Buchungsliste anzeigen“ ausgeführt und befindet sich in der Buchungsübersicht.

# Ablauf

1. Der Anwender klickt auf "Neue Einlieferung" (oder wechselt im Buchungsformular auf den Vorgang "Einlieferung").
2. Das System zeigt das Einlieferungs-Formular an mit:
    * Vorgang: Pflichtfeld, Enum { Buchung, Kauf, Verkauf, Tilgung, Ertrag, Einlieferung }, Vorbelegung: Einlieferung
    * Datum: Pflichtfeld, Default: Tagesdatum
    * Beschreibung: optional, Freitext zur Buchung
    * Sender/Empfänger: optional, beteiligte Person / abgebendes Institut
    * Wertpapier: Pflichtfeld, Dropdown aller angelegten Wertpapiere
    * Zieldepot: Pflichtfeld, Dropdown aller Konten (Typ: Bestand, Subtyp: Depot)
    * Stückzahl: Pflichtfeld, numerisch (Dezimalzahl möglich), > 0
    * Einstandspreis pro Stück: optional, numerisch, >= 0, Default: 0
    * Einstandswert gesamt: optional, numerisch, >= 0, Default: 0
    * Live-Berechnung: Stückzahl * Einstandspreis pro Stück = Einstandswert (bidirektional synchronisiert)
3. Der Anwender füllt die Pflichtfelder sowie optional Beschreibung, Sender/Empfänger und Einstandspreis bzw. Einstandswert aus.
4. Der Anwender klickt auf "Buchen" (bzw. "Speichern" bei Bearbeitung).
5. Das System validiert die Angaben:
    * Sind Pflichtfelder nicht ausgefüllt oder ungültig (z. B. Stückzahl <= 0 oder Einstandspreis < 0), zeigt es Fehlermeldungen an.
    * Andernfalls speichert das System die Einlieferung:
        * Erstellt den Buchungssatz in `bookings` mit Vorgang `'Einlieferung'`.
        * Erstellt den Depot-Bestandseintrag in `depot_positions` (Wertpapier, Zieldepot, Stückzahl, Einstandspreis pro Stück, Einlieferungsdatum).
        * Erzeugt automatisch die Buchungsposition in `booking_positions`:
            * Depot-Konto: Einbuchung mit `+Einstandswert` (analog zum Kauf zur Erhöhung des Depot-Buchwerts, sofern Einstandswert > 0).
        * Stößt bei rückwirkender Buchung eine automatische FIFO-Neuberechnung nachfolgender Verkäufe desselben Wertpapiers im Zieldepot an.
6. Das System kehrt zur Buchungsliste zurück, die nun die erfasste Einlieferung anzeigt.

## Validierungsregeln

| Feld | Regel |
|------|-------|
| Vorgang | Pflichtfeld, Enum: Einlieferung |
| Datum | Pflichtfeld |
| Wertpapier | Pflichtfeld, muss existierendes Wertpapier sein |
| Zieldepot | Pflichtfeld, muss existierendes Konto mit Typ `Bestand` und Subtyp `Depot` sein |
| Stückzahl | Pflichtfeld, numerisch, > 0 (Nachkommastellen erlaubt) |
| Einstandspreis pro Stück | Optional, numerisch, >= 0 |
| Einstandswert gesamt | Optional, numerisch, >= 0 |

## Datenmodell

### Booking

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| id | INTEGER | auto | Primary Key |
| vorgang | TEXT | ja | Enum: Einlieferung |
| date | TEXT | ja | Einlieferungsdatum (ISO 8601) |
| description | TEXT | nein | Freitext-Beschreibung |
| sender_receiver | TEXT | nein | Abgebendes Institut / Übertragende Partei |

### DepotPosition (`depot_positions`)

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| id | INTEGER | auto | Primary Key |
| booking_id | INTEGER | ja | Foreign Key auf Booking (UNIQUE) |
| depot_account_id | INTEGER | ja | Foreign Key auf Account (Zieldepot) |
| security_id | INTEGER | ja | Foreign Key auf Securities |
| quantity | REAL | ja | Eingelieferte Stückzahl |
| price_per_unit | REAL | ja | Einstandspreis pro Stück (0 falls nicht angegeben) |
| purchase_date | TEXT | ja | Einlieferungsdatum (ISO 8601) |

### BookingPosition (`booking_positions`, automatisch erzeugt)

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| id | INTEGER | auto | Primary Key |
| booking_id | INTEGER | ja | Foreign Key auf Booking |
| account_id | INTEGER | ja | Foreign Key auf Account (Zieldepot) |
| valuta | TEXT | ja | Wertstellungsdatum (Einlieferungsdatum) |
| amount | REAL | ja | Einstandswert (Stückzahl * Einstandspreis, analog Kauf) |

## UI-Hinweise

- Direkteinstieg über Route `/bookings/new/delivery` oder Button "Neue Einlieferung" in der Buchungsliste.
- Wertpapier: Dropdown mit allen verfügbaren Wertpapieren.
- Zieldepot: Gefiltertes Dropdown (nur Bestandskonten mit Subtyp `Depot`).
- Kein Verrechnungskonto erforderlich, da kein Gegenkonten-Geldfluss erfolgt.
- Einstandspreis und Einstandswert werden bei Eingabe bidirektional synchronisiert (`Einstandswert = Stückzahl * Einstandspreis`).
- Abbrechen-Button: Verwirft Eingaben und navigiert zurück zur Buchungsliste.
