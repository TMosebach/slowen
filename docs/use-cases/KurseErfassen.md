# Kurse erfassen

# Beschreibung

Der Anwender erfasst oder aktualisiert historische und tagesaktuelle Kurse von Wertpapieren zu einem frei wählbaren Stichtag. Die Kurse werden in einer Sammelmaske für alle angelegten Wertpapiere gleichzeitig gepflegt.

Die erfassten Kurse bilden die Grundlage für:
* die Bewertung und Marktwertberechnung von Depotbeständen in der Depot-Detailansicht,
* die Gesamtvermögens- und Depotwertanzeige im Dashboard,
* die Anzeige des jeweils jüngsten Kurses in der Wertpapierliste.

# Beteiligte:

* Anwender
* Slowen, das System

# Vorbedingung

* Es ist mindestens ein Wertpapier im System angelegt (siehe Use Case [`WertpapierAnlegen.md`](WertpapierAnlegen.md)).
* Der Anwender hat die Anwendung gestartet.

# Ablauf

1. Der Anwender wählt in der Hauptnavigation den Eintrag "Wertpapiere".
2. Das System zeigt die Wertpapierübersicht (`/securities`) mit der Tabelle aller vorhandenen Wertpapiere an.
3. Der Anwender klickt in der Kopfzeile auf die Schaltfläche "Kurse" (neben "Neu").
4. Das System öffnet das Formular zur Kurserfassung (`/securities/prices`):
    * **Stichtagsdatum:** Vorgabewert ist das aktuelle Tagesdatum.
    * **Wertpapierliste:** Alle angelegten Wertpapiere werden zeilenweise mit Name, Typ, ISIN und einem Eingabefeld für den Kurs angezeigt.
5. Das System prüft, ob für das ausgewählte Stichtagsdatum bereits Kurse in der Datenbank existieren:
    * Vorhandene Kurse werden geladen und in den jeweiligen Eingabefeldern im deutschen Zahlenformat (z. B. `123,45`) vorbelegt.
    * Für Wertpapiere ohne bisherigen Kurs zu diesem Datum bleibt das Eingabefeld leer.
6. Der Anwender kann das Stichtagsdatum bei Bedarf anpassen (z. B. auf einen historischen Handelstag):
    * Bei Datumswechsel lädt das System automatisch die für den neu gewählten Tag gespeicherten Kurse nach.
7. Der Anwender trägt die Kurse für die gewünschten Wertpapiere ein oder passt bestehende Kurse an:
    * Eingabefelder von Wertpapieren, für die am Stichtag kein Kurs erfasst werden soll, bleiben leer.
8. Der Anwender klickt auf "Speichern" (oder bricht über "Abbrechen" ab).
9. Das System validiert die Eingaben:
    * Sind numerische Formate ungültig oder Werte $\le 0$, bricht das System mit einer verständlichen Fehlermeldung ab.
    * Andernfalls speichert das System die Kurse für den Stichtag:
        * Für Wertpapiere mit neuem Kurseintrag wird ein Datensatz in `security_prices` angelegt.
        * Für Wertpapiere mit bestehendem Kurseintrag am selben Datum wird der Wert aktualisiert (`UNIQUE(security_id, date)`).
        * Wertpapiere mit leerem Eingabefeld werden übersprungen (keine Änderung / kein Datensatz).
10. Das System zeigt eine Erfolgsmeldung an und navigiert zurück zur Wertpapierübersicht (`/securities`), die nun in der Spalte "Jüngster Kurs" die aktualisierten Werte anzeigt.

## Validierungsregeln

| Feld | Regel |
|------|-------|
| Stichtag / Datum | Pflichtfeld, gültiges Datum |
| Kurs pro Wertpapier | Optional pro Zeile; wenn befüllt: numerischer Wert $> 0$, maximal zwei Dezimalstellen empfohlen, Trennzeichen Komma oder Punkt |

## Datums- und Zahlenformate (Architekturkonformität)

