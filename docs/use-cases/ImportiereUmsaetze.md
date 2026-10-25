# Importiere Umsätze

## Beschreibung

Der Anwender importiert Umsätze aus CSV-Dateien externer Kreditinstitute (ING, Comdirect, Deutsche Bank) in ein ausgewähltes Konto. Das System ermittelt den passenden instituts- und artenspezifischen Parser, überführt die Fremddaten in das Slowen-interne Buchungsmodell (`Booking` mit zwei ausgeglichenen `BookingPosition`en) und visualisiert die erkannten Buchungen auf einer zweiten Seite, auf der der Anwender das Gegenkonto der Buchung manuell zuweist.

Die instituts- und dateiformatspezifischen Kodierungs- und Spaltenregeln sowie die Erkennungsmerkmale für Vorgangsarten sind in den separaten Formatspezifikationen unter [`docs/import-formate/`](../import-formate/README.md) dokumentiert.

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
5. Das System ermittelt den zur Kombination aus `Art des Imports` und `Institut` passenden Parser (siehe Spezifikationen in [`docs/import-formate/`](../import-formate/README.md)).
6. Der Parser liest die CSV-Datei ein, erkennt anhand der formatspezifischen Regeln die Vorgangsart (z. B. `Buchung`, `Tilgung`, `Einlieferung`, `Ertrag`) und übersetzt die Daten in das interne Buchungsmodell.
   * Bei der Art *Umsatz* bestimmt das System den Datumszeitraum der importierten Buchungen über das Minimum und Maximum von Buchungsdatum (`date`) und Valuta (`valuta`) aller importierten Sätze, erweitert um jeweils 2 Tage Toleranz davor und danach (`von = min - 2 Tage`, `bis = max + 2 Tage`).
   * Das System lädt alle bereits in Slowen vorhandenen Buchungen des Zielkontos, bei denen das Buchungsdatum ODER die Valuta einer Buchungsposition in diesen erweiterten Zeitraum fällt.
   * Das System wechselt auf die zweite Seite.
7. Das System zeigt die erzeugten Buchungen gemeinsam mit den vorhandenen Buchungen auf der **zweiten Seite (Buchungsvorschau & Kontierung)** an:
   * **Kennzeichnung & Sortierung:** Die Buchungen werden chronologisch dargestellt. Vorhandene Buchungen sind optisch hervorgehoben und durch ein Badge (z. B. "Vorhanden") eindeutig von neuen Import-Buchungen ("Neu") unterscheidbar.
   * **Dubletten-Hinweis:** Erkennt das System bei einer neuen Import-Buchung eine mögliche Übereinstimmung mit einer vorhandenen Buchung (gleicher Betrag und Datum/Valuta im Toleranzbereich), wird ein optischer Dubletten-Hinweis angezeigt.
   * **Ignorieren von Import-Buchungen:** Jede neue Import-Buchung bietet eine Checkbox/Aktion "Ignorieren". Wird eine Buchung ignoriert, wird sie optisch entwertet (z. B. ausgegraut) und von der Gegenkonto-Pflicht sowie dem späteren Speichern ausgenommen.
   * **Korrektur vorhandener Buchungen:** Der Anwender kann bei einer vorhandenen Buchung die Felder `Empfänger / Sender`, `Beschreibung / Verwendungszweck`, `Buchungsdatum` und `Valuta` direkt korrigieren. Die Beträge bleiben unverändert. Die Änderungen werden vorgemerkt und erst bei "Fertig" gespeichert.
   * **Gegenkonto:**
     - Für jede nicht ignorierte Import-Buchung existiert eine Spalte **Gegenkonto** links von Valuta und Betrag zur Auswahl des gewünschten Gegenkontos.
     - Bei vorhandenen Buchungen wird das bereits zugeordnete Gegenkonto schreibgeschützt angezeigt.
