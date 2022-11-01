# Slowen Datenimport

Der Import ist ein Tool zum Importieren von Kontenrahmen und Buchungen.

## Aufruf

Das Tool kennt zwei Argumente:

* m - Modus (Konto oder Buchung)
* f - File (zu importierende Datei)

Beispielaufruf:

	java -jar import-0.0.1-SNAPSHOT.jar -m Konto -f konten.csv
	
## Eingabeformat

### Konto-Import

Die Kontodatei ist eine CSV-Datei (Trennung durch ';') mit den folgenden Spalten:

* KontoType
* Name
* BilanzType

### Buchung-Import

Die Buchungdatei ist eine CSV-Datei (Trennung durch ';') mit den folgenden Spalten:

* Empfänger
* Verwendung
* Datum
* Konto
* Betrag
* ....

Das Datum wird sowohl für das Buchungsdatum als auch für die Valuta in den Kontoumsätzen herangezogen.

Die Konto/Betrag-Spalten-Kombination ist fortführbar, wodurch mehrfache Buchungen darstellbar sind.
