# Tilgung erfassen

# Beschreibung

Der Anwender erfasst die Tilgung eines Wertpapiers (z. B. fällige Anleihe oder Zertifikat) aus einem Depot-Konto auf ein Verrechnungskonto. Im Unterschied zum Verkauf wird die Tilgung nicht durch den Wertpapierbesitzer initiiert, sondern erfolgt gemäß den Bedingungen des Emittenten (z. B. Endfälligkeit oder vorzeitige Kündigung).

Buchhalterisch entspricht die Tilgung dem Verkauf: Das System ermittelt die Anschaffungskosten nach dem FIFO-Verfahren, verbucht den Abgang aus dem Depot, bucht den Tilgungserlös auf das Verrechnungskonto und bucht realisierte Kursgewinne oder -verluste sowie Steuern und ggf. Gebühren automatisch auf die entsprechenden Konten.

# Beteiligte:

* Anwender
* Slowen, das System

# Vorbedingung

Der Anwender hat den Use Case „Buchungsliste anzeigen“ ausgeführt und befindet sich in der Buchungsübersicht (oder steigt über die Detailansicht eines Depots/Wertpapiers ein).

# Ablauf

1. Der Anwender klickt auf "Neue Tilgung" (oder wechselt im Buchungsformular auf den Vorgang "Tilgung").
2. Das System zeigt das Tilgungs-Formular an mit:
    * Vorgang: Pflichtfeld, Enum { Buchung, Kauf, Verkauf, Tilgung }, Vorbelegung: Tilgung
    * Datum: Pflichtfeld, Default: Tagesdatum (bzw. Fälligkeit des Wertpapiers, falls gepflegt)
    * Valuta: Pflichtfeld, vorbelegt mit Fälligkeitsdatum des Wertpapiers (falls vorhanden), ansonsten Buchungsdatum
    * Beschreibung: optional, Freitext zur Buchung
    * Sender/Empfänger: optional, beteiligte Gegenstelle / Emittent
    * Wertpapier: Pflichtfeld, Dropdown aller angelegten Wertpapiere
    * Depot-Konto: Pflichtfeld, Dropdown aller Konten (Typ: Bestand, Subtyp: Depot)
    * Verrechnungskonto: Pflichtfeld, Dropdown aller Konten (Typ: Bestand, Subtyp != Depot)
    * Stückzahl: Pflichtfeld, numerisch (Dezimalzahl möglich), > 0 (auch Teiltilgungen sind möglich)
    * Tilgungskurs: Pflichtfeld, numerisch, > 0, Vorbelegung: 100
    * Gebühren: optional, numerisch, >= 0, Default: 0
    * Kapitalertragsteuer: optional, numerisch, >= 0, Default: 0
    * Solidaritätszuschlag: optional, numerisch, >= 0, Default: 0
    * Live-Berechnung / Kennzahlen:
        * Tilgungserlös (Brutto): Stückzahl * Tilgungskurs
        * Abzüge: Gebühren + Kapitalertragsteuer + Solidaritätszuschlag
        * Nettozufluss: Tilgungserlös - Abzüge
        * FIFO-Einstand (live): Summe der Anschaffungskosten der nach FIFO-Reihenfolge getilgten Bestände bis zum Buchungsdatum
        * Kursgewinn/-verlust (live): Nettozufluss - FIFO-Einstand
        * Bestandsprüfung: Warnhinweis, wenn die getilgte Stückzahl den verfügbaren Depotbestand zum Buchungsdatum übersteigt
3. Der Anwender wählt das Wertpapier aus:
    * Besitzt das Wertpapier ein Fälligkeitsdatum (`faelligkeit`), belegt das System die Valuta (und optional das Datum) automatisch mit diesem Fälligkeitsdatum vor.
    * Der Tilgungskurs wird mit 100 vorbelegt.
4. Der Anwender passt bei Bedarf Stückzahl (Voll- oder Teiltilgung), Steuern und optionale Gebühren an.
5. Der Anwender klickt auf "Buchen" (bzw. "Speichern" bei Bearbeitung).
6. Das System validiert die Angaben:
    * Prüfung auf Pflichtfelder und positive Werte für Stückzahl und Tilgungskurs.
    * Prüfung, dass Depot-Konto und Verrechnungskonto unterschiedlich sind.
    * Prüfung, dass der Nettozufluss größer 0 ist.
    * Prüfung, dass zum Buchungsdatum genügend Wertpapierbestand im Depot vorhanden ist.
    * Bei Fehlern werden entsprechende Fehlermeldungen ausgegeben.
