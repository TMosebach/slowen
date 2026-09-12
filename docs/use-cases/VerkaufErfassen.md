# Verkauf erfassen

# Beschreibung

Der Anwender erfasst den Verkauf eines Wertpapiers aus einem Depot-Konto auf ein Verrechnungskonto. Das System ermittelt die Anschaffungskosten nach dem FIFO-Verfahren und bucht realisierte Kursgewinne oder -verluste sowie Steuern und Gebühren automatisch.

# Beteiligte:

* Anwender
* Slowen, das System

# Ablauf

1. Der Anwender wählt den Buchungen-Eintrag in der Navigationsleiste.
2. Das System zeigt die Buchung-Liste an.
3. Der Anwender klickt auf "Neuer Verkauf" (oder wechselt im Buchungsformular auf den Vorgang "Verkauf").
4. Das System zeigt das Verkauf-Formular an mit:
    * Vorgang: Pflichtfeld, Enum { Buchung, Kauf, Verkauf }, Vorbelegung: Verkauf
    * Datum: Pflichtfeld, Default: Tagesdatum
    * Beschreibung: optional, Freitext zur Buchung
    * Sender/Empfänger: optional, beteiligte Person/Gegenstelle
    * Wertpapier: Pflichtfeld, Dropdown aller angelegten Wertpapiere
    * Depot-Konto: Pflichtfeld, Dropdown aller Konten (Typ: Bestand, Subtyp: Depot)
    * Verrechnungskonto: Pflichtfeld, Dropdown aller Konten (Typ: Bestand, Subtyp != Depot)
    * Stückzahl: Pflichtfeld, numerisch (Dezimalzahl möglich), > 0
    * Kurs pro Stück: Pflichtfeld, numerisch, > 0
    * Gebühren: optional, numerisch, >= 0, Default: 0
    * Kapitalertragsteuer: optional, numerisch, >= 0, Default: 0
    * Solidaritätszuschlag: optional, numerisch, >= 0, Default: 0
    * Live-Berechnung / Kennzahlen:
        * Verkaufserlös (Brutto): Stückzahl * Kurs pro Stück
        * Abzüge: Gebühren + Kapitalertragsteuer + Solidaritätszuschlag
        * Nettozufluss: Verkaufserlös - Abzüge
        * FIFO-Einstand (live): Summe der Anschaffungskosten der nach FIFO-Reihenfolge veräußerten Bestände bis zum Buchungsdatum
        * Kursgewinn/-verlust (live): Nettozufluss - FIFO-Einstand
        * Bestandsprüfung: Warnhinweis, wenn die gewünschte Verkaufsmenge den verfügbaren Depotbestand zum Buchungsdatum übersteigt
5. Der Anwender füllt die Felder aus.
6. Der Anwender klickt auf "Buchen" (bzw. "Speichern" bei Bearbeitung).
7. Das System validiert die Angaben:
    * Prüfung auf Pflichtfelder und positive Werte für Menge und Kurs.
    * Prüfung, dass Depot-Konto und Verrechnungskonto unterschiedlich sind.
    * Prüfung, dass der Nettozufluss größer 0 ist.
    * Prüfung, dass zum Buchungsdatum genügend Wertpapierbestand im Depot vorhanden ist.
    * Bei Fehlern werden entsprechende Fehlermeldungen ausgegeben.
8. Das System speichert den Verkauf:
    * Erstellt den Buchungssatz in `bookings` mit Vorgang `'Verkauf'`.
    * Speichert die Verkaufsdetails in `sale_details` (Wertpapier, Depot-Konto, Verrechnungskonto, Menge, Kurs, Gebühren, Steuern).
    * Erzeugt automatisch die Buchungspositionen in `booking_positions`:
        * Depot-Konto: Abgang mit `-FIFO-Einstandswert`
        * Verrechnungskonto: Zugang mit `+Nettozufluss`
        * Systemkonto "Wertpapierprovision": Belastung mit `+Gebühren` (falls > 0)
        * Systemkonto "Kapitalertragsteuer": Belastung mit `+Kapitalertragsteuer` (falls > 0)
        * Systemkonto "Solidaritätszuschlag": Belastung mit `+Solidaritätszuschlag` (falls > 0)
        * Systemkonto "Kursgewinn": Ertrag mit `+Kursgewinn` (falls Gewinn > 0)
        * Systemkonto "Kursverlust": Aufwand mit `+Kursverlust` (falls Verlust > 0)
    * Führt bei nachträglichen Datumsänderungen oder Einschub historischer Transaktionen eine automatische FIFO-Neuberechnung zeitlich nachfolgender Verkäufe desselben Wertpapiers im selben Depot durch.
