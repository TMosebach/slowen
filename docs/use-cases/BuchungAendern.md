# Buchung ändern

# Beschreibung

Der Anwender ändert die Daten einer bestehenden Buchung ausgehend von der Kontodetailseite.

# Beteiligte:

* Anwender
* Slowen, das System

# Vorbedingung

Der Anwender hat den Use Case „Kontodetails ansehen“ ausgeführt und befindet sich auf der Kontodetailseite.

# Ablauf (Standardverlauf)

1. Der Anwender klickt bei einer Buchung auf das Ändern-Icon.
2. Das System öffnet das Buchung-Formular mit den Daten der Buchung (Vorgang, Datum, Beschreibung, Sender/Empfänger, Positionen, ggf. Kauf-/Verkaufsdetails).
3. Der Anwender ändert die Daten und klickt auf „Ändern“ (statt „Buchen“ beim Erfassen).
4. Das System prüft die Pflichtfelder gemäß „Buchung erfassen“; bei Fehlern zeigt es Meldungen und bleibt im Formular.
5. Das System speichert die geänderten Daten (abgeleitete Positionen bei Kauf/Verkauf werden neu berechnet) und kehrt zur Kontodetailseite zurück.

# Alternativer Verlauf

3a. Der Anwender klickt auf „Abbrechen“.
4a. Das System verwirft ggf. gemachte Änderungen und kehrt zur Kontodetailseite zurück.

# UI-Hinweise

- Das Ändern-Icon ist für alle Vorgänge (Buchung, Kauf, Verkauf) verfügbar.
- Die Rückkehrseite wird über den Query-Parameter `returnTo` übergeben (z. B. `/bookings/5/edit?returnTo=/accounts/3`). Nur interne Pfade (beginnend mit `/`) sind erlaubt; ohne Parameter ist das Ziel die Buchungsliste.
- Der Submit-Button heißt im Änderungsmodus „Ändern“.
