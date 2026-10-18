# Buchungsliste anzeigen

# Beschreibung

Der Anwender öffnet die Buchungsübersicht, um alle erfassten Buchungen mit Vorgang, Datum, Beschreibung und Gegenpartei einzusehen.

# Beteiligte:

* Anwender
* Slowen, das System

# Ablauf

1. Der Anwender wählt den Eintrag „Buchungen“ in der Navigationsleiste.
2. Das System zeigt die Buchungsliste an mit:
    * Vorgang (Buchung, Kauf, Verkauf)
    * Buchungsdatum
    * Beschreibung
    * Sender / Empfänger
    * Aktionen pro Buchung (Bearbeiten, Löschen)
3. Sind noch keine Buchungen vorhanden, zeigt das System einen entsprechenden Hinweis an.

# UI-Hinweise

- Das Buchungsdatum wird im Format `DD.MM.YYYY` dargestellt.
- Die Tabelle passt sich der Fensterbreite an (`table-fixed`). Der gesamte Zeileninhalt ist ohne horizontales Scrollen im Fenster sichtbar; lange Texte in Beschreibung und Sender/Empfänger werden mehrzeilig umgebrochen.
- Die Tabellenzeilen sind im Zebra-Muster abwechselnd weiß und hellgrau hinterlegt (`odd:bg-white`, `even:bg-gray-50`), um die Unterscheidbarkeit einzelner Buchungen zu verbessern.
- Im Kopfbereich stehen Aktions-Buttons zur Verfügung:
    * „Neue Buchung“ (Einstieg in den Use Case „Buchung erfassen“)
    * „Neuer Kauf“ (Einstieg in den Use Case „Kauf erfassen“)
    * „Neuer Verkauf“ (Einstieg in den Use Case „Verkauf erfassen“)
- Pro Tabellenzeile werden die Aktionen Ändern und Löschen nebeneinander in einer Spalte angeboten:
    * Ändern-Icon (Stift): Einstieg in den Use Case „Buchung ändern“.
    * „Löschen“-Button: Entfernt die Buchung nach Bestätigung.
- Bei leerer Liste wird der Text „Noch keine Buchungen vorhanden.“ angezeigt.
