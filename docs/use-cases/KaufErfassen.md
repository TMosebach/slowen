# Kauf erfassen

# Beschreibung

Der Anwender erfasst den Kauf eines Wertpapiers in ein Depot-Konto gegen ein Verrechnungskonto.

# Beteiligte:

* Anwender
* Slowen, das System

# Ablauf

1. Der Anwender wählt den Buchungen-Eintrag in der Navigationsleiste.
2. Das System zeigt die Buchung-Liste an.
3. Der Anwender klickt auf "Neuer Kauf" (oder wechselt im Buchungsformular auf den Vorgang "Kauf").
4. Das System zeigt das Kauf-Formular an mit:
    * Vorgang: Pflichtfeld, Enum { Buchung, Kauf, Verkauf }, Vorbelegung: Kauf
    * Datum: Pflichtfeld, Default: Tagesdatum
    * Beschreibung: optional, Freitext zur Buchung
    * Sender/Empfänger: optional, beteiligte Person/Gegenstelle
    * Wertpapier: Pflichtfeld, Dropdown aller angelegten Wertpapiere
    * Depot-Konto: Pflichtfeld, Dropdown aller Konten (Typ: Bestand, Subtyp: Depot)
    * Verrechnungskonto: Pflichtfeld, Dropdown aller Konten (Typ: Bestand, Subtyp != Depot)
    * Stückzahl: Pflichtfeld, numerisch (Dezimalzahl möglich), > 0
    * Kurs pro Stück: Pflichtfeld, numerisch, > 0
    * Gebühren: optional, numerisch, >= 0, Default: 0
    * Stückzinsen: optional, numerisch, >= 0, Default: 0
    * Live-Berechnung / Zusammenfassung:
        * Kurswert: Stückzahl * Kurs pro Stück
        * Gesamtbetrag: Kurswert + Gebühren + Stückzinsen
5. Der Anwender füllt die Pflichtfelder sowie optional Beschreibung, Sender/Empfänger, Gebühren und Stückzinsen aus.
6. Der Anwender klickt auf "Buchen" (bzw. "Speichern" bei Bearbeitung).
7. Das System validiert die Angaben:
    * Sind Pflichtfelder nicht ausgefüllt oder ungültig, zeigt es Fehlermeldungen an.
    * Andernfalls speichert das System den Kauf:
        * Erstellt den Buchungssatz in `bookings` mit Vorgang `'Kauf'`.
        * Erstellt den Depot-Bestandseintrag in `depot_positions` (Wertpapier, Depot-Konto, Stückzahl, Kurs, Kaufdatum).
        * Erzeugt automatisch die zugehörigen Buchungspositionen in `booking_positions`:
            * Verrechnungskonto: Belastung mit `-Gesamtbetrag`
            * Depot-Konto: Einbuchung mit `+Kurswert`
            * Systemkonto "Wertpapierprovision": Belastung mit `+Gebühren` (falls > 0)
            * Systemkonto "Stückzinsen": Belastung mit `+Stückzinsen` (falls > 0)
8. Das System kehrt zur Buchungsliste zurück, die nun die erfasste Kaufbuchung anzeigt.

## Validierungsregeln

| Feld | Regel |
|------|-------|
| Vorgang | Pflichtfeld, Enum: Kauf |
| Datum | Pflichtfeld |
| Wertpapier | Pflichtfeld, muss existierendes Wertpapier sein |
| Depot-Konto | Pflichtfeld, muss existierendes Konto mit Typ `Bestand` und Subtyp `Depot` sein |
| Verrechnungskonto | Pflichtfeld, muss existierendes Konto mit Typ `Bestand` und Subtyp != `Depot` sein; darf nicht identisch mit Depot-Konto sein |
| Stückzahl | Pflichtfeld, numerisch, > 0 (Nachkommastellen erlaubt) |
| Kurs pro Stück | Pflichtfeld, numerisch, > 0 |
| Gebühren | Optional, numerisch, >= 0 |
| Stückzinsen | Optional, numerisch, >= 0 |

## Datenmodell

### Booking

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| id | INTEGER | auto | Primary Key |
| vorgang | TEXT | ja | Enum: Kauf |
| date | TEXT | ja | Kaufdatum (ISO 8601) |
| description | TEXT | nein | Freitext-Beschreibung |
| sender_receiver | TEXT | nein | Beteiligte Gegenstelle / Broker |

### DepotPosition (`depot_positions`)

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| id | INTEGER | auto | Primary Key |
| booking_id | INTEGER | ja | Foreign Key auf Booking (UNIQUE) |
| depot_account_id | INTEGER | ja | Foreign Key auf Account (Depot) |
| security_id | INTEGER | ja | Foreign Key auf Securities |
| quantity | REAL | ja | Gekaufte Stückzahl |
| price_per_unit | REAL | ja | Kaufkurs pro Stück |
| purchase_date | TEXT | ja | Kaufdatum (ISO 8601) |

### BookingPosition (`booking_positions`, automatisch erzeugt)

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| id | INTEGER | auto | Primary Key |
| booking_id | INTEGER | ja | Foreign Key auf Booking |
| account_id | INTEGER | ja | Foreign Key auf Account (Verrechnung, Depot oder Systemkonto) |
| valuta | TEXT | ja | Wertstellungsdatum (Kaufdatum) |
| amount | REAL | ja | Buchungsbetrag |

## UI-Hinweise

- Direkteinstieg über Route `/bookings/new/purchase` oder Button "Neuer Kauf".
- Wertpapier: Dropdown mit allen verfügbaren Wertpapieren.
- Depot-Konto: Gefiltertes Dropdown (nur Bestandskonten mit Subtyp `Depot`).
- Verrechnungskonto: Gefiltertes Dropdown (nur Bestandskonten ohne Subtyp `Depot`).
- Kurswert und Gesamtbetrag werden bei Eingabe von Stückzahl, Kurs, Gebühren oder Stückzinsen live berechnet und angezeigt.
- Abbrechen-Button: Verwirft Eingaben und navigiert zurück zur Buchungsliste.