In Übereinstimmung mit [`Architektur.md`](../Architektur.md) gilt die strikte Trennung zwischen externer Präsentation und interner Datenhaltung:

| Bereich | Format | Beispiel | Verantwortung / Regeln |
|---|---|---|---|
| **UI-Präsentation (Datum)** | Deutsches Format (`DD.MM.YYYY`) | `13.11.2026` | Sichtbare Anzeige im Formular und in Tabellen |
| **UI-Präsentation (Kurse)** | Deutsches Zahlenformat | `123,45` bzw. `1.234,56` | Komma als Dezimaltrenner, Tausendertrennpunkt bei Werten $\ge 1.000$ |
| **UI-Eingabefeld (Kurse)** | Flexibel | `123,45` oder `123.45` | Akzeptiert sowohl deutsches Komma als auch internationalen Dezimalpunkt |
| **UI-Formulareingabe (Datum)** | ISO 8601 (`YYYY-MM-DD`) | `2026-11-13` | `<input type="date">` bindet intern ISO-Wert, Browser lokalisiert die Darstellung |
| **Datenbank & IPC (Datum)** | ISO 8601 (`YYYY-MM-DD`) | `2026-11-13` | `TEXT NOT NULL` in SQLite, lexikografisch sortierbar (`ORDER BY date DESC`) |
| **Datenbank & IPC (Kurs)** | `REAL` / `number` | `123.45` | Standard-Gleitkommazahl |

## Datenmodell

### SecurityPrice (`security_prices`)

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| id | INTEGER | auto | Primary Key |
| security_id | INTEGER | ja | Foreign Key auf `securities(id)` |
| date | TEXT | ja | Stichtagsdatum im ISO-Format (`YYYY-MM-DD`) |
| price | REAL | ja | Kursbetrag pro Stück (> 0) |
| created_at | TEXT | auto | Erstellungszeitpunkt (`CURRENT_TIMESTAMP`) |
| updated_at | TEXT | auto | Letzter Aktualisierungszeitpunkt (`CURRENT_TIMESTAMP`) |

**Eindeutigkeits-Constraint:**
```sql
UNIQUE(security_id, date)
```
Pro Wertpapier kann an einem Stichtagsdatum genau ein Kurs existieren. Ein erneutes Speichern am selben Tag überschreibt den bestehenden Kurswert.

## UI-Hinweise

- **Einstiegsweg:** Navigation $\rightarrow$ "Wertpapiere" $\rightarrow$ Button "Kurse" (Route `/securities/prices`).
- **Sammelerfassung:** Alle Wertpapiere werden auf einer gemeinsamen Seite gelistet, um eine zügige Eingabe nach Börsenschluss ohne Einzelfensterwechsel zu ermöglichen.
- **Tagesdatum als Standard:** Das Stichtagsfeld ist standardmäßig mit dem aktuellen Systemdatum vorbelegt.
- **Dynamisches Nachladen:** Das Ändern des Datums lädt sofort vorhandene Kurse für den gewählten Tag aus der Datenbank nach.
- **Teileingaben:** Nicht jedes Wertpapier muss zwingend befüllt werden. Leere Felder bleiben unverändert bzw. werden nicht angelegt.
- **Abbrechen:** Der Button "Abbrechen" verwirft alle nicht gespeicherten Eingaben und leitet zurück zur Wertpapierübersicht (`/securities`).
- **Anzeige bei fehlenden Wertpapieren:** Befinden sich noch keine Wertpapiere im System, zeigt die Maske den Hinweis *"Noch keine Wertpapiere vorhanden."* anstelle der Tabelle.

## Verwandte Use Cases

- [`WertpapierAnlegen.md`](WertpapierAnlegen.md): Erfassen der Wertpapierstammdaten, die hier bepreist werden.
- [`KontodetailsAnsehen.md`](KontodetailsAnsehen.md): Bewertung der Depotbestände auf Basis des jüngsten Kurses (`getLatest`).
- [`ZeigeDashboard.md`](ZeigeDashboard.md): Berechnung und Aggregation des Gesamtvermögens und Depotwerts.
