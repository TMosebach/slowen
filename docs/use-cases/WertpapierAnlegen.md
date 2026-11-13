# Wertpapier anlegen

# Beschreibung

Der Anwender legt Stammdaten für Wertpapiere (Aktien, Anleihen, Fonds, ETFs, Zertifikate) an. Die angelegten Wertpapiere bilden die Grundlage für die Bestandsführung in Depotkonten sowie für alle wertpapierbezogenen Buchungsvorgänge (Kauf, Verkauf, Tilgung, Ertrag, Einlieferung) und die historische Kurspflege.

# Beteiligte:

* Anwender
* Slowen, das System

# Vorbedingung

Der Anwender hat die Anwendung gestartet und befindet sich in der Navigation oder auf der Wertpapierliste (`/securities`).

# Ablauf

1. Der Anwender wählt in der Navigation den Eintrag "Wertpapiere".
2. Das System zeigt die Wertpapierliste an.
3. Der Anwender klickt auf die Schaltfläche "Neues Wertpapier".
4. Das System zeigt das Formular zur Erfassung eines Wertpapiers an mit:
    * **Name:** Pflichtfeld, Freitext
    * **Typ:** Pflichtfeld, Enum { `Aktie`, `Anleihe`, `Fonds`, `ETF`, `Zertifikat` }, Vorbelegung: `Aktie`
    * **ISIN:** Pflichtfeld, 12-stellig alphanumerisch, systemweit eindeutig
    * **WKN:** Pflichtfeld, 6-stellig alphanumerisch, systemweit eindeutig
    * **Fälligkeit:** Bedingtes Pflichtfeld (nur bei Typ `Anleihe` und `Zertifikat` sichtbar und erforderlich; bei `Aktie`, `Fonds` und `ETF` ausgeblendet)
5. Der Anwender wählt den Typ aus:
    * Wählt der Anwender `Anleihe` oder `Zertifikat`, blendet das System das Feld **Fälligkeit** als Pflichtfeld ein.
    * Wählt der Anwender `Aktie`, `Fonds` oder `ETF`, wird das Feld **Fälligkeit** ausgeblendet.
6. Der Anwender füllt die Pflichtfelder aus.
7. Der Anwender klickt auf "Speichern" (oder bricht mit "Abbrechen" ab).
8. Das System validiert die Eingaben:
    * Sind Pflichtfelder nicht befüllt, ISIN/WKN unvollständig oder nicht formgerecht, zeigt das System entsprechende Fehlermeldungen an.
    * Ist die ISIN oder WKN bereits bei einem anderen Wertpapier vergeben, bricht das System mit der Fehlermeldung *"ISIN oder WKN bereits vorhanden"* ab.
    * Andernfalls speichert das System den neuen Datensatz in der Tabelle `securities`.
9. Das System zeigt eine Erfolgsmeldung an und kehrt zur Wertpapierliste (`/securities`) zurück, die nun das neu angelegte Wertpapier enthält.

## Validierungsregeln

| Feld | Regel |
|------|-------|
| Name | Pflichtfeld, darf nicht leer sein |
| Typ | Pflichtfeld, Enum: `Aktie`, `Anleihe`, `Fonds`, `ETF`, `Zertifikat` |
| ISIN | Pflichtfeld, genau 12 alphanumerische Zeichen (A–Z, 0–9), systemweit eindeutig |
| WKN | Pflichtfeld, genau 6 alphanumerische Zeichen (A–Z, 0–9), systemweit eindeutig |
| Fälligkeit | Pflichtfeld, wenn Typ = `Anleihe` oder `Zertifikat`. Format: ISO 8601 (`YYYY-MM-DD`). Nicht zulässig / ausgeblendet für `Aktie`, `Fonds`, `ETF`. |

## Typ-Definitionen und Fälligkeit

| Wertpapiertyp | Fälligkeitsdatum erforderlich? | Typische Anwendungsfälle |
|---|---|---|
| `Aktie` | Nein (ausgeblendet) | Dividendenaktien, Stamm- und Vorzugsaktien |
| `Anleihe` | **Ja (Pflichtfeld)** | Staats- und Unternehmensanleihen mit festem Endfälligkeitsdatum |
| `Fonds` | Nein (ausgeblendet) | Offene Investmentfonds, Geldmarktfonds |
| `ETF` | Nein (ausgeblendet) | Exchange Traded Funds (Indexfonds) |
| `Zertifikat` | **Ja (Pflichtfeld)** | Strukturierte Produkte, Discount-/Bonus-Zertifikate mit Fälligkeit |

## Datenmodell

### Security (`securities`)

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| id | INTEGER | auto | Primary Key |
| name | TEXT | ja | Bezeichnung des Wertpapiers |
| type | TEXT | ja | Wertpapierart (`Aktie`, `Anleihe`, `Fonds`, `ETF`, `Zertifikat`) |
| isin | TEXT | ja | Internationale Wertpapierkennnummer (12 Stellen, `UNIQUE`) |
| wkn | TEXT | ja | Deutsche Wertpapierkennnummer (6 Stellen, `UNIQUE`) |
| faelligkeit | TEXT | bedingt | Fälligkeitsdatum im ISO-Format (`YYYY-MM-DD`), `NULL` bei Typen ohne Fälligkeit |
| created_at | TEXT | auto | Erstellungszeitpunkt (`CURRENT_TIMESTAMP`) |
| updated_at | TEXT | auto | Letzter Aktualisierungszeitpunkt (`CURRENT_TIMESTAMP`) |

## UI-Hinweise

- **Direkteinstieg:** Über Hauptnavigation "Wertpapiere" $\rightarrow$ Button "Neues Wertpapier" (Route `/securities/form`).
- **ISIN / WKN Normalisierung:**
  - Eingaben in den Feldern ISIN und WKN werden bei Eingabe und Verlassen automatisch in Großbuchstaben konvertiert.
  - Sonderzeichen, Leerzeichen und Umlaute werden automatisch gefiltert (zulässig sind ausschließlich `[A-Z0-9]`).
- **Fälligkeitsfeld:**
  - Technische Realisierung via `<input type="date">` mit bidirektionaler Bindung an den ISO-Datumsstring (`YYYY-MM-DD`).
  - Dynamische Sichtbarkeit gekoppelt an die Wertpapierart (`FAELLIGKEIT_TYPES`).
- **Abbrechen:**
  - Die Schaltfläche "Abbrechen" verwirft alle Eingaben und navigiert zurück zur Wertpapierliste (`/securities`).

## Verwandte Use Cases

- [`KaufErfassen.md`](KaufErfassen.md): Auswahl des Wertpapiers beim Kauf in ein Depot.
- [`VerkaufErfassen.md`](VerkaufErfassen.md): Veräußerung von Beständen des Wertpapiers nach dem FIFO-Prinzip.
- [`TilgungErfassen.md`](TilgungErfassen.md): Tilgung von Anleihen und Zertifikaten unter Nutzung des gepflegten Fälligkeitsdatums (`faelligkeit`).
- [`ErtragErfassen.md`](ErtragErfassen.md): Erfassung von Dividenden, Zinsen und Ausschüttungen mit automatischer Zuordnung des Ertragskontos anhand des Wertpapiertyps.
- [`EinlieferungErfassen.md`](EinlieferungErfassen.md): Einbuchen von Altbeständen oder Depotüberträgen für das Wertpapier.
- [`ImportiereUmsaetze.md`](ImportiereUmsaetze.md): Automatisches Matching oder Anforderung fehlender Wertpapierstammdaten bei Bank-Umsatzimporten.
