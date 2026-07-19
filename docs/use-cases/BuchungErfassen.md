# Buchung anlegen

# Beschreibung

Der Anwender erfasst eine Buchung, um einen Geldfluss zwischen Konten zu dokumentieren.

# Beteiligte:

* Anwender
* Slowen, das System

# Ablauf

1. der Anwender wählt den Buchungen-Eintrag in der Navigationsleiste
2. das System zeigt die Buchung-Liste an
3. der Anwender klickt auf "neue Buchung"
4. das System zeigt das Buchung-Formular an mit
    * Vorgang: Pflichtfeld, Enum { Buchung }, Default: Buchung
    * Datum: Pflichtfeld, Default: Tagesdatum
    * Beschreibung: optional, Freitext zur Buchung
    * Sender/Empfänger: optional, beteiligte Person auf der Gegenseite
    * Liste mit Positionen, wobei die erste Position (Konto, Valuta - Default: aktuelles Datum, Betrag; alle Pflichtfelder) zur Erfassung vorgegeben ist
5. Der Anwender füllt die Felder der Buchung und der Position (Konto, Valuta, Betrag; alle Pflichtfelder) aus.
6. Der Anwender kann weitere Positionen der Liste hinzufügen und ausfüllen.
7. der Anwender klickt auf Buchen.
8. das System prüft, ob alle Pflichtfelder ausgefüllt sind, falls nicht zeigt es Fehlermeldungen.
Andernfalls speichert es die Buchung mit ihren Positionen und kehrt zur Buchung-Liste zurück, die nun die erfasste Buchung anzeigt.

## Validierungsregeln

| Feld | Regel |
|------|-------|
| Vorgang | Pflichtfeld, Enum: Buchung |
| Datum | Pflichtfeld |
| Position: Konto | Pflichtfeld, muss als angelegtes Konto existieren |
| Position: Valuta | Pflichtfeld |
| Position: Betrag | Pflichtfeld, numerisch, > 0 |

### Hinweise

- Mindestens eine Position ist erforderlich
- Die Summe der Positionen muss nicht 0 sein
- Das Datum der Buchung ist unabhängig von den Valuta-Daten der Positionen

## Datenmodell

### Booking

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| id | INTEGER | auto | Primary Key |
| vorgang | TEXT | ja | Enum: Buchung |
| date | TEXT | ja | Buchungsdatum (ISO 8601) |
| description | TEXT | nein | Freitext-Beschreibung |
| sender_receiver | TEXT | nein | Beteiligte Person/Gegenstelle |
| created_at | TEXT | auto | Erstellungszeitpunkt |

### BookingPosition

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| id | INTEGER | auto | Primary Key |
| booking_id | INTEGER | ja | Foreign Key auf Booking |
| account_id | INTEGER | ja | Foreign Key auf Account |
| valuta | TEXT | ja | Wertstellungsdatum (ISO 8601) |
| amount | REAL | ja | Betrag (positiv) |

## UI-Hinweise

- Vorgang: Dropdown mit Enum-Werten, derzeit mit "Buchung" vorbelegt
- Datum: Datumsfeld mit Kalender-Picker
- Beschreibung: Textfeld
- Sender/Empfänger: Textfeld
- Positionen: Tabelle mit Konto (Dropdown), Valuta (Datumsfeld), Betrag (Zahl)
- Plus-Button zum Hinzufügen einer neuen Position
- Löschen-Button pro Position zum Entfernen
- Abbrechen-Button: Verwirft Änderungen und kehrt zur Buchungsliste zurück