7. Das System speichert die Tilgung:
    * Erstellt den Buchungssatz in `bookings` mit Vorgang `'Tilgung'`.
    * Speichert die Detaildaten in `sale_details` (Wertpapier, Depot-Konto, Verrechnungskonto, Menge, Kurs, Gebühren, Steuern).
    * Erzeugt automatisch die Buchungspositionen in `booking_positions`:
        * Depot-Konto: Abgang mit `-FIFO-Einstandswert`
        * Verrechnungskonto: Zugang mit `+Nettozufluss`
        * Systemkonto "Wertpapierprovision": Belastung mit `+Gebühren` (falls > 0)
        * Systemkonto "Kapitalertragsteuer": Belastung mit `+Kapitalertragsteuer` (falls > 0)
        * Systemkonto "Solidaritätszuschlag": Belastung mit `+Solidaritätszuschlag` (falls > 0)
        * Systemkonto "Kursgewinn": Ertrag mit `+Kursgewinn` (falls Gewinn > 0)
        * Systemkonto "Kursverlust": Aufwand mit `+Kursverlust` (falls Verlust > 0)
    * Führt bei nachträglichen Datumsänderungen oder Einschub historischer Transaktionen eine automatische FIFO-Neuberechnung zeitlich nachfolgender Verkäufe und Tilgungen desselben Wertpapiers im selben Depot durch.
8. Das System kehrt zur Buchungsliste zurück, die nun die erfasste Tilgungsbuchung anzeigt.

## Validierungsregeln

| Feld | Regel |
|------|-------|
| Vorgang | Pflichtfeld, Enum: Tilgung |
| Datum | Pflichtfeld |
| Wertpapier | Pflichtfeld, muss existierendes Wertpapier sein |
| Depot-Konto | Pflichtfeld, muss existierendes Konto mit Typ `Bestand` und Subtyp `Depot` sein |
| Verrechnungskonto | Pflichtfeld, muss existierendes Konto mit Typ `Bestand` und Subtyp != `Depot` sein; darf nicht identisch mit Depot-Konto sein |
| Stückzahl | Pflichtfeld, numerisch, > 0; darf den zum Stichtag verfügbaren FIFO-Bestand im Depot nicht überschreiten (Teiltilgungen zulässig) |
| Tilgungskurs | Pflichtfeld, numerisch, > 0 (Vorbelegung 100) |
| Gebühren | Optional, numerisch, >= 0 |
| Kapitalertragsteuer | Optional, numerisch, >= 0 |
| Solidaritätszuschlag | Optional, numerisch, >= 0 |
| Nettozufluss | Muss größer 0 sein (Tilgungserlös - Gebühren - Steuern > 0) |

## Datenmodell

### Booking

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| id | INTEGER | auto | Primary Key |
| vorgang | TEXT | ja | Enum: Tilgung |
| date | TEXT | ja | Tilgungsdatum (ISO 8601) |
| description | TEXT | nein | Freitext-Beschreibung |
| sender_receiver | TEXT | nein | Emittent / Zahlstelle |

### SaleDetails (`sale_details`)

Zur Vermeidung von Datenmodell-Redundanz teilen sich `Verkauf` und `Tilgung` dieselbe Detailtabelle:

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| booking_id | INTEGER | ja | Primary Key & Foreign Key auf Booking |
| security_id | INTEGER | ja | Foreign Key auf Securities |
| depot_account_id | INTEGER | ja | Foreign Key auf Account (Depot) |
| settlement_account_id | INTEGER | ja | Foreign Key auf Account (Verrechnung) |
| quantity | REAL | ja | Getilgte Stückzahl |
| price_per_unit | REAL | ja | Tilgungskurs pro Stück |
| fees | REAL | ja | Gebühren (Default: 0) |
| capital_gains_tax | REAL | ja | Kapitalertragsteuer (Default: 0) |
| solidarity_surcharge | REAL | ja | Solidaritätszuschlag (Default: 0) |

## UI-Hinweise

- Direkteinstieg über Route `/bookings/new/redemption` oder Button "Neue Tilgung".
- Labels spiegeln die Fachlichkeit wider ("Tilgungskurs" statt "Verkaufskurs", "Tilgungserlös" statt "Verkaufserlös").
- Automatische Vorbelegung von Valuta mit der Fälligkeit des Wertpapiers und Tilgungskurs mit 100.
