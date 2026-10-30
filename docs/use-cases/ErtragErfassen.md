# Ertrag erfassen

# Beschreibung

Der Anwender erfasst den Ertrag eines Wertpapiers (z. B. Dividende einer Aktie, Zinszahlung einer Anleihe oder Ausschüttung eines Fonds/ETFs) aus einem Depot auf ein Verrechnungskonto. Im Gegensatz zu Kauf, Verkauf oder Tilgung führt der Ertrag zu **keiner Bestandsänderung** im Depot, wird jedoch dem auslösenden Wertpapier und Depot über einen Depotumsatz mit Menge 0 zugerechnet.

Der Anwender wählt das Depot und den betroffenen Wertpapierbestand aus und erfasst den Bruttoertrag sowie optional abzuführende Steuern (Kapitalertragsteuer und Solidaritätszuschlag). Das Ertragskonto wird anhand der Wertpapierart automatisch vorausgewählt (`Dividende`, `Zins` oder `Fondsertrag`), kann vom Anwender jedoch bei Bedarf angepasst werden.

# Beteiligte:

* Anwender
* Slowen, das System

# Vorbedingung

Der Anwender befindet sich in der Buchungsübersicht (Einstieg über Button "Neuer Ertrag") oder in der Depot-Detailansicht (Einstieg über Aktion "Ertrag erfassen" an einer konkreten Bestandsposition).

# Ablauf

1. Der Anwender klickt auf **"Neuer Ertrag"** (bzw. wählt im Buchungsformular den Vorgang "Ertrag" oder klickt in der Depot-Detailansicht auf "Ertrag erfassen").
2. Das System zeigt das Ertrags-Formular an mit:
    * **Vorgang:** Pflichtfeld, Enum { `Buchung`, `Kauf`, `Verkauf`, `Tilgung`, `Ertrag` }, Vorbelegung: `Ertrag`
    * **Datum:** Pflichtfeld, Default: Tagesdatum
    * **Beschreibung:** optional, Freitext zur Buchung
    * **Sender/Empfänger:** optional, beteiligte Gesellschaft / Zahlstelle
    * **Depot-Konto:** Pflichtfeld, Dropdown aller Konten (Typ: `Bestand`, Subtyp: `Depot`)
    * **Wertpapier:** Pflichtfeld, Dropdown aller angelegten Wertpapiere (bevorzugt die im gewählten Depot gehaltenen Werte)
    * **Verrechnungskonto:** Pflichtfeld, Dropdown aller Konten (Typ: `Bestand`, Subtyp != `Depot`)
    * **Ertragskonto:** Pflichtfeld, Dropdown aller Ertragskonten (Typ: `GuV`, Subtyp: `Ertrag`), automatisch vorausgewählt anhand der Wertpapierart:
        - Aktie $\rightarrow$ `Dividende`
        - Anleihe, Zertifikat $\rightarrow$ `Zins`
        - Fonds, ETF $\rightarrow$ `Fondsertrag`
    * **Bruttobetrag:** Pflichtfeld, numerisch, > 0
    * **Kapitalertragsteuer:** optional, numerisch, >= 0, Default: 0
    * **Solidaritätszuschlag:** optional, numerisch, >= 0, Default: 0
    * **Live-Berechnung & Bestandsprüfung:**
        - Abzüge: Kapitalertragsteuer + Solidaritätszuschlag
        - Nettozufluss: Bruttobetrag - Abzüge
        - Bestandsprüfung: Warnhinweis, wenn zum Buchungsdatum kein aktiver Bestand des Wertpapiers im gewählten Depot vorhanden ist (Hinweis: Speichern bleibt dennoch möglich, z. B. bei nachträglicher Erfassung nach Tilgung).
3. Bei Einstieg über die Depotansicht sind Depot-Konto und Wertpapier bereits vorausgewählt.
4. Bei Auswahl des Wertpapiers wählt das System automatisch das passende Ertragskonto vor.
5. Der Anwender erfasst den Bruttobetrag und optional Steuern.
6. Der Anwender klickt auf **"Buchen"** (bzw. "Speichern" bei Bearbeitung).
7. Das System validiert die Angaben:
    * Prüfung auf Pflichtfelder und positive Beträge (`Bruttobetrag > 0`).
    * Prüfung, dass Steuern nicht negativ sind und `Nettozufluss > 0` ist.
    * Prüfung, dass Verrechnungskonto und Ertragskonto gültig zugewiesen sind.
