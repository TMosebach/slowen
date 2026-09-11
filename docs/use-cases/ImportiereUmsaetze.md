# Importiere Umsätze

## Beschreibung

Der Anwender importiert Umsätze oder Depot-Bestände aus CSV-Dateien externer Kreditinstitute (ING, Comdirect, Deutsche Bank) in ein ausgewähltes Konto bzw. Depot.

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
5. Das System liest die CSV-Datei ein, wechselt auf die **zweite Seite (Datei-Inhalt/Vorschau)** und zeigt den Inhalt der Datei tabellarisch an.
6. Der Anwender prüft die Anzeige und klickt auf den Button **"Fertig"**.
7. Das System wechselt wieder auf die erste Import-Seite zurück.

## Validierungsregeln

| Feld / Element | Regel |
|---|---|
| Art des Imports | Pflichtfeld, Enum: `Umsatz`, `Depot-Bestand` |
| Institut | Pflichtfeld, Enum: `ING`, `Comdirect`, `Deutsche Bank` |
| Konto / Depot | Pflichtfeld, muss ein existierendes Konto passend zum gewählten Typ sein |
| CSV-Datei | Pflichtfeld, lesbare Datei im CSV-Format |
| Laden-Button | Nur aktiv, wenn alle Pflichtfelder ausgefüllt und eine CSV-Datei ausgewählt ist |

## UI-Hinweise

* **Navigation:** Neuer Menüeintrag "Import" in der Sidebar.
* **Erste Seite (Import-Formular):**
  - Dropdown / Auswahl für Import-Art (`Umsatz` / `Depot-Bestand`).
  - Dropdown für Institut (`ING`, `Comdirect`, `Deutsche Bank`).
  - Dropdown für Konto / Depot (gefiltert nach der gewählten Art).
  - Dateiauswahlfeld (File Input) für die CSV-Datei mit Anzeige des Dateinamens.
  - Primärer Button "Laden".
* **Zweite Seite (Inhaltsanzeige):**
  - Tabelle mit den eingelesenen Zeilen und Spalten der CSV-Datei.
  - Button "Fertig", welcher zurück zur ersten Seite navigiert/umschaltet.
