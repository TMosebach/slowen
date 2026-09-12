# Importiere Umsätze

## Beschreibung

Der Anwender importiert Umsätze aus CSV-Dateien externer Kreditinstitute (ING, Comdirect, Deutsche Bank) in ein ausgewähltes Konto. Das System ermittelt den passenden instituts- und artenspezifischen Parser, überführt die Fremddaten in das Slowen-interne Buchungsmodell (`Booking` mit zwei ausgeglichenen `BookingPosition`en) und visualisiert die erkannten Buchungen auf einer zweiten Seite, auf der der Anwender das Gegenkonto der Buchung manuell zuweist.

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
6. Der Parser liest die CSV-Datei ein, übersetzt die institutionsspezifischen Spalten/Formate in das interne Slowen-Buchungsmodell (`Booking` mit zwei Positionen: 1. Position auf das Zielkonto, 2. Position als Gegenbuchung mit invertiertem Betrag) und wechselt auf die zweite Seite.
7. Das System zeigt die erzeugten Buchungen auf der **zweiten Seite (Buchungsvorschau & Kontierung)** an:
   * Für jede Buchung existiert eine Spalte **Gegenkonto** links von Valuta und Betrag.
   * Der Anwender kann in der Auswahlbox das gewünschte Gegenkonto für die Gegenposition auswählen.
8. Der Anwender klickt auf den Button **"Fertig"**.
9. Das System prüft, ob der Anwender in allen Buchungen ein Gegenkonto angegeben hat:
   * **Fall A (Alle Gegenkonten gepflegt):**
     1. Das System speichert alle Buchungen mit ihren Positionen in der Datenbank, sodass der Import wirksam wird.
     2. Das System kehrt auf die erste Import-Seite zurück und zeigt eine Erfolgsmeldung an.
   * **Fall B (Mindestens ein Gegenkonto fehlt):**
     1. Das System bricht den Abschluss ab und verbleibt auf der zweiten Seite.
     2. Das System weist den Anwender mit einer Fehlermeldung darauf hin.
     3. Das System markiert die noch zu bearbeitenden Gegenkonto-Eingabefelder optisch rot.

## Validierungs- und Parserregeln

| Feld / Element | Regel |
|---|---|
| Art des Imports | Pflichtfeld, Enum: `Umsatz`, `Depot-Bestand` |
| Institut | Pflichtfeld, Enum: `ING`, `Comdirect`, `Deutsche Bank` |
| Konto / Depot | Pflichtfeld, muss ein existierendes Konto passend zum gewählten Typ sein |
| CSV-Datei | Pflichtfeld, lesbare CSV-Datei im Format des gewählten Instituts |
| Laden-Button | Nur aktiv, wenn alle Pflichtfelder ausgefüllt und eine CSV-Datei ausgewählt ist |
| Parser-Ermittlung | Für die gewählte Kombination (z. B. `Umsatz` + `ING`) muss ein registrierter Parser vorhanden sein; andernfalls wird eine verständliche Fehlermeldung ausgegeben |
| Gegenkonto-Pflicht bei Abschluss | Beim Klick auf "Fertig" muss jeder Buchung ein gültiges Gegenkonto (`account_id > 0`) zugewiesen sein; andernfalls werden fehlende Felder rot markiert |

### Datenübernahme in das Buchungsmodell

* **Buchungsdatum (`date`)**: Aus Buchungsdatum der Bank im ISO-Format (`YYYY-MM-DD`).
* **Vorgang (`vorgang`)**: Vorbelegt mit `'Buchung'`.
* **Empfänger / Sender (`sender_receiver`)**: Aus dem entsprechenden Namensfeld des Instituts (z. B. "Auftraggeber/Empfänger" bei ING, "Zahlungsempfänger" bei Comdirect, "Begünstigter / Auftraggeber" bei Deutsche Bank).
* **Beschreibung (`description`)**: Buchungstext und/oder Verwendungszweck.
* **Positionen (`BookingPosition[]`)**:
  - **1. Position (Zielkonto):**
    - `account_id`: ID des im Schritt 1 ausgewählten Zielkontos.
    - `valuta`: Wertstellungsdatum der Bank (ISO-Format `YYYY-MM-DD`), Fallback auf Buchungsdatum.
    - `amount`: Berechneter Fließkomma-Betrag (positiv für Einnahmen/Gutschriften, negativ für Ausgaben/Lastschriften).
  - **2. Position (Gegenbuchung):**
    - `account_id`: Initial unbesetzt (`0` / keine Vorauswahl), wird vom Anwender auf der zweiten Seite gewählt.
    - `valuta`: Entspricht der Valuta der 1. Position.
    - `amount`: Invertierter Betrag der 1. Position (`-Betrag`).

## UI-Hinweise

* **Navigation:** Neuer Menüeintrag "Import" in der Sidebar.
* **Erste Seite (Import-Formular):**
  - Segmentierte Auswahl für Import-Art (`Umsatz` / `Depot-Bestand`).
  - Dropdown für Institut (`ING`, `Comdirect`, `Deutsche Bank`).
  - Dropdown für Konto / Depot (gefiltert nach der gewählten Art).
  - Dateiauswahlfeld (File Input) für die CSV-Datei mit Anzeige des Dateinamens.
  - Primärer Button "Laden".
  - Erfolgsbanner bei erfolgreichem Buchungsimport.
* **Zweite Seite (Buchungsanzeige & Kontierung):**
  - Zusammenfassung: Import-Art, Institut, Zielkonto, Dateiname, Anzahl Buchungen und Summe der Banktransaktionen (1. Position).
  - Fehlermeldungsbanner bei unvollständiger Gegenkontierung.
  - Strukturierte Buchungstabelle mit Spalten:
    - `#`
    - `Buchungsdatum` (deutsches Format `DD.MM.YYYY`)
    - `Empfänger / Sender`
    - `Beschreibung / Verwendungszweck`
    - **`Gegenkonto`** (Auswahlbox mit allen verfügbaren Konten; bei Validierungsfehler rot umrandet und hinterlegt)
    - `Valuta` (deutsches Format `DD.MM.YYYY`)
    - `Betrag` (mit Farbcodierung grün/rot)
  - Button "Fertig", welcher die Validierung und Speicherung aller Buchungen anstößt.