9. Das System kehrt zur Buchungsliste zurück, die nun die erfasste Verkaufsbuchung anzeigt.

## Validierungsregeln

| Feld | Regel |
|------|-------|
| Vorgang | Pflichtfeld, Enum: Verkauf |
| Datum | Pflichtfeld |
| Wertpapier | Pflichtfeld, muss existierendes Wertpapier sein |
| Depot-Konto | Pflichtfeld, muss existierendes Konto mit Typ `Bestand` und Subtyp `Depot` sein |
| Verrechnungskonto | Pflichtfeld, muss existierendes Konto mit Typ `Bestand` und Subtyp != `Depot` sein; darf nicht identisch mit Depot-Konto sein |
| Stückzahl | Pflichtfeld, numerisch, > 0; darf den zum Stichtag verfügbaren FIFO-Bestand im Depot nicht überschreiten |
| Kurs pro Stück | Pflichtfeld, numerisch, > 0 |
| Gebühren | Optional, numerisch, >= 0 |
| Kapitalertragsteuer | Optional, numerisch, >= 0 |
| Solidaritätszuschlag | Optional, numerisch, >= 0 |
| Nettozufluss | Muss größer 0 sein (Verkaufserlös - Gebühren - Steuern > 0) |

## Datenmodell

### Booking

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| id | INTEGER | auto | Primary Key |
| vorgang | TEXT | ja | Enum: Verkauf |
| date | TEXT | ja | Verkaufsdatum (ISO 8601) |
| description | TEXT | nein | Freitext-Beschreibung |
| sender_receiver | TEXT | nein | Beteiligte Gegenstelle / Broker |

### SaleDetails (`sale_details`)

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| booking_id | INTEGER | ja | Primary Key & Foreign Key auf Booking |
| security_id | INTEGER | ja | Foreign Key auf Securities |
| depot_account_id | INTEGER | ja | Foreign Key auf Account (Depot) |
| settlement_account_id | INTEGER | ja | Foreign Key auf Account (Verrechnung) |
| quantity | REAL | ja | Verkaufte Stückzahl |
| price_per_unit | REAL | ja | Verkaufskurs pro Stück |
| fees | REAL | ja | Gebühren (Default: 0) |
| capital_gains_tax | REAL | ja | Kapitalertragsteuer (Default: 0) |
| solidarity_surcharge | REAL | ja | Solidaritätszuschlag (Default: 0) |

### BookingPosition (`booking_positions`, automatisch erzeugt)

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| id | INTEGER | auto | Primary Key |
| booking_id | INTEGER | ja | Foreign Key auf Booking |
| account_id | INTEGER | ja | Foreign Key auf Account (Depot, Verrechnung, GuV-Systemkonten) |
| valuta | TEXT | ja | Wertstellungsdatum (Verkaufsdatum) |
| amount | REAL | ja | Buchungsbetrag |

## UI-Hinweise

- Direkteinstieg über Route `/bookings/new/sale` oder Button "Neuer Verkauf".
- Wertpapier: Dropdown mit allen verfügbaren Wertpapieren.
- Depot-Konto: Gefiltertes Dropdown (nur Bestandskonten mit Subtyp `Depot`).
- Verrechnungskonto: Gefiltertes Dropdown (nur Bestandskonten ohne Subtyp `Depot`).
- Live-Berechnung von Verkaufserlös, Abzügen, Nettozufluss, geschätztem FIFO-Einstand und Kursgewinn/-verlust.
- Live-Validierung und optische Warnmeldung bei unzureichendem Bestand.
- Abbrechen-Button: Verwirft Eingaben und navigiert zurück zur Buchungsliste.