8. Das System speichert den Ertrag:
    * Erstellt den Buchungssatz in `bookings` mit Vorgang `'Ertrag'`.
    * Erstellt einen Eintrag in `depot_positions` mit `quantity = 0`, `price_per_unit = 0` und `purchase_date = booking.date`, um die Buchung eindeutig dem Wertpapier und Depot zuzurechnen, ohne den FIFO-Bestand zu verändern.
    * Erzeugt die ausgeglichenen Buchungspositionen in `booking_positions`:
        - Verrechnungskonto: Zugang mit `+Nettozufluss`
        - Ertragskonto: Ertrag mit `-Bruttobetrag`
        - Systemkonto "Kapitalertragsteuer": Belastung mit `+Kapitalertragsteuer` (falls > 0)
        - Systemkonto "Solidaritätszuschlag": Belastung mit `+Solidaritätszuschlag` (falls > 0)
9. Das System kehrt zur Buchungsliste (bzw. zur aufrufenden Depotansicht) zurück.

## Validierungsregeln

| Feld | Regel |
|------|-------|
| Vorgang | Pflichtfeld, Enum: `Ertrag` |
| Datum | Pflichtfeld (ISO-Format `YYYY-MM-DD`) |
| Depot-Konto | Pflichtfeld, existierendes Konto mit Typ `Bestand` und Subtyp `Depot` |
| Wertpapier | Pflichtfeld, existierendes Wertpapier |
| Verrechnungskonto | Pflichtfeld, Typ `Bestand`, Subtyp != `Depot` |
| Ertragskonto | Pflichtfeld, Typ `GuV`, Subtyp `Ertrag` |
| Bruttobetrag | Pflichtfeld, numerisch, > 0 |
| Kapitalertragsteuer | Optional, numerisch, >= 0 |
| Solidaritätszuschlag | Optional, numerisch, >= 0 |
| Nettozufluss | Muss größer 0 sein (`Brutto - KapESt - Soli > 0`) |
| Bestand zum Stichtag | Warnmeldung bei Stückzahl $\le$ 0 zum Stichtag (nicht blockierend) |

## Zuordnung der Ertragskonten nach Wertpapierart

| Wertpapierart (`securities.type`) | Vorausgewähltes Ertragskonto |
|---|---|
| `Aktie` | `Dividende` (Systemkonto, GuV/Ertrag) |
| `Anleihe`, `Zertifikat` | `Zins` (Systemkonto, GuV/Ertrag) |
| `Fonds`, `ETF` | `Fondsertrag` (Systemkonto, GuV/Ertrag) |

## Datenmodell

### Booking (`bookings`)

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| id | INTEGER | auto | Primary Key |
| vorgang | TEXT | ja | Enum: `'Ertrag'` |
| date | TEXT | ja | Ertragsdatum (ISO 8601) |
| description | TEXT | nein | Freitext-Beschreibung |
| sender_receiver | TEXT | nein | Emittent / Zahlstelle |

### DepotPosition (`depot_positions`, Verknüpfung mit Menge 0)

| Feld | Wert | Beschreibung |
|------|------|--------------|
| booking_id | `booking.id` | Eindeutige Verknüpfung zur Buchung |
| depot_account_id | ID des Depots | Depotzuordnung |
| security_id | ID des Wertpapiers | Wertpapierzurechnung |
| quantity | `0` | Keine Bestandsänderung |
| price_per_unit | `0` | Keine Kursauswirkung |
| purchase_date | `booking.date` | Stichtag |

### BookingPosition (`booking_positions`, automatisch erzeugt)

| Konto | Betrag | Vorzeichen / Bedeutung |
|-------|--------|------------------------|
| Verrechnungskonto | `net` | `+` (Zugang auf dem Geldkonto) |
| Ertragskonto (`Dividende`/`Zins`/`Fondsertrag`) | `-gross` | `-` (Ertrag im Haben) |
| Kapitalertragsteuer (Systemkonto) | `tax` | `+` (Steueraufwand, falls > 0) |
| Solidaritätszuschlag (Systemkonto) | `soli` | `+` (Steueraufwand, falls > 0) |

Die Summe aller Positionen ergibt exakt `0`.

## UI-Hinweise

- Direkteinstieg über Route `/bookings/new/income` oder Button "Neuer Ertrag" in der Buchungsliste.
- Kontextueller Einstieg aus der Depotansicht: Button/Icon "Ertrag erfassen" an jeder Bestandsposition mit Vorbelegung von Depot und Wertpapier.
- Automatische Vorbelegung des Ertragskontos beim Wechsel des Wertpapiers.
- Warnung bei unzureichendem oder fehlendem Depotbestand zum Stichtag.
