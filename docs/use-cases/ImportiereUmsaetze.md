# Importiere Umsätze

## Beschreibung

Der Anwender importiert Umsätze aus CSV-Dateien externer Kreditinstitute (ING, Comdirect, Deutsche Bank) in ein ausgewähltes Konto. Das System ermittelt den passenden instituts- und artenspezifischen Parser, überführt die Fremddaten in das Slowen-interne Buchungsmodell (`Booking` und `BookingPosition`) und visualisiert die erkannten Buchungen auf einer zweiten Seite.

## Beteiligte

* Anwender
* Slowen, das System

## Ablauf

1. Der Anwender wählt den Eintrag **"Import"** in der Hauptnavigationsleiste.
2. Das System öffnet das Import-Modul und zeigt die **erste Seite (Import-Konfiguration)** an mit:
   * **Art des Imports**: Pflichtfeld, Auswahl { `Umsatz`, `Depot-Bestand` }, Vorbelegung: `Umsatz`
   * **Institut**: Pflichtfeld, Auswahl { `ING`, `Comdirect`, `Deutsche Bank` }
   * **Zielkonto / Depot**: Pflichtfeld, dynamische Auswahl abhängig von der gewählten Art:
     - Bei Art *Umsatz*: Auswahl der Konten (z. B. Giro, Tagesgeld, Kreditkarte)
     - Bei Art *Depot-Bestand*: Auswahl aller Konten vom Subtyp `Depot`
   * **CSV-Datei**: Pflichtfeld, Dateiauswahl für eine `.csv`-Datei
   * Button **"Laden"** (deaktiviert, solange Pflichtfelder nicht vollständig sind)
3. Der Anwender wählt die Art des Imports, das Institut, das Zielkonto bzw. -depot und wählt die CSV-Datei aus.
4. Der Anwender klickt auf den Button **"Laden"**.
5. Das System ermittelt den zur Kombination aus `Art des Imports` und `Institut` passenden Parser.
6. Der Parser liest die CSV-Datei ein, übersetzt die institutionsspezifischen Spalten/Formate in das interne Slowen-Buchungsmodell (`Booking` mit `BookingPosition`en) und ordnet die Positionen dem ausgewählten Konto zu.
7. Das System wechselt auf die **zweite Seite (Buchungsvorschau)** und zeigt die erzeugten Buchungen mit ihren Positionen (Buchungsdatum, Sender/Empfänger, Verwendungszweck, Valuta, Betrag) strukturiert an.
8. Der Anwender prüft die Anzeige und klickt auf den Button **"Fertig"**.
9. Das System wechselt wieder auf die erste Import-Seite zurück.

## Validierungs- und Parserregeln

| Feld / Element | Regel |
|---|---|
| Art des Imports | Pflichtfeld, Enum: `Umsatz`, `Depot-Bestand` |
| Institut | Pflichtfeld, Enum: `ING`, `Comdirect`, `Deutsche Bank` |
| Konto / Depot | Pflichtfeld, muss ein existierendes Konto passend zum gewählten Typ sein |
| CSV-Datei | Pflichtfeld, lesbare CSV-Datei im Format des gewählten Instituts |
| Laden-Button | Nur aktiv, wenn alle Pflichtfelder ausgefüllt und eine CSV-Datei ausgewählt ist |
| Parser-Ermittlung | Für die gewählte Kombination (z. B. `Umsatz` + `ING`) muss ein registrierter Parser vorhanden sein; andernfalls wird eine verständliche Fehlermeldung ausgegeben |

### Datenübernahme in das Buchungsmodell

* **Buchungsdatum (`date`)**: Aus Buchungsdatum der Bank im ISO-Format (`YYYY-MM-DD`).
* **Vorgang (`vorgang`)**: Vorbelegt mit `'Buchung'`.
* **Empfänger / Sender (`sender_receiver`)**: Aus dem entsprechenden Namensfeld des Instituts (z. B. "Auftraggeber/Empfänger" bei ING, "Zahlungsempfänger" bei Comdirect, "Begünstigter / Auftraggeber" bei Deutsche Bank).
* **Beschreibung (`description`)**: Buchungstext und/oder Verwendungszweck.
* **Position (`BookingPosition`)**:
  - `account_id`: ID des im Schritt 1 ausgewählten Zielkontos.
  - `valuta`: Wertstellungsdatum der Bank (ISO-Format `YYYY-MM-DD`), Fallback auf Buchungsdatum.
  - `amount`: Berechneter Fließkomma-Betrag (positiv für Einnahmen/Gutschriften, negativ für Ausgaben/Lastschriften).

## UI-Hinweise

* **Navigation:** Neuer Menüeintrag "Import" in der Sidebar.
* **Erste Seite (Import-Formular):**
  - Segmentierte Auswahl für Import-Art (`Umsatz` / `Depot-Bestand`).
  - Dropdown für Institut (`ING`, `Comdirect`, `Deutsche Bank`).
  - Dropdown für Konto / Depot (gefiltert nach der gewählten Art).
  - Dateiauswahlfeld (File Input) für die CSV-Datei mit Anzeige des Dateinamens.
  - Primärer Button "Laden".
* **Zweite Seite (Buchungsanzeige):**
  - Zusammenfassung: Import-Art, Institut, Zielkonto, Dateiname und Anzahl der erkannten Buchungen.
  - Strukturierte Buchungstabelle mit Spalten: Datum, Empfänger / Sender, Beschreibung / Verwendungszweck, Valuta, Betrag (mit Farbcodierung grün/rot).
  - Button "Fertig", welcher zurück zur ersten Seite navigiert/umschaltet.
