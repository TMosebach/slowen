# Import-Formatspezifikation: ING

## 1. Dateiformat & Metadaten

* **Dateityp:** CSV (.csv)
* **Standard-Encoding:** UTF-8 (mit oder ohne BOM) oder Windows-1252 / ISO-8859-1 (Fallback)
* **Feldtrennzeichen:** Semikolon (`;`)
* **Dezimaltrennzeichen:** Komma (`,`), Tausendertrennzeichen Punkt (`.`)
* **Datumsformat:** `DD.MM.YYYY`
* **Vorspann / Metazeilen:** Vor der eigentlichen Datentabelle können Institutsangaben (IBAN, Zeitraum, Kontoinhaber) stehen. Die Kopfzeile wird anhand der Schlüsselwörter `Buchung` und `Betrag` dynamisch lokalisiert.

## 2. Spaltenübersicht (Umsatzanzeige)

| Spaltenname (typisch) | Bedeutung | Slowen-Verwendung |
|---|---|---|
| `Buchung` | Buchungstag der Bank | `Booking.date` |
| `Valuta` | Wertstellungstag | `BookingPosition[0].valuta` |
| `Auftraggeber/Empfänger` | Zahlungsbeteiligter | `Booking.sender_receiver` |
| `Buchungstext` | Kategorie/Vorgangsart der Bank | Erkennung Vorgangsart & `description` |
| `Verwendungszweck` | Freitext / Überweisungsdetails | `Booking.description` |
| `Saldo` | Kontosaldo nach Buchung | Nicht importiert (wird verworfen) |
| `Betrag` / `Betrag (EUR)` | Transaktionsbetrag | `BookingPosition[0].amount` |

## 3. Erkennung der Vorgangsarten

| Vorgangsart in Slowen | Erkennungskriterium in CSV | Status |
|---|---|---|
| **Buchung** (Standard) | Fallback / Standard, wenn keine Wertpapier-Schlüsselwörter zutreffen | Produktiv |
| **Tilgung** | `Buchungstext` oder `Verwendungszweck` enthält entsprechende Kennzeichnung (z. B. "Tilgung", "Fälligkeit", "Rückzahlung") | *Format folgt in weiterem Schritt* |
| **Einlieferung** | `Buchungstext` oder `Verwendungszweck` enthält entsprechende Kennzeichnung (z. B. "Einlieferung", "Depotübertrag") | *Format folgt in weiterem Schritt* |
| **Ertrag** | `Buchungstext` oder `Verwendungszweck` enthält "Dividende", "Ertragsgutschrift", "Zinsen", "Kupon" | *Format folgt in weiterem Schritt* |

## 4. Feld-Mappings je Vorgangsart

### 4.1 Vorgang: Buchung (Standard-Zahlungsverkehr)

* **Zielkonto (1. Position):** Ausgewähltes ING-Konto (z. B. Giro, Extra-Konto/Tagesgeld).
* **Gegenkonto (2. Position):** Wird vom Anwender auf Seite 2 ausgewählt.
* **Dubletten-Hinweis:** Aktiv (Prüfung gegen bestehende Buchungen im ±2-Tage-Fenster).

| Slowen-Feld | Quelldaten ING | Transformationsregel |
|---|---|---|
| `date` | Spalte `Buchung` | ISO 8601 (`YYYY-MM-DD`) |
| `vorgang` | Fester Wert `'Buchung'` | |
| `sender_receiver` | Spalte `Auftraggeber/Empfänger` | Getrimmt |
| `description` | Spalte `Buchungstext` + Spalte `Verwendungszweck` | Zusammengeführt mit Leerzeichen |
| `positions[0].account_id` | Import-Zielkonto | ID des gewählten Kontos |
| `positions[0].valuta` | Spalte `Valuta` (Fallback: `Buchung`) | ISO 8601 (`YYYY-MM-DD`) |
| `positions[0].amount` | Spalte `Betrag` | Fließkommazahl mit Vorzeichen |
| `positions[1].account_id` | Manuelle Auswahl durch Anwender | Pflicht bei Abschluss |
| `positions[1].valuta` | Wie Position 0 | |
| `positions[1].amount` | `-positions[0].amount` | Invertierter Betrag |

### 4.2 Wertpapiervorgänge (Tilgung, Einlieferung, Ertrag)

*(Die genaue Kodierung und Feldbelegung aus den ING-CSV-Dateien wird in den folgenden Schritten spezifiziert)*

* **Besonderheit:** Diese Vorgänge entstehen auf dem ING-Verrechnungskonto. Die Partnerkonten (Depot bzw. Steuer-/Ertragskonten) sind nicht Teil eines separaten Imports. Es findet keine Dublettenprüfung gegenüber Gegenbuchungen statt.

## 5. Fehlende / Optionale Angaben & Fallbacks

* Fehlt `Valuta`, wird das `Buchungsdatum` als Valuta übernommen.
* Fehlt `Auftraggeber/Empfänger`, wird ein leerer String eingetragen.
* Zusätzliche Fußzeilen der Bank (z. B. Saldohinweise) werden anhand ungültiger Datumsformate in der ersten Spalte ignoriert.

## 6. Beispieldaten

```csv
Buchung;Valuta;Auftraggeber/Empfänger;Buchungstext;Verwendungszweck;Saldo;Betrag (EUR)
01.09.2026;01.09.2026;Arbeitgeber GmbH;Gehalt/Rente;Gehalt September;3.500,00;2.500,00
02.09.2026;02.09.2026;Supermarkt AG;Lastschrift;Kartenzahlung;-;-50,00
```