8. Der Anwender klickt auf den Button **"Fertig"**.
9. Das System prüft, ob der Anwender in allen aktiven (nicht ignorierten) Import-Buchungen ein Gegenkonto angegeben hat:
   * **Fall A (Alle erforderlichen Gegenkonten gepflegt):**
     1. Das System speichert die vorgenommenen Korrekturen an vorhandenen Buchungen in der Datenbank.
     2. Das System speichert alle nicht ignorierten Import-Buchungen mit ihren Positionen in der Datenbank.
     3. Als "Ignorieren" markierte Import-Buchungen werden verworfen und nicht gespeichert.
     4. Das System kehrt auf die erste Import-Seite zurück und zeigt eine Erfolgsmeldung an (inklusive Information über importierte, ignorierte und korrigierte Buchungen).
   * **Fall B (Mindestens ein Gegenkonto bei einer aktiven Import-Buchung fehlt):**
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
| Zeitraum Vorhandene Buchungen (nur Art *Umsatz*) | Berechnet als `[min(date, valuta) - 2 Tage, max(date, valuta) + 2 Tage]` über alle importierten Buchungen. Es werden alle Buchungen geladen, die das Zielkonto betreffen und deren `date` ODER `valuta` (einer Buchungsposition) in diesem Bereich liegen. |
| Kennzeichnung vorhandener Buchungen | Optische Unterscheidung mit Badge "Vorhanden" (gegenüber "Neu"). Gegenkonto ist fest vorgegeben (bereits gebucht). Beträge sind unveränderlich. |
| Korrektur vorhandener Buchungen | Felder `Empfänger / Sender`, `Beschreibung / Verwendungszweck`, `Buchungsdatum` und `Valuta` dürfen vom Anwender direkt in der Zeile editiert werden. Änderungen werden erst beim Klick auf "Fertig" gespeichert. |
| Mögliche Dubletten | Hinweis-Icon/Badge an der Import-Zeile, wenn eine vorhandene Buchung den gleichen Betrag und ein Buchungsdatum oder eine Valuta innerhalb des Toleranzzeitraums (±2 Tage) aufweist. |
| Ignorieren von Import-Buchungen | Kann pro neuer Import-Buchung aktiviert werden. Ignorierte Zeilen erfordern kein Gegenkonto und werden beim Speichern verworfen (verhindert Doppelbuchungen bei bereits anderweitig erfassten Umsätzen). |
| Gegenkonto-Pflicht bei Abschluss | Beim Klick auf "Fertig" muss jeder **aktiven (nicht ignorierten) Import-Buchung** ein gültiges Gegenkonto (`account_id > 0`) zugewiesen sein; andernfalls werden fehlende Felder rot markiert. |

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

* **Navigation:** Menüeintrag "Import" in der Sidebar.
* **Erste Seite (Import-Formular):**
  - Segmentierte Auswahl für Import-Art (`Umsatz` / `Depot-Bestand`).
  - Dropdown für Institut (`ING`, `Comdirect`, `Deutsche Bank`).
  - Dropdown für Konto / Depot (gefiltert nach der gewählten Art).
  - Dateiauswahlfeld (File Input) für die CSV-Datei mit Anzeige des Dateinamens.
  - Primärer Button "Laden".
  - Erfolgsbanner bei erfolgreichem Buchungsimport.
* **Zweite Seite (Buchungsanzeige & Kontierung):**
  - Zusammenfassung: Import-Art, Institut, Zielkonto, Dateiname, Anzahl Buchungen (aufgeschlüsselt: neu, vorhanden, ignoriert) und Summe der aktiven Banktransaktionen (1. Position).
  - Fehlermeldungsbanner bei unvollständiger Gegenkontierung.
  - Strukturierte Buchungstabelle mit Spalten:
    - `#`
    - `Status` (Badge: "Neu" / "Vorhanden", ggf. Warnhinweis "Mögliche Dublette")
    - `Ignorieren` (Checkbox für neue Import-Zeilen)
    - `Buchungsdatum` (deutsches Format `DD.MM.YYYY`; editierbar für vorhandene Buchungen)
    - `Empfänger / Sender` (editierbar für vorhandene Buchungen)
    - `Beschreibung / Verwendungszweck` (editierbar für vorhandene Buchungen)
    - **`Gegenkonto`** (Auswahlbox bei neuen Import-Buchungen; als fester Text bei vorhandenen Buchungen; rot markiert bei Validierungsfehler)
    - `Valuta` (deutsches Format `DD.MM.YYYY`; editierbar für vorhandene Buchungen)
    - `Betrag` (mit Farbcodierung grün/rot; schreibgeschützt)
  - Button "Fertig", welcher die Validierung, die Aktualisierung korrigierter vorhandener Buchungen und die Speicherung aller aktiven Import-Buchungen anstößt.

