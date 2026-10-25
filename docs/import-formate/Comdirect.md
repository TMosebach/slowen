# Import-Formatspezifikation: Comdirect

## 1. Dateiformat & Metadaten

* **Dateityp:** CSV (.csv)
* **Standard-Encoding:** Windows-1252 / ISO-8859-1 oder UTF-8
* **Feldtrennzeichen:** Semikolon (`;`)
* **Dezimaltrennzeichen:** Komma (`,`), Tausendertrennzeichen Punkt (`.`)
* **Datumsformat:** `DD.MM.YYYY`
* **Vorspann / Metazeilen:** Vor der Tabelle stehen Metazeilen mit "Umsätze - Girokonto", "Zeitraum:", etc. Die Kopfzeile wird anhand der Schlüsselwörter `Buchung` und `Umsatz`/`Betrag` ermittelt.

## 2. Spaltenübersicht (Umsatzanzeige)

| Spaltenname (typisch) | Bedeutung | Slowen-Verwendung |
|---|---|---|
| `Buchungstag` | Buchungstag der Bank | `Booking.date` |
| `Wertstellung (Valuta)` | Wertstellungstag | `BookingPosition[0].valuta` |
| `Vorgang` | Art des Geschäfts (z. B. "Überweisung", "Wertpapiere") | Erkennung Vorgangsart & `description` |
| `Buchungstext` | Detailtext / Verwendungszweck | `Booking.description` |
| `Zahlungsempfänger/-pflichtiger` | Kontrahent / Partner | `Booking.sender_receiver` |
| `Umsatz in EUR` | Transaktionsbetrag | `BookingPosition[0].amount` |

## 3. Erkennung der Vorgangsarten

| Vorgangsart in Slowen | Erkennungskriterium in CSV | Status |
|---|---|---|
| **Buchung** (Standard) | Fallback / Standard bei allgemeinen Umsätzen (Überweisung, Lastschrift, Kartenzahlung) | Produktiv |
| **Tilgung** | Spalte `Vorgang` oder `Buchungstext` enthält entsprechende Merkmale (z. B. "Wertpapiere", "Tilgung", "Fälligkeit", "Einlösung") | *Format folgt in weiterem Schritt* |
| **Einlieferung** | Spalte `Vorgang` oder `Buchungstext` enthält entsprechende Merkmale (z. B. "Einlieferung", "Übertrag") | *Format folgt in weiterem Schritt* |
| **Ertrag** | Spalte `Vorgang` oder `Buchungstext` enthält "Dividende", "Ausschüttung", "Zinszahlung", "Ertragsgutschrift" | *Format folgt in weiterem Schritt* |

## 4. Feld-Mappings je Vorgangsart

### 4.1 Vorgang: Buchung (Standard-Zahlungsverkehr)

* **Zielkonto (1. Position):** Ausgewähltes Comdirect-Konto (z. B. Giro, Verrechnungskonto).
* **Gegenkonto (2. Position):** Wird vom Anwender auf Seite 2 ausgewählt.
* **Dubletten-Hinweis:** Aktiv (Prüfung gegen bestehende Buchungen im ±2-Tage-Fenster).

| Slowen-Feld | Quelldaten Comdirect | Transformationsregel |
|---|---|---|
| `date` | Spalte `Buchungstag` | ISO 8601 (`YYYY-MM-DD`) |
| `vorgang` | Fester Wert `'Buchung'` | |
| `sender_receiver` | Spalte `Zahlungsempfänger/-pflichtiger` | Getrimmt |
| `description` | Spalte `Vorgang` + Spalte `Buchungstext` | Zusammengeführt mit Leerzeichen |
| `positions[0].account_id` | Import-Zielkonto | ID des gewählten Kontos |
| `positions[0].valuta` | Spalte `Wertstellung (Valuta)` | ISO 8601 (`YYYY-MM-DD`) |
| `positions[0].amount` | Spalte `Umsatz in EUR` | Fließkommazahl mit Vorzeichen |
| `positions[1].account_id` | Manuelle Auswahl durch Anwender | Pflicht bei Abschluss |
| `positions[1].valuta` | Wie Position 0 | |
| `positions[1].amount` | `-positions[0].amount` | Invertierter Betrag |

### 4.2 Wertpapiervorgänge (Tilgung, Einlieferung, Ertrag)

*(Die genaue Kodierung und Feldbelegung aus den Comdirect-CSV-Dateien wird in den folgenden Schritten spezifiziert)*

* **Besonderheit:** Diese Vorgänge entstehen auf dem Comdirect-Verrechnungskonto. Die Partnerkonten (Depot bzw. Steuer-/Ertragskonten) sind nicht Teil eines separaten Imports. Es findet keine Dublettenprüfung gegenüber Gegenbuchungen statt.

## 5. Fehlende / Optionale Angaben & Fallbacks

* Fehlt `Wertstellung (Valuta)`, wird `Buchungstag` verwendet.
* Fehlt `Zahlungsempfänger/-pflichtiger`, bleibt das Feld leer.
* Fußzeilen der Comdirect (z. B. "Alter Kontostand", "Neuer Kontostand") werden ignoriert.

## 6. Beispieldaten

```csv
"Buchungstag";"Wertstellung (Valuta)";"Vorgang";"Buchungstext";"Zahlungsempfänger/-pflichtiger";"Umsatz in EUR"
"01.09.2026";"01.09.2026";"Überweisung";"Rechnungsbegleichung";"Handwerker GmbH";"-150,00"
"02.09.2026";"02.09.2026";"Gutschrift";"Rückerstattung";"Online Shop";"45,90"
```
