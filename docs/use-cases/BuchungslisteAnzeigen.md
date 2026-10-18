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
- Im Kopfbereich stehen Aktions-Buttons zur Verfügung:
    * „Neue Buchung“ (Einstieg in den Use Case „Buchung erfassen“)
    * „Neuer Kauf“ (Einstieg in den Use Case „Kauf erfassen“)
    * „Neuer Verkauf“ (Einstieg in den Use Case „Verkauf erfassen“)
- Pro Tabellenzeile werden Aktionen angeboten:
    * „Bearbeiten“: Öffnet das Buchungsformular zur Bearbeitung.
    * „Löschen“: Entfernt die Buchung nach Bestätigung.
- Bei leerer Liste wird der Text „Noch keine Buchungen vorhanden.“ angezeigt.
