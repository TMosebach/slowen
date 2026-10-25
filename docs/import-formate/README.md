# Spezifikationen der CSV-Importformate

## Zweck

Dieses Verzeichnis enthält die instituts- und dateiformatspezifischen Spezifikationen für den Import von CSV-Dateien in Slowen. Es dient als verbindliche Fach- und Parser-Referenz.

## Trennung von Use Case und Format-Spezifikation

Um die Spezifikationen lesbar, modular und erweiterbar zu halten, gilt folgende Aufgabenverteilung:

* **Use Case (`docs/use-cases/ImportiereUmsaetze.md`)**:
  - Definiert den fachlichen Anwenderablauf (Schritte 1 bis 9).
  - Regelt Seitenaufbau, Validierungen, Toleranzfenster, Gegenkonto-Zuweisung, Dubletten-Hinweise, Ignorieren-Logik und Persistierung.
  - Definiert die unterstützten **Vorgangsarten** (z. B. Standard-`Buchung` sowie Wertpapiervorgänge wie `Tilgung`, `Einlieferung`, `Ertrag`).
* **Format-Dokumente (`docs/import-formate/<Institut>.md`)**:
  - Dokumentieren das konkrete CSV-Dateiformat des jeweiligen Instituts (Zeichensatz, Trennzeichen, Header-Zeilen).
  - Enthalten die Erkennungsmerkmale für Vorgangsarten (anhand von Buchungstext, Vorgangsspalte, Umsatzart oder Schlüsselwörtern).
  - Beschreiben das Mapping der Rohspalten auf die Felder des Slowen-Modells (`Booking`, `BookingPosition`, etc.).
  - Definieren Fallback-Regeln für Informationen, die in der Datei nicht oder unvollständig geliefert werden.
  - Stellen anonymisierte Test- und Beispieldaten bereit.

## Unterstützte Institute

| Institut | Datei | Status |
|---|---|---|
| **ING** | [`ING.md`](ING.md) | Standard-Umsatz vorhanden; Wertpapiervorgänge in Vorbereitung |
| **Comdirect** | [`Comdirect.md`](Comdirect.md) | Standard-Umsatz vorhanden; Wertpapiervorgänge in Vorbereitung |
| **Deutsche Bank** | [`DeutscheBank.md`](DeutscheBank.md) | Standard-Umsatz vorhanden; Wertpapiervorgänge in Vorbereitung |

## Vorgangsarten-Matrix

| Vorgangsart | Art des Zielkontos | Gegenkonten / Partnerkonten | Besonderheiten Dublettenprüfung |
|---|---|---|---|
| **Buchung** (Standard) | Giro / Tagesgeld / Kreditkarte | Freies Gegenkonto (Giro, Aufwand, etc.) | Dublettenprüfung relevant, da Gegenkonto vorab importiert/gebucht sein kann |
| **Tilgung** | Verrechnungskonto | Depotkonto / Systemkonten | Entsteht auf Verrechnungskonto; Depot wird nicht importiert $\rightarrow$ keine Dublette aus Gegenimport |
| **Einlieferung** | Verrechnungskonto / Depot | Gegenposition / Einbuchung | Entsteht auf Verrechnungskonto/Depot $\rightarrow$ keine Dublette aus Gegenimport |
| **Ertrag** (Dividende, Zinsen) | Verrechnungskonto | Ertragskonto (GuV) / Steuerkonten | Entsteht auf Verrechnungskonto; Steuer-/Ertragskonten nicht importiert $\rightarrow$ keine Dublette aus Gegenimport |

## Aufbau einer Formatspezifikation

Jede Formatdatei folgt dieser einheitlichen Struktur:
1. **Metadaten & CSV-Format:** Encoding, Zeilenumbruch, Feldtrenner, Kopfzeilen.
2. **Spaltenübersicht:** Auflistung aller Rohspalten des Instituts.
3. **Erkennung der Vorgangsarten:** Kriterien/Muster, wie das System die Vorgangsart identifiziert.
4. **Feld-Mappings je Vorgangsart:** Tabellarische Zuordnung zu Slowen-Feldern.
5. **Fehlende / Optionale Angaben & Fallbacks:** Behandlung nicht gelieferter Werte.
6. **Beispieldaten:** Authentische Testzeilen.
