# Import-Formatspezifikation: Deutsche Bank

## 1. Dateiformat & Metadaten

* **Dateityp:** CSV (.csv)
* **Standard-Encoding:** Windows-1252 / ISO-8859-1 oder UTF-8
* **Feldtrennzeichen:** Semikolon (`;`)
* **Dezimaltrennzeichen:** Komma (`,`), Tausendertrennzeichen Punkt (`.`)
* **Datumsformat:** `DD.MM.YYYY`
* **Vorspann / Metazeilen:** Vor der Tabelle stehen Zeilen mit Konto- und Auszugsdaten. Die Kopfzeile wird anhand von `Buchungstag` und `Betrag`/`Umsatz` dynamisch identifiziert.

## 2. Spaltenübersicht (Umsatzanzeige)

| Spaltenname (typisch) | Bedeutung | Slowen-Verwendung |
|---|---|---|
| `Buchungstag` | Buchungstag der Bank | `Booking.date` |
| `Wert` / `Wertstellung` | Wertstellungstag | `BookingPosition[0].valuta` |
| `Umsatzart` | Text der Umsatzart (z. B. "SEPA-Überweisung", "Wertpapierabrechnung") | Erkennung Vorgangsart & `description` |
| `Begünstigter / Auftraggeber` | Zahlungsbeteiligter | `Booking.sender_receiver` |
| `Verwendungszweck` | Freitext / Verwendungszweck | `Booking.description` |
| `Betrag` | Transaktionsbetrag | `BookingPosition[0].amount` |

## 3. Erkennung der Vorgangsarten

| Vorgangsart in Slowen | Erkennungskriterium in CSV | Status |
|---|---|---|
| **Buchung** (Standard) | Fallback / Standard bei allgemeinen Umsätzen | Produktiv |
| **Tilgung** | Spalte `Umsatzart` oder `Verwendungszweck` enthält entsprechende Merkmale (z. B. "Wertpapier", "Tilgung", "Fälligkeit", "Rückzahlung Anleihe") | *Format folgt in weiterem Schritt* |
| **Einlieferung** | Spalte `Umsatzart` oder `Verwendungszweck` enthält Merkmale für Einlieferungen/Überträge | *Format folgt in weiterem Schritt* |
| **Ertrag** | Spalte `Umsatzart` oder `Verwendungszweck` enthält "Dividende", "Zinsen", "Ertragsgutschrift" | *Format folgt in weiterem Schritt* |

## 4. Feld-Mappings je Vorgangsart

### 4.1 Vorgang: Buchung (Standard-Zahlungsverkehr)

* **Zielkonto (1. Position):** Ausgewähltes Deutsche-Bank-Konto (z. B. Giro, Verrechnungskonto).
* **Gegenkonto (2. Position):** Wird vom Anwender auf Seite 2 ausgewählt.
* **Dubletten-Hinweis:** Aktiv (Prüfung gegen bestehende Buchungen im ±2-Tage-Fenster).

| Slowen-Feld | Quelldaten Deutsche Bank | Transformationsregel |
|---|---|---|
| `date` | Spalte `Buchungstag` | ISO 8601 (`YYYY-MM-DD`) |
| `vorgang` | Fester Wert `'Buchung'` | |
| `sender_receiver` | Spalte `Begünstigter / Auftraggeber` | Getrimmt |
| `description` | Spalte `Umsatzart` + Spalte `Verwendungszweck` | Zusammengeführt mit Leerzeichen |
| `positions[0].account_id` | Import-Zielkonto | ID des gewählten Kontos |
| `positions[0].valuta` | Spalte `Wert` / `Wertstellung` | ISO 8601 (`YYYY-MM-DD`) |
| `positions[0].amount` | Spalte `Betrag` | Fließkommazahl mit Vorzeichen |
| `positions[1].account_id` | Manuelle Auswahl durch Anwender | Pflicht bei Abschluss |
| `positions[1].valuta` | Wie Position 0 | |
| `positions[1].amount` | `-positions[0].amount` | Invertierter Betrag |

### 4.2 Wertpapiervorgänge (Tilgung, Einlieferung, Ertrag)

*(Die genaue Kodierung und Feldbelegung aus den Deutsche-Bank-CSV-Dateien wird in den folgenden Schritten spezifiziert)*

* **Besonderheit:** Diese Vorgänge entstehen auf dem Deutsche-Bank-Verrechnungskonto. Die Partnerkonten (Depot bzw. Steuer-/Ertragskonten) sind nicht Teil eines separaten Imports. Es findet keine Dublettenprüfung gegenüber Gegenbuchungen statt.

## 5. Fehlende / Optionale Angaben & Fallbacks

* Fehlt `Wert`, wird das `Buchungstag` als Valuta übernommen.
* Zeilen mit Kontosalden ("Kontostand", "Saldo") am Dateiende werden automatisch herausgefiltert.

## 6. Beispieldaten

```csv
Buchungstag;Wert;Umsatzart;Begünstigter / Auftraggeber;Verwendungszweck;Betrag
01.09.2026;01.09.2026;SEPA-Überweisung;Stadtwerke;Stromabschlag;-85,00
02.09.2026;02.09.2026;Gutschrift;Finanzamt;Steuererstattung;420,00
```