## Vorgangsarten und Varianten

Die importierten Umsätze werden anhand institutionsspezifischer Kriterien in unterschiedliche Vorgangsarten unterteilt. Die konkrete Erkennung und das Mapping pro Institut sind in [`docs/import-formate/`](../import-formate/README.md) spezifiziert.

### 1. Standard-Umsatz (`vorgang = 'Buchung'`)
* Typische Fälle: Überweisungen, Lastschriften, Kartenzahlungen, Daueraufträge auf Giro- oder Anlagekonten.
* **Gegenkonto:** Freie Auswahl des Gegenkontos durch den Anwender (Aufwand, Ertrag oder Bestandskonto).
* **Dublettenprüfung:** Voll aktiv (±2 Tage Toleranz), da Gegenbuchungen vorab auf anderen Konten erfasst oder importiert worden sein können.

### 2. Wertpapiervorgänge auf dem Verrechnungskonto
Wertpapiervorgänge entstehen auf dem dem Depot zugeordneten Verrechnungskonto (z. B. Giro- oder Verrechnungskonto).

* **Kauf (`vorgang = 'Kauf'`):**
  - Kauf eines Wertpapiers mit Belastung des Verrechnungskontos.
  - Das System erkennt den Vorgang und extrahiert nach Möglichkeit die ISIN.
  - In der Import-Vorschau werden anstelle der einfachen Gegenkonto-Auswahl die Kauf-Pflichtfelder gemäß [`KaufErfassen.md`](KaufErfassen.md) angezeigt: **Wertpapier**, **Depot-Konto**, **Stückzahl**, **Kurs pro Stück** sowie optional **Gebühren** und **Stückzinsen**.
  - Fehlt die Stückzahl oder das Wertpapier (z. B. noch nicht in Slowen angelegt), muss der Anwender diese Angaben vor dem Speichern in der Zeile ergänzen.
  - Werden Gebühren oder Stückzinsen nicht angegeben (leer oder 0), werden keine entsprechenden Provisions-/Stückzinspositionen angelegt.
* **Tilgung (`vorgang = 'Tilgung'`):**
  - Rückzahlung bzw. Fälligkeit eines Wertpapiers (z. B. Anleihe, Zertifikat) mit Gutschrift des Nennwerts auf dem Verrechnungskonto und Ausbuchung der Bestände aus dem Depot (siehe auch Use Case [`TilgungErfassen.md`](TilgungErfassen.md)).
  - Das System erkennt die Tilgung anhand institutsspezifischer Merkmale (z. B. Buchungstext "Wertpapiergutschrift" und Verwendungszweck beginnend mit "Tilgung") und extrahiert die ISIN.
  - In der Import-Vorschau werden analog zum Kauf die Tilgungs-Pflichtfelder angezeigt: **Wertpapier**, **Depot-Konto**, **Stückzahl**, **Tilgungskurs** (vorbelegt mit 100) sowie optional **Gebühren** und **Steuern** (Kapitalertragsteuer, Solidaritätszuschlag).
  - Das System schlägt automatisch eine Stückzahl basierend auf Betrag und Tilgungskurs vor, welche vom Anwender angepasst werden kann (auch Teiltilgungen zulässig).
  - Bei einer rechnerischen Abweichung zwischen berechnetem Nettozufluss und CSV-Betrag wird ein optischer Abweichungshinweis angezeigt.
* **Einlieferung (`vorgang = 'Einlieferung'`):**
  - Übertrag bzw. Einbuchung von Wertpapierbeständen.
* **Ertrag (`vorgang = 'Ertrag'`):**
  - Gutschriften aus Dividenden, Zinsen oder Fondsausschüttungen auf dem Verrechnungskonto, ggf. unter Berücksichtigung einbehaltener Steuern.
* **Besonderheit bei der Dublettenprüfung:**
  - Die beteiligten Partnerkonten (Depotkonto, Ertrags- oder Steuerkonten) unterliegen keinem separaten Fremdimport.
  - Daher können bei diesen Vorgängen keine Dubletten aus Gegenbuchungen eines Partnerkonto-Imports entstehen; die Dublettenprüfung gegen vorherige Importe entfällt hier (bzw. prüft nur manuell vorab erfasste Käufe auf dem Verrechnungskonto).
